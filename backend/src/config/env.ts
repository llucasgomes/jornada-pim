import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce.number().default(3000),

  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().default('postgres'),
  DB_PASS: z.string().default('senha'),
  DB_NAME: z.string().default('jornadapim'),

  JWT_SECRET: z.string().default('chaveSuperSecreta'),
})

const parsedEnv = envSchema.parse(process.env)

// 👇 monta dinamicamente
export const env = {
  ...parsedEnv,
  POSTGRES_URL: `postgresql://${parsedEnv.DB_USER}:${parsedEnv.DB_PASS}@${parsedEnv.DB_HOST}:${parsedEnv.DB_PORT}/${parsedEnv.DB_NAME}`,
}
