import { defineConfig } from 'drizzle-kit'
import { env } from './src/config/env'

  export default defineConfig({
    schema: './src/libs/drizzle/schemas',
    out: './src/libs/drizzle/migrations',
    dialect: 'postgresql',
    dbCredentials: {
      url:env.POSTGRES_URL,
    },
  })