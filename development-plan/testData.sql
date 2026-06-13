-- Ecomize Mock Test Data Script (Supabase Optimized)
-- Fixed UUIDs to use valid Hexadecimal characters (0-9, a-f only).

-- Clean up existing data (Order matters because of Foreign Keys)
TRUNCATE TABLE 
    order_items, 
    orders, 
    supply_batches, 
    product_variants, 
    products, 
    suppliers, 
    staff, 
    store_settings, 
    coupons, 
    integrations,
    subscriptions, 
    tenants, 
    plans, 
    super_admins, 
    global_themes
    CASCADE;

-- Truncate auth.users (Supabase native table)
TRUNCATE TABLE auth.users CASCADE;

-- =========================================================================
-- 1. Super Admins
-- =========================================================================
INSERT INTO super_admins (id, name, email, password, two_factor_enabled) VALUES
('a1111111-1111-1111-1111-111111111111', 'Admin Jarvis', 'admin@ecomize.com', '$2b$10$dummyhashpassword1', false),
('a2222222-2222-2222-2222-222222222222', 'Rahat Kabir', 'rahat@ecomize.com', '$2b$10$dummyhashpassword2', true),
('a3333333-3333-3333-3333-333333333333', 'Siam Islam', 'siam@ecomize.com', '$2b$10$dummyhashpassword3', false),
('a4444444-4444-4444-4444-444444444444', 'Anika Bushra', 'anika@ecomize.com', '$2b$10$dummyhashpassword4', false),
('a5555555-5555-5555-5555-555555555555', 'Root User', 'root@ecomize.com', '$2b$10$dummyhashpassword5', true);

-- =========================================================================
-- 2. Tenants (Vendors)
-- =========================================================================
INSERT INTO tenants (id, subdomain, custom_domain, status) VALUES
('b1111111-1111-1111-1111-111111111111', 'gadgetshop', 'gadgetshop.com.bd', 'ACTIVE'),
('b2222222-2222-2222-2222-222222222222', 'fashionhouse', 'fashionhouse.com', 'ACTIVE'),
('b3333333-3333-3333-3333-333333333333', 'organicfood', NULL, 'PENDING'),
('b4444444-4444-4444-4444-444444444444', 'booknook', 'booknook.store', 'ACTIVE'),
('b5555555-5555-5555-5555-555555555555', 'cosmeticscentral', 'cosmetics.net', 'SUSPENDED');

-- =========================================================================
-- 3. Plans
-- =========================================================================
INSERT INTO plans (id, name, product_limit, traffic_limit, storage_limit, price, interval) VALUES
('c1111111-1111-1111-1111-111111111111', 'Free', 50, 5000, 500, 0.00, 'MONTHLY'),
('c2222222-2222-2222-2222-222222222222', 'Starter', 500, 50000, 2048, 1500.00, 'MONTHLY'),
('c3333333-3333-3333-3333-333333333333', 'Pro', 5000, 200000, 10240, 3500.00, 'MONTHLY'),
('c4444444-4444-4444-4444-444444444444', 'Enterprise', 100000, 1000000, 102400, 15000.00, 'MONTHLY'),
('c5555555-5555-5555-5555-555555555555', 'Pro Yearly', 5000, 200000, 10240, 35000.00, 'YEARLY');

-- =========================================================================
-- 4. Subscriptions
-- =========================================================================
INSERT INTO subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end) VALUES
('d1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'ACTIVE', NOW(), NOW() + INTERVAL '30 days'),
('d2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'ACTIVE', NOW(), NOW() + INTERVAL '30 days'),
('d3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'ACTIVE', NOW(), NOW() + INTERVAL '30 days'),
('d4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'c5555555-5555-5555-5555-555555555555', 'ACTIVE', NOW(), NOW() + INTERVAL '365 days'),
('d5555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'c3333333-3333-3333-3333-333333333333', 'CANCELED', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days');

-- =========================================================================
-- 5. Global Themes
-- =========================================================================
INSERT INTO global_themes (id, name, code_identifier, preview_url, is_active) VALUES
('e1111111-1111-1111-1111-111111111111', 'Ecomize Classic', 'classic-theme', 'https://cdn.ecomize.com/themes/classic.png', true),
('e2222222-2222-2222-2222-222222222222', 'Dark Mode Pro', 'dark-theme', 'https://cdn.ecomize.com/themes/dark.png', true),
('e3333333-3333-3333-3333-333333333333', 'Organic Fresh', 'organic-theme', 'https://cdn.ecomize.com/themes/organic.png', true),
('e4444444-4444-4444-4444-444444444444', 'Minimalist Clean', 'minimal-theme', 'https://cdn.ecomize.com/themes/minimal.png', true),
('e5555555-5555-5555-5555-555555555555', 'Retro Vapor', 'retro-theme', 'https://cdn.ecomize.com/themes/retro.png', false);

-- =========================================================================
-- 6. Store Settings
-- =========================================================================
INSERT INTO store_settings (id, tenant_id, store_name, logo_url, brand_color, theme_config, custom_css, custom_js) VALUES
('f1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Gadget Shop BD', 'https://cdn.r2.com/gadget_logo.png', '#FF5733', '{"sections": ["hero", "trending", "banner"]}', 'body { font-family: Inter; }', 'console.log("gadget shop initialized");'),
('f2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'Vogue Fashion', 'https://cdn.r2.com/vogue_logo.png', '#E91E63', '{"sections": ["slider", "categories", "grid"]}', '.nav { background: pink; }', NULL),
('f3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'Organic Farm', 'https://cdn.r2.com/organic_logo.png', '#4CAF50', '{"sections": ["hero", "fresh-badge"]}', NULL, NULL),
('f4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'Book Nook', 'https://cdn.r2.com/book_logo.png', '#3F51B5', '{"sections": ["hero", "recent-books"]}', 'h1 { color: #3F51B5; }', 'alert("Welcome to Book Nook");'),
('f5555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'Central Cosmetics', NULL, '#9C27B0', '{"sections": ["hero", "grid"]}', NULL, NULL);

-- =========================================================================
-- Supabase native auth.users Mock Data Insertion
-- =========================================================================
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud) VALUES
('11111111-1111-1111-1111-111111111111', 'owner1@gadget.com', '$2b$10$dummyhash1', NOW(), 'authenticated', 'authenticated'),
('22222222-2222-2222-2222-222222222222', 'owner2@fashion.com', '$2b$10$dummyhash2', NOW(), 'authenticated', 'authenticated'),
('33333333-3333-3333-3333-333333333333', 'owner3@organic.com', '$2b$10$dummyhash3', NOW(), 'authenticated', 'authenticated'),
('44444444-4444-4444-4444-444444444444', 'owner4@books.com', '$2b$10$dummyhash4', NOW(), 'authenticated', 'authenticated'),
('55555555-5555-5555-5555-555555555555', 'owner5@cosmetics.com', '$2b$10$dummyhash5', NOW(), 'authenticated', 'authenticated');

-- =========================================================================
-- 7. Staff
-- =========================================================================
INSERT INTO staff (id, tenant_id, name, role, status) VALUES
('11111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Rahim Ahmed', 'OWNER', true),
('22222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'Karim Mia', 'OWNER', true),
('33333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'Saleh Ahmed', 'OWNER', true),
('44444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'Liton Das', 'OWNER', true),
('55555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'Mousumi Akter', 'OWNER', true);

-- =========================================================================
-- 8. Suppliers
-- =========================================================================
INSERT INTO suppliers (id, tenant_id, name, email, phone, address) VALUES
('11111111-2222-2222-2222-111111111111', 'b1111111-1111-1111-1111-111111111111', 'China Gadget Import', 'import@chinagadget.com', '01700000001', 'Dhaka, Bangladesh'),
('22222222-3333-3333-3333-222222222222', 'b2222222-2222-2222-2222-222222222222', 'Textile Source BD', 'sales@textilesource.com', '01700000002', 'Narayanganj'),
('33333333-4444-4444-4444-333333333333', 'b3333333-3333-3333-3333-333333333333', 'Bogra Organic Farms', NULL, '01700000003', 'Bogra'),
('44444444-5555-5555-5555-444444444444', 'b4444444-4444-4444-4444-444444444444', 'Bengal Publications', 'info@bengalpub.com', '01700000004', 'Banglabazar, Dhaka'),
('55555555-6666-6666-6666-555555555555', 'b5555555-5555-5555-5555-555555555555', 'Seoul Cosmetics Ltd', 'korea@seoulcosmetics.com', '01700000005', 'Seoul, South Korea');

-- =========================================================================
-- 9. Products
-- =========================================================================
INSERT INTO products (id, tenant_id, title, description, base_price, compare_price, status) VALUES
('11111111-3333-3333-3333-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Pro Wireless Earbuds', 'ANC support wireless earbuds', 3500.00, 4500.00, 'ACTIVE'),
('22222222-4444-4444-4444-222222222222', 'b2222222-2222-2222-2222-222222222222', 'Slim Fit Denim Jeans', '100% stretchable denim', 1800.00, 2500.00, 'ACTIVE'),
('33333333-5555-5555-5555-333333333333', 'b3333333-3333-3333-3333-333333333333', 'Premium Honey 1KG', 'Pure raw sundarban honey', 1200.00, 1500.00, 'ACTIVE'),
('44444444-6666-6666-6666-444444444444', 'b4444444-4444-4444-4444-444444444444', 'Python Programming Book', 'Basic to advanced python coding guide', 450.00, 600.00, 'ACTIVE'),
('55555555-7777-7777-7777-555555555555', 'b5555555-5555-5555-5555-555555555555', 'Aloe Vera Skin Gel', 'Natural extract skin moisturizing gel', 350.00, 500.00, 'ACTIVE');

-- =========================================================================
-- 10. Product Variants
-- =========================================================================
INSERT INTO product_variants (id, tenant_id, product_id, sku, price, stock, size, color, weight) VALUES
('11111111-4444-4444-4444-111111111111', 'b1111111-1111-1111-1111-111111111111', '11111111-3333-3333-3333-111111111111', 'EAR-PRO-BLK', 3500.00, 150, 'Standard', 'Black', 0.15),
('22222222-5555-5555-5555-222222222222', 'b2222222-2222-2222-2222-222222222222', '22222222-4444-4444-4444-222222222222', 'DNM-32-BLU', 1800.00, 80, '32', 'Blue', 0.60),
('33333333-6666-6666-6666-333333333333', 'b3333333-3333-3333-3333-333333333333', '33333333-5555-5555-5555-333333333333', 'HON-PRE-1KG', 1200.00, 200, '1KG', 'Amber', 1.10),
('44444444-7777-7777-7777-444444444444', 'b4444444-4444-4444-4444-444444444444', '44444444-6666-6666-6666-444444444444', 'BOK-PY-BASIC', 450.00, 30, 'Paperback', 'Green', 0.40),
('55555555-8888-8888-8888-555555555555', 'b5555555-5555-5555-5555-555555555555', '55555555-7777-7777-7777-555555555555', 'ALOE-GEL-100', 350.00, 0, '100ML', 'Clear', 0.12);

-- =========================================================================
-- 11. Supply Batches
-- =========================================================================
INSERT INTO supply_batches (id, tenant_id, supplier_id, variant_id, quantity, cost_price) VALUES
('11111111-5555-5555-5555-111111111111', 'b1111111-1111-1111-1111-111111111111', '11111111-2222-2222-2222-111111111111', '11111111-4444-4444-4444-111111111111', 200, 2000.00),
('22222222-6666-6666-6666-222222222222', 'b2222222-2222-2222-2222-222222222222', '22222222-3333-3333-3333-222222222222', '22222222-5555-5555-5555-222222222222', 100, 1000.00),
('33333333-7777-7777-7777-333333333333', 'b3333333-3333-3333-3333-333333333333', '33333333-4444-4444-4444-333333333333', '33333333-6666-6666-6666-333333333333', 250, 700.00),
('44444444-8888-8888-8888-444444444444', 'b4444444-4444-4444-4444-444444444444', '44444444-5555-5555-5555-444444444444', '44444444-7777-7777-7777-444444444444', 50, 250.00),
('55555555-9999-9999-9999-555555555555', 'b5555555-5555-5555-5555-555555555555', '55555555-6666-6666-6666-555555555555', '55555555-8888-8888-8888-555555555555', 150, 150.00);

-- =========================================================================
-- 12. Orders
-- =========================================================================
INSERT INTO orders (id, tenant_id, customer_name, customer_email, customer_phone, shipping_address, total_price, shipping_charge, payment_method, payment_status, shipping_status, awb_code, tracking_url) VALUES
('11111111-6666-6666-6666-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Jamil Hasan', 'jamil@gmail.com', '01800000001', 'Mirpur-10, Dhaka', 3560.00, 60.00, 'COD', 'PENDING', 'PENDING', NULL, NULL),
('22222222-7777-7777-7777-222222222222', 'b2222222-2222-2222-2222-222222222222', 'Tasnim Mim', 'tasnim@yahoo.com', '01800000002', 'Halishahar, Chittagong', 1920.00, 120.00, 'BKASH', 'PAID', 'PROCESSING', NULL, NULL),
('33333333-8888-8888-8888-333333333333', 'b3333333-3333-3333-3333-333333333333', 'Fahim Faisal', NULL, '01800000003', 'Rajshahi Town', 1260.00, 60.00, 'NAGAD', 'PAID', 'SHIPPED', 'ST-99881', 'https://steadfast.com.bd/track/ST-99881'),
('44444444-9999-9999-9999-444444444444', 'b4444444-4444-4444-4444-444444444444', 'Nusrat Jahan', 'nusrat@outlook.com', '01800000004', 'Dhanmondi, Dhaka', 510.00, 60.00, 'COD', 'PENDING', 'DELIVERED', 'PT-4421', 'https://pathao.com.bd/track/PT-4421'),
('55555555-aaaa-aaaa-aaaa-555555555555', 'b5555555-5555-5555-5555-555555555555', 'Sajid Islam', 'sajid@gmail.com', '01800000005', 'Sylhet Zilla', 350.00, 0.00, 'CARD', 'FAILED', 'CANCELLED', NULL, NULL);

-- =========================================================================
-- 13. Order Items
-- =========================================================================
INSERT INTO order_items (id, tenant_id, order_id, variant_id, quantity, price) VALUES
('11111111-7777-7777-7777-111111111111', 'b1111111-1111-1111-1111-111111111111', '11111111-6666-6666-6666-111111111111', '11111111-4444-4444-4444-111111111111', 1, 3500.00),
('22222222-8888-8888-8888-222222222222', 'b2222222-2222-2222-2222-222222222222', '22222222-7777-7777-7777-222222222222', '22222222-5555-5555-5555-222222222222', 1, 1800.00),
('33333333-9999-9999-9999-333333333333', 'b3333333-3333-3333-3333-333333333333', '33333333-8888-8888-8888-333333333333', '33333333-6666-6666-6666-333333333333', 1, 1200.00),
('44444444-aaaa-aaaa-aaaa-444444444444', 'b4444444-4444-4444-4444-444444444444', '44444444-9999-9999-9999-444444444444', '44444444-7777-7777-7777-444444444444', 1, 450.00),
('55555555-bbbb-bbbb-bbbb-555555555555', 'b5555555-5555-5555-5555-555555555555', '55555555-aaaa-aaaa-aaaa-555555555555', '55555555-8888-8888-8888-555555555555', 1, 350.00);

-- =========================================================================
-- 14. Coupons
-- =========================================================================
INSERT INTO coupons (id, tenant_id, code, type, value, min_order_value, start_date, end_date, is_active) VALUES
('11111111-8888-8888-8888-111111111111', 'b1111111-1111-1111-1111-111111111111', 'GADGET10', 'PERCENTAGE', 10.00, 2000.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', true),
('22222222-9999-9999-9999-222222222222', 'b2222222-2222-2222-2222-222222222222', 'WINTER200', 'FLAT', 200.00, 1500.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '10 days', true),
('33333333-aaaa-aaaa-aaaa-333333333333', 'b3333333-3333-3333-3333-333333333333', 'FREEFREE', 'PERCENTAGE', 100.00, 5000.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days', false),
('44444444-bbbb-bbbb-bbbb-444444444444', 'b4444444-4444-4444-4444-444444444444', 'READMORE', 'PERCENTAGE', 15.00, 500.00, NOW() - INTERVAL '1 day', NOW() + INTERVAL '60 days', true),
('55555555-cccc-cccc-cccc-555555555555', 'b5555555-5555-5555-5555-555555555555', 'GLOWUP', 'PERCENTAGE', 12.00, 1000.00, NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', true);

-- =========================================================================
-- 15. Integrations
-- =========================================================================
INSERT INTO integrations (id, tenant_id, provider, keys_json, is_active) VALUES
('11111111-9999-9999-9999-111111111111', 'b1111111-1111-1111-1111-111111111111', 'BKASH', '{"app_key": "bkash_key_123", "app_secret": "bkash_sec_456"}', true),
('22222222-aaaa-aaaa-aaaa-222222222222', 'b2222222-2222-2222-2222-222222222222', 'FB_PIXEL', '{"pixel_id": "999888777"}', true),
('33333333-bbbb-bbbb-bbbb-333333333333', 'b3333333-3333-3333-3333-333333333333', 'STEADFAST', '{"api_key": "steadfast_api_key_xyz", "secret_key": "sec_1"}', true),
('44444444-cccc-cccc-cccc-444444444444', 'b4444444-4444-4444-4444-444444444444', 'GA4', '{"measurement_id": "G-ABC123XYZ"}', true),
('55555555-dddd-dddd-dddd-555555555555', 'b5555555-5555-5555-5555-555555555555', 'SSLCOMMERZ', '{"store_id": "ssl_store_1", "store_pass": "ssl_pass_1"}', false);
