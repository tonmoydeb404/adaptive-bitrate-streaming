import { Injectable } from '@nestjs/common';
import { exec, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

type Resulation = {
  width: number;
  height: number;
};

@Injectable()
export class UploadService {
  private getVideoResolution(filePath: string): Resulation {
    try {
      const output = execSync(
        `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of json "${filePath}"`,
      ).toString();
      const metadata = JSON.parse(output);
      return {
        width: metadata.streams[0].width,
        height: metadata.streams[0].height,
      };
    } catch (error) {
      console.error('Error getting video resolution:', error);
      return { width: 1920, height: 1080 }; // Default fallback
    }
  }

  private generateFFmpegCommand(filePath: string, outputDir: string) {
    const resolution = this.getVideoResolution(filePath);

    const qualities = [
      {
        width: 1920,
        height: 1080,
        crf: 23,
        preset: 'medium',
        bitrate: 5000,
        maxrate: Math.round(5000 * 1.2), // 20% higher than bitrate
        bufsize: Math.round(5000 * 2), // 2x bitrate
        audioBitrate: 128,
        bandwidth: 5000000,
      },
      {
        width: 1280,
        height: 720,
        crf: 26,
        preset: 'fast',
        bitrate: 3000,
        maxrate: Math.round(3000 * 1.2), // 20% higher than bitrate
        bufsize: Math.round(3000 * 2), // 2x bitrate
        audioBitrate: 128,
        bandwidth: 3000000,
      },
      {
        width: 854,
        height: 480,
        crf: 28,
        preset: 'fast',
        bitrate: 1500,
        maxrate: Math.round(1500 * 1.2), // 20% higher than bitrate
        bufsize: Math.round(1500 * 2), // 2x bitrate
        audioBitrate: 128,
        bandwidth: 1500000,
      },
      {
        width: 640,
        height: 360,
        crf: 30,
        preset: 'fast',
        bitrate: 800,
        maxrate: Math.round(800 * 1.2), // 20% higher than bitrate
        bufsize: Math.round(800 * 2), // 2x bitrate
        audioBitrate: 96,
        bandwidth: 800000,
      },
      {
        width: 426,
        height: 240,
        crf: 32,
        preset: 'fast',
        bitrate: 400,
        maxrate: Math.round(400 * 1.2), // 20% higher than bitrate
        bufsize: Math.round(400 * 2), // 2x bitrate
        audioBitrate: 64,
        bandwidth: 400000,
      },
    ].reverse();

    // Filter out qualities that are larger than the input resolution
    const filteredQualities = qualities.filter(
      (q) => q.width <= resolution.width && q.height <= resolution.height,
    );

    console.log(
      'Filtered Qualities:',
      filteredQualities.map((q) => q.height),
    );
    console.log('Original Resolution:', resolution);

    let convertCommand = `ffmpeg -y -i "${filePath}" \\\n`;
    convertCommand += '  -map 0:v -map 0:a:';

    filteredQualities.forEach(
      ({
        width,
        height,
        crf,
        preset,
        bitrate,
        audioBitrate,
        bufsize,
        maxrate,
      }) => {
        // Ensure width and height are even
        // const evenWidth = width % 2 === 0 ? width : width + 1;
        // const evenHeight = height % 2 === 0 ? height : height + 1;

        // Append options for this quality level
        convertCommand += ` \\\n`;
        convertCommand += `  -vf scale=w=${width}:h=${height}:force_original_aspect_ratio=decrease:force_divisible_by=2 -c:a aac -ar 48000 -c:v h264 -profile:v main -crf ${crf} -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v ${bitrate}k -maxrate ${maxrate}k -bufsize ${bufsize}k -b:a ${audioBitrate}k -hls_segment_filename "${outputDir}/${height}p_%03d.ts" "${outputDir}/${height}p.m3u8"`;
      },
    );

    // console.log(convertCommand);

    // console.log(convertCommand);

    let masterContent = '#EXTM3U\n';

    filteredQualities.forEach(({ bandwidth, width, height }) => {
      const evenWidth = width;
      const evenHeight = height;
      masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${evenWidth}x${evenHeight}\n${evenHeight}p.m3u8\n`;
    });

    return { convertCommand, masterContent };
  }

  async convertToHLS(filePath: string): Promise<string> {
    const fileName = path.basename(filePath, path.extname(filePath));
    const outputDir = path.join('uploads/hls', fileName);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const masterPath = path.join(outputDir, 'master.m3u8');
    const { convertCommand, masterContent } = this.generateFFmpegCommand(
      filePath,
      outputDir,
    );

    console.log({ convertCommand, masterContent });

    return new Promise((resolve, reject) => {
      exec(convertCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg error:', error);
          reject(error);
        } else {
          fs.writeFileSync(masterPath, masterContent, 'utf8');
          console.log('✅ Master Playlist Generated:', masterPath);

          resolve(masterPath);
        }
      });
    });
  }
}
