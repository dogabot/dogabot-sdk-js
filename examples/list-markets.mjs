/**
 * List markets with optional filters (GET /api/v1/markets).
 * From sdk/js after `pnpm run build`: node examples/list-markets.mjs
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
const markets = await client.resources.getMarkets({
  query: { limit: 5, is_tradable: true },
})
console.log(JSON.stringify(markets, null, 2))
