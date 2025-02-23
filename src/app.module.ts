import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';
import { VideosModule } from './videos/videos.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads/hls'),
      serveRoot: '/videos-stream',
    }),
    UploadModule,
    VideosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
