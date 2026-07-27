import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlanService } from './plan.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { SuperJwtAuthGuard } from '../auth/super-jwt-auth.guard';

@ApiTags('Master Administration - Plans')
@ApiBearerAuth()
@UseGuards(SuperJwtAuthGuard)
@Controller('api/master/plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

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

  @Get(':id')
  @ApiOperation({ summary: 'Get a plan by ID' })
  findOne(@Param('id') id: string) {
    return this.planService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a plan' })
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.planService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a plan' })
  remove(@Param('id') id: string) {
    return this.planService.remove(id);
  }
}
