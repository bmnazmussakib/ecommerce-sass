# Ecomize — Data Flow Diagram (DFD)

---

## **১. Level 0: Context Diagram (সিস্টেমের বাহ্যিক ডেটা প্রবাহ)**

সিস্টেমের সাথে ব্যবহারকারী ও এক্সটার্নাল এপিআই-এর মধ্যকার উচ্চ-স্তরের ডেটা প্রবাহ:

```mermaid
graph TD
    %% Entities
    SA[Super Admin]
    Vendor[Vendor / Merchant]
    Customer[Customer]
    Payment[Payment Gateway]
    Courier[Courier Service API]
    SMS[SMS Gateway]
    
    %% System Box
    subgraph Ecomize [Ecomize SaaS Platform]
        Core[Core App Engine]
    end

    %% Flows
    SA -->|১. প্যাকেজ সেটিং ও ভেন্ডর রুলস| Core
    Core -->|২. প্ল্যাটফর্ম লগ ও অ্যানালিটিক্স| SA

    Vendor -->|৩. প্রোডাক্ট, কাস্টম ডোমেইন ও এপিআই কী| Core
    Core -->|৪. অর্ডার রিপোর্ট, ইনভয়েস ও রিয়েল-টাইম ট্রাফিক অ্যালার্ট| Vendor

    Customer -->|৫. স্টোর ব্রাউজ, অর্ডার প্লেস ও পেমেন্ট| Core
    Core -->|৬. অর্ডার কনফার্মেশন ও ট্র্যাকিং স্ট্যাটাস| Customer

    Core -->|৭. পেমেন্ট ভেরিফিকেশন ও রিফান্ড রিকোয়েস্ট| Payment
    Payment -->|৮. পেমেন্ট ট্রানজেকশন স্ট্যাটাস| Core

    Core -->|৯. ওটিপি ও নোটিফিকেশন রিকোয়েস্ট| SMS
    SMS -->|১০. ওটিপি কোড ডেলিভারি| Customer

    Core -->|১১. পার্সেল শিপমেন্ট বুকিং ও ট্র্যাকিং| Courier
    Courier -->|১২. লাইভ ট্র্যাকিং স্ট্যাটাস| Core
```

---

## **২. Level 1: Core Process DFD (মূল প্রসেস ভিত্তিক ডেটা প্রবাহ)**

সিস্টেমের ভেতরের ডাটাবেস ও মডিউলগুলোর মধ্যে কীভাবে ডেটা প্রবাহিত হয় তা নিচে দেখানো হলো:

```mermaid
graph TD
    %% Entities
    Customer([Customer])
    Vendor([Vendor])
    
    %% Data Stores
    MasterDB[(Master DB)]
    TenantDB[(Tenant PostgreSQL)]
    Redis[(Redis Cache & Queues)]
    
    %% Processes
    P1[1.0 Tenant Resolution]
    P2[2.0 Catalog & Store Render]
    P3[3.0 Checkout & Fraud Filter]
    P4[4.0 Billing & Quota Manager]
    P5[5.0 Order Fulfillment]

    %% Flow lines
    %% 1.0 Tenant Resolution
    Customer -->|স্টোর ইউআরএল রিকোয়েস্ট| P1
    P1 -->|ডোমেইন/সাবডোমেইন কোয়েরি| MasterDB
    MasterDB -->|কানেকশন স্ট্রিং/কনফিগ| P1
    P1 -->|কানেকশন মেমোরি ক্যাশ| Redis

    %% 2.0 Catalog Render
    Customer -->|প্রোডাক্ট সার্চ ও ভিউ| P2
    P2 -->|ক্যাটাগরি/প্রোডাক্ট কুয়েরি| TenantDB
    TenantDB -->|প্রোডাক্ট ডাটা| P2
    P2 -->|ISR স্ট্যাটিক পেজ| Customer

    %% 3.0 Checkout & OTP
    Customer -->|COD অর্ডার সাবমিট| P3
    P3 -->|আইপি/ডিভাইস ট্র্যাকিং| Redis
    P3 -->|ওটিপি ও অর্ডার সেভ| TenantDB
    P3 -->|ওটিপি টেম্প ফাইল| Redis

    %% 4.0 Billing & Quota Tracker
    Customer -->|প্রতি ভিজিট/পেজ ভিউ| P4
    P4 -->|ভিজিটর কাউন্ট ইনক্রিমেন্ট| Redis
    P4 -->|লিমিট ক্রসড নোটিফিকেশন| Vendor
    P4 -->|প্ল্যান লিমিট ভেরিফিকেশন| MasterDB

    %% 5.0 Fulfillment
    Vendor -->|শিপিং স্ট্যাটাস পরিবর্তন| P5
    P5 -->|কুরিয়ার বুকিং প্রসেস| Redis
    P5 -->|শিপিং ও ট্র্যাকিং ডাটা| TenantDB
```

---

## **৩. ডেটা ফ্লো বিবরণী (Data Flow Descriptions)**

### **৩.১ ডোমেইন ও টেন্যান্ট ডিটেকশন (Tenant Resolution)**
* **ইনপুট ডেটা:** গ্রাহকের ব্রাউজার থেকে আসা `Host Header` (যেমন: `mstore.com` বা `store1.ecomize.com`)।
* **প্রসেস:** NestJS মিডলওয়্যার `Master DB` ও `Redis` থেকে এই ডোমেইনের বিপরীতে বরাদ্দকৃত PostgreSQL কানেকশন স্ট্রিং খুঁজে বের করে।
* **আউটপুট:** রানটাইমে নির্দিষ্ট টেন্যান্ট ডাটাবেসে কানেক্ট হয়ে স্টোর রেন্ডার করা।

### **৩.২ চেকআউট ও অ্যান্টি-ফ্রড প্রসেস (Checkout & Anti-Fraud)**
* **ইনপুট ডেটা:** কাস্টমারের ফোন নম্বর, আইপি অ্যাড্রেস এবং চেকআউট ডিটেইলস।
* **প্রসেস:** `Redis` দিয়ে একই আইপি ও ডিভাইস থেকে অর্ডারের ফ্রিকোয়েন্সি রিড করা হয়। ফ্রড ডিটেক্ট না হলে ওটিপি জেনারেট করে এসএমএস গেটওয়েতে পাঠানো হয়।
* **আউটপুট:** ওটিপি ভেরিফাইড অর্ডার ডেটা টেন্যান্টের ডাটাবেসে (`Tenant DB`) সেভ হওয়া এবং কার্ট ক্লিয়ার হওয়া।

### **৩.৩ ট্রাফিক কোটা ও মেম্বারশিপ প্রসেস (Quota & Billing)**
* **ইনপুট ডেটা:** কাস্টমারের পেজ ভিজিট ইভেন্ট।
* **প্রসেস:** `Redis`-এ ভেন্ডর আইডি ভিত্তিক ভিজিটর কাউন্টার ১ করে বাড়তে থাকে। কাউন্টারের ভ্যালু মেম্বারশিপ প্ল্যান লিমিটের সাথে মিলিয়ে দেখা হয়।
* **আউটপুট:** লিমিট ওভারফ্লো হলে ভেন্ডর ড্যাশবোর্ডে "Limit Exceeded" অ্যালার্ট ফায়ার করা এবং অতিরিক্ত ট্রাফিকের ক্ষেত্রে স্ট্যাটিক ক্যাশ পেজ রেন্ডার করা।
