import { Injectable, Inject } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { UpdateSocialSettingDto } from './dto/social.dto';

@Injectable()
export class SocialService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async getSettings() {
    let setting = await this.prisma.socialSetting.findFirst();
    if (!setting) {
      setting = await this.prisma.socialSetting.create({
        data: {
          enableShareButtons: true,
          autoShareMessage: 'Check out this awesome product!',
        },
      });
    }
    return setting;
  }

  async updateSettings(dto: UpdateSocialSettingDto) {
    const existing = await this.getSettings();
    return this.prisma.socialSetting.update({
      where: { id: existing.id },
      data: dto,
    });
  }

  /**
   * Helper method generating social share URLs for any target link
   */
  async generateShareUrls(targetUrl: string, title?: string, customMsg?: string) {
    const settings = await this.getSettings();

    const shareText = customMsg || title || settings.autoShareMessage || 'Check this out!';
    const encodedUrl = encodeURIComponent(targetUrl);
    const encodedText = encodeURIComponent(shareText);

    let whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${targetUrl}`)}`;
    if (settings.whatsappNumber) {
      const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
      whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`${shareText} ${targetUrl}`)}`;
    }

    return {
      targetUrl,
      shareText,
      enableShareButtons: settings.enableShareButtons,
      shareUrls: {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
        whatsapp: whatsappUrl,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
      },
      profiles: {
        facebook: settings.facebookUrl || null,
        instagram: settings.instagramUrl || null,
        twitter: settings.twitterUrl || null,
        whatsappNumber: settings.whatsappNumber || null,
        youtube: settings.youtubeUrl || null,
        linkedin: settings.linkedinUrl || null,
        pinterest: settings.pinterestUrl || null,
      },
    };
  }
}
