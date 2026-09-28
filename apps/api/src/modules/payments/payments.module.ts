import { Module } from '@nestjs/common';
import { MockPaymentProvider, PaymentProvider } from './payment-provider.js';

@Module({
  providers: [{ provide: PaymentProvider, useClass: MockPaymentProvider }],
  exports: [PaymentProvider],
})
export class PaymentsModule {}
