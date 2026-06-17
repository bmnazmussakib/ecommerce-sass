import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class BkashService {
  private readonly baseUrl = 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

  async grantToken(keys: any): Promise<string> {
    const url = `${this.baseUrl}/tokenized/checkout/token/grant`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        username: keys.username,
        password: keys.password,
      },
      body: JSON.stringify({
        app_key: keys.app_key,
        app_secret: keys.app_secret,
      }),
    });

    const data = await response.json() as any;
    if (!response.ok || !data.id_token) {
      throw new BadRequestException(`bKash Token Grant Failed: ${data.errorMessage || response.statusText}`);
    }
    return data.id_token;
  }

  async createPayment(token: string, orderId: string, amount: number, keys: any, callbackUrl: string): Promise<any> {
    const url = `${this.baseUrl}/tokenized/checkout/create`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-APP-Key': keys.app_key,
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: '01777777777', // Dummy testing number
        callbackURL: callbackUrl,
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: orderId,
      }),
    });

    const data = await response.json() as any;
    if (!response.ok || data.statusCode !== '0000') {
      throw new BadRequestException(`bKash Payment Creation Failed: ${data.statusMessage || response.statusText}`);
    }
    return data;
  }

  async executePayment(token: string, paymentID: string, keys: any): Promise<any> {
    const url = `${this.baseUrl}/tokenized/checkout/execute`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: token,
        'X-APP-Key': keys.app_key,
      },
      body: JSON.stringify({ paymentID }),
    });

    const data = await response.json() as any;
    console.log('bKash execute raw response:', JSON.stringify(data));
    // Always return data; let caller handle statusCode
    return data;
  }
}
