import { Module } from '@nestjs/common';
import { PopupCampaignService } from './popup-campaign.service';
import { PopupCampaignController } from './popup-campaign.controller';

@Module({
  controllers: [PopupCampaignController],
  providers: [PopupCampaignService],
  exports: [PopupCampaignService],
})
export class PopupCampaignModule {}
