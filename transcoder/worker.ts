/**
 * Transcoder worker (Node)
 *
 * Note: This file is written in JS/TS-style. In the Dockerfile we run via node worker.js.
 * For the boilerplate, we'll assume it's transpiled to worker.js in the image build or run with ts-node.
 *
 * Behavior summary:
 * - Blocking loop reading Redis list 'transcoding:queue'
 * - Downloads source from S3/MinIO
 * - Runs clamdscan (clamdscan must be installed in container)
 * - Runs ffprobe to collect resolution/duration
 * - Runs ffmpeg to produce HLS renditions (6s segments)
 * - Uploads HLS files to S3/MinIO and updates TranscodingJob in DB
 *
 * FFmpeg examples included as comments.
 */
const Redis = require('ioredis');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const os = require('os');
const { PrismaClient } = require('@prisma/client');

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');
const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
  accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
  secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  s3ForcePathStyle: true,
});
const prisma = new PrismaClient();
const bucket = process.env.S3_BUCKET || 'strelitzia';

async function workLoop() {
  while (true) {
    try {
      const jobJson = await redis.rpop('transcoding:queue');
      if (!jobJson) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      const job = JSON.parse(jobJson);
      console.log('Processing job', job.uploadId);
      await processJob(job);
    } catch (err) {
      console.error('Worker loop error', err);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

async function processJob(job) {
  const { uploadId, key } = job;
  const workdir = path.join('/work', uploadId);
  fs.mkdirSync(workdir, { recursive: true });
  const sourcePath = path.join(workdir, 'source');
  // download source
  const out = fs.createWriteStream(sourcePath);
  await new Promise((res, rej) => {
    s3.getObject({ Bucket: bucket, Key: key }).createReadStream().pipe(out).on('finish', res).on('error', rej);
  });

  // ClamAV scan
  try {
    const scan = spawnSync('clamdscan', ['--fdpass', sourcePath], { encoding: 'utf-8' });
    if (scan.status !== 0) {
      await prisma.transcodingJob.update({ where: { id: uploadId }, data: { status: 'failed', logsText: `clamav failure: ${scan.stderr || scan.stdout}` } });
      return;
    }
  } catch (e) {
    console.warn('ClamAV not available or failed. Configure in production.', e);
  }

  // ffprobe
  const ffprobe = spawnSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', sourcePath], { encoding: 'utf-8' });
  if (ffprobe.status !== 0) {
    await prisma.transcodingJob.update({ where: { id: uploadId }, data: { status: 'failed', logsText: ffprobe.stderr } });
    return;
  }
  const probe = JSON.parse(ffprobe.stdout);
  const videoStream = (probe.streams || []).find((s) => s.codec_type === 'video') || {};
  const height = videoStream.height || 0;

  const preferDown = job.presetInfo?.prefer_downscale_to_1080 ?? true;
  const keepOriginal = job.presetInfo?.keep_original ?? false;
  const shouldDownscaleTo1080 = preferDown && height > 1080;

  const hlsDir = path.join(workdir, 'hls');
  fs.mkdirSync(hlsDir, { recursive: true });

  // FFmpeg examples:
  // Downscale to 1080 master:
  // ffmpeg -i input -c:v libx264 -preset fast -crf 20 -vf scale=-2:1080 -c:a aac -b:a 128k -g 48 -sc_threshold 0 -f hls -hls_time 6 -hls_segment_filename "1080p/seg_%03d.ts" 1080p/master.m3u8
  // Original <=1080: use original as highest rendition and generate lower renditions:
  // ffmpeg -i input -c:v copy -c:a copy -f hls -hls_time 6 -hls_segment_filename "orig/seg_%03d.ts" orig/master.m3u8
  try {
    if (shouldDownscaleTo1080) {
      // 1080p
      spawnSync('ffmpeg', ['-y', '-i', sourcePath, '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-vf', 'scale=-2:1080', '-c:a', 'aac', '-b:a', '128k', '-g', '48', '-sc_threshold', '0', '-f', 'hls', '-hls_time', '6', '-hls_segment_filename', path.join(hlsDir, '1080p_seg_%03d.ts'), path.join(hlsDir, '1080p_master.m3u8')], { stdio: 'inherit' });
      // 720p/480p/360p
      const renditions = [{ h: 720, f: '720p' }, { h: 480, f: '480p' }, { h: 360, f: '360p' }];
      for (const r of renditions) {
        spawnSync('ffmpeg', ['-y', '-i', sourcePath, '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-vf', `scale=-2:${r.h}`, '-c:a', 'aac', '-b:a', '96k', '-g', '48', '-sc_threshold', '0', '-f', 'hls', '-hls_time', '6', '-hls_segment_filename', path.join(hlsDir, `${r.f}_seg_%03d.ts`), path.join(hlsDir, `${r.f}_master.m3u8`)], { stdio: 'inherit' });
      }
    } else {
      // Create original HLS (repack)
      spawnSync('ffmpeg', ['-y', '-i', sourcePath, '-c:v', 'copy', '-c:a', 'copy', '-f', 'hls', '-hls_time', '6', '-hls_segment_filename', path.join(hlsDir, 'orig_seg_%03d.ts'), path.join(hlsDir, 'orig_master.m3u8')], { stdio: 'inherit' });
      // create lower renditions if applicable
      const renditions = [];
      if (height > 720) renditions.push({ h: 720, f: '720p' });
      if (height > 480) renditions.push({ h: 480, f: '480p' });
      if (height > 360) renditions.push({ h: 360, f: '360p' });
      for (const r of renditions) {
        spawnSync('ffmpeg', ['-y', '-i', sourcePath, '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-vf', `scale=-2:${r.h}`, '-c:a', 'aac', '-b:a', '96k', '-g', '48', '-sc_threshold', '0', '-f', 'hls', '-hls_time', '6', '-hls_segment_filename', path.join(hlsDir, `${r.f}_seg_%03d.ts`), path.join(hlsDir, `${r.f}_master.m3u8`)], { stdio: 'inherit' });
      }
    }
  } catch (e) {
    await prisma.transcodingJob.update({ where: { id: uploadId }, data: { status: 'failed', logsText: String(e) } });
    return;
  }

  // Create a simple master.m3u8 manifest (production should compute bandwidth/resolution)
  const master = ['#EXTM3U', '#EXT-X-VERSION:3'];
  if (shouldDownscaleTo1080) {
    master.push('#EXT-X-STREAM-INF:BANDWIDTH=6000000,RESOLUTION=1920x1080');
    master.push('1080p_master.m3u8');
    master.push('#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720');
    master.push('720p_master.m3u8');
    master.push('#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=854x480');
    master.push('480p_master.m3u8');
    master.push('#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360');
    master.push('360p_master.m3u8');
  } else {
    master.push('#EXT-X-STREAM-INF:BANDWIDTH=4000000');
    master.push('orig_master.m3u8');
    if (fs.existsSync(path.join(hlsDir, '720p_master.m3u8'))) {
      master.push('#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720');
      master.push('720p_master.m3u8');
    }
  }
  fs.writeFileSync(path.join(hlsDir, 'master.m3u8'), master.join('\n'));

  // Upload HLS files to S3
  const walk = (dir) => {
    const list = [];
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        walk(full).forEach((x) => list.push(path.join(f, x)));
      } else {
        list.push(f);
      }
    }
    return list;
  };
  const files = [];
  const collect = (dir, base = '') => {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        collect(full, path.join(base, f));
      } else {
        files.push({ local: full, remote: path.posix.join(uploadId, 'hls', base, f) });
      }
    }
  };
  collect(hlsDir, '');

  for (const f of files) {
    const body = fs.createReadStream(f.local);
    const params = {
      Bucket: bucket,
      Key: f.remote,
      Body: body,
      CacheControl: f.local.endsWith('.m3u8') ? 'no-cache, max-age=10' : 'public, max-age=31536000, immutable',
    };
    await s3.putObject(params).promise();
  }

  // Update TranscodingJob
  await prisma.transcodingJob.update({ where: { id: uploadId }, data: { status: 'success', finishedAt: new Date(), logsText: 'transcode completed' } });

  // Optionally delete source
  if (!keepOriginal) {
    try { await s3.deleteObject({ Bucket: bucket, Key: key }).promise(); } catch (e) { console.warn('delete original failed', e); }
  }

  // Clean up (optional)
  // fs.rmSync(workdir, { recursive: true, force: true });
}

workLoop();