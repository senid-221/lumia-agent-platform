import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(10000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  EXA_API_KEY: z.string().optional(),
  IREMBO_OFFICIAL_URL: z.string().url().default('https://irembo.gov.rw'),
  CORS_ORIGIN: z.string().default('*'),
  WHATSAPP_VERIFY_TOKEN: z.string().min(8).optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_GRAPH_VERSION: z.string().default('v23.0')
});

export const env = schema.parse(process.env);
