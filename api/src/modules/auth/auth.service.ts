import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {}

  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email already exists');
    const hash = await argon2.hash(password, { type: argon2.argon2id });
    const user = await this.prisma.user.create({
      data: { email, passwordHash: hash, role: 'watcher' },
    });
    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Invalid credentials');
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new BadRequestException('Invalid credentials');

    const accessToken = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_PRIVATE_KEY || 'dev-key', { expiresIn: '15m' });
    const refreshToken = uuidv4();
    const refreshHash = await argon2.hash(refreshToken, { type: argon2.argon2id });
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });
    return { accessToken, refreshToken };
  }
}