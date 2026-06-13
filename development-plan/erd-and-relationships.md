# Ecomize — Database Entity-Relationship Diagram (ERD) & Relationships

---

## **১. Central / Master Database ERD**

সেন্ট্রাল ডাটাবেসের টেবিলগুলোর মধ্যকার সম্পর্ক (১:১ এবং ১:N সম্পর্ক):

```mermaid
erDiagram
    TENANT {
        string id PK
        string subdomain
        string customDomain
        string status
        string dbConnectionString
        datetime createdAt
    }
    PLAN {
        string id PK
        string name
        int productLimit
        int trafficLimit
        int storageLimit
        decimal price
        string interval
    }
    SUBSCRIPTION {
        string id PK
        string tenantId FK
        string planId FK
        string status
        datetime currentPeriodStart
        datetime currentPeriodEnd
        string stripeSubscriptionId
    }
    SUPER_ADMIN {
        string id PK
        string name
        string email
        string password
        boolean twoFactorEnabled
    }
    GLOBAL_THEME {
        string id PK
        string name
        string codeIdentifier
        string previewUrl
        boolean isActive
    }

    TENANT ||--o| SUBSCRIPTION : "has one"
    PLAN ||--o{ SUBSCRIPTION : "subscribed by many"
```

---

## **২. Tenant Database ERD (প্রতি ভেন্ডরের নিজস্ব ডাটাবেস)**

ভেন্ডরের ইন্টারনাল ডাটাবেসের টেবিলগুলোর সম্পর্ক:

```mermaid
erDiagram
    STORE_SETTING {
        string id PK
        string storeName
        string logoUrl
        string brandColor
        json themeConfig
        string customCss
        string customJs
    }
    STAFF {
        string id PK
        string name
        string email
        string password
        string role
        boolean status
    }
    PRODUCT {
        string id PK
        string title
        string description
        decimal basePrice
        decimal comparePrice
        string status
    }
    PRODUCT_VARIANT {
        string id PK
        string productId FK
        string sku
        decimal price
        int stock
        string size
        string color
        decimal weight
    }
    SUPPLIER {
        string id PK
        string name
        string email
        string phone
        string address
    }
    SUPPLY_BATCH {
        string id PK
        string supplierId FK
        string variantId FK
        int quantity
        decimal costPrice
        datetime date
    }
    ORDER {
        string id PK
        string customerName
        string customerPhone
        string customerEmail
        string shippingAddress
        decimal totalPrice
        decimal shippingCharge
        string paymentMethod
        string paymentStatus
        string shippingStatus
        string awbCode
    }
    ORDER_ITEM {
        string id PK
        string orderId FK
        string variantId FK
        int quantity
        decimal price
    }
    COUPON {
        string id PK
        string code
        string type
        decimal value
        decimal minOrderValue
        datetime endDate
        boolean isActive
    }
    INTEGRATION {
        string id PK
        string provider
        json keysJson
        boolean isActive
    }

    PRODUCT ||--|{ PRODUCT_VARIANT : "has many"
    PRODUCT_VARIANT ||--o{ ORDER_ITEM : "included in many"
    ORDER ||--|{ ORDER_ITEM : "contains many"
    SUPPLIER ||--o{ SUPPLY_BATCH : "supplies many"
    PRODUCT_VARIANT ||--o{ SUPPLY_BATCH : "restocked in many"
```

---

## **৩. সম্পর্কের বিবরণী (Relationship Details)**

### **৩.১ Master DB Relationships**
* **Tenant (১:১) Subscription:** প্রতিটি টেন্যান্টের (ভেন্ডর) সর্বোচ্চ একটি সক্রিয় সাবস্ক্রিপশন থাকতে পারবে।
* **Plan (১:N) Subscription:** একটি সাবস্ক্রিপশন প্ল্যানের (যেমন: প্রোপ্ল্যান) অধীনে একাধিক ভেন্ডর সাবস্ক্রাইব করতে পারবে।

### **৩.২ Tenant DB Relationships**
* **Product (১:N) ProductVariant:** একটি মূল প্রোডাক্টের অধীনে একাধিক সাইজ, কালার বা ভ্যারিয়েন্ট থাকতে পারে (যেমন: T-Shirt -> Red-M, Blue-L)।
* **ProductVariant (১:N) OrderItem:** একটি নির্দিষ্ট প্রোডাক্ট ভ্যারিয়েন্ট একাধিক অর্ডারের লাইন আইটেম হতে পারে।
* **Order (১:N) OrderItem:** একটি অর্ডারের ভেতর একাধিক কার্ট প্রোডাক্ট (Order Items) থাকতে পারে।
* **Supplier (১:N) SupplyBatch:** একজন সাপ্লাইয়ার একাধিক সময়ে কাঁচামাল বা প্রোডাক্ট ব্যাচ সাপ্লাই করতে পারেন।
* **ProductVariant (১:N) SupplyBatch:** একটি প্রোডাক্ট ভ্যারিয়েন্টের স্টক একাধিক ব্যাচে আসতে পারে, যা দিয়ে গড় কেনা খরচ (Average Costing) হিসাব করা হবে।
