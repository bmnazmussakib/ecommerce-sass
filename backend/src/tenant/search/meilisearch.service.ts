import { Injectable, Logger } from '@nestjs/common';
import { Meilisearch, Index } from 'meilisearch';

@Injectable()
export class MeiliSearchService {
  private client: Meilisearch;
  private readonly logger = new Logger(MeiliSearchService.name);

  constructor() {
    // Connect to local or env configured Meilisearch server
    this.client = new Meilisearch({
      host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey',
    });
  }


  // Use tenant-specific indices (e.g. products_tenantId) to ensure tenant data isolation
  private getTenantIndex(tenantId: string): Index {
    return this.client.index(`products_${tenantId}`);
  }

  async syncProduct(tenantId: string, product: any) {
    try {
      const index = this.getTenantIndex(tenantId);
      
      // Transform product option and variant details to a flat structure for search
      const document = {
        id: product.id,
        title: product.title,
        description: product.description,
        basePrice: Number(product.basePrice),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        status: product.status,
        categoryName: product.category?.name || null,
        options: product.options?.map((opt: any) => ({
          name: opt.name,
          values: opt.values,
        })) || [],
        variants: product.variants?.map((v: any) => ({
          sku: v.sku,
          price: Number(v.price),
          size: v.size,
          color: v.color,
          options: v.options,
          stock: v.stock,
        })) || [],
      };

      await index.addDocuments([document]);
      this.logger.log(`Synced product [${product.id}] to Meilisearch index [products_${tenantId}]`);
    } catch (err: any) {
      this.logger.error(`Failed to sync product to Meilisearch: ${err.message}`);
    }
  }

  async deleteProduct(tenantId: string, productId: string) {
    try {
      const index = this.getTenantIndex(tenantId);
      await index.deleteDocument(productId);
      this.logger.log(`Deleted product [${productId}] from Meilisearch index [products_${tenantId}]`);
    } catch (err: any) {
      this.logger.error(`Failed to delete product from Meilisearch: ${err.message}`);
    }
  }

  async searchProducts(tenantId: string, query: string, options?: any) {
    try {
      const index = this.getTenantIndex(tenantId);
      return await index.search(query, options);
    } catch (err: any) {
      this.logger.error(`Meilisearch search failed: ${err.message}`);
      return { hits: [], nbHits: 0 };
    }
  }
}
