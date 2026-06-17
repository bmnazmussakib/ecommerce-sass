import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { CloudinaryService } from '../../core/cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Tenant - Uploads')
@ApiHeader({ name: 'x-tenant-id', description: 'Tenant subdomain', required: true })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/tenant/upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @ApiOperation({ summary: 'Upload an image (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    try {
      const result = await this.cloudinaryService.uploadImage(file);
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      throw new BadRequestException(`Cloudinary upload failed: ${err.message || err}`);
    }
  }
}
