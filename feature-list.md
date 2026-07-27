# Ecomize — Complete Feature List

> **Legend:** ✅ Implemented (Backend) | 🔜 Due (Priority) | 🧭 Roadmap
> **Stack:** NestJS + Prisma + PostgreSQL (Backend) | Next.js (Frontend — not started)
> **Cost:** — = No deps | Free = Open source / free API | Free tier = Has free tier | Tx fee = Transaction-based fee | Paid = Requires payment

---

## 1. SUPER ADMIN PANEL (Platform Owner)

| # | Feature | Status | Layer | Priority | Dependencies / Cost | Notes |
|---|---------|--------|-------|----------|-------------------|-------|
| 1.1 | Plan CRUD | ✅ Done | Backend | — | — | Full CRUD with product/traffic/storage limits |
| 1.2 | Tenant CRUD | ✅ Done | Backend | — | — | Subdomain + custom domain, status management |
| 1.3 | Tenant impersonation | ✅ Done | Backend | — | — | Generate JWT as vendor OWNER |
| 1.4 | Traffic/rate limiting | ✅ Done | Backend | — | Redis (free self-hosted) | Daily request caps via TrafficLog table |
| 1.5 | Super Admin login & auth | 🔜 Due | Backend | High | — | Login/2FA for platform admin (model exists) |
| 1.6 | Super Admin 2FA | 🔜 Due | Backend | High | — | TOTP 2FA (model exists, no code) |
| 1.7 | Admin role-based access | 🔜 Due | Backend | High | — | Permission system for admin staff |
| 1.8 | Subscription billing (Stripe) | 🔜 Due | Backend | High | Stripe (~2.9% + $0.30/txn) | Recurring payments, webhooks, auto-renew |
| 1.9 | Subscription CRUD | 🔜 Due | Backend | High | — | Assign plans, upgrade/downgrade cycle |
| 1.10 | Multi-currency plan pricing | 🔜 Due | Backend | Low | — | Set pricing in multiple currencies per plan |
| 1.11 | Admin store data access | 🔜 Due | Backend | Medium | — | View vendor products, orders, customers |
| 1.12 | GlobalTheme management | 🔜 Due | Backend | High | Cloudinary (free 25GB) | Theme rollout for vendors (model exists) |
| 1.13 | Vendor onboarding workflow | 🔜 Due | Backend | High | — | Approval/suspension lifecycle |
| 1.14 | Custom domain auto-SSL | 🔜 Due | Backend | Medium | Cloudflare (Free plan) | Let's Encrypt / Cloudflare SSL provisioning |
| 1.15 | Visitor quota enforcement | 🔜 Due | Backend | Medium | Redis / Upstash (free tier) | Count visitors, throttle when over limit |
| 1.16 | Platform analytics dashboard | 🔜 Due | B/E + F/E | Medium | — | Aggregated platform metrics |
| 1.17 | Infrastructure monitoring | 🔜 Due | B/E + F/E | Medium | Grafana/Prometheus (free self-hosted) | Per-tenant resource usage |
| 1.18 | Global announcement & notifications | 🔜 Due | B/E + F/E | Medium | Email/SMS provider (free tier) | Send alerts to all/multiple vendors |
| 1.19 | Audit log | 🔜 Due | Backend | Medium | — | Activity tracking for compliance |
| 1.20 | GDPR data anonymization | 🔜 Due | Backend | Low | — | Data anonymization for GDPR compliance |
| 1.21 | Invoice & tax management | 🔜 Due | Backend | Low | — | PDF invoices, multi-currency, tax rules |
| 1.22 | Platform payment gateway (manual withdrawal) | 🔜 Due | Backend | Medium | Stripe/SSLCommerz (txn fees) | Platform-as-gateway, manual payout records |
| 1.23 | Feature toggle system | 🔜 Due | Backend | Low | — | Enable/disable features per tenant |
| 1.24 | Super Admin panel UI | 🔜 Due | Frontend | High | — | Dashboard, vendor list, plan mgmt, etc. |

---

## 2. VENDOR PANEL (Merchant Dashboard)

| # | Feature | Status | Layer | Priority | Dependencies / Cost | Notes |
|---|---------|--------|-------|----------|-------------------|-------|
| 2.1 | Staff registration & login (JWT) | ✅ Done | Backend | — | — | Register/login with bcrypt password hashing |
| 2.2 | TOTP 2FA | ✅ Done | Backend | — | — | QR code + otplib |
| 2.3 | Store settings | ✅ Done | Backend | — | — | Name, logo, brand color, theme config |
| 2.4 | Custom CSS / JS per store | ✅ Done | Backend | — | — | Stored in StoreSetting model |
| 2.5 | Category management (nested) | ✅ Done | Backend | — | — | Full CRUD with parent/children |
| 2.6 | Product CRUD with variants | ✅ Done | Backend | — | — | Size/color/weight/SKU/price/stock |
| 2.7 | Bulk product import via CSV | ✅ Done | Backend | — | BullMQ + Redis (free OSS) | BullMQ background queue processor |
| 2.8 | Meilisearch full-text search | ✅ Done | Backend | — | Meilisearch (free self-hosted) | Per-tenant indices, auto-synced |
| 2.9 | Supplier management CRUD | ✅ Done | Backend | — | — | Supplier names, contacts, addresses |
| 2.10 | Coupon/discount engine CRUD | ✅ Done | Backend | — | — | Percentage/flat, min order, date range |
| 2.11 | Order checkout flow | ✅ Done | Backend | — | — | Stock deduction, coupon, anti-fraud, shipping |
| 2.12 | Anti-fraud order protection | ✅ Done | Backend | — | FingerprintJS (20K visits/mo free) | Blocklist, fingerprint, velocity check |
| 2.13 | bKash payment integration | ✅ Done | Backend | — | bKash API (txn fees) | Tokenized checkout API with callback |
| 2.14 | SSLCommerz payment integration | ✅ Done | Backend | — | SSLCommerz API (txn fees) | Gateway API v4 with IPN callback |
| 2.15 | PDF invoice generation | ✅ Done | Backend | — | — | Per-order PDF via PDFKit |
| 2.16 | Steadfast courier fulfillment | ✅ Done | Backend | — | Steadfast API (courier fees) | Create order with sandbox mock |
| 2.17 | Pathao courier fulfillment | ✅ Done | Backend | — | Pathao API (courier fees) | Token grant + create order with sandbox mock |
| 2.18 | Order listing & status updates | ✅ Done | Backend | — | — | Payment/shipping status management |
| 2.19 | Integrations key management | ✅ Done | Backend | — | — | Store API keys per provider |
| 2.20 | Analytics dashboard | ✅ Done | Backend | — | — | Revenue, sales chart, top products |
| 2.21 | Image upload to Cloudinary | ✅ Done | Backend | — | Cloudinary (25GB free) | Product/store images |
| 2.22 | SupplyBatch (stock entry & costing) | 🔜 Due | Backend | Medium | — | Schema exists, no endpoints |
| 2.23 | NAGAD payment integration | 🔜 Due | Backend | Medium | Nagad API (txn fees) | Schema has NAGAD enum |
| 2.24 | FB Pixel / GA4 / GTM tracking | 🔜 Due | Backend | Medium | FB/Google APIs (free) | Schema has enums, no implementation |
| 2.25 | Role-based authorization | 🔜 Due | Backend | Medium | — | OWNER/ADMIN/STAFF guards |
| 2.26 | Order refund & return handling | 🔜 Due | Backend | Medium | — | Full return workflow |
| 2.27 | Abandoned cart recovery | 🔜 Due | B/E + F/E | Medium | Email/SMS provider (free tier) | Email/SMS reminders |
| 2.28 | Flash sales & advanced promos | 🔜 Due | Backend | Low | — | Time-bound sales events |
| 2.29 | Email marketing integration | 🔜 Due | B/E + F/E | Low | Mailchimp (500 contacts free) | Campaign management |
| 2.30 | SEO management (meta, sitemap, OG) | 🔜 Due | Backend | Low | — | Per-page SEO editor |
| 2.31 | Customer list & CRUD | 🔜 Due | Backend | Medium | — | Customer records with segmentation |
| 2.32 | Enable/disable store toggle | 🔜 Due | Backend | Medium | — | Pause/resume storefront visibility |
| 2.33 | Digital product support | 🔜 Due | Backend | Medium | — | File delivery for digital downloads |
| 2.34 | Low-stock alerts | 🔜 Due | Backend | Medium | Email/SMS provider (free tier) | Notify when stock below threshold |
| 2.35 | Shipping zones & rates | 🔜 Due | Backend | Medium | — | Zone-based shipping cost config |
| 2.36 | Redx courier integration | 🔜 Due | Backend | Medium | Redx API (courier fees) | Courier booking with AWB generation |
| 2.37 | Webhook configuration | 🔜 Due | Backend | Medium | — | Event-driven webhook calls |
| 2.38 | Data export — CSV/JSON | 🔜 Due | Backend | Medium | — | Export products, orders, customers |
| 2.39 | Product scheduling — launch later | 🔜 Due | Backend | Low | — | Schedule product publish date |
| 2.40 | BOGO offers | 🔜 Due | Backend | Low | — | Buy-one-get-one promotion engine |
| 2.41 | Tax rules by region | 🔜 Due | Backend | Low | — | Tax config per region |
| 2.42 | Social media links & auto-sharing | 🔜 Due | Both | Low | Free | FB/Twitter/WhatsApp sharing config |
| 2.43 | Popup campaigns & exit intent | 🔜 Due | Both | Low | — | Marketing popups with exit detection |
| 2.44 | Contact form | 🔜 Due | Backend | Low | — | Customer inquiry form handling |
| 2.45 | Heatmaps & session replays | 🧭 Roadmap | Both | Low | Hotjar/Clarity (free tier) | Visitor behavior analytics |
| 2.46 | Vendor dashboard UI | 🔜 Due | Frontend | High | — | Full merchant dashboard |
| 2.47 | Drag-and-drop storefront builder | 🔜 Due | Frontend | High | GrapesJS (open source) | Section-based page builder |
| 2.48 | Live chat widget | 🧭 Roadmap | Frontend | Low | Tawk.to / Crisp (free tier) | Customer engagement |
| 2.49 | Multi-language support | 🧭 Roadmap | Frontend | Low | i18n libraries (open source) | i18n per store |
| 2.50 | Affiliate system | 🧭 Roadmap | B/E + F/E | Low | — | Referral tracking |
| 2.51 | Loyalty points system | 🧭 Roadmap | Backend | Low | — | Customer rewards |
| 2.52 | Multi-warehouse stock support | 🧭 Roadmap | Backend | Low | — | Premium feature |
| 2.53 | Mobile app / PWA generation | 🧭 Roadmap | Frontend | Low | PWA (free), App store ($99/yr) | For premium vendors |

---

## 3. CUSTOMER STOREFRONT

| # | Feature | Status | Layer | Priority | Dependencies / Cost | Notes |
|---|---------|--------|-------|----------|-------------------|-------|
| 3.1 | Public product catalog & browsing | ✅ Done | Backend only | — | — | API ready, no frontend |
| 3.2 | Public category browsing | ✅ Done | Backend only | — | — | API ready, no frontend |
| 3.3 | Meilisearch instant product search | ✅ Done | Backend only | — | Meilisearch (free self-hosted) | Full-text search API ready |
| 3.4 | Checkout API (COD + gateways) | ✅ Done | Backend only | — | bKash/SSLCommerz (txn fees) | Full checkout flow API ready |
| 3.5 | OTP verification for COD orders | ✅ Done | Backend only | — | SMS gateway (pay-per-use) | Via SMS gateway (Redis TTL) |
| 3.6 | Order tracking page | ✅ Done | Backend only | — | — | Public order lookup API ready |
| 3.7 | Responsive storefront UI (Next.js) | 🔜 Due | Frontend | High | — | SSR/ISR, sub-1s load target |
| 3.8 | Quick one-page checkout UI | 🔜 Due | Frontend | High | — | Full checkout form |
| 3.9 | Product filtering UI | 🔜 Due | Frontend | High | — | Price, size, category filters |
| 3.10 | CDN edge caching (Cloudflare) | 🔜 Due | Infrastructure | High | Cloudflare (Free plan) | For static assets & ISR pages |
| 3.11 | Incremental Static Regeneration | 🔜 Due | Frontend | High | — | Next.js ISR for fast page loads |
| 3.12 | Product reviews & ratings | 🧭 Roadmap | B/E + F/E | Low | — | Customer testimonials |

---

## 4. SYSTEM & SECURITY

| # | Feature | Status | Layer | Priority | Dependencies / Cost | Notes |
|---|---------|--------|-------|----------|-------------------|-------|
| 4.1 | Multi-tenant DB-per-tenant isolation | ✅ Done | Backend | — | PostgreSQL / Supabase (free tier) | Separate PostgreSQL DB per vendor |
| 4.2 | Subdomain-based tenant resolution | ✅ Done | Backend | — | — | Auto-detect from Host header |
| 4.3 | Custom domain resolution | ✅ Done | Backend | — | — | Fallback lookup by domain |
| 4.4 | Global rate limiting | ✅ Done | Backend | — | — | NestJS ThrottlerModule (100 req/min) |
| 4.5 | Per-plan daily traffic quota | ✅ Done | Backend | — | Redis (free self-hosted) | Custom TrafficThrottleMiddleware |
| 4.6 | JWT authentication | ✅ Done | Backend | — | — | Passport JWT, 1d expiry |
| 4.7 | Password hashing (bcrypt) | ✅ Done | Backend | — | — | 10 rounds |
| 4.8 | Anti-fraud blocklists (email, phone) | ✅ Done | Backend | — | — | BlockedContact model |
| 4.9 | Anti-fraud device fingerprinting | ✅ Done | Backend | — | FingerprintJS (20K/mo free) | BlockedFingerprint model |
| 4.10 | Anti-fraud velocity check | ✅ Done | Backend | — | Redis (free self-hosted) | Max 3 orders/5min per fingerprint |
| 4.11 | BullMQ background job queue | ✅ Done | Backend | — | BullMQ + Redis (free OSS) | CSV import queue |
| 4.12 | Swagger API documentation | ✅ Done | Backend | — | — | `/api` endpoint |
| 4.13 | Cloudinary image storage | ✅ Done | Backend | — | Cloudinary (25GB free) | Product/store image upload |
| 4.14 | CAPTCHA for login & forms | 🔜 Due | B/E + F/E | Medium | reCAPTCHA / Turnstile (free) | Brute-force protection |
| 4.15 | WAF | 🔜 Due | Infrastructure | Medium | Cloudflare (Free WAF) | AWS WAF / Cloudflare |
| 4.16 | Automated backups & restore | 🔜 Due | Infrastructure | Medium | DB provider dependent (free tier) | DB backup strategy |
| 4.17 | Rate limiting per store / API key | 🔜 Due | Backend | Medium | Redis (free self-hosted) | API key-based throttling |
| 4.18 | ELK / CloudWatch logging | 🔜 Due | Infrastructure | Medium | ELK (free self-hosted), CloudWatch (free tier) | Centralized logging |
| 4.19 | CI/CD pipeline | 🔜 Due | Infrastructure | Medium | GitHub Actions (2000 min/mo free) | Automated testing + deployment |
| 4.20 | Docker containerization | 🔜 Due | Infrastructure | Medium | Docker (free OSS) | Dockerfile + compose exist, deployment pending |
| 4.21 | Kubernetes auto-scaling | 🧭 Roadmap | Infrastructure | Low | EKS / Fargate (cluster cost) | EKS / Fargate orchestration |

---

## Summary

| Category | ✅ Implemented | 🔜 Due (High) | 🔜 Due (Med/Low) | 🧭 Roadmap |
|----------|---------------|----------------|-------------------|-----------|
| Super Admin | 4 | 8 | 12 | 0 |
| Vendor Panel | 21 | 2 | 23 | 7 |
| Storefront | 6 (Backend only) | 5 | 0 | 1 |
| System & Security | 13 | 0 | 7 | 1 |
| **Total** | **44** | **15** | **42** | **9** |

> **Note:** "Layer" indicates where work is needed. "Backend" = NestJS API. "Frontend" = Next.js UI. "Infrastructure" = DevOps/deployment.
