# 🔐 Ecomize SaaS — Test Credentials Reference

> ⚠️ **LOCAL/DEV USE ONLY. কখনো এই ফাইলটি Git-এ push করবেন না।**

---

## 🌐 API Base URLs

| Environment | URL |
|-------------|-----|
| **Local Dev** (`npm run start:dev`) | `http://localhost:8889` |
| **Docker Compose** (`docker compose up`) | `http://localhost:8888` |
| **Swagger UI** | `http://localhost:8889/api` বা `http://localhost:8888/api` |

---

## 👑 Super Admin (Master Panel)

> Master admin — সব tenant manage করতে পারে

| Field | Value |
|-------|-------|
| **Login Endpoint** | `POST /api/master/auth/login` |
| **Email** | ডেটাবেজে সিড করা ইমেইল দিন |
| **Password** | সিড করার সময় যে পাসওয়ার্ড দেওয়া হয়েছে (bcrypt hashed) |
| **Role** | `SUPER_ADMIN` |

**🔑 Login Request Body:**
```json
{
  "email": "admin@ecomize.com",
  "password": "Admin@123456"
}
```

> ℹ️ Super Admin DB-তে পাসওয়ার্ড অবশ্যই `bcrypt.hash("Admin@123456", 10)` হ্যাশ হিসেবে স্টোর করা থাকতে হবে।

---

## 🏪 Tenant Staff / Store Owner

> প্রতিটি Tenant-এর নিজস্ব DB-তে `Staff` টেবিলে থাকে

| Field | Value |
|-------|-------|
| **Login Endpoint** | `POST /api/tenant/auth/login` |
| **Header Required** | `x-tenant-id: <subdomain>` |
| **Email** | টেন্যান্ট অনবোর্ডের সময় তৈরি হওয়া ইমেইল |
| **Password** | অনবোর্ডের সময় সেট করা পাসওয়ার্ড |
| **Available Roles** | `OWNER`, `ADMIN`, `STAFF` |

**🔑 Login Request Body:**
```json
{
  "email": "owner@mystore.com",
  "password": "MyStore@123"
}
```

**🔑 Test Header (Local Dev):**
```
x-tenant-id: <tenant-subdomain>
```

---

## 🗄️ PostgreSQL — Master DB

| Field | Value |
|-------|-------|
| **Container Name** | `ecomize_postgres_master` |
| **Host (local)** | `localhost` |
| **Port** | `5431` |
| **Database** | `master_db` |
| **Username** | `postgres` |
| **Password** | `postgres` |
| **Connection URL** | `postgresql://postgres:postgres@localhost:5431/master_db` |

---

## 🗄️ PostgreSQL — Tenant Template DB

| Field | Value |
|-------|-------|
| **Container Name** | `ecomize_postgres_tenant` |
| **Host (local)** | `localhost` |
| **Port** | `5432` |
| **Database** | `tenant_template_db` |
| **Username** | `postgres` |
| **Password** | `postgres` |
| **Connection URL** | `postgresql://postgres:postgres@localhost:5432/tenant_template_db` |

---

## 🗄️ PostgreSQL — Supabase (Remote / Production Dev)

| Field | Value |
|-------|-------|
| **Project** | `ulrxqtvluaajdegreidr` |
| **Host** | `aws-1-ap-south-1.pooler.supabase.com` |
| **Port (Pooler)** | `6543` |
| **Port (Direct)** | `5432` |
| **Username** | `postgres.ulrxqtvluaajdegreidr` |
| **Password** | `nsakib151@msdsl` |
| **Database** | `postgres` |
| **Pooler URL** | `postgresql://postgres.ulrxqtvluaajdegreidr:nsakib151@msdsl@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| **Direct URL** | `postgresql://postgres.ulrxqtvluaajdegreidr:nsakib151@msdsl@aws-1-ap-south-1.pooler.supabase.com:5432/postgres` |

---

## 🟥 Redis

| Field | Value |
|-------|-------|
| **Container Name** | `ecomize_redis` |
| **Host (local)** | `localhost` |
| **Port** | `6379` |
| **Password (Docker)** | `ecomize_redis_secure_pass_9281736` |
| **Connection URL** | `redis://:ecomize_redis_secure_pass_9281736@localhost:6379` |

**🔑 Redis CLI Test Command:**
```bash
redis-cli -h localhost -p 6379 -a ecomize_redis_secure_pass_9281736 ping
```

---

## ☁️ Cloudinary (Image Upload)

| Field | Value |
|-------|-------|
| **Cloud Name** | `duurprdyt` |
| **API Key** | `971461827275183` |
| **API Secret** | `CSZprbFB3o5khs_eQQS5xljC_Ys` |

---

## 🔑 JWT

| Field | Value |
|-------|-------|
| **Secret Key** | `ecomize_prod_sec_key_9f83b27a14e67290c41b8a5d3e0f` |
| **Algorithm** | `HS256` |
| **Expiry** | Default NestJS JWT expiry |

> JWT token decode করতে: [jwt.io](https://jwt.io) → Paste token → Secret দিন

---

## 💳 bKash (Sandbox)

> Sandbox test — real payment হয় না

| Field | Value |
|-------|-------|
| **Base URL** | `https://tokenized.sandbox.bka.sh/v1.2.0-beta` |
| **Integration Config** | DB-তে `Integration` টেবিলে `provider: BKASH` row-তে `keysJson` এ সেভ করা থাকে |

---

## 🌐 Tunnel / Public URL (Local Dev Testing)

| Field | Value |
|-------|-------|
| **Current URL** | `https://solid-yaks-trade.loca.lt` |
| **Tool** | `localtunnel` বা `ngrok` |
| **Usage** | bKash / SSLCommerz callback URL হিসেবে ব্যবহার করুন |

> 📝 Tunnel URL প্রতিবার নতুন হয়। `APP_URL` env var আপডেট করুন।

---

## 📡 Swagger API Testing Quick Guide

1. `http://localhost:8889/api` এ যান
2. Master Admin login → `POST /api/master/auth/login`
3. Token copy করুন → Swagger-এর **Authorize** বাটনে paste করুন
4. Tenant endpoint test করতে `x-tenant-id` header যোগ করুন

---

## 🧪 Sample Test Requests

### Tenant Login
```bash
curl -X POST http://localhost:8889/api/tenant/auth/login \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: <subdomain>" \
  -d '{"email":"owner@test.com","password":"Test@123"}'
```

### Master Admin Login
```bash
curl -X POST http://localhost:8889/api/master/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecomize.com","password":"Admin@123456"}'
```

### Health Check
```bash
curl http://localhost:8889/api
```
