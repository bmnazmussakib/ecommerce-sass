import { Module } from '@nestjs/common';
import { TaxRuleService } from './tax-rule.service';
import { TaxRuleController } from './tax-rule.controller';

@Module({
  controllers: [TaxRuleController],
  providers: [TaxRuleService],
  exports: [TaxRuleService],
})
export class TaxRuleModule {}
