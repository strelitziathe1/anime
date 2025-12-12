// Transpiled/JS worker for the transcoder container.
// This is equivalent to the worker.ts implementation and runs under node directly.

const Redis = require('ioredis');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
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

  try {
    if (shouldDownscaleTo1080) {
      spawnSync('ffmpeg', ['-y', '-i', sourcePath, '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-vf', 'scale=-2:1080', '-c:a', 'aac', '-b:a', '128k', '-g', '48', '-sc_threshold', '0', '-f', 'hls', '-hls_time', '6', '-hls_segment_filename', path.join(hlsDir, '1080p_seg_%03d.ts'), path.join(hlsDir, '1080p_master.m3u8')], { stdio: 'inherit' });
      const renditions = [{ h: 720, f: '720p' }, { h: 480, f: '480p' }, { h: 360, f: '360p' }];
      for (const r of renditions) {
        spawnSync('ffmpeg', ['-y', '-i', sourcePath, '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-vf', `scale=-2:${r.h}`, '-c:a', 'aac', '-b:a', '96k', '-g', '48', '-sc_threshold', '0', '-f', 'hls', '-hls_time', '6', '-hls_segment_filename', path.join(hlsDir, `${r.f}_seg_%03d.ts`), path.join(hlsDir, `${r.f}_master.m3u8`)], { stdio: 'inherit' });
      }
    } else {
      spawnSync('ffmpeg', ['-y', '-i', sourcePath, '-c:v', 'copy', '-c:a', 'copy', '-f', 'hls', '-hls_time', '6', '-hls_segment_filename', path.join(hlsDir, 'orig_seg_%03d.ts'), path.join(hlsDir, 'orig_master.m3u8')], { stdio: 'inherit' });
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

  await prisma.transcodingJob.update({ where: { id: uploadId }, data: { status: 'success', finishedAt: new Date(), logsText: 'transcode completed' } });

  if (!keepOriginal) {
    try { await s3.deleteObject({ Bucket: bucket, Key: key }).promise(); } catch (e) { console.warn('delete original failed', e); }
  }
}

workLoop();