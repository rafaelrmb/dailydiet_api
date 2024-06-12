import { config } from 'dotenv';
import z from 'zod';

if (process.env.NODE_ENV === 'test') {
  config({ path: 'env.test' });
} else {
  config();
}

const envFileSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']).default('sqlite'),
  DATABASE_URL: z.string(),
});

const _env = envFileSchema.safeParse(process.env);

if (_env.success === false) {
  console.error('⚠️ Invalid environment variables', _env.error.format());

  throw new Error('Invalid environment variables.');
}

export const env = _env.data;
