# Ecomize SaaS Backend - Phase-by-Phase Roadmap (Supabase Edition)

Detailed implementation roadmap using Supabase (PostgreSQL) databases and Prisma ORM.

## User Review Required

> [!IMPORTANT]
> - **Database Platform:** Supabase (PostgreSQL). We will use Supabase Postgres connection strings.
> - **Master DB:** A dedicated Supabase project to act as the central registry.
> - **Tenant DBs:** Dynamic allocation using connection strings of individual Supabase projects (or separate schemas/databases inside the same Supabase instance, depending on provisioning preference).
> - **ORM:** Prisma Client with dynamic datasource connection pooling.

---

## Phase 1: Supabase Integration & Tenancy Connection Switcher
Implement dynamic connection pooling with Supabase connection strings.

### Proposed Changes
- **Prisma Setup for Supabase:** Configure `schema.prisma` to use Postgres provider.
- **Tenant Middleware:** Extract domain/subdomain headers.
- **Supabase Pool Manager:** Resolve the target tenant's Supabase connection string from the Master DB and inject the dynamic Prisma Client request-scoped.

---

## Phase 2: Master (Global) Administration Module
Registry database setup on the Master Supabase database.

### Proposed Changes
- **Tenant Registry APIs:** CRUD endpoints to store vendor subdomain, custom domain, and Supabase connection string.
- **Plan Limits & Pricing:** Config parameters for storage/bandwidth limits.

---

## Phase 3: Tenant Core Settings & RBAC
Initialize store configurations on the tenant database.

### Proposed Changes
- **Store Settings Module:** Save branding and layouts to the tenant's Supabase database.
- **Staff Auth & JWT:** RBAC validation guards for tenant users.

---

## Phase 4: Product Catalog & Suppliers
Inventory management inside the tenant Supabase instance.

### Proposed Changes
- **Products & Options Engine:** Handling inventory, categories, SKUs.
- **Supplier Log Module:** Stock history and Cost of Goods Sold (COGS).

---

## Phase 5: Orders & Checkout Engine

### Goal Description
Implement the core checkout logic including Order placement, Stock Management (reducing product variant stock safely), and Coupon application inside a consistent transaction block.

### Proposed Changes

#### `src/tenant/coupon/`
- **[NEW]** `coupon.module.ts`, `coupon.controller.ts`, `coupon.service.ts`
- **[NEW]** `dto/coupon.dto.ts` for CRUD on discount coupons (Flat, Percentage, min order value).

#### `src/tenant/order/`
- **[NEW]** `order.module.ts`, `order.controller.ts`, `order.service.ts`
- **[NEW]** `dto/order.dto.ts` for handling checkout payloads.
- **Transactional Consistency:** We will use Prisma's `$transaction` API to ensure that stock checks, stock reductions, and order insertions happen atomically.
- **Coupons Validation:** The checkout payload can accept a coupon code, validate its active dates and minOrderValue, and calculate the final `totalPrice`.

### Open Questions
> [!IMPORTANT]
> 1. Should the `Checkout` API be completely public (no JWT required) so any customer can order without logging in, or do you want a separate Customer Auth module later? (I will assume Public for now).
> 2. What happens if a Product Variant stock is 0? Should we throw an "Out of Stock" error or allow backorders? (I will assume throw error).
---

## Phase 6: Payment & Shipping Integrations
Extend transactional flows.

### Proposed Changes
- **Payment Adapters:** bKash, Nagad, SSLCommerz integrations.
- **Shipping Adapters:** Pathao, Steadfast delivery.

---

## Phase 7: Analytics & Traffic Enforcement
Monitor and throttle traffic.

### Proposed Changes
- **Traffic Throttler:** Middleware checking usage limits stored in Master DB.
- **Admin Dashboards:** Aggregated sales and visitor analytics.

---

## Phase 8: Advanced Storefront Features & Admin Automation (Pending MVP Requirements)
Implement core storefront features, background queues, and administrative automation tasks.

### Proposed Changes

#### Meilisearch Product Sync
- **[NEW]** `src/tenant/search/` (SearchModule, SearchService)
- **Sync Listener:** Event listener that receives events when product catalog updates (create/update/delete) and synchronizes with Meilisearch index.

#### OTP Verification for COD Checkouts
- **[NEW]** `src/tenant/otp/` (OtpModule, OtpService)
- **OTP Manager:** Logic to generate 6-digit code, store in Redis with 5 min TTL, and invoke external SMS Gateway (e.g., Greenweb, MimSMS).
- **COD Checkout Update:** Restrict Order creation on Cash on Delivery method until the OTP challenge is solved.

#### Anti-Fraud & Device Fingerprinting
- **Anti-Fraud Filter:** Middleware or Guard checking request IP and device fingerprints stored in Redis.
- **Throttling:** Blocks checkouts if suspicious order velocity thresholds are crossed.

#### BD Courier Adapters
- **[NEW]** `src/tenant/integration/adapters/steadfast.service.ts` & `pathao.service.ts`
- **Fulfillment API:** Extend `order.controller.ts` with booking action that syncs data with Steadfast/Pathao REST APIs and stores consignment ID.

#### Bulk CSV Product Parser
- **[NEW]** `src/tenant/product/jobs/csv-parser.processor.ts`
- **BullMQ Config:** Setup BullMQ and Redis processor to parse large product CSV files stored in Cloudflare R2 and bulk insert into `Tenant DB`.

#### PDF Invoice Generator
- **[NEW]** `src/tenant/order/invoice.service.ts`
- **Invoice API:** Endpoint to compile order details into a clean PDF stream for merchant/customer download.

#### Super Admin Cloudflare & Impersonation Automation
- **Cloudflare API integration:** Master service endpoint to register custom domains, set up CNAME routing, and request SSL certificates.
- **Impersonation Endpoint:** SuperAdmin Auth API generates a transient, secure JWT signed with tenant scope to bypass standard admin login.

---

## Verification Plan

### Automated Tests
- Dynamic connection switcher test: Connect to two mock Supabase databases and query data.
