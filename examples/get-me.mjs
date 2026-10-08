/**
 * Print the authenticated account (GET /api/v1/me).
 * From sdk/js after `pnpm run build`: node examples/get-me.mjs
 */
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { Client } = await import(pathToFileURL(join(root, 'dist/index.js')).href)

if (!process.env.DOGABOT_API_KEY) {
  console.error('Set DOGABOT_API_KEY=dbk_live_...')
  process.exit(1)
}

const client = new Client()
console.log(JSON.stringify(await client.getMe(), null, 2))
