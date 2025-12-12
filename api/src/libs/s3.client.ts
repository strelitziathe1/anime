import { Provider } from '@nestjs/common';
import AWS from 'aws-sdk';

export const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
  accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
  secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: process.env.S3_REGION || 'us-east-1',
});

export const s3Provider: Provider = {
  provide: 'S3',
  useValue: s3,
};

export function getPresignedPutUrl(Key: string, ContentType = 'application/octet-stream') {
  const params = {
    Bucket: process.env.S3_BUCKET || 'strelitzia',
    Key,
    Expires: 60 * 60,
    ContentType,
  };
  return s3.getSignedUrlPromise('putObject', params);
}

export function getPresignedGetUrl(Key: string, ttlSec = 300) {
  const params = {
    Bucket: process.env.S3_BUCKET || 'strelitzia',
    Key,
    Expires: ttlSec,
  };
  return s3.getSignedUrlPromise('getObject', params);
}