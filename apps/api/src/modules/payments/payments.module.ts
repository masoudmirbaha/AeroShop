import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.js';
import {
  DisabledPaymentProvider,
  MockPaymentProvider,
  PaymentProvider,
} from './payment-provider.js';

export function createPaymentProvider(mode: Env['PAYMENT_MODE']): PaymentProvider {
  return mode === 'mock' ? new MockPaymentProvider() : new DisabledPaymentProvider();
}

@Module({
  providers: [
    {
      provide: PaymentProvider,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        createPaymentProvider(config.get('PAYMENT_MODE', { infer: true })),
    },
  ],
  exports: [PaymentProvider],
})
export class PaymentsModule {}
