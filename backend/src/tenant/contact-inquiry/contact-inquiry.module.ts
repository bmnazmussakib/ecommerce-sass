import { Module } from '@nestjs/common';
import { ContactInquiryService } from './contact-inquiry.service';
import { ContactInquiryController } from './contact-inquiry.controller';

import { CaptchaModule } from '../captcha/captcha.module';

@Module({
  imports: [CaptchaModule],
  controllers: [ContactInquiryController],
  providers: [ContactInquiryService],
  exports: [ContactInquiryService],
})
export class ContactInquiryModule {}
