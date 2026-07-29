import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient, InquiryStatus } from '@prisma/tenant-client';
import {
  CreateContactInquiryDto,
  UpdateContactInquiryDto,
} from './dto/contact-inquiry.dto';

import { CaptchaService } from '../captcha/captcha.service';

@Injectable()
export class ContactInquiryService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
    private readonly captchaService: CaptchaService,
  ) {}

  async create(dto: CreateContactInquiryDto) {
    await this.captchaService.verifyForAction(
      'CONTACT',
      dto.captchaToken,
      dto.captchaAnswer,
    );

    const { captchaToken, captchaAnswer, ...data } = dto;
    return this.prisma.contactInquiry.create({
      data,
    });
  }

  async findAll(status?: InquiryStatus) {
    return this.prisma.contactInquiry.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const inquiry = await this.prisma.contactInquiry.findUnique({
      where: { id },
    });
    if (!inquiry) throw new NotFoundException(`Inquiry ${id} not found`);
    return inquiry;
  }

  async update(id: string, dto: UpdateContactInquiryDto) {
    await this.findOne(id);
    return this.prisma.contactInquiry.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contactInquiry.delete({
      where: { id },
    });
  }
}
