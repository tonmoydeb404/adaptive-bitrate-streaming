import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Video file to upload',
  })
  @IsNotEmpty()
  file: any;
}
