import { Module } from '@nestjs/common';
import { ContactInquiryService } from './contact-inquiry.service';
import { ContactInquiryController } from './contact-inquiry.controller';

@Module({
  controllers: [ContactInquiryController],
  providers: [ContactInquiryService],
  exports: [ContactInquiryService],
})
export class ContactInquiryModule {}
