# Ecomize — Complete Feature List

> **Legend:** ✅ Implemented (Backend) | 🔜 Due (Priority) | 🧭 Roadmap
> **Stack:** NestJS + Prisma + PostgreSQL (Backend) | Next.js (Frontend — not started)

---

## 1. SUPER ADMIN PANEL (Platform Owner)

| # | Feature | Status | Layer | Priority | Notes |
|---|---------|--------|-------|----------|-------|
| 1.1 | Plan CRUD (create/edit/delete subscription packages) | ✅ Done | Backend | — | Full CRUD with product/traffic/storage limits |
| 1.2 | Tenant CRUD (create, list, update, delete vendors) | ✅ Done | Backend | — | Includes subdomain + custom domain fields |
| 1.3 | Tenant impersonation (Login as Vendor) | ✅ Done | Backend | — | Generates JWT as vendor OWNER staff |
| 1.4 | Traffic/rate limiting per plan tier | ✅ Done | Backend | — | Daily request caps via TrafficLog table |
| 1.5 | Super Admin login & authentication | 🔜 Due | Backend | High | Login/2FA for platform admin (model exists) |
| 1.6 | Super Admin 2FA | 🔜 Due | Backend | High | TOTP 2FA (model exists, no code) |
| 1.7 | Super Admin role-based access (staff roles) | 🔜 Due | Backend | High | Permission system for admin staff |
| 1.8 | Subscription billing (Stripe integration) | 🔜 Due | Backend | High | Recurring payments, webhooks, auto-renew |
| 1.9 | Subscription CRUD (assign plans, upgrade/downgrade) | 🔜 Due | Backend | High | Plan assignment, cycle management |
| 1.10 | GlobalTheme management (upload/activate/deactivate) | 🔜 Due | Backend | High | Theme rollout for vendors (model exists) |
| 1.11 | Vendor onboarding workflow (PENDING -> APPROVED) | 🔜 Due | Backend | High | Approval/suspension lifecycle |
| 1.12 | Custom domain auto-SSL (Cloudflare API) | 🔜 Due | Backend | Medium | Let's Encrypt / Cloudflare SSL provisioning |
| 1.13 | Visitor quota enforcement & monitoring | 🔜 Due | Backend | Medium | Count visitors, throttle when over limit |
| 1.14 | Platform analytics dashboard (MRR, vendor count, uptime) | 🔜 Due | Backend + Frontend | Medium | Aggregated platform metrics |
| 1.15 | Infrastructure monitoring (server load, DB size) | 🔜 Due | Backend + Frontend | Medium | Per-tenant resource usage |
| 1.16 | Global announcement & notification system | 🔜 Due | Backend + Frontend | Medium | Send alerts to all/multiple vendors |
| 1.17 | Audit log of all admin actions | 🔜 Due | Backend | Medium | Activity tracking for compliance |
| 1.18 | Invoice & tax management (VAT/GST) | 🔜 Due | Backend | Low | PDF invoices, multi-currency, tax rules |
| 1.19 | Feature toggle system (beta features per vendor) | 🔜 Due | Backend | Low | Enable/disable features per tenant |
| 1.20 | Super Admin panel UI | 🔜 Due | Frontend | High | Dashboard, vendor list, plan mgmt, etc. |

---

## 2. VENDOR PANEL (Merchant Dashboard)

| # | Feature | Status | Layer | Priority | Notes |
|---|---------|--------|-------|----------|-------|
| 2.1 | Staff registration & login (JWT) | ✅ Done | Backend | — | Register/login with bcrypt password hashing |
| 2.2 | TOTP 2FA (generate, enable, disable, verify) | ✅ Done | Backend | — | QR code + otplib |
| 2.3 | Store settings (name, logo, brand color, theme config) | ✅ Done | Backend | — | GET/PUT with auto-create defaults |
| 2.4 | Custom CSS/JS per store | ✅ Done | Backend | — | Stored in StoreSetting model |
| 2.5 | Category management (nested hierarchy) | ✅ Done | Backend | — | Full CRUD with parent/children |
| 2.6 | Product CRUD with variants (size, color, weight, SKU, price, stock) | ✅ Done | Backend | — | Full CRUD with Meilisearch auto-sync |
| 2.7 | Bulk product import via CSV | ✅ Done | Backend | — | BullMQ background queue processor |
| 2.8 | Meilisearch full-text product search | ✅ Done | Backend | — | Per-tenant indices, auto-synced |
| 2.9 | Supplier management CRUD | ✅ Done | Backend | — | Supplier names, contacts, addresses |
| 2.10 | Coupon/discount engine CRUD | ✅ Done | Backend | — | Percentage/flat, min order, date range |
| 2.11 | Order checkout flow | ✅ Done | Backend | — | Stock deduction, coupon, anti-fraud, shipping |
| 2.12 | Anti-fraud order protection | ✅ Done | Backend | — | Blocklist (email/phone), fingerprint, velocity check (max 3/5min) |
| 2.13 | bKash payment integration | ✅ Done | Backend | — | Tokenized checkout API with callback |
| 2.14 | SSLCommerz payment integration | ✅ Done | Backend | — | Gateway API v4 with IPN callback |
| 2.15 | PDF invoice generation | ✅ Done | Backend | — | Per-order PDF via PDFKit |
| 2.16 | Steadfast courier fulfillment | ✅ Done | Backend | — | Create order with sandbox mock |
| 2.17 | Pathao courier fulfillment | ✅ Done | Backend | — | Token grant + create order with sandbox mock |
| 2.18 | Order listing, details, status updates | ✅ Done | Backend | — | Payment/shipping status management |
| 2.19 | Integrations key management CRUD | ✅ Done | Backend | — | Store API keys per provider |
| 2.20 | Analytics (revenue, sales chart, top products, order statuses, recent orders) | ✅ Done | Backend | — | 7d/30d/90d charts |
| 2.21 | Image upload to Cloudinary | ✅ Done | Backend | — | Product/store images |
| 2.22 | SupplyBatch (supplier stock entry & cost tracking) | 🔜 Due | Backend | Medium | Schema exists, no endpoints |
| 2.23 | NAGAD payment integration | 🔜 Due | Backend | Medium | Schema has NA.GAD enum |
| 2.24 | Facebook Pixel / GA4 / GTM tracking | 🔜 Due | Backend | Medium | Schema has FB_PIXEL, GA4 enums |
| 2.25 | Role-based authorization (OWNER/ADMIN/STAFF guards) | 🔜 Due | Backend | Medium | Permission enforcement per role |
| 2.26 | Order refund & return handling | 🔜 Due | Backend | Medium | Full return workflow |
| 2.27 | Abandoned cart recovery | 🔜 Due | Backend + Frontend | Medium | Email/SMS reminders |
| 2.28 | Flash sales & advanced promotions | 🔜 Due | Backend | Low | Time-bound sales events |
| 2.29 | Email marketing integration (Mailchimp etc.) | 🔜 Due | Backend + Frontend | Low | Campaign management |
| 2.30 | SEO management (meta, sitemap, OG) | 🔜 Due | Backend | Low | Per-page SEO editor |
| 2.31 | Vendor dashboard UI | 🔜 Due | Frontend | High | Full merchant dashboard |
| 2.32 | Drag-and-drop storefront builder | 🔜 Due | Frontend | High | Section-based page builder |
| 2.33 | Live chat widget | 🧭 Roadmap | Frontend | Low | Customer engagement |
| 2.34 | Multi-language support | 🧭 Roadmap | Frontend | Low | i18n per store |
| 2.35 | Affiliate system | 🧭 Roadmap | Backend + Frontend | Low | Referral tracking |
| 2.36 | Loyalty points system | 🧭 Roadmap | Backend | Low | Customer rewards |
| 2.37 | Multi-warehouse stock support | 🧭 Roadmap | Backend | Low | Premium feature |
| 2.38 | Mobile app / PWA generation | 🧭 Roadmap | Frontend | Low | For premium vendors |

---

## 3. CUSTOMER STOREFRONT

| # | Feature | Status | Layer | Priority | Notes |
|---|---------|--------|-------|----------|-------|
| 3.1 | Public product catalog & browsing | ✅ Done | Backend only | — | API ready, no frontend |
| 3.2 | Public category browsing | ✅ Done | Backend only | — | API ready, no frontend |
| 3.3 | Meilisearch instant product search | ✅ Done | Backend only | — | Full-text search API ready |
| 3.4 | Checkout API (COD, bKash, SSLCommerz) | ✅ Done | Backend only | — | Full checkout flow API ready |
| 3.5 | OTP verification for COD orders | ✅ Done | Backend only | — | Via SMS gateway (Redis TTL) |
| 3.6 | Order tracking page | ✅ Done | Backend only | — | Public order lookup API ready |
| 3.7 | Responsive storefront UI (Next.js SSR/ISR) | 🔜 Due | Frontend | High | Sub-1s load target |
| 3.8 | Quick one-page checkout UI | 🔜 Due | Frontend | High | Full checkout form |
| 3.9 | Product filtering (price, size, category) | 🔜 Due | Frontend | High | Instant filter UI |
| 3.10 | CDN edge caching (Cloudflare) | 🔜 Due | Infrastructure | High | For static assets & ISR pages |
| 3.11 | Incremental Static Regeneration (ISR) | 🔜 Due | Frontend | High | Next.js ISR for fast page loads |
| 3.12 | Product reviews & ratings | 🧭 Roadmap | Backend + Frontend | Low | Customer testimonials |

---

## 4. SYSTEM & SECURITY

| # | Feature | Status | Layer | Priority | Notes |
|---|---------|--------|-------|----------|-------|
| 4.1 | Multi-tenant DB-per-tenant isolation | ✅ Done | Backend | — | Separate PostgreSQL DB per vendor |
| 4.2 | Subdomain-based tenant resolution | ✅ Done | Backend | — | Auto-detect from Host header |
| 4.3 | Custom domain resolution | ✅ Done | Backend | — | Fallback lookup by domain |
| 4.4 | Global rate limiting (100 req/min) | ✅ Done | Backend | — | NestJS ThrottlerModule |
| 4.5 | Per-plan daily traffic quota | ✅ Done | Backend | — | Custom TrafficThrottleMiddleware |
| 4.6 | JWT authentication (1d expiry) | ✅ Done | Backend | — | Passport JWT strategy |
| 4.7 | Password hashing (bcrypt, 10 rounds) | ✅ Done | Backend | — | Secure credential storage |
| 4.8 | Anti-fraud blocklists (email, phone) | ✅ Done | Backend | — | BlockedContact model |
| 4.9 | Anti-fraud device fingerprinting | ✅ Done | Backend | — | BlockedFingerprint model |
| 4.10 | Anti-fraud velocity check | ✅ Done | Backend | — | Max 3 orders/5min per fingerprint |
| 4.11 | BullMQ background job queue (Redis) | ✅ Done | Backend | — | CSV import queue |
| 4.12 | Swagger API documentation | ✅ Done | Backend | — | `/api` endpoint |
| 4.13 | Cloudinary image storage | ✅ Done | Backend | — | Product/store image upload |
| 4.14 | CAPTCHA for login & forms | 🔜 Due | Backend + Frontend | Medium | Brute-force protection |
| 4.15 | WAF (Web Application Firewall) | 🔜 Due | Infrastructure | Medium | AWS WAF / Cloudflare |
| 4.16 | Automated backups & restore | 🔜 Due | Infrastructure | Medium | DB backup strategy |
| 4.17 | Rate limiting per store/API key | 🔜 Due | Backend | Medium | API key-based throttling |
| 4.18 | ELK / CloudWatch logging & monitoring | 🔜 Due | Infrastructure | Medium | Centralized logging |
| 4.19 | CI/CD pipeline (GitHub Actions) | 🔜 Due | Infrastructure | Medium | Automated testing + deployment |
| 4.20 | Docker containerization | 🔜 Due | Infrastructure | Medium | Dockerfile + docker-compose exist, deployment pending |
| 4.21 | Kubernetes auto-scaling | 🧭 Roadmap | Infrastructure | Low | EKS / Fargate orchestration |

---

## Summary

| Category | ✅ Implemented | 🔜 Due (High) | 🔜 Due (Med/Low) | 🧭 Roadmap |
|----------|---------------|----------------|-------------------|-----------|
| Super Admin | 4 | 6 | 6 | 0 |
| Vendor Panel | 20 | 2 | 6 | 5 |
| Storefront | 6 (Backend only) | 4 | 0 | 1 |
| System & Security | 12 | 0 | 6 | 1 |
| **Total** | **42** | **12** | **18** | **7** |

> **Note:** "Layer" indicates where work is needed for that feature. "Backend" = NestJS API code. "Frontend" = Next.js UI. "Infrastructure" = DevOps/deployment.
