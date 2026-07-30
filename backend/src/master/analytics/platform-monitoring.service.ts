import { Injectable } from '@nestjs/common';
import { MasterPrismaService } from '../../core/database/master-prisma.service';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import * as os from 'os';

@Injectable()
export class PlatformMonitoringService {
  constructor(private readonly prisma: MasterPrismaService) {}

  async getInfrastructureStatus() {
    // 1. Host/Server Metrics (CPU, Memory, Uptime)
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    const cpuCores = os.cpus();
    const loadAvg = os.loadavg(); // 1, 5, 15 minutes load average
    const serverUptime = os.uptime(); // in seconds

    // 2. Query Postgres for database size metrics (Master DB)
    let masterDbSize = 'Unknown';
    try {
      const dbSizeQuery = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT pg_size_pretty(pg_database_size(current_database())) as size;`
      );
      if (dbSizeQuery && dbSizeQuery.length > 0) {
        masterDbSize = dbSizeQuery[0].size;
      }
    } catch (err: any) {
      console.error('[Monitoring] Failed to fetch Master DB size:', err.message);
    }

    // 3. Query Postgres for Tenant schema/database sizes dynamically
    const tenants = await this.prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
    });

    const tenantDbs: any[] = [];
    const CHUNK_SIZE = 10; // Process 10 tenant checks concurrently

    for (let i = 0; i < tenants.length; i += CHUNK_SIZE) {
      const chunk = tenants.slice(i, i + CHUNK_SIZE);
      const chunkPromises = chunk.map(async (tenant) => {
        return Promise.race([
          this.checkTenantDbStatus(tenant),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Connection Timeout')), 3000), // 3s Timeout
          ),
        ]).catch((err) => {
          console.error(`[Monitoring] Tenant DB ${tenant.subdomain} check failed: ${err.message}`);
          return {
            id: tenant.id,
            subdomain: tenant.subdomain,
            dbSize: 'Unknown',
            latencyMs: 0,
            status: 'UNHEALTHY',
          };
        });
      });

      const chunkResults = await Promise.all(chunkPromises);
      tenantDbs.push(...chunkResults);
    }

    return {
      server: {
        platform: os.platform(),
        arch: os.arch(),
        cpuCores: cpuCores.length,
        loadAverage1Min: loadAvg[0],
        loadAverage5Min: loadAvg[1],
        loadAverage15Min: loadAvg[2],
        memory: {
          totalGb: Number((totalMemory / (1024 * 1024 * 1024)).toFixed(2)),
          freeGb: Number((freeMemory / (1024 * 1024 * 1024)).toFixed(2)),
          usedGb: Number((usedMemory / (1024 * 1024 * 1024)).toFixed(2)),
          usagePercent: Number(memoryUsagePercent.toFixed(2)),
        },
        uptimeSeconds: Math.floor(serverUptime),
      },
      databases: {
        master: {
          size: masterDbSize,
          status: 'HEALTHY',
        },
        tenants: tenantDbs,
      },
    };
  }

  private async checkTenantDbStatus(tenant: any) {
    const tenantPrisma = new TenantPrismaClient({
      datasources: {
        db: {
          url: tenant.dbConnectionString,
        },
      },
    });

    let size = 'Unknown';
    let latencyMs = 0;
    let status = 'HEALTHY';

    try {
      const start = Date.now();
      await tenantPrisma.$connect();
      
      // Measure connection latency
      await tenantPrisma.$executeRawUnsafe('SELECT 1;');
      latencyMs = Date.now() - start;

      // Query database schema size
      const sizeQuery = await tenantPrisma.$queryRawUnsafe<any[]>(
        `SELECT pg_size_pretty(pg_database_size(current_database())) as size;`
      );
      if (sizeQuery && sizeQuery.length > 0) {
        size = sizeQuery[0].size;
      }
    } catch (err: any) {
      status = 'UNHEALTHY';
      console.error(`[Monitoring] Dynamic Tenant DB check failed for ${tenant.subdomain}:`, err.message);
    } finally {
      await tenantPrisma.$disconnect().catch(() => {});
    }

    return {
      id: tenant.id,
      subdomain: tenant.subdomain,
      dbSize: size,
      latencyMs,
      status,
    };
  }
}
