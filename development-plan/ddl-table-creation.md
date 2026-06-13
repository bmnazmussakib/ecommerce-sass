# Ecomize — Supabase Shared Database with RLS DDL Scripts

একটি সিঙ্গেল Supabase ডাটাবেসের মধ্যে সব ভেন্ডরের ডাটা Row Level Security (RLS) পলিসি এবং `tenant_id` কলাম ব্যবহার করে নিরাপদে আইসোলেট করার DDL স্ক্রিপ্ট নিচে দেওয়া হলো।

---

## **১. Database Schema Setup (এনাম ও সেন্ট্রাল টেবিলসমূহ)**

```sql
-- Create Enums
CREATE TYPE tenant_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');
CREATE TYPE billing_cycle AS ENUM ('MONTHLY', 'YEARLY');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');
CREATE TYPE staff_role AS ENUM ('OWNER', 'ADMIN', 'STAFF');
CREATE TYPE product_status AS ENUM ('DRAFT', 'ACTIVE', 'OUT_OF_STOCK');
CREATE TYPE payment_method AS ENUM ('COD', 'BKASH', 'NAGAD', 'CARD');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE shipping_status AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE coupon_type AS ENUM ('PERCENTAGE', 'FLAT');
CREATE TYPE integration_provider AS ENUM ('BKASH', 'NAGAD', 'SSLCOMMERZ', 'PATHAO', 'STEADFAST', 'FB_PIXEL', 'GA4');

-- 1. Super Admin Table
CREATE TABLE super_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Central Tenants Table (ভেন্ডরদের মূল তালিকা)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain VARCHAR(255) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    status tenant_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Central Plans Table
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    product_limit INT NOT NULL,
    traffic_limit INT NOT NULL,
    storage_limit INT NOT NULL, -- In Megabytes
    price DECIMAL(10, 2) NOT NULL,
    interval billing_cycle DEFAULT 'MONTHLY'
);

-- 4. Central Subscriptions Table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status subscription_status DEFAULT 'ACTIVE',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Central Global Themes Table
CREATE TABLE global_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code_identifier VARCHAR(100) UNIQUE NOT NULL,
    preview_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## **২. Tenant-Specific Tables (ভেন্ডর ডাটা টেবিলসমূহ উইথ tenant_id)**

```sql
-- 6. Store Settings Table
CREATE TABLE store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    brand_color VARCHAR(10) DEFAULT '#4F46E5',
    theme_config JSONB NOT NULL,
    custom_css TEXT,
    custom_js TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Staff Table (Supabase Auth-এর সাথে কানেক্টেড)
CREATE TABLE staff (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role staff_role DEFAULT 'STAFF',
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Supplier Table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    address TEXT
);

-- 9. Product Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    compare_price DECIMAL(10, 2),
    status product_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Product Variant Table
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    size VARCHAR(50),
    color VARCHAR(50),
    weight DECIMAL(6, 2)
);

-- 11. Supply Batch Table
CREATE TABLE supply_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INT NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Order Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    shipping_charge DECIMAL(10, 2) NOT NULL,
    payment_method payment_method DEFAULT 'COD',
    payment_status payment_status DEFAULT 'PENDING',
    shipping_status shipping_status DEFAULT 'PENDING',
    awb_code VARCHAR(100),
    tracking_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Order Item Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- 14. Coupon Table
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    type coupon_type DEFAULT 'PERCENTAGE',
    value DECIMAL(10, 2) NOT NULL,
    min_order_value DECIMAL(10, 2) DEFAULT 0.00,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_coupon_per_tenant UNIQUE (tenant_id, code)
);

-- 15. Integrations Table
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    provider integration_provider NOT NULL,
    keys_json JSONB NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_provider_per_tenant UNIQUE (tenant_id, provider)
);
```

---

## **৩. Row Level Security (RLS) Policies (ডাটা আইসোলেশন এনাবল)**

NestJS যখন ডেটা কুয়েরি করবে, তখন সেশন ডিক্লেয়ার করবে: `SET LOCAL app.current_tenant_id = 'your-tenant-uuid'`. নিচে RLS এনাবল এবং পলিসি স্ক্রিপ্ট দেওয়া হলো:

```sql
-- Enable RLS on Tenant-Specific Tables
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Dynamic Tenant RLS Policy Function (Helper)
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Policies for each table
CREATE POLICY tenant_store_settings_policy ON store_settings
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY tenant_staff_policy ON staff
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY tenant_suppliers_policy ON suppliers
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY tenant_products_policy ON products
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY tenant_product_variants_policy ON product_variants
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY tenant_supply_batches_policy ON supply_batches
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY tenant_orders_policy ON orders
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY tenant_order_items_policy ON order_items
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY tenant_coupons_policy ON coupons
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY tenant_integrations_policy ON integrations
    FOR ALL USING (tenant_id = get_current_tenant_id());
```
