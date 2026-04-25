import { drizzle } from 'drizzle-orm/libsql'
import { env } from './env'
import { createClient } from "@libsql/client";

const client = createClient({ url: env.SQLITE_URL })
export const db = drizzle(client)