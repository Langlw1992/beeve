import {mkdirSync} from 'node:fs'
import {dirname, resolve} from 'node:path'

import {Database} from 'bun:sqlite'
import {drizzle} from 'drizzle-orm/bun-sqlite'

import * as schema from './schema'

export const databaseFile = resolve(process.cwd(), 'data/auth.db')

mkdirSync(dirname(databaseFile), {recursive: true})

export const sqlite = new Database(databaseFile)

export const db = drizzle(sqlite, {schema})