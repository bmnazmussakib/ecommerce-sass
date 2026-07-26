import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class SslCommerzService {
  private readonly isSandbox = true;
  private readonly baseUrl = 'https://sandbox.sslcommerz.com';

  async initiatePayment(keys: any, payload: {
    total_amount: number;
    tran_id: string;
    success_url: string;
    fail_url: string;
    cancel_url: string;
    cus_name: string;
    cus_email: string;
    cus_phone: string;
    cus_add1: string;
  }): Promise<string> {
    const url = `${this.baseUrl}/gwprocess/v4/api.php`;

    // Form data creation required by SSLCommerz
    const formData = new URLSearchParams();
    formData.append('store_id', keys.store_id);
    formData.append('store_passwd', keys.store_passwd || keys.store_password);
    formData.append('total_amount', payload.total_amount.toString());
    formData.append('currency', 'BDT');
    formData.append('tran_id', payload.tran_id);
    formData.append('success_url', payload.success_url);
    formData.append('fail_url', payload.fail_url);
    formData.append('cancel_url', payload.cancel_url);
    
    // Customer profile info
    formData.append('cus_name', payload.cus_name);
    formData.append('cus_email', payload.cus_email || 'customer@ecomize.com');
    formData.append('cus_add1', payload.cus_add1 || 'Dhaka, Bangladesh');
    formData.append('cus_phone', payload.cus_phone);
    formData.append('cus_country', 'Bangladesh');

    // Shipping & Product profiles (required fields)
    formData.append('shipping_method', 'NO');
    formData.append('num_of_item', '1');
    formData.append('product_name', 'Ecomize Order');
    formData.append('product_category', 'General');
    formData.append('product_profile', 'general');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new BadRequestException(`SSLCommerz initiation response parse error: ${text}`);
    }

    if (data.status === 'SUCCESS' && data.GatewayPageURL) {
      return data.GatewayPageURL;
    } else {
      throw new BadRequestException(`SSLCommerz Payment Initiation Failed: ${data.failedreason || 'Unknown Error'}`);
    }
  }

  async validatePayment(keys: any, valId: string): Promise<boolean> {
    const storeId = keys.store_id;
    const storePassword = keys.store_passwd || keys.store_password;
    const url = `${this.baseUrl}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePassword}&format=json`;

    const response = await fetch(url);
    const data = await response.json() as any;

    if (data.status === 'VALID' || data.status === 'VALIDATED') {
      return true;
    }
    return false;
  }
}
