import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateProfile(userId: string, data: any) {
    // ignore role or isAdmin fields if present
    delete data.role;
    delete data.isAdmin;
    delete data.is_admin;
    if (data.password) {
      data.passwordHash = await argon2.hash(data.password, { type: argon2.argon2id });
      delete data.password;
    }
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async listUsers() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async suspend(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { isActive: false } });
  }

  async unsuspend(userId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { isActive: true } });
  }
}