import {resolve} from 'node:path'

export default {
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: resolve(process.cwd(), 'data/auth.db'),
  },
}