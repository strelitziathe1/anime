import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS',
      useFactory: () => {
        const url = process.env.REDIS_URL || 'redis://redis:6379';
        return new Redis(url);
      },
    },
  ],
  exports: ['REDIS'],
})
export class RedisModule {}