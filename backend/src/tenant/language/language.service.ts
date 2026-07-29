import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import {
  CreateLanguageDto,
  UpdateLanguageDto,
  UpsertTranslationDto,
} from './dto/language.dto';

const DEFAULT_ENGLISH_DICTIONARY = {
  cart: 'Cart',
  checkout: 'Checkout',
  buy_now: 'Buy Now',
  add_to_cart: 'Add to Cart',
  search: 'Search',
  total: 'Total',
  shipping: 'Shipping',
  subtotal: 'Subtotal',
  tax: 'Tax',
  discount: 'Discount',
};

@Injectable()
export class LanguageService implements OnModuleInit {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async onModuleInit() {
    // Ensure default English language exists if no languages seeded
    try {
      const count = await this.prisma.storeLanguage.count();
      if (count === 0) {
        await this.prisma.storeLanguage.create({
          data: {
            code: 'en',
            name: 'English',
            isDefault: true,
            isActive: true,
            translations: DEFAULT_ENGLISH_DICTIONARY,
          },
        });
      }
    } catch {
      // Ignore if DB not synced yet during module init
    }
  }

  async create(dto: CreateLanguageDto) {
    const code = dto.code.toLowerCase();
    const existing = await this.prisma.storeLanguage.findUnique({
      where: { code },
    });
    if (existing) {
      throw new ConflictException(`Language code '${code}' already exists`);
    }

    if (dto.isDefault) {
      await this.prisma.storeLanguage.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.storeLanguage.create({
      data: {
        code,
        name: dto.name,
        isDefault: dto.isDefault ?? false,
        isActive: dto.isActive ?? true,
        translations: dto.translations || {},
      },
    });
  }

  async findAll() {
    return this.prisma.storeLanguage.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        isDefault: true,
        isActive: true,
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(code: string) {
    const langCode = code.toLowerCase();
    const lang = await this.prisma.storeLanguage.findUnique({
      where: { code: langCode },
    });
    if (!lang) {
      throw new NotFoundException(`Language '${langCode}' not found`);
    }
    return lang;
  }

  async update(code: string, dto: UpdateLanguageDto) {
    const lang = await this.findOne(code);
    if (dto.isDefault) {
      await this.prisma.storeLanguage.updateMany({
        where: { id: { not: lang.id }, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.storeLanguage.update({
      where: { id: lang.id },
      data: dto,
    });
  }

  async upsertTranslations(code: string, dto: UpsertTranslationDto) {
    const lang = await this.findOne(code);
    const current = (lang.translations as Record<string, string>) || {};
    const merged = { ...current, ...dto.translations };

    return this.prisma.storeLanguage.update({
      where: { id: lang.id },
      data: { translations: merged },
    });
  }

  async remove(code: string) {
    const lang = await this.findOne(code);
    if (lang.isDefault) {
      throw new ConflictException('Cannot delete default store language');
    }
    return this.prisma.storeLanguage.delete({
      where: { id: lang.id },
    });
  }
}
