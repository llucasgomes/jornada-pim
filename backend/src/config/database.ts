import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from './env'

// Disable prefetch as it is not supported for "Transaction" pool mode
const queryClient = postgres(env.POSTGRES_URL)
export const db = drizzle(queryClient)
