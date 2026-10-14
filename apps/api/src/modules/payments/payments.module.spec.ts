import type { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { validateEnv } from '../../config/env.js';
import {
  DisabledPaymentProvider,
  MockPaymentProvider,
  PaymentProvider,
} from './payment-provider.js';
import { PaymentsModule } from './payments.module.js';

class ConfigStub {}

function configModule(values: Record<string, unknown>): DynamicModule {
  return {
    module: ConfigStub,
    global: true,
    providers: [{ provide: ConfigService, useValue: { get: (key: string) => values[key] } }],
    exports: [ConfigService],
  };
}

async function resolveProvider(values: Record<string, unknown>) {
  const moduleRef = await Test.createTestingModule({
    imports: [configModule(values), PaymentsModule],
  }).compile();
  return moduleRef.get(PaymentProvider);
}

describe('PaymentsModule provider selection', () => {
  it('selects the mock provider for explicit mock mode', async () => {
    expect(await resolveProvider({ PAYMENT_MODE: 'mock' })).toBeInstanceOf(MockPaymentProvider);
  });

  it('selects the disabled provider for disabled mode', async () => {
    expect(await resolveProvider({ PAYMENT_MODE: 'disabled' })).toBeInstanceOf(
      DisabledPaymentProvider,
    );
  });

  it('falls back to the disabled provider when the mode is missing', async () => {
    expect(await resolveProvider({})).toBeInstanceOf(DisabledPaymentProvider);
  });

  it('falls back to the disabled provider for an unexpected mode', async () => {
    expect(await resolveProvider({ PAYMENT_MODE: 'MOCK' })).toBeInstanceOf(
      DisabledPaymentProvider,
    );
  });

  it('wires a validated production config to the disabled provider', async () => {
    const env = validateEnv({
      NODE_ENV: 'production',
      WEB_URL: 'https://shop.example.com',
      DATABASE_URL: 'postgresql://user:pass@db:5432/aeroshop',
      JWT_ACCESS_SECRET: 'a'.repeat(32),
      JWT_REFRESH_SECRET: 'b'.repeat(32),
    });

    expect(await resolveProvider(env)).toBeInstanceOf(DisabledPaymentProvider);
  });
});
