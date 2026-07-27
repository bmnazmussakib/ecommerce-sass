import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { MasterPrismaService } from '../../core/database/master-prisma.service';
import { CreateGlobalThemeDto, UpdateGlobalThemeDto } from './dto/global-theme.dto';

@Injectable()
export class GlobalThemeService {
  constructor(private prisma: MasterPrismaService) {}

  async create(createThemeDto: CreateGlobalThemeDto) {
    const existing = await this.prisma.globalTheme.findUnique({
      where: { codeIdentifier: createThemeDto.codeIdentifier },
    });
    if (existing) {
      throw new ConflictException(`Theme with codeIdentifier '${createThemeDto.codeIdentifier}' already exists`);
    }

    return this.prisma.globalTheme.create({
      data: createThemeDto,
    });
  }

  async findAll() {
    return this.prisma.globalTheme.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const theme = await this.prisma.globalTheme.findUnique({ where: { id } });
    if (!theme) {
      throw new NotFoundException(`GlobalTheme with ID ${id} not found`);
    }
    return theme;
  }

  async update(id: string, updateThemeDto: UpdateGlobalThemeDto) {
    await this.findOne(id);

    if (updateThemeDto.codeIdentifier) {
      const existing = await this.prisma.globalTheme.findFirst({
        where: { codeIdentifier: updateThemeDto.codeIdentifier, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException(`Theme with codeIdentifier '${updateThemeDto.codeIdentifier}' already in use`);
      }
    }

    return this.prisma.globalTheme.update({
      where: { id },
      data: updateThemeDto as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.globalTheme.delete({ where: { id } });
  }
}
