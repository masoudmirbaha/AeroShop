import { ServiceUnavailableException } from '@nestjs/common';

export type PaymentResult = 'SUCCESS' | 'FAILED';

export const PAYMENTS_DISABLED_MESSAGE =
  'پرداخت آنلاین در حال حاضر در دسترس نیست. لطفاً بعداً دوباره تلاش کنید.';

export abstract class PaymentProvider {
  /**
   * `simulatedResult` comes from the client and is honored only by the mock provider;
   * any real provider must ignore it and confirm the payment server-side.
   */
  abstract charge(amount: number, simulatedResult: PaymentResult): Promise<PaymentResult>;
}

export class MockPaymentProvider extends PaymentProvider {
  charge(_amount: number, simulatedResult: PaymentResult): Promise<PaymentResult> {
    return Promise.resolve(simulatedResult);
  }
}

export class DisabledPaymentProvider extends PaymentProvider {
  charge(): Promise<PaymentResult> {
    return Promise.reject(new ServiceUnavailableException(PAYMENTS_DISABLED_MESSAGE));
  }
}
