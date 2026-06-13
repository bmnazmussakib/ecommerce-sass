# Ecomize — User Journey & Features Flow Planning

এই ডকুমেন্টে ইকোমাইজ প্ল্যাটফর্মের প্রতিটি গুরুত্বপূর্ণ ফিচারের জন্য ইউজার জার্নি (User Journey) এবং সিস্টেম ফ্লো (System Flow) বিস্তারিতভাবে ম্যাপিং করা হলো।

---

## **১. Super Admin Panel (সুপার এডমিন ফিচারসমূহ)**

### **১.১ ভেন্ডর অনবোর্ডিং, সাসপেনশন ও ডিলিট**
* **ইউজার জার্নি (User Journey):** 
  1. সুপার এডমিন ড্যাশবোর্ডে লগইন করে "Vendor Management" টেবিলে যান।
  2. নতুন ভেন্ডরের সাইন-আপ রিকোয়েস্ট দেখে ডকুমেন্টস ও ডোমেইন চয়েস রিভিউ করেন।
  3. "Approve" ক্লিক করার সাথে সাথে ভেন্ডরের অ্যাকাউন্ট একটিভ হয়। কোনো অসাধু কাজের জন্য "Suspend" বা "Delete" করতে পারেন।
* **সিস্টেম ফ্লো (System Flow):** 
  `Super Admin Request` -> `Master DB (Update Status)` -> `NestJS Gateway` -> `Docker / DB Provisioning Task` -> `Queue` -> `Create/Drop Tenant Schema`.

### **১.২ কাস্টম ডোমেইন ও SSL অটো-প্রোভিশনিং**
* **ইউজার জার্নি (User Journey):**
  1. মার্চেন্ট তার কাস্টম ডোমেইন (যেমন: `mystore.com`) এডমিন ড্যাশবোর্ডে অ্যাড করে DNS আপডেট করেন।
  2. সুপার এডমিন এবং সিস্টেম অটোমেটিক ডোমেইন ভ্যালিডেট ও SSL কানেক্ট করে স্টোর লাইভ করে দেয়।
* **সিস্টেম ফ্লো (System Flow):** 
  `Vendor Domain Input` -> `NestJS Check CNAME/A Record` -> `Verify Status` -> `Cloudflare SSL for SaaS API Call` -> `Auto SSL Active` -> `Activate Mapping in Central DB`.

### **১.৩ টেন্যান্ট ইমপার্সোনেশন (Admin View-as-Vendor)**
* **ইউজার জার্নি (User Journey):**
  1. মার্চেন্ট কোনো টেকনিক্যাল সমস্যায় পড়লে সুপার এডমিনকে জানান।
  2. সুপার এডমিন প্যানেল থেকে মার্চেন্টের লাইনে "Login as Merchant" এ ক্লিক করেন এবং মার্চেন্টের পাসওয়ার্ড ছাড়াই তার প্যানেল দেখতে ও ডিবাগ করতে পারেন।
* **সিস্টেম ফ্লো (System Flow):** 
  `SA Impersonate Trigger` -> `Auth Service Validation` -> `Generate Special JWT (Super Admin claims with Tenant ID)` -> `Redirect to Merchant Panel Session`.

### **১.৪ প্ল্যান ইঞ্জিন ও সাবস্ক্রিপশন বিলিং**
* **ইউজার জার্নি (User Journey):**
  1. মার্চেন্ট তার বর্তমান প্যাকেজ থেকে স্টোর ট্রাফিক বা প্রোডাক্ট লিমিট বৃদ্ধির জন্য আপগ্রেড অপশন সিলেক্ট করেন।
  2. পেমেন্ট সম্পন্ন হলে তার লিমিট অটোমেটিক আপডেট হয়ে যায়।
* **সিস্টেম ফ্লো (System Flow):** 
  `Vendor Checkout` -> `Stripe / SSLCommerz IPN callback` -> `Plan Assigner Service` -> `Update Limit & Cycle in Master DB`.

---

## **২. Vendor Dashboard Panel (মার্চেন্ট ফিচারসমূহ)**

### **২.১ স্টোরফ্রন্ট ড্র্যাগ-অ্যান্ড-ড্রপ বিল্ডার**
* **ইউজার জার্নি (User Journey):**
  1. মার্চেন্ট থিম সেকশনে গিয়ে ব্যানার ইমেজ আপলোড করেন এবং প্রোডাক্ট স্লাইডারের পজিশন চেঞ্জ করে সেভ দেন।
* **সিস্টেম ফ্লো (System Flow):** 
  `Merchant Interface Drag-Drop` -> `Generate JSON Layout Config` -> `NestJS Tenant DB Controller` -> `Update store_settings Table` -> `Flush Redis Store Cache`.

### **২.২ প্রোডাক্ট ভ্যারিয়েন্ট ও SKU জেনারেটর**
* **ইউজার জার্নি (User Journey):**
  1. মার্চেন্ট প্রোডাক্ট আপলোড পেজে সাইজ (M, L, XL) এবং কালার (Black, Blue) সিলেক্ট করেন।
  2. সিস্টেম ডায়নামিকভাবে ৬টি আলাদা ভ্যারিয়েন্ট রো এবং কাস্টম প্রাইস/SKU ইনপুট ফিল্ড তৈরি করে দেয়।
* **সিস্টেম ফ্লো (System Flow):** 
  `Attribute Input` -> `Cartesian Product Calculation` -> `Render Table Rows with Unique SKUs` -> `Confirm & Bulk Insert into DB`.

### **২.৩ ইনভেন্টরি ট্র্যাকিং ও লো-স্টক অ্যালার্ট**
* **ইউজার জার্নি (User Journey):**
  1. মার্চেন্ট প্রতিটি প্রোডাক্টের স্টক লিমিট ৫ সেট করে রাখেন। স্টক ৫ বা তার নিচে নামলে মার্চেন্ট ফোনে/ইমেইলে নোটিফিকেশন পান।
* **সিস্টেম ফ্লো (System Flow):** 
  `Order Saved` -> `Decrease Variant Stock` -> `Trigger Stock Alert Checker` -> `Push to BullMQ` -> `Send Email & Dashboard Push Notification`.

### **২.৪ কুরিয়ার বুকিং ও অটো-ফুলফিলমেন্ট**
* **ইউজার জার্নি (User Journey):**
  1. মার্চেন্ট কোনো অর্ডার প্যানেলে গিয়ে "Confirm Shipment" এ ক্লিক করেন এবং পার্সেল সাইজ ও ওজন ইনপুট দেন।
  2. ওয়ান-ক্লিকে কুরিয়ার বুকিং কমপ্লিট হয় এবং ট্র্যাকিং আইডি জেনারেট হয়ে যায়।
* **সিস্টেম ফ্লো (System Flow):** 
  `Fulfill Request` -> `Read Courier Keys from Integration Table` -> `Post API Payload to Pathao/Steadfast` -> `Receive AWB & Tracking URL` -> `Save in Order Table`.

### **২.৫ সাপ্লায়ার ও ব্যাচ ইনভেন্টরি কস্টিং**
* **ইউজার জার্নি (User Journey):**
  1. মার্চেন্ট নতুন মাল কেনার পর সাপ্লায়ার সিলেক্ট করে কত পিস কত টাকা দরে কিনেছেন তা ইনপুট দিয়ে রি-স্টক করেন।
* **সিস্টেম ফ্লো (System Flow):** 
  `Supplier Stock Entry` -> `Create Supply Batch` -> `Increment Variant Stock` -> `Calculate Weighted Average Unit Cost` -> `Update Product Cost Matrix`.

---

## **৩. Customer Storefront (ক্রেতা ফিচারসমূহ)**

### **৩.১ স্টোরফ্রন্ট ক্যাশিং ও রেন্ডারিং**
* **ইউজার জার্নি (User Journey):**
  1. ক্রেতা মার্চেন্টের নিজস্ব ডোমেইনে ব্রাউজ করেন এবং পেজগুলো মিলি-সেকেন্ডে ফাস্ট লোড হতে দেখেন।
* **সিস্টেম ফ্লো (System Flow):** 
  `Visitor Browser Request` -> `Cloudflare CDN (Edge Cache)` -> `If Miss -> Next.js ISR Render` -> `NestJS API (Read DB)` -> `Save back to CDN Edge`.

### **৩.২ ইনস্ট্যান্ট প্রোডাক্ট সার্চ ও ক্যাটালগ ফিল্টারিং**
* **ইউজার জার্নি (User Journey):**
  1. ক্রেতা স্টোরের সার্চ বক্সে টাইপ করার সাথে সাথে স্ক্রিন রিফ্রেশ না হয়েই সঠিক প্রোডাক্ট সামনে চলে আসে।
* **সিস্টেম ফ্লো (System Flow):** 
  `OnKeyDown Input Event` -> `API Route` -> `Query Meilisearch Index` -> `Return JSON results` -> `Render Products Grid`.

### **৩.৩ ওটিপি ভেরিফাইড ক্যাশ অন ডেলিভারি (COD)**
* **ইউজার জার্নি (User Journey):**
  1. ক্রেতা COD সিলেক্ট করে ওটিপি সেন্ড করেন, মোবাইলে কোড পেয়ে সাবমিট করার মাধ্যমে অর্ডার প্লেস করেন।
* **সিস্টেম ফ্লো (System Flow):** 
  `Submit Checkout Form` -> `Generate 6-digit OTP` -> `Save in Redis (TTL 5m)` -> `Send SMS via Gateway` -> `Verify input against Redis` -> `Save Order in Tenant DB`.

### **৩.৪ পেমেন্ট গেটওয়ে ভেরিফিকেশন ও ট্র্যাকিং**
* **ইউজার জার্নি (User Journey):**
  1. ক্রেতা অনলাইন পেমেন্ট মেথড সিলেক্ট করেন, বিকাশ গেটওয়েতে পিন ও ওটিপি দিয়ে পেমেন্ট কমপ্লিট করেন এবং সাকসেস স্ট্যাটাস দেখতে পান।
* **সিস্টেম ফ্লো (System Flow):** 
  `Select Payment` -> `Redirect to SSLCommerz / bKash Gateway` -> `Callback / IPN Listeners` -> `Validate signature` -> `Update Order Status (Paid)` -> `Email PDF Invoice`.

---

## **৪. Security & Anti-Fraud (নিরাপত্তা ও ফ্রড ফিল্টার)**

### **৪.১ অ্যান্টি-ফেক অর্ডার ও ডিভাইস ব্লকিং**
* **সিস্টেম ফ্লো (System Flow):** 
  `Checkout Button Click` -> `Read Customer IP & Device Fingerprint` -> `Check Redis Log (Rate limiting: max 3 per hour)` -> `Verify Phone Blacklist` -> `If Blocked -> Throw Error / Trigger Captcha`.

### **৪.২ রিয়েল-টাইম ট্রাফিক কোটা মনিটর**
* **সিস্টেম ফ্লো (System Flow):** 
  `Any Page view` -> `Send Visitor Metas` -> `Redis Counter Increment` -> `Match with Plan Quota Limit` -> `If 100% Limit Exceeded -> Push Store to Cached Static Mode & Notify Merchant`.
