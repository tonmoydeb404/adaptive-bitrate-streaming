import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VideosService {
  private readonly videosPath = 'uploads/hls';

  getAllVideos() {
    if (!fs.existsSync(this.videosPath)) {
      return [];
    }

    return fs.readdirSync(this.videosPath).map((video) => ({
      name: video,
      path: path.join(
        process.env.SERVER_URL,
        'videos-stream',
        video,
        'index.m3u8',
      ),
    }));
  }
}
