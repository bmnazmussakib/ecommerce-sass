import { Scope, Inject, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MasterPrismaService } from './master-prisma.service';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';

export const TENANT_PRISMA_CLIENT = 'TENANT_PRISMA_CLIENT';

@Injectable()
export class TenantConnectionProvider {
  private static connections: Map<string, TenantPrismaClient> = new Map();

  static getProvider() {
    return {
      provide: TENANT_PRISMA_CLIENT,
      scope: Scope.REQUEST,
      useFactory: async (req: Request, masterPrisma: MasterPrismaService) => {
        const host = (req as any).tenantHost || req.headers.host || '';
        if (!host) {
          throw new BadRequestException('Hostname is required for tenant resolution');
        }

        // Clean port from hostname if exists (e.g. localhost:3000 -> localhost)
        const hostname = host.split(':')[0];

        // Determine subdomain or custom domain
        // Assuming platform domain is configured as env variable, or just extracting first part
        const parts = hostname.split('.');
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        
        let subdomain = '';
        let isCustomDomain = false;

        if (isLocalhost) {
          // Fallback or test header for local development testing
          const testTenant = (req.headers['x-tenant-id'] as string) || (req.query?.tenantId as string);
          if (testTenant) {
            subdomain = testTenant;
          } else {
            // Default to 'default' or test tenant for ease of testing
            subdomain = 'default';
          }
        } else if (parts.length > 2) {
          subdomain = parts[0];
        } else {
          isCustomDomain = true;
        }

        // Fetch tenant from master database
        const tenant = await masterPrisma.tenant.findFirst({
          where: isCustomDomain 
            ? { customDomain: hostname, status: 'ACTIVE' }
            : { subdomain: subdomain, status: 'ACTIVE' }
        });

        if (!tenant) {
          throw new NotFoundException(`Tenant not found or inactive for host: ${hostname}`);
        }

        const connectionString = tenant.dbConnectionString;

        // Reuse connection pool from cache or initialize new one
        if (!this.connections.has(connectionString)) {
          const client = new TenantPrismaClient({
            datasources: {
              db: {
                url: connectionString,
              },
            },
          });
          await client.$connect();
          this.connections.set(connectionString, client);
        }

        return this.connections.get(connectionString);
      },
      inject: [REQUEST, MasterPrismaService],
    };
  }
}
