import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

@Injectable()
export class TranscodingService {
  private redis: Redis;
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');
  }

  // Example: list running jobs
  async listJobs() {
    return this.prisma.transcodingJob.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async getJob(id: string) {
    return this.prisma.transcodingJob.findUnique({ where: { id } });
  }

  // Retry/cancel APIs would enqueue commands to Redis and update DB
}