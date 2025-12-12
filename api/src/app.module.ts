import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { VideosModule } from './modules/videos/videos.module';
import { AdminModule } from './modules/admin/admin.module';
import { TranscodingModule } from './modules/transcoding/transcoding.module';
import { s3Provider } from './libs/s3.client';
import { RedisModule } from './libs/redis.client';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    UploadsModule,
    VideosModule,
    AdminModule,
    TranscodingModule,
    RedisModule,
  ],
  providers: [
    {
      provide: 'PRISMA',
      useFactory: () => {
        const prisma = new PrismaClient();
        return prisma;
      },
    },
    s3Provider,
  ],
  exports: ['PRISMA', s3Provider],
})
export class AppModule {}