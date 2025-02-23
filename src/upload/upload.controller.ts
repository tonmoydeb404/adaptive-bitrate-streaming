import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UploadDto } from './dto/upload.dto';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('File uploaded:', file);

    if (!file) {
      return { message: 'No file was uploaded' };
    }

    const convertedPath = await this.uploadService.convertToHLS(file.path);
    return { message: 'Video converted to HLS successfully', convertedPath };
  }
}
