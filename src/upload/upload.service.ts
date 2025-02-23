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
    const ffmpegCommand = `ffmpeg -i "${filePath}" -profile:v baseline -level 3.0 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${outputFile}"`;

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
