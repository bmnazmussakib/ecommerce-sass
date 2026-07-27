import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GlobalThemeService } from './global-theme.service';
import { CreateGlobalThemeDto, UpdateGlobalThemeDto } from './dto/global-theme.dto';
import { SuperJwtAuthGuard } from '../auth/super-jwt-auth.guard';

@ApiTags('Master Administration - Global Themes')
@ApiBearerAuth()
@UseGuards(SuperJwtAuthGuard)
@Controller('api/master/themes')
export class GlobalThemeController {
  constructor(private readonly themeService: GlobalThemeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new global theme' })
  @ApiResponse({ status: 201, description: 'Theme created successfully.' })
  create(@Body() createThemeDto: CreateGlobalThemeDto) {
    return this.themeService.create(createThemeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all global themes' })
  findAll() {
    return this.themeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a theme by ID' })
  findOne(@Param('id') id: string) {
    return this.themeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a theme' })
  update(@Param('id') id: string, @Body() updateThemeDto: UpdateGlobalThemeDto) {
    return this.themeService.update(id, updateThemeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a theme' })
  remove(@Param('id') id: string) {
    return this.themeService.remove(id);
  }
}
