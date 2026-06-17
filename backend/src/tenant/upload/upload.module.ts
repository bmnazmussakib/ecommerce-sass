import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../../core/cloudinary/cloudinary.module';
import { UploadController } from './upload.controller';

@Module({
  imports: [CloudinaryModule],
  controllers: [UploadController],
})
export class UploadModule {}
