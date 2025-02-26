import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class VideosService {
  private readonly videosPath = 'uploads/hls';

  getAllVideos() {
    if (!fs.existsSync(this.videosPath)) {
      return [];
    }

    return fs.readdirSync(this.videosPath).map((video) => ({
      name: video,
      path: [
        process.env.SERVER_URL,
        'videos-stream',
        video,
        'master.m3u8',
      ].join('/'),
    }));
  }
}
