
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.2.1
 * Query Engine version: 4123509d24aa4dede1e864b46351bf2790323b69
 */
Prisma.prismaVersion = {
  client: "6.2.1",
  engine: "4123509d24aa4dede1e864b46351bf2790323b69"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.StoreSettingScalarFieldEnum = {
  id: 'id',
  storeName: 'storeName',
  logoUrl: 'logoUrl',
  brandColor: 'brandColor',
  themeConfig: 'themeConfig',
  taxRate: 'taxRate',
  customCss: 'customCss',
  customJs: 'customJs',
  isStoreOpen: 'isStoreOpen',
  maintenanceMessage: 'maintenanceMessage',
  updatedAt: 'updatedAt'
};

exports.Prisma.StaffScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  password: 'password',
  role: 'role',
  status: 'status',
  twoFactorSecret: 'twoFactorSecret',
  twoFactorEnabled: 'twoFactorEnabled',
  createdAt: 'createdAt'
};

exports.Prisma.SupplierScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  address: 'address'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  parentId: 'parentId',
  isActive: 'isActive'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  basePrice: 'basePrice',
  comparePrice: 'comparePrice',
  status: 'status',
  publishedAt: 'publishedAt',
  categoryId: 'categoryId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductVariantScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  sku: 'sku',
  price: 'price',
  stock: 'stock',
  size: 'size',
  color: 'color',
  weight: 'weight',
  isDigital: 'isDigital',
  fileUrl: 'fileUrl'
};

exports.Prisma.DigitalDownloadScalarFieldEnum = {
  id: 'id',
  variantId: 'variantId',
  orderId: 'orderId',
  token: 'token',
  expiresAt: 'expiresAt',
  downloadedAt: 'downloadedAt',
  createdAt: 'createdAt'
};

exports.Prisma.SupplyBatchScalarFieldEnum = {
  id: 'id',
  supplierId: 'supplierId',
  variantId: 'variantId',
  quantity: 'quantity',
  costPrice: 'costPrice',
  date: 'date'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  customerId: 'customerId',
  customerName: 'customerName',
  customerEmail: 'customerEmail',
  customerPhone: 'customerPhone',
  shippingAddress: 'shippingAddress',
  totalPrice: 'totalPrice',
  shippingCharge: 'shippingCharge',
  taxPaid: 'taxPaid',
  paymentMethod: 'paymentMethod',
  paymentStatus: 'paymentStatus',
  shippingStatus: 'shippingStatus',
  awbCode: 'awbCode',
  trackingUrl: 'trackingUrl',
  fingerprint: 'fingerprint',
  createdAt: 'createdAt'
};

exports.Prisma.BlockedFingerprintScalarFieldEnum = {
  id: 'id',
  fingerprint: 'fingerprint',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.BlockedContactScalarFieldEnum = {
  id: 'id',
  value: 'value',
  type: 'type',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  variantId: 'variantId',
  quantity: 'quantity',
  price: 'price'
};

exports.Prisma.CouponScalarFieldEnum = {
  id: 'id',
  code: 'code',
  type: 'type',
  value: 'value',
  minOrderValue: 'minOrderValue',
  startDate: 'startDate',
  endDate: 'endDate',
  isActive: 'isActive'
};

exports.Prisma.IntegrationScalarFieldEnum = {
  id: 'id',
  provider: 'provider',
  keysJson: 'keysJson',
  isActive: 'isActive'
};

exports.Prisma.FlashSaleScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  startDate: 'startDate',
  endDate: 'endDate',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.FlashSaleProductScalarFieldEnum = {
  id: 'id',
  flashSaleId: 'flashSaleId',
  productVariantId: 'productVariantId',
  salePrice: 'salePrice',
  limitQuantity: 'limitQuantity',
  soldQuantity: 'soldQuantity'
};

exports.Prisma.CustomerScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  address: 'address',
  loyaltyPoints: 'loyaltyPoints',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WebhookScalarFieldEnum = {
  id: 'id',
  url: 'url',
  events: 'events',
  secret: 'secret',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ShippingZoneScalarFieldEnum = {
  id: 'id',
  name: 'name',
  countries: 'countries',
  regions: 'regions',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ShippingRateScalarFieldEnum = {
  id: 'id',
  zoneId: 'zoneId',
  minOrderValue: 'minOrderValue',
  maxOrderValue: 'maxOrderValue',
  rate: 'rate',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TaxRuleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  country: 'country',
  region: 'region',
  rate: 'rate',
  priority: 'priority',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BogoOfferScalarFieldEnum = {
  id: 'id',
  title: 'title',
  buyVariantId: 'buyVariantId',
  buyQuantity: 'buyQuantity',
  getVariantId: 'getVariantId',
  getQuantity: 'getQuantity',
  discountPercent: 'discountPercent',
  startDate: 'startDate',
  endDate: 'endDate',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SeoSettingScalarFieldEnum = {
  id: 'id',
  pagePath: 'pagePath',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  metaKeywords: 'metaKeywords',
  ogTitle: 'ogTitle',
  ogDescription: 'ogDescription',
  ogImage: 'ogImage',
  canonicalUrl: 'canonicalUrl',
  noIndex: 'noIndex',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SocialSettingScalarFieldEnum = {
  id: 'id',
  facebookUrl: 'facebookUrl',
  instagramUrl: 'instagramUrl',
  twitterUrl: 'twitterUrl',
  whatsappNumber: 'whatsappNumber',
  youtubeUrl: 'youtubeUrl',
  linkedinUrl: 'linkedinUrl',
  pinterestUrl: 'pinterestUrl',
  enableShareButtons: 'enableShareButtons',
  autoShareMessage: 'autoShareMessage',
  updatedAt: 'updatedAt'
};

exports.Prisma.PopupCampaignScalarFieldEnum = {
  id: 'id',
  title: 'title',
  headline: 'headline',
  content: 'content',
  imageUrl: 'imageUrl',
  ctaText: 'ctaText',
  ctaLink: 'ctaLink',
  triggerType: 'triggerType',
  delaySeconds: 'delaySeconds',
  scrollPercent: 'scrollPercent',
  couponCode: 'couponCode',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContactInquiryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  subject: 'subject',
  message: 'message',
  status: 'status',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AffiliatePartnerScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  code: 'code',
  commissionRate: 'commissionRate',
  totalEarnings: 'totalEarnings',
  paidEarnings: 'paidEarnings',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AffiliateConversionScalarFieldEnum = {
  id: 'id',
  affiliateId: 'affiliateId',
  orderId: 'orderId',
  orderAmount: 'orderAmount',
  commissionAmount: 'commissionAmount',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.AffiliatePayoutScalarFieldEnum = {
  id: 'id',
  affiliateId: 'affiliateId',
  amount: 'amount',
  paymentMethod: 'paymentMethod',
  reference: 'reference',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.LoyaltySettingScalarFieldEnum = {
  id: 'id',
  pointsPerCurrency: 'pointsPerCurrency',
  redemptionRate: 'redemptionRate',
  minPointsToRedeem: 'minPointsToRedeem',
  isEnabled: 'isEnabled',
  updatedAt: 'updatedAt'
};

exports.Prisma.LoyaltyTransactionScalarFieldEnum = {
  id: 'id',
  customerId: 'customerId',
  points: 'points',
  type: 'type',
  description: 'description',
  orderId: 'orderId',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.StaffRole = exports.$Enums.StaffRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF'
};

exports.ProductStatus = exports.$Enums.ProductStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  SCHEDULED: 'SCHEDULED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  COD: 'COD',
  BKASH: 'BKASH',
  NAGAD: 'NAGAD',
  CARD: 'CARD'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

exports.ShippingStatus = exports.$Enums.ShippingStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED'
};

exports.CouponType = exports.$Enums.CouponType = {
  PERCENTAGE: 'PERCENTAGE',
  FLAT: 'FLAT'
};

exports.IntProviderType = exports.$Enums.IntProviderType = {
  BKASH: 'BKASH',
  NAGAD: 'NAGAD',
  SSLCOMMERZ: 'SSLCOMMERZ',
  PATHAO: 'PATHAO',
  STEADFAST: 'STEADFAST',
  FB_PIXEL: 'FB_PIXEL',
  GA4: 'GA4'
};

exports.PopupTriggerType = exports.$Enums.PopupTriggerType = {
  EXIT_INTENT: 'EXIT_INTENT',
  TIMED_DELAY: 'TIMED_DELAY',
  PAGE_SCROLL: 'PAGE_SCROLL'
};

exports.InquiryStatus = exports.$Enums.InquiryStatus = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  ARCHIVED: 'ARCHIVED'
};

exports.AffiliateStatus = exports.$Enums.AffiliateStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED'
};

exports.ConversionStatus = exports.$Enums.ConversionStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.LoyaltyTransactionType = exports.$Enums.LoyaltyTransactionType = {
  EARNED: 'EARNED',
  REDEEMED: 'REDEEMED',
  ADJUSTMENT: 'ADJUSTMENT'
};

exports.Prisma.ModelName = {
  StoreSetting: 'StoreSetting',
  Staff: 'Staff',
  Supplier: 'Supplier',
  Category: 'Category',
  Product: 'Product',
  ProductVariant: 'ProductVariant',
  DigitalDownload: 'DigitalDownload',
  SupplyBatch: 'SupplyBatch',
  Order: 'Order',
  BlockedFingerprint: 'BlockedFingerprint',
  BlockedContact: 'BlockedContact',
  OrderItem: 'OrderItem',
  Coupon: 'Coupon',
  Integration: 'Integration',
  FlashSale: 'FlashSale',
  FlashSaleProduct: 'FlashSaleProduct',
  Customer: 'Customer',
  Webhook: 'Webhook',
  ShippingZone: 'ShippingZone',
  ShippingRate: 'ShippingRate',
  TaxRule: 'TaxRule',
  BogoOffer: 'BogoOffer',
  SeoSetting: 'SeoSetting',
  SocialSetting: 'SocialSetting',
  PopupCampaign: 'PopupCampaign',
  ContactInquiry: 'ContactInquiry',
  AffiliatePartner: 'AffiliatePartner',
  AffiliateConversion: 'AffiliateConversion',
  AffiliatePayout: 'AffiliatePayout',
  LoyaltySetting: 'LoyaltySetting',
  LoyaltyTransaction: 'LoyaltyTransaction'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
