import { CanActivate, ExecutionContext, Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class MainAdminGuard implements CanActivate {
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: any }>();
    const user = req.user;
    if (!user) return false;
    const freshUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!freshUser) return false;
    if (freshUser.role !== 'main_admin') {
      throw new ForbiddenException('Main admin required');
    }
    return true;
  }
}