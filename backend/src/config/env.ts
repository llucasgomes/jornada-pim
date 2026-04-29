import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce.number().default(3333),

  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().default('postgres'),
  DB_PASS: z.string().default('senha'),
  DB_NAME: z.string().default('jornadapim'),

  SQLITE_URL: z.string().default('file:./src/database/data/dev.db'),

  JWT_SECRET: z.string().default('chaveSuperSecreta'),

  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_NAME: z.string(),
})

const parsedEnv = envSchema.parse(process.env)

//  monta dinamicamente
export const env = {
  ...parsedEnv,
  POSTGRES_URL: `postgresql://${parsedEnv.DB_USER}:${parsedEnv.DB_PASS}@${parsedEnv.DB_HOST}:${parsedEnv.DB_PORT}/${parsedEnv.DB_NAME}`,
  CLOUDINARY_URL: `cloudinary://${parsedEnv.CLOUDINARY_API_KEY}:${parsedEnv.CLOUDINARY_API_SECRET}@${parsedEnv.CLOUDINARY_NAME}`,
}
