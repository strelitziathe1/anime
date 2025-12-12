import { Controller, UseGuards, Post, Body, Get, Query, Req } from '@nestjs/common';
import { MainAdminGuard } from '../../common/guards/main-admin.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PrismaClient } from '@prisma/client';
import { Inject } from '@nestjs/common';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles('admin', 'main_admin')
export class AdminController {
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {}

  @UseGuards(MainAdminGuard)
  @Post('promote')
  async promote(@Body() body: { targetUserId: string; newRole: 'admin' | 'main_admin' | 'watcher' }, @Req() req: any) {
    const actorId = req.user?.id;
    const target = await this.prisma.user.update({
      where: { id: body.targetUserId },
      data: { role: body.newRole },
    });
    await this.prisma.auditLog.create({
      data: {
        actorId,
        targetId: target.id,
        action: 'promote',
        detailsJson: { newRole: body.newRole },
      },
    });
    return { user: { id: target.id, role: target.role } };
  }

  @UseGuards(MainAdminGuard)
  @Post('demote')
  async demote(@Body() body: { targetUserId: string; newRole: 'watcher' | 'admin' }, @Req() req: any) {
    const actorId = req.user?.id;
    const target = await this.prisma.user.update({
      where: { id: body.targetUserId },
      data: { role: body.newRole },
    });
    await this.prisma.auditLog.create({
      data: {
        actorId,
        targetId: target.id,
        action: 'demote',
        detailsJson: { newRole: body.newRole },
      },
    });
    return { user: { id: target.id, role: target.role } };
  }

  @Get('upload-rate')
  async uploadRate(@Query('window') window = '1m') {
    // Placeholder: implement aggregation from UploadMetric + Redis counters
    return { window, bytesPerMin: 0 };
  }
}