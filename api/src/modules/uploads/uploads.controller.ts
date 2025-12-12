import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { InitUploadDto } from './dto/init-upload.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('upload')
@UseGuards(RolesGuard)
@Roles('watcher', 'admin', 'main_admin')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('init')
  async initUpload(@Body() dto: InitUploadDto, @Req() req: any) {
    return this.uploadsService.initUpload(req.user?.id, dto);
  }

  @Post('init/batch')
  async initBatch(@Body() dtos: InitUploadDto[], @Req() req: any) {
    return this.uploadsService.initBatch(req.user?.id, dtos);
  }

  @Post('complete')
  async complete(@Body() dto: CompleteUploadDto, @Req() req: any) {
    return this.uploadsService.completeUpload(req.user?.id, dto.uploadId, dto.metadata);
  }
}