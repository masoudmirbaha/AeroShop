import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_URL: z.url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ADMIN_EMAIL: z.email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
});

export type Env = z.infer<typeof envSchema>;

// Development defaults and .env.example placeholders must never reach production.
function productionProblems(config: Record<string, unknown>, env: Env): string[] {
  const problems: string[] = [];
  if (config['WEB_URL'] === undefined) {
    problems.push('WEB_URL must be set explicitly');
  }
  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
    if (env[key].length < 32) problems.push(`${key} must be at least 32 characters`);
    if (env[key].startsWith('change-me')) problems.push(`${key} still uses the example placeholder`);
  }
  if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
    problems.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ');
  }
  return problems;
}

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(
      `Invalid environment variables:\n${z.prettifyError(result.error)}`,
    );
  }
  const problems =
    result.data.NODE_ENV === 'production' ? productionProblems(config, result.data) : [];
  if (problems.length) {
    throw new Error(`Invalid production environment:\n- ${problems.join('\n- ')}`);
  }
  return result.data;
}
