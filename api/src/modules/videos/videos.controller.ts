import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  // Returns a short-lived signed URL for the master.m3u8 for the episode
  @Get(':episodeId/signed-url')
  async getSignedUrl(@Param('episodeId') episodeId: string) {
    const url = await this.videosService.getSignedMasterUrl(episodeId);
    if (!url) throw new NotFoundException('Episode or master playlist not found');
    return { url };
  }
}