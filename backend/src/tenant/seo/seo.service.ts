import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA_CLIENT } from '../../core/database/tenant-connection.provider';
import { PrismaClient as TenantPrismaClient } from '@prisma/tenant-client';
import { UpsertSeoSettingDto } from './dto/seo.dto';

@Injectable()
export class SeoService {
  constructor(
    @Inject(TENANT_PRISMA_CLIENT) private readonly prisma: TenantPrismaClient,
  ) {}

  async upsert(dto: UpsertSeoSettingDto) {
    const normalizedPath = dto.pagePath.startsWith('/')
      ? dto.pagePath
      : `/${dto.pagePath}`;

    return this.prisma.seoSetting.upsert({
      where: { pagePath: normalizedPath },
      create: { ...dto, pagePath: normalizedPath },
      update: { ...dto, pagePath: normalizedPath },
    });
  }

  async findAll() {
    return this.prisma.seoSetting.findMany({
      orderBy: { pagePath: 'asc' },
    });
  }

  async findByPath(pagePath: string) {
    const normalizedPath = pagePath.startsWith('/')
      ? pagePath
      : `/${pagePath}`;

    const setting = await this.prisma.seoSetting.findUnique({
      where: { pagePath: normalizedPath },
    });
    if (!setting) {
      throw new NotFoundException(
        `SEO settings for path ${normalizedPath} not found`,
      );
    }
    return setting;
  }

  async removeByPath(pagePath: string) {
    const normalizedPath = pagePath.startsWith('/')
      ? pagePath
      : `/${pagePath}`;
    await this.findByPath(normalizedPath);
    return this.prisma.seoSetting.delete({
      where: { pagePath: normalizedPath },
    });
  }

  /**
   * Resolve dynamic page metadata and Open Graph tags for storefront
   */
  async getMetaTags(path: string = '/', baseUrl: string = 'http://localhost:3000') {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // 1. Check explicit custom SEO setting
    const customSeo = await this.prisma.seoSetting.findUnique({
      where: { pagePath: normalizedPath },
    });

    // 2. Fetch default store settings for fallback
    const storeSetting = await this.prisma.storeSetting.findFirst();
    const storeName = storeSetting?.storeName || 'SaaS Store';

    if (customSeo) {
      return {
        path: normalizedPath,
        metaTitle: customSeo.metaTitle,
        metaDescription: customSeo.metaDescription || '',
        metaKeywords: customSeo.metaKeywords || '',
        ogTitle: customSeo.ogTitle || customSeo.metaTitle,
        ogDescription: customSeo.ogDescription || customSeo.metaDescription || '',
        ogImage: customSeo.ogImage || storeSetting?.logoUrl || '',
        canonicalUrl: customSeo.canonicalUrl || `${baseUrl}${normalizedPath}`,
        noIndex: customSeo.noIndex,
      };
    }

    // 3. Fallback defaults
    return {
      path: normalizedPath,
      metaTitle: `${storeName} | Online Shop`,
      metaDescription: storeSetting?.maintenanceMessage || `Welcome to ${storeName}`,
      metaKeywords: 'ecommerce, online store, shop',
      ogTitle: `${storeName} | Online Shop`,
      ogDescription: `Explore products on ${storeName}`,
      ogImage: storeSetting?.logoUrl || '',
      canonicalUrl: `${baseUrl}${normalizedPath}`,
      noIndex: false,
    };
  }

  /**
   * Generates dynamic XML sitemap containing site pages, categories, and products
   */
  async generateSitemapXml(baseUrl: string = 'http://localhost:3000'): Promise<string> {
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const now = new Date().toISOString().split('T')[0];

    // Static core pages & custom SEO pages
    const customSeoPages = await this.prisma.seoSetting.findMany({
      where: { noIndex: false },
    });

    // Active categories
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, id: true },
    });

    // Active products
    const products = await this.prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, title: true, updatedAt: true },
    });

    const urls: { loc: string; lastmod: string; changefreq: string; priority: string }[] = [
      { loc: `${cleanBaseUrl}/`, lastmod: now, changefreq: 'daily', priority: '1.0' },
      { loc: `${cleanBaseUrl}/products`, lastmod: now, changefreq: 'daily', priority: '0.9' },
    ];

    // Add custom SEO pages
    for (const page of customSeoPages) {
      if (page.pagePath !== '/' && page.pagePath !== '/products') {
        urls.push({
          loc: `${cleanBaseUrl}${page.pagePath}`,
          lastmod: page.updatedAt.toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.8',
        });
      }
    }

    // Add Category pages
    for (const cat of categories) {
      urls.push({
        loc: `${cleanBaseUrl}/category/${cat.slug}`,
        lastmod: now,
        changefreq: 'weekly',
        priority: '0.7',
      });
    }

    // Add Product pages
    for (const prod of products) {
      urls.push({
        loc: `${cleanBaseUrl}/products/${prod.id}`,
        lastmod: prod.updatedAt.toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.8',
      });
    }

    const xmlUrls = urls
      .map(
        (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
  }
}
