import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from '../decorators/roles.decorator';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, @Inject('PRISMA') private prisma: PrismaClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request & { user?: any }>();

    if (!requiredRoles || requiredRoles.length === 0) return true;
    const user = req.user;
    if (!user) return false;

    // Re-fetch user from DB
    const freshUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!freshUser) return false;

    // Prevent non-main_admin from attempting role changes
    const body = (req as any).body;
    if (body && (body.role || body.isAdmin || body.is_admin)) {
      if (freshUser.role !== 'main_admin') {
        throw new ForbiddenException('Only main_admin may change roles.');
      }
    }

    const allowed = requiredRoles.includes(freshUser.role as Role);
    if (!allowed) throw new ForbiddenException('Insufficient role');
    return true;
  }
}