import { Controller, Get, Param, UseGuards, Req, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('users')
@UseGuards(RolesGuard)
@Roles('admin', 'main_admin')
export class UsersController {
  constructor(private svc: UsersService) {}

  @Get()
  async list() {
    return this.svc.listUsers();
  }

  @Post('suspend/:id')
  async suspend(@Param('id') id: string) {
    return this.svc.suspend(id);
  }

  @Post('unsuspend/:id')
  async unsuspend(@Param('id') id: string) {
    return this.svc.unsuspend(id);
  }
}