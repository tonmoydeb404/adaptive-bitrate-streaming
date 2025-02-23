import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  async convertToHLS(filePath: string): Promise<string> {
    const fileName = path.basename(filePath, path.extname(filePath));
    const outputDir = path.join('uploads/hls', fileName);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, 'index.m3u8');
    const ffmpegCommand = `ffmpeg -i ${filePath} \
        -map 0:v -c:v libx264 -crf 23 -preset medium -g 48 \
        -map 0:v -c:v libx264 -crf 28 -preset fast -g 48 \
        -map 0:v -c:v libx264 -crf 32 -preset fast -g 48 \
        -map 0:a -c:a aac -b:a 128k \
        -hls_time 10 -hls_playlist_type vod -hls_flags independent_segments -report \
        -f hls ${outputFile}`;

    return new Promise((resolve, reject) => {
      exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg error:', error);
          reject(error);
        } else {
          // console.log('FFmpeg output:', stdout);
          resolve(outputFile);
        }
      });
    });
  }
}
