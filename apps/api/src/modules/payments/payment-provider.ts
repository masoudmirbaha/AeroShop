export type PaymentResult = 'SUCCESS' | 'FAILED';

export abstract class PaymentProvider {
  abstract charge(amount: number, result: PaymentResult): Promise<PaymentResult>;
}

export class MockPaymentProvider extends PaymentProvider {
  charge(_amount: number, result: PaymentResult): Promise<PaymentResult> {
    return Promise.resolve(result);
  }
}
