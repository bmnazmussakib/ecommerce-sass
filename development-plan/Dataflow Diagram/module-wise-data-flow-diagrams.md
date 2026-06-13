# Ecomize — Module-Wise Data Flow Diagrams (DFDs)

---

## **১. Super Admin Module (সুপার এডমিন মডিউল)**
ভেন্ডর অনবোর্ডিং, বিলিং ও রিসোর্স প্ল্যান ম্যানেজমেন্টের ফ্লো:

```mermaid
graph TD
    SA["Super Admin"]
    MasterDB[("Master Database")]
    Redis[("Redis Cache")]
    Stripe["Stripe / Billing API"]

    SA -->|"১. ক্রিয়েট/আপডেট প্যাকেজ ও লিমিট"| P1["1.1 Plan Manager"]
    P1 -->|"সেভ প্ল্যান লিমিট"| MasterDB

    SA -->|"২. ভেন্ডর স্ট্যাটাস পরিবর্তন (Approve/Suspend)"| P2["1.2 Vendor Status Manager"]
    P2 -->|"আপডেট ভেন্ডর স্ট্যাটাস"| MasterDB
    P2 -->|"ইনভ্যালিডেট কানেকশন ক্যাশ"| Redis

    Stripe -->|"৩. সাবস্ক্রিপশন সাকসেস ইভেন্ট"| P3["1.3 Billing & Invoicing"]
    P3 -->|"আপডেট সাবস্ক্রিপশন ডাটা"| MasterDB
    P3 -->|"অ্যালার্ট ট্রিগার (কোটা আপডেট)"| Redis
```

---

## **২. Vendor Dashboard Module (মার্চেন্ট মডিউল)**
প্রোডাক্ট লিস্টিং, ইনভেন্টরি আপডেট এবং কাস্টম ডোমেইন উইজার্ডের ফ্লো:

```mermaid
graph TD
    Vendor["Vendor / Merchant"]
    TenantDB[("Tenant PostgreSQL")]
    Cloudflare["Cloudflare API"]
    MasterDB[("Master Database")]

    %% Product & Inventory
    Vendor -->|"১. প্রোডাক্ট ডাটা ও ইমেজ আপলোড"| P4["2.1 Catalog Engine"]
    P4 -->|"সেভ প্রোডাক্ট ও ইনভেন্টরি"| TenantDB

    %% Custom Domain
    Vendor -->|"২. কাস্টম ডোমেইন ইনপুট (mystore.com)"| P5["2.2 Domain Configurator"]
    P5 -->|"ডোমেইন ভেরিফিকেশন কুয়েরি"| MasterDB
    P5 -->|"SSL ইস্যু রিকোয়েস্ট"| Cloudflare
    Cloudflare -->|"SSL স্ট্যাটাস সাকসেস"| P5
    P5 -->|"ডোমেইন ম্যাপ অ্যাক্টিভেট"| MasterDB
```

---

## **৩. Customer Storefront Module (স্টোরফ্রন্ট মডিউল)**
গ্রাহকের প্রোডাক্ট ব্রাউজিং, সার্চ এবং কার্ট থেকে অর্ডার প্লেসমেন্টের ফ্লো:

```mermaid
graph TD
    Customer["Customer"]
    TenantDB[("Tenant PostgreSQL")]
    Redis[("Redis Cache")]
    SMS["SMS Gateway"]

    Customer -->|"১. ক্যাটাগরি ভিউ ও সার্চ"| P6["3.1 Storefront Catalog Render"]
    P6 -->|"প্রোডাক্ট রিড"| TenantDB
    P6 -->|"ক্যাটাগরি ক্যাশ"| Redis

    Customer -->|"২. চেকআউট ফর্ম সাবমিট (COD)"| P7["3.2 Checkout & OTP Flow"]
    P7 -->|"আইপি/ডিভাইস রেট লিমিট চেক"| Redis
    P7 -->|"OTP কোড জেনারেট"| Redis
    P7 -->|"SMS ওটিপি সেন্ড"| SMS
    
    Customer -->|"৩. সাবমিট OTP কোড"| P7
    P7 -->|"ভেরিফাই OTP"| Redis
    P7 -->|"অর্ডার ও ইনভয়েস সেভ"| TenantDB
```

---

## **৪. Integration Module (এক্সটার্নাল এপিআই মডিউল)**
কুরিয়ার সার্ভিস এবং পেমেন্ট গেটওয়ের ব্যাকগ্রাউন্ড প্রসেসের ফ্লো:

```mermaid
graph TD
    Queue[("BullMQ / Redis Queue")]
    TenantDB[("Tenant PostgreSQL")]
    CourierAPI["Pathao / Steadfast API"]
    PaymentGateway["bKash / Nagad / SSLCommerz"]
    Customer["Customer"]

    %% Payment Flow
    Customer -->|"১. অনলাইন পেমেন্ট ইনিশিয়েট"| PaymentGateway
    PaymentGateway -->|"২. পেমেন্ট সাকসেস আইপিএন (IPN) কলব্যাক"| P8["4.1 Payment Handler"]
    P8 -->|"আপডেট ট্রানজেকশন ও অর্ডার স্ট্যাটাস"| TenantDB

    %% Shipping Flow
    TenantDB -->|"৩. অর্ডার ফুলফিলমেন্ট ট্রিগার"| Queue
    Queue -->|"৪. শিপমেন্ট টাস্ক রান"| P9["4.2 Shipping Sync Worker"]
    P9 -->|"AWB/শিপমেন্ট বুকিং"| CourierAPI
    CourierAPI -->|"৫. বুকিং আইডি ও ট্র্যাকিং URL"| P9
    P9 -->|"সেভ শিপিং ট্র্যাকিং ডিটেইলস"| TenantDB
```

---

## **৫. Anti-Fraud & Traffic Quota Module (নিরাপত্তা ও কোটা মডিউল)**
ভেন্ডরের ট্রাফিক সীমা মনিটরিং ও ভুয়া অর্ডার ডিটেকশনের ফ্লো:

```mermaid
graph TD
    Request["Incoming HTTP Request"]
    Redis[("Redis Memory Cache")]
    MasterDB[("Master Database")]
    TenantDB[("Tenant PostgreSQL")]
    Block["Block / Throttle Engine"]
    Forward["Forward to Process"]

    %% Traffic Monitor
    Request -->|"১. পেজ ভিউ ট্র্যাকিং"| P10["5.1 Traffic Monitor"]
    P10 -->|"প্যাকেজ লিমিট চেক"| MasterDB
    P10 -->|"কাউন্টার ইনক্রিমেন্ট"| Redis
    
    P10 -->|"২. লিমিট ওভারফ্লো"| Block
    P10 -->|"৩. লিমিট ঠিক থাকলে"| Forward

    %% Anti-Fraud
    Request -->|"৪. অর্ডার করার প্রচেষ্টা"| P11["5.2 Anti-Fraud Filter"]
    P11 -->|"ডিভাইস ও আইপি রেট লিমিট চেক"| Redis
    P11 -->|"ফোন নম্বর ব্লকলিস্ট চেক"| TenantDB
    
    P11 -->|"৫. সন্দেহজনক অর্ডার (লিমিট এক্সিড)"| Block
    P11 -->|"৬. সফল ভেরিফিকেশন"| Forward
```
