import { Controller, Get, Param, Post, UseGuards, Inject } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { MainAdminGuard } from '../../common/guards/main-admin.guard';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

@Controller('transcoding')
@UseGuards(RolesGuard)
@Roles('admin', 'main_admin')
export class TranscodingController {
  private redis: Redis;
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');
  }

  @Get('jobs')
  async listJobs() {
    return this.prisma.transcodingJob.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }

  @Post(':id/retry')
  @UseGuards(MainAdminGuard)
  async retryJob(@Param('id') id: string) {
    const job = await this.prisma.transcodingJob.findUnique({ where: { id } });
    if (!job) return { ok: false, reason: 'not_found' };
    // enqueue job for retry (simple Redis LPUSH)
    await this.redis.lpush('transcoding:queue', JSON.stringify({ uploadId: id, retry: true }));
    await this.prisma.transcodingJob.update({ where: { id }, data: { status: 'pending', logsText: (job.logsText || '') + '\nRetry enqueued' } });
    return { ok: true };
  }

  @Post(':id/cancel')
  @UseGuards(MainAdminGuard)
  async cancelJob(@Param('id') id: string) {
    // Mark cancelled in DB. Removing from queue may be complex; workers should respect status.
    await this.prisma.transcodingJob.update({ where: { id }, data: { status: 'cancelled' } });
    return { ok: true };
  }
}