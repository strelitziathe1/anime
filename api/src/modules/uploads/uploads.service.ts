import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { getPresignedPutUrl } from '../../libs/s3.client';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import AWS from 'aws-sdk';
import { execFile } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as util from 'util';

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
  accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
  secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  s3ForcePathStyle: true,
});

const execFileAsync = util.promisify(execFile);

@Injectable()
export class UploadsService {
  private redis: Redis;

  constructor(@Inject('PRISMA') private prisma: PrismaClient) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');
  }

  async initUpload(userId: string | undefined, dto: any) {
    const uploadId = uuidv4();
    const key = `uploads/${uploadId}/${dto.filename}`;
    const presignedUrl = await getPresignedPutUrl(key, 'application/octet-stream');

    await this.prisma.uploadMetric.create({
      data: {
        userId,
        bytesUploaded: BigInt(dto.size),
      },
    });

    // create a TranscodingJob record with id = uploadId for tracking
    await this.prisma.transcodingJob.create({
      data: {
        id: uploadId,
        status: 'pending',
        createdById: userId,
        presetInfo: { prefer_downscale_to_1080: dto.prefer_downscale_to_1080 ?? true, keep_original: dto.keep_original ?? false },
      },
    });

    return { uploadId, presignedUrl, key };
  }

  async initBatch(userId: string | undefined, dtos: any[]) {
    const batchId = uuidv4();
    const results = [];
    for (const d of dtos) {
      const uploadId = uuidv4();
      const key = `uploads/${batchId}/${uploadId}/${d.filename}`;
      const presignedUrl = await getPresignedPutUrl(key, 'application/octet-stream');
      await this.prisma.transcodingJob.create({
        data: { id: uploadId, status: 'pending', createdById: userId, presetInfo: { prefer_downscale_to_1080: d.prefer_downscale_to_1080 ?? true, keep_original: d.keep_original ?? false } },
      });
      results.push({ uploadId, presignedUrl, key });
    }
    return { batchId, files: results };
  }

  async completeUpload(userId: string | undefined, uploadId: string, metadata?: any) {
    const job = await this.prisma.transcodingJob.findUnique({ where: { id: uploadId } });
    if (!job) throw new BadRequestException('Unknown uploadId');

    const bucket = process.env.S3_BUCKET || 'strelitzia';
    const list = await s3
      .listObjectsV2({ Bucket: bucket, Prefix: `uploads/${uploadId}` })
      .promise();
    if (!list.Contents || list.Contents.length === 0) {
      throw new BadRequestException('File not found in storage');
    }
    const key = list.Contents[0].Key!;

    // Download small part or whole file to temp for check
    const tmpPath = `${os.tmpdir()}/${uploadId}-head`;
    const out = fs.createWriteStream(tmpPath);
    const stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream();
    await new Promise((res, rej) => {
      stream.pipe(out);
      stream.on('end', res);
      stream.on('error', rej);
    });

    // Run file --mime-type using system `file` (libmagic)
    try {
      const { stdout } = await execFileAsync('file', ['--mime-type', '-b', tmpPath]);
      const mimeType = stdout.trim();
      const allowed = ['video/mp4', 'video/x-matroska', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/MP2T', 'video/x-flv'];
      fs.unlinkSync(tmpPath);
      if (!allowed.includes(mimeType)) {
        throw new BadRequestException(`Disallowed container mime: ${mimeType}`);
      }
    } catch (err) {
      try { fs.unlinkSync(tmpPath); } catch {}
      throw new BadRequestException('File validation failed');
    }

    // Update job and enqueue to Redis
    await this.prisma.transcodingJob.update({
      where: { id: uploadId },
      data: { status: 'pending', presetInfo: metadata || job.presetInfo },
    });

    await this.redis.lpush('transcoding:queue', JSON.stringify({ uploadId, key, bucket, userId, presetInfo: metadata || job.presetInfo }));

    return { jobId: uploadId };
  }
}