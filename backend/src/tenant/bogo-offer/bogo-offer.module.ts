import { Module } from '@nestjs/common';
import { BogoOfferService } from './bogo-offer.service';
import { BogoOfferController } from './bogo-offer.controller';

@Module({
  controllers: [BogoOfferController],
  providers: [BogoOfferService],
  exports: [BogoOfferService],
})
export class BogoOfferModule {}
