import { validateEnv } from './env.js';

const development = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/test',
  JWT_ACCESS_SECRET: 'dev-access-secret-123',
  JWT_REFRESH_SECRET: 'dev-refresh-secret-123',
};

const production = {
  NODE_ENV: 'production',
  WEB_URL: 'https://shop.example.com',
  DATABASE_URL: 'postgresql://user:pass@db:5432/aeroshop',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
};

describe('validateEnv PAYMENT_MODE', () => {
  it('defaults to disabled in production', () => {
    expect(validateEnv(production).PAYMENT_MODE).toBe('disabled');
  });

  it('defaults to mock in development', () => {
    expect(validateEnv(development).PAYMENT_MODE).toBe('mock');
  });

  it('defaults to mock in test', () => {
    expect(validateEnv({ ...development, NODE_ENV: 'test' }).PAYMENT_MODE).toBe('mock');
  });

  it('rejects mock payments in production', () => {
    expect(() => validateEnv({ ...production, PAYMENT_MODE: 'mock' })).toThrow(
      /PAYMENT_MODE=mock is not allowed in production/,
    );
  });

  it('accepts an explicit disabled mode in production', () => {
    expect(validateEnv({ ...production, PAYMENT_MODE: 'disabled' }).PAYMENT_MODE).toBe('disabled');
  });

  it('lets development opt out of mock payments', () => {
    expect(validateEnv({ ...development, PAYMENT_MODE: 'disabled' }).PAYMENT_MODE).toBe('disabled');
  });

  it('rejects unknown payment modes', () => {
    expect(() => validateEnv({ ...development, PAYMENT_MODE: 'live' })).toThrow(
      /Invalid environment variables/,
    );
  });
});
