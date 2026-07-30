# Ecomize SaaS Backend — Development Guideline

> Maintain consistency across all modules when adding new features or fixing bugs.
> Follow these conventions whether you are a human developer or an AI agent.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 11 |
| Language | TypeScript 5.7 (strict mode) |
| ORM | Prisma 6 with `@prisma/master-client` & `@prisma/tenant-client` |
| Database | PostgreSQL 15 (Supabase) |
| Queue | BullMQ (Redis) |
| Search | Meilisearch |
| Validation | `class-validator` + `class-transformer` |
| Auth | Passport.js (JWT) + bcrypt + otplib (TOTP 2FA) |
| Docs | Swagger (`@nestjs/swagger`) |
| Payments | bKash (tokenized API), SSLCommerz (form POST) |
| Courier | Steadfast, Pathao |
| Media | Cloudinary |
| PDF | pdfkit |
| Background | BullMQ queues |

---

## 2. Directory Structure

```
src/
  main.ts                        ← Bootstrap (Swagger, port, factory)
  app.module.ts                  ← Root module (global middleware, interceptors, imports)
  app.controller.ts              ← Health check + test-tenant endpoint
  app.service.ts                 ← App service
  core/                          ← Shared infrastructure (GLOBAL — do NOT add domain logic here)
    database/
      database.module.ts         ← @Global() — exports MasterPrismaService + TENANT_PRISMA_CLIENT
      master-prisma.service.ts   ← Extends PrismaClient (master DB)
      tenant-connection.provider.ts ← Request-scoped factory for tenant PrismaClient
    cloudinary/
      cloudinary.module.ts
      cloudinary.provider.ts
      cloudinary.service.ts
    guards/
      feature-toggle.guard.ts    ← Checks tenant.featureToggles via @FeatureToggle()
    decorators/
      feature-toggle.decorator.ts ← SetMetadata helper
    interceptors/
      audit-log.interceptor.ts   ← Global APP_INTERCEPTOR (logs POST/PUT/PATCH/DELETE)
    middleware/
      tenant-resolver.middleware.ts ← Attaches tenantHost from Host header
      traffic-throttle.middleware.ts ← Enforces plan traffic limits + status checks
  master/                        ← Super Admin / platform management
    master.module.ts             ← Aggregates all master submodules
    auth/                        ← Super Admin auth + 2FA + audit logs
    tenant/                      ← Tenant CRUD + impersonation + cross-tenant data queries
    plan/                        ← Subscription plan CRUD
    subscription/                ← Subscription lifecycle management
    billing/                     ← Payment processing (SSLCommerz + manual)
    theme/                       ← Global theme CRUD
    analytics/                   ← Platform-wide analytics + infrastructure monitoring
    gdpr/                        ← Customer data anonymization
  tenant/                        ← Per-tenant ecommerce logic
    tenant.module.ts             ← Aggregates all tenant submodules
    auth/                        ← Staff JWT auth + 2FA + RBAC
    settings/                    ← Store settings + StoreClosedGuard
    category/                    ← Nested category CRUD
    product/                     ← Product + variant CRUD + Meilisearch sync + CSV import (BullMQ)
    order/                       ← Checkout (transactional) + invoice (PDF) + payment callbacks
    customer/                    ← Customer CRUD with paginated search
    coupon/                      ← Discount coupon CRUD
    flash-sale/                  ← Flash sale CRUD with overlap detection
    supplier/                    ← Supplier CRUD
    supply-batch/                ← Stock-in with inventory adjustments + costing
    shipping/                    ← Zone + rate CRUD + calculateShipping logic
    integration/                 ← Payment/courier credentials + adapter implementations
    digital-product/             ← Digital file management + download tokens
    webhook/                     ← Outbound webhook dispatcher with HMAC signing + retries
    analytics/                   ← Per-store analytics
    search/                      ← Meilisearch client (per-tenant indices)
    upload/                      ← Cloudinary image upload
    data-export/                 ← CSV/JSON export for products/orders/customers
  generated/
    master/                      ← Auto-generated Prisma client for master DB
    tenant/                      ← Auto-generated Prisma client for tenant DB
```

### Naming Conventions

| Artifact | Convention | Example |
|----------|-----------|---------|
| Module file | `kebab-case.module.ts` | `flash-sale.module.ts` |
| Controller file | `kebab-case.controller.ts` | `flash-sale.controller.ts` |
| Service file | `kebab-case.service.ts` | `flash-sale.service.ts` |
| DTO files | `dto/kebab-case.dto.ts` | `dto/flash-sale.dto.ts` |
| Guard file | `kebab-case.guard.ts` | `store-closed.guard.ts` |
| Strategy file | `kebab-case.strategy.ts` | `jwt.strategy.ts` |
| Decorator file | `kebab-case.decorator.ts` | `feature-toggle.decorator.ts` |
| Adapter file | `adapters/kebab.service.ts` | `adapters/bkash.service.ts` |
| Spec file | Same path + `.spec.ts` | `flash-sale.service.spec.ts` |
| Job processor | `jobs/kebab.processor.ts` | `jobs/csv-parser.processor.ts` |
| Entity file | `entities/kebab.entity.ts` | `entities/integration.entity.ts` |

---

## 3. Multi-Tenancy Pattern

### How it works

1. **`TenantResolverMiddleware`** (applied to `*` routes) extracts the `Host` header and attaches it as `req.tenantHost`.
2. **`TenantConnectionProvider`** (request-scoped factory) reads `req.tenantHost` and resolves the tenant:
   - **Localhost**: reads `x-tenant-id` header or `tenantId` query param, falls back to `'default'`
   - **Subdomain** (>2 hostname parts): extracts first subdomain
   - **Custom domain** (2 parts): queries by `customDomain` field
3. Looks up the tenant in master DB → gets `dbConnectionString` → creates/caches a `PrismaClient` for that connection.
4. The tenant client is injected via `@Inject(TENANT_PRISMA_CLIENT)` into tenant services.

### Rules for developers

- **Master module services** → inject `MasterPrismaService` directly
- **Tenant module services** → inject `@Inject(TENANT_PRISMA_CLIENT) private readonly prisma: any`
- **Never** import `TenantConnectionProvider` directly — use the injection token
- **For background jobs** (BullMQ workers): instantiate `TenantPrismaClient` directly with the connection string passed via job data
- **For cross-tenant queries** (master analytics): instantiate `TenantPrismaClient` dynamically, `$connect`, query, `$disconnect`

---

## 4. Module Structure Pattern

Every feature module MUST follow this exact structure:

```
feature/
  feature.module.ts
  feature.controller.ts
  feature.service.ts
  dto/
    feature.dto.ts
```

### Module File (`*.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';

@Module({
  imports: [],       // Import other modules if needed
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],  // Export if consumed by other modules
})
export class FeatureModule {}
```

- Use `@Global()` only when absolutely necessary (e.g., `AuthModule`, `DatabaseModule`, `SearchModule`)
- Import `DatabaseModule` from core when you need tenant DB access
- Import `AuthModule` when you need to use JWT guards in master module

### Controller File (`*.controller.ts`)

```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeatureService } from './feature.service';
import { CreateDto, UpdateDto } from './dto/feature.dto';

@ApiTags('Group Name - Subtitle')
@Controller('api/tenant/features')   // or 'api/master/features'
export class FeatureController {
  constructor(private readonly service: FeatureService) {}

  @Post()
  @ApiOperation({ summary: 'Short description' })
  create(@Body() dto: CreateDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Short description' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Short description' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Short description' })
  update(@Param('id') id: string, @Body() dto: UpdateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Short description' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```

### Service File (`*.service.ts`)

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
// For master services:
// import { MasterPrismaService } from '../../core/database/master-prisma.service';

@Injectable()
export class FeatureService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: any,
    // For master services:
    // private readonly prisma: MasterPrismaService,
  ) {}

  async create(dto: CreateDto) {
    return this.prisma.featureModel.create({ data: dto });
  }

  async findAll() {
    return this.prisma.featureModel.findMany();
  }

  async findOne(id: string) {
    const record = await this.prisma.featureModel.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Feature with ID ${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateDto) {
    await this.findOne(id);
    return this.prisma.featureModel.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.featureModel.delete({ where: { id } });
  }
}
```

### DTO File (`dto/*.dto.ts`)

```typescript
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';   // or @nestjs/mapped-types

export class CreateDto {
  @ApiProperty({ example: 'Sample', description: 'Description' })
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;
}

export class UpdateDto extends PartialType(CreateDto) {}
```

---

## 5. Authentication & Authorization

### Master Module (Super Admin)

| Artifact | File |
|----------|------|
| Strategy | `master/auth/master-jwt.strategy.ts` (name: `'super-jwt'`) |
| Guard | `master/auth/super-jwt-auth.guard.ts` (extends `AuthGuard('super-jwt')`) |
| Role check | Strategy validates `payload.role === 'SUPER_ADMIN'` |

**Usage:**
```typescript
@UseGuards(SuperJwtAuthGuard)
@Controller('api/master/...')
```

### Tenant Module (Staff)

| Artifact | File |
|----------|------|
| Strategy | `tenant/auth/jwt.strategy.ts` (name: `'jwt'`) |
| Guard | `tenant/auth/jwt-auth.guard.ts` (extends `AuthGuard('jwt')`) |
| Role decorator | `tenant/auth/roles.decorator.ts` — `@Roles('OWNER', 'ADMIN', 'STAFF')` |
| Role guard | `tenant/auth/roles.guard.ts` |

**Usage:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER', 'ADMIN')
@Controller('api/tenant/...')
```

### Rules

- **Public endpoints**: No guards. Accessible without token (e.g., checkout, product listing, flash sales)
- **Staff endpoints**: `@UseGuards(JwtAuthGuard)` for any authenticated staff
- **Restricted endpoints**: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('OWNER', 'ADMIN')`
- **Store-closed check**: `@UseGuards(StoreClosedGuard)` on the checkout endpoint only
- **Feature gating**: `@FeatureToggle('feature_name')` + `@UseGuards(FeatureToggleGuard)` for plan-gated features

---

## 6. Database & Prisma Patterns

### Schema Files

- **Master DB**: `prisma/master.prisma` → generates `@prisma/master-client`
- **Tenant DB**: `prisma/tenant.prisma` → generates `@prisma/tenant-client`

### Model Conventions

```prisma
model Feature {
  id        String   @id @default(uuid())
  // ...fields...
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

- Always use UUIDs (`@default(uuid())`)
- Always include `createdAt` and `updatedAt`
- Use `@@unique` for composite unique constraints
- Use `@@index` for query performance on frequently filtered fields
- Use `@db.Decimal(10, 2)` for monetary fields
- Use `Json` type for flexible config blobs (e.g., `featureToggles`, `themeConfig`, `keysJson`)

### Query Patterns

**Find with existence check:**
```typescript
const record = await this.prisma.model.findUnique({ where: { id } });
if (!record) throw new NotFoundException('Message');
```

**Transactional:**
```typescript
await this.prisma.$transaction([
  this.prisma.model.update({ ... }),
  this.prisma.otherModel.create({ ... }),
]);
```

**Upsert:**
```typescript
const log = await this.prisma.trafficLog.upsert({
  where: { tenantId_date: { tenantId, date: today } },
  update: { count: { increment: 1 } },
  create: { tenantId, date: today, count: 1 },
});
```

**Aggregation:**
```typescript
const summary = await this.prisma.order.aggregate({
  where: { paymentStatus: 'PAID' },
  _sum: { totalPrice: true },
  _count: { id: true },
});
```

**Group by:**
```typescript
const groups = await this.prisma.tenant.groupBy({
  by: ['status'],
  _count: { id: true },
});
```

**Include relations:**
```typescript
return this.prisma.product.findMany({
  include: { variants: true, category: true },
});
```

---

## 7. API Design Conventions

### Route Prefixes

| Scope | Prefix |
|-------|--------|
| Super Admin | `/api/master/*` |
| Tenant | `/api/tenant/*` |
| Public | `/api/tenant/*` (without auth guard) |

### Standard CRUD Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/` | JWT | Create |
| `GET` | `/` | JWT/None | List all |
| `GET` | `/:id` | JWT/None | Get by ID |
| `PATCH` | `/:id` | JWT | Update |
| `DELETE` | `/:id` | JWT | Delete |

### Special Action Routes

- Use **POST** for actions that create side effects: `POST /:id/impersonate`, `POST /:id/fulfill`
- Use **GET** for read-only computed data: `GET /search`, `GET /active`, `GET /status`, `GET /summary`
- Use descriptive sub-paths for nested resources: `GET /:id/store-data/products`

### Swagger Decorators

Every controller class MUST have `@ApiTags('Group - Subtitle')`.
Every endpoint MUST have `@ApiOperation({ summary: '...' })`.
JWT-protected endpoints MUST have `@ApiBearerAuth()`.

---

## 8. Error Handling

| Exception | When to use |
|-----------|-------------|
| `NotFoundException` | Record not found by ID |
| `ConflictException` | Unique constraint violation (duplicate subdomain, email, code) |
| `BadRequestException` | Invalid input, validation failure, business rule violation |
| `UnauthorizedException` | Invalid credentials, missing/invalid JWT |
| `ForbiddenException` | Role mismatch, feature disabled |
| `ServiceUnavailableException` | Store is closed (503) |
| `HttpException` with TOO_MANY_REQUESTS | Traffic limit exceeded |

- **Never** expose raw Prisma errors to the client — catch and rethrow NestJS HTTP exceptions
- For non-critical failures (webhook dispatch, audit log writes, traffic tracking DB errors), catch and log without failing the request ("fail open")

---

## 9. Business Logic Patterns

### Transactional Operations

Wrap all multi-step writes in `$transaction`:

- **Order checkout**: stock deduction + flash sale tracking + coupon validation + shipping calc + customer upsert + order creation + payment initiation + webhook dispatch
- **Supply batch create**: create batch record + increment variant stock
- **Supply batch delete**: decrement variant stock + delete batch record
- **Billing payment verify**: mark payment SUCCESS + upsert subscription

### Integration Adapter Pattern

Each external service gets its own injectable class in `integration/adapters/`:

```typescript
@Injectable()
export class SomeService {
  async someMethod(keys: any, ...args: any[]) {
    // Use keys from integration entity's keysJson
    // Implement mock fallback for dev/testing
  }
}
```

- Accept `keys` object (the `keysJson` from the `Integration` entity)
- Always provide mock fallback when credentials look like test/sandbox values
- Use sandbox URLs from environment or hardcoded for dev

### Event-Driven Webhooks

1. Dispatch events via `EventEmitter2`: `this.eventEmitter.emit('order.placed', data)`
2. `WebhookService.dispatch(event, data)` is called from within the same request lifecycle
3. Webhook sends HMAC-signed POST to subscribed URLs with 3 retries (exponential backoff)

### Anti-Fraud

- `BlockedContact` — blocklist for phone/email
- `BlockedFingerprint` — device fingerprint blocklist
- Velocity check: max 3 orders per 5 minutes per fingerprint

### Audit Logging

- Global `AuditLogInterceptor` (APP_INTERCEPTOR) logs all POST/PUT/PATCH/DELETE
- Logs to master DB `AuditLog` table
- Auto-redacts `password` and `token` from request body
- Errors in audit logging do NOT fail the request

---

## 10. Seed & Script Patterns

- Seed files: `seed.ts`, `seed-product.ts`, `seed-blocked.ts`, `seed-integration.ts` at root
- Bulk variant parsing helper: `get-variants.js` at root
- Scratch/experimental scripts: `scratch/` directory

---

## 11. Testing Conventions

- Test files co-located with source: `*.spec.ts`
- Jest configured with `ts-jest`, rootDir: `src`, testRegex: `.*\.spec\.ts$`
- Module aliases: `@prisma/master-client` → `src/generated/master`, `@prisma/tenant-client` → `src/generated/tenant`
- Use `@nestjs/testing` `Test.createTestingModule` for unit tests

---

## 12. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MASTER_DATABASE_URL` | Yes | Master DB connection string |
| `MASTER_DIRECT_URL` | Yes | Master DB direct connection (migrations) |
| `TENANT_DATABASE_TEMPLATE_URL` | Yes | Template URL for new tenant provisioning |
| `JWT_SECRET` | Yes | JWT signing secret |
| `APP_URL` | Yes | Public URL for payment callbacks |
| `PORT` | No | Server port (default 8888) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary config |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary config |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary config |
| `REDIS_HOST` | No | Redis host (default localhost) |
| `REDIS_PORT` | No | Redis port (default 6379) |

---

## 13. Development Workflow

### Running locally

```bash
npm run start:dev     # Watch mode on port 8888 (or PORT env)
```

### Docker (full stack)

```bash
docker-compose up     # Master DB (5431), Tenant DB (5432), Redis (6379), API (8888)
```

### Prisma operations

```bash
npx prisma generate                # Generate both clients
npx prisma db push --schema=prisma/master.prisma    # Push master schema
npx prisma db push --schema=prisma/tenant.prisma    # Push tenant template schema
npx prisma studio --schema=prisma/master.prisma     # Master DB studio
npx prisma studio --schema=prisma/tenant.prisma     # Tenant DB studio
```

### Lint & Build

```bash
npm run lint          # ESLint with TypeScript
npm run build         # Compile to dist/
npm run test          # Run Jest tests
```

---

## 14. Summary — Quick Reference Card

| When you want to... | Do this |
|---------------------|---------|
| Create a new feature | Copy an existing module folder structure (module/controller/service/dto) |
| Access tenant DB | `@Inject(TENANT_PRISMA_CLIENT) private readonly prisma: any` |
| Access master DB | `private readonly prisma: MasterPrismaService` |
| Protect a route (staff) | `@UseGuards(JwtAuthGuard)` |
| Protect a route (admin) | `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('OWNER', 'ADMIN')` |
| Protect a route (super admin) | `@UseGuards(SuperJwtAuthGuard)` |
| Feature-gate a route | `@FeatureToggle('name')` + `@UseGuards(FeatureToggleGuard)` |
| Add multi-step write | Use `$transaction` with array of operations |
| Integrate a third-party API | Create adapter in `integration/adapters/`, read keys from Integration entity |
| Fire a webhook | `this.eventEmitter.emit('event.name', data)` |
| Generate Swagger docs | Add `@ApiTags`, `@ApiOperation`, `@ApiBearerAuth` decorators |
| Handle not-found | Throw `NotFoundException` with descriptive message |
| Fail silently on non-critical error | Catch, `console.error`, let request proceed |
| Create a DTO | Use `class-validator` decorators + `ApiProperty` for Swagger |
| Query across tenant DBs | Dynamically instantiate `TenantPrismaClient` + `$connect/query/$disconnect` |
