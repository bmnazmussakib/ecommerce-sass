import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

@Injectable()
export class WebhookService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async create(dto: CreateWebhookDto) {
    return this.prisma.webhook.create({ data: dto });
  }

  async findAll() {
    return this.prisma.webhook.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const webhook = await this.prisma.webhook.findUnique({ where: { id } });
    if (!webhook) throw new NotFoundException('Webhook not found');
    return webhook;
  }

  async update(id: string, dto: UpdateWebhookDto) {
    await this.findOne(id);
    return this.prisma.webhook.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.webhook.delete({ where: { id } });
  }

  async dispatch(event: string, data: Record<string, unknown>): Promise<void> {
    const webhooks = await this.prisma.webhook.findMany({
      where: { events: { has: event }, isActive: true },
    });
    if (webhooks.length === 0) return;

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const body = JSON.stringify(payload);

    for (const webhook of webhooks) {
      void this.sendWithRetry(webhook.url, webhook.secret ?? null, body);
    }
  }

  private async sendWithRetry(
    url: string,
    secret: string | null,
    body: string,
    retries = 3,
  ): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'Ecomize-Webhook/1.0',
        };
        if (secret) {
          const crypto = await import('crypto');
          const signature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');
          headers['X-Webhook-Signature'] = signature;
        }
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body,
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return;
      } catch {
        if (attempt === retries) {
          console.error(
            `[Webhook] Failed to deliver to ${url} after ${retries} attempts`,
          );
        } else {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    }
  }
}
