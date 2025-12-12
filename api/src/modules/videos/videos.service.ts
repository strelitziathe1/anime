import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class VideosService {
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {}

  async getSignedMasterUrl(episodeId: string) {
    const episode = await this.prisma.episode.findUnique({ where: { id: episodeId } });
    if (!episode || !episode.s3_master_key) return null;
    // generate short-lived signed URL
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({
      endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
      accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      s3ForcePathStyle: true,
    });
    const params = { Bucket: process.env.S3_BUCKET || 'strelitzia', Key: episode.s3_master_key, Expires: 300 };
    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  }
}