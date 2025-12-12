import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [AdminController],
  providers: [
    {
      provide: 'PRISMA',
      useFactory: () => new PrismaClient(),
    },
  ],
})
export class AdminModule {}