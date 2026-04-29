// server.ts
import { buildApp } from './app'
import { env } from './config/env'

const app = buildApp()

app.listen(
  {
    host: '0.0.0.0',
    port: env.PORT,
  },
  (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server running ${address}`)
  }
)
