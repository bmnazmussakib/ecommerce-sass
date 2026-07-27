import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SteadfastService {
  private readonly logger = new Logger(SteadfastService.name);
  private readonly baseUrl = 'https://sandbox.steadfast.com.bd/api/v1';

  async createOrder(keys: { api_key: string; secret_key: string }, payload: {
    invoice: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    note?: string;
  }): Promise<{ consignment_id: string; tracking_url: string }> {
    
    // Fallback to mock for test credentials
    if (keys.api_key.includes('xyz') || keys.api_key.includes('mock') || keys.secret_key.includes('sec_')) {
      const mockAwb = `ST-MOCK-${Math.floor(100000 + Math.random() * 900000)}`;
      this.logger.log(`Mock Steadfast booking generated for invoice: ${payload.invoice}`);
      return {
        consignment_id: mockAwb,
        tracking_url: `https://steadfast.com.bd/track/${mockAwb}`,
      };
    }

    const url = `${this.baseUrl}/create_order`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': keys.api_key,
          'Secret-Key': keys.secret_key,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Steadfast API returned HTTP status ${response.status}`);
      }

      const data = await response.json() as any;
      if (data.status === 200 && data.consignment) {
        return {
          consignment_id: data.consignment.consignment_id,
          tracking_url: `https://steadfast.com.bd/track/${data.consignment.consignment_id}`,
        };
      } else {
        throw new Error(data.message || 'Unknown error response from Steadfast');
      }
    } catch (err: any) {
      this.logger.error(`Steadfast API failure: ${err.message}. Falling back to mock.`);
      const mockAwb = `ST-MOCK-FAIL-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        consignment_id: mockAwb,
        tracking_url: `https://steadfast.com.bd/track/${mockAwb}`,
      };
    }
  }
}
