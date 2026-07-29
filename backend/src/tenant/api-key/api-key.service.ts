import {
  Injectable,
  Inject,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { CreateApiKeyDto, UpdateApiKeyDto } from './dto/api-key.dto';
import * as crypto from 'crypto';

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

@Injectable()
export class ApiKeyService {
  // In-memory sliding window rate limit tracker per API key
  private readonly rateLimitMap = new Map<string, RateLimitTracker>();

  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async create(dto: CreateApiKeyDto) {
    const randomHex = crypto.randomBytes(24).toString('hex');
    const generatedKey = `ek_live_${randomHex}`;

    const apiKey = await this.prisma.apiKey.create({
      data: {
        name: dto.name,
        key: generatedKey,
        rateLimit: dto.rateLimit ?? 100,
        isActive: true,
      },
    });

    return {
      ...apiKey,
      plainKey: generatedKey, // Returned once upon creation
    };
  }

  async findAll() {
    const keys = await this.prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return keys.map((k) => ({
      ...k,
      key: `${k.key.substring(0, 12)}...${k.key.substring(k.key.length - 4)}`, // Mask key string
    }));
  }

  async findOne(id: string) {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id },
    });
    if (!apiKey) throw new NotFoundException(`API Key ${id} not found`);
    return apiKey;
  }

  async update(id: string, dto: UpdateApiKeyDto) {
    await this.findOne(id);
    return this.prisma.apiKey.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.apiKey.delete({
      where: { id },
    });
  }

  /**
   * Validate API Key and enforce per-minute sliding window rate limiting
   */
  async validateAndThrottle(rawKey: string): Promise<boolean> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { key: rawKey },
    });

    if (!apiKey || !apiKey.isActive) {
      throw new HttpException(
        { statusCode: HttpStatus.UNAUTHORIZED, message: 'Invalid or inactive API Key' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Update lastUsedAt asynchronously
    this.prisma.apiKey
      .update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {});

    // Rate Limiting Logic (1 minute window)
    const now = Date.now();
    const windowMs = 60 * 1000;
    let tracker = this.rateLimitMap.get(apiKey.id);

    if (!tracker || now > tracker.resetTime) {
      tracker = { count: 1, resetTime: now + windowMs };
      this.rateLimitMap.set(apiKey.id, tracker);
    } else {
      tracker.count++;
      if (tracker.count > apiKey.rateLimit) {
        const retryAfterSec = Math.ceil((tracker.resetTime - now) / 1000);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `API Key rate limit of ${apiKey.rateLimit} requests/min exceeded. Retry in ${retryAfterSec}s.`,
            retryAfterSeconds: retryAfterSec,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    return true;
  }
}
