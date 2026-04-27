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


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQxM2FjM2Q5LTNkMzQtNDZhYS1iZWJjLTUwYmY1NWUwNjU1ZCIsInBlcmZpbCI6Imdlc3RvciIsIm5vbWUiOiJKdWxpYW5hIFJvY2hhIFRhdmFyZXMiLCJtYXRyaWN1bGEiOiJQSU0tMDAwMSIsImlhdCI6MTc3NzMzMTkwNiwiZXhwIjoxNzc3MzYwNzA2fQ.0AwIVsl5a5e9JFk6-121gsxhqYqveykt6WCQFn2Se1s