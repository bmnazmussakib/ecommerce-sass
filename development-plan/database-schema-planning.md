# Ecomize — Multi-Tenant Database Schema Planning

মাল্টি-টেন্যান্ট (Database-per-Tenant) আর্কিটেকচার অনুযায়ী ইকোমাইজের জন্য ২টি ডাটাবেস লেয়ার ডিজাইন করা হয়েছে।

---

## **১. Master Database Schema (Central/Shared Database)**
এই ডাটাবেসটি সেন্ট্রাল এবং শেয়ার্ড। এখানে প্ল্যাটফর্মের কোর সেটিংস, সাবস্ক্রিপশন প্ল্যান এবং ভেন্ডরদের ডাটাবেস কানেকশন স্ট্রিং সংরক্ষিত থাকে।

```prisma
// Prisma Schema Representation for Master DB

model SuperAdmin {
  id                String   @id @default(uuid())
  name              String
  email             String   @unique
  password          String
  twoFactorSecret   String?
  twoFactorEnabled  Boolean  @default(false)
  createdAt         DateTime @default(now())
}

model Tenant {
  id                 String        @id @default(uuid())
  subdomain          String        @unique
  customDomain       String?       @unique
  status             TenantStatus  @default(PENDING) // PENDING, ACTIVE, SUSPENDED
  dbConnectionString String // টেন্যান্টের নিজস্ব PostgreSQL ডাটাবেসের URL
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
  subscription       Subscription?
}

enum TenantStatus {
  PENDING
  ACTIVE
  SUSPENDED
}

model Plan {
  id           String         @id @default(uuid())
  name         String // Free, Starter, Pro, Enterprise
  productLimit Int
  trafficLimit Int // Monthly visitor cap
  storageLimit Int // In Megabytes
  price        Decimal        @db.Decimal(10, 2)
  interval     BillingCycle   @default(MONTHLY) // MONTHLY, YEARLY
  subscriptions Subscription[]
}

enum BillingCycle {
  MONTHLY
  YEARLY
}

model Subscription {
  id                 String             @id @default(uuid())
  tenantId           String             @unique
  tenant             Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  planId             String
  plan               Plan               @relation(fields: [planId], references: [id])
  status             SubscriptionStatus @default(ACTIVE)
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  stripeSubscriptionId String?
  createdAt          DateTime           @default(now())
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
}

model GlobalTheme {
  id             String   @id @default(uuid())
  name           String
  codeIdentifier String   @unique // e.g., 'classic-theme', 'bold-theme'
  previewUrl     String
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
}
```

---

## **২. Tenant Database Schema (Isolated PostgreSQL Database per Vendor)**
প্রতিটি ভেন্ডরের জন্য এই স্কিমার একটি আলাদা ডাটাবেস ক্লোন তৈরি হবে। এখানে ভেন্ডরের নিজস্ব ডাটা যেমন কাস্টমার, প্রোডাক্ট ও অর্ডার সংরক্ষিত থাকবে।

```prisma
// Prisma Schema Representation for Tenant DB

model StoreSetting {
  id            String   @id @default(uuid())
  storeName     String
  logoUrl       String?
  brandColor    String   @default("#4F46E5")
  themeConfig   Json // ড্র্যাগ-অ্যান্ড-ড্রপ বিল্ডারের লেআউট ও সেটিংস
  customCss     String?
  customJs      String?
  updatedAt     DateTime @updatedAt
}

model Staff {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      StaffRole @default(STAFF)
  status    Boolean  @default(true)
  createdAt DateTime @default(now())
}

enum StaffRole {
  OWNER
  ADMIN
  STAFF
}

model Supplier {
  id        String        @id @default(uuid())
  name      String
  email     String?
  phone     String
  address   String?
  batches   SupplyBatch[]
}

model Product {
  id            String           @id @default(uuid())
  title         String
  description   String
  basePrice     Decimal          @db.Decimal(10, 2)
  comparePrice  Decimal?         @db.Decimal(10, 2)
  status        ProductStatus    @default(DRAFT)
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  variants      ProductVariant[]
}

enum ProductStatus {
  DRAFT
  ACTIVE
  OUT_OF_STOCK
}

model ProductVariant {
  id         String        @id @default(uuid())
  productId  String
  product    Product       @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku        String        @unique
  price      Decimal       @db.Decimal(10, 2)
  stock      Int           @default(0)
  size       String?
  color      String?
  weight     Decimal?      @db.Decimal(6, 2) // In KG
  orderItems OrderItem[]
  batches    SupplyBatch[]
}

model SupplyBatch {
  id         String         @id @default(uuid())
  supplierId String
  supplier   Supplier       @relation(fields: [supplierId], references: [id])
  variantId  String
  variant    ProductVariant @relation(fields: [variantId], references: [id])
  quantity   Int
  costPrice  Decimal        @db.Decimal(10, 2)
  date       DateTime       @default(now())
}

model Order {
  id              String         @id @default(uuid())
  customerName    String
  customerEmail   String?
  customerPhone   String
  shippingAddress String
  totalPrice      Decimal        @db.Decimal(10, 2)
  shippingCharge  Decimal        @db.Decimal(10, 2)
  paymentMethod   PaymentMethod  @default(COD)
  paymentStatus   PaymentStatus  @default(PENDING)
  shippingStatus  ShippingStatus @default(PENDING)
  awbCode         String? // কুরিয়ার বুকিং আইডি (Airway Bill)
  trackingUrl     String?
  createdAt       DateTime       @default(now())
  orderItems      OrderItem[]
}

enum PaymentMethod {
  COD
  BKASH
  NAGAD
  CARD
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum ShippingStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model OrderItem {
  id        String         @id @default(uuid())
  orderId   String
  order     Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variantId String
  variant   ProductVariant @relation(fields: [variantId], references: [id])
  quantity  Int
  price     Decimal        @db.Decimal(10, 2)
}

model Coupon {
  id            String     @id @default(uuid())
  code          String     @unique
  type          CouponType @default(PERCENTAGE)
  value         Decimal    @db.Decimal(10, 2) // ছাড়ের পরিমাণ
  minOrderValue Decimal    @default(0) @db.Decimal(10, 2)
  startDate     DateTime
  endDate       DateTime
  isActive      Boolean    @default(true)
}

enum CouponType {
  PERCENTAGE
  FLAT
}

model Integration {
  id        String          @id @default(uuid())
  provider  IntProviderType @unique // bKash, Nagad, Pathao, FacebookPixel
  keysJson  Json // credentials, secret, API keys
  isActive  Boolean         @default(false)
}

enum IntProviderType {
  BKASH
  NAGAD
  SSLCOMMERZ
  PATHAO
  STEADFAST
  FB_PIXEL
  GA4
}
```
