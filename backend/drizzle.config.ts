import { defineConfig } from 'drizzle-kit'
import { env } from './src/config/env'

export default defineConfig({
  //schema: './src/database/schemas', // postgres
  //out: './src/database/migrations', // postgres
  schema: './src/database/schemas/sqlite', // SQLite
  out: './src/database/migrations/sqlite', // SQLite
  dialect: 'sqlite',
  dbCredentials: {
    url: env.SQLITE_URL,
  },
})
