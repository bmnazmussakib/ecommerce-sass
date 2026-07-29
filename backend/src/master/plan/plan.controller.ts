import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlanService } from './plan.service';
import { CreatePlanDto, UpdatePlanDto, SetPlanCurrencyPriceDto } from './dto/plan.dto';
import { SuperJwtAuthGuard } from '../auth/super-jwt-auth.guard';

@ApiTags('Master Administration - Plans & Pricing')
@Controller('api/master/plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @ApiBearerAuth()
  @UseGuards(SuperJwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully.' })
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planService.create(createPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all plans' })
  findAll() {
    return this.planService.findAll();
  }

  @Get(':id/price')
  @ApiOperation({ summary: 'Get resolved plan price in requested currency (Public)' })
  getPlanPriceInCurrency(
    @Param('id') id: string,
    @Query('currency') currency: string = 'USD',
  ) {
    return this.planService.getPlanPriceInCurrency(id, currency);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a plan by ID' })
  findOne(@Param('id') id: string) {
    return this.planService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(SuperJwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a plan' })
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.planService.update(id, updatePlanDto);
  }

  @ApiBearerAuth()
  @UseGuards(SuperJwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a plan' })
  remove(@Param('id') id: string) {
    return this.planService.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(SuperJwtAuthGuard)
  @Post(':id/prices')
  @ApiOperation({ summary: 'Set or update plan price for specific currency' })
  setCurrencyPrice(
    @Param('id') id: string,
    @Body() dto: SetPlanCurrencyPriceDto,
  ) {
    return this.planService.setCurrencyPrice(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(SuperJwtAuthGuard)
  @Get(':id/prices')
  @ApiOperation({ summary: 'Get all multi-currency prices for a plan' })
  getCurrencyPrices(@Param('id') id: string) {
    return this.planService.getCurrencyPrices(id);
  }

  @ApiBearerAuth()
  @UseGuards(SuperJwtAuthGuard)
  @Delete(':id/prices/:currency')
  @ApiOperation({ summary: 'Delete specific currency price tier for a plan' })
  removeCurrencyPrice(
    @Param('id') id: string,
    @Param('currency') currency: string,
  ) {
    return this.planService.removeCurrencyPrice(id, currency);
  }
}
