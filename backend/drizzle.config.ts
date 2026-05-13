import { defineConfig } from 'drizzle-kit'
import { env } from './src/config/env'

export default defineConfig({
  schema: './src/database/schemas', // postgres
  out: './src/database/migrations', // postgres
  dialect: 'postgresql',
  dbCredentials: {
    url: env.POSTGRES_URL,
  },
})
