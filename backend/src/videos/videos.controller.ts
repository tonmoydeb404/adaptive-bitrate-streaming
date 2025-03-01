import { Controller, Get } from '@nestjs/common';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  getAllVideos() {
    return this.videosService.getAllVideos();
  }
}
