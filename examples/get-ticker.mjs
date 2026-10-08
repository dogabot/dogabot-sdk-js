/**
 * Fetch a ticker with query params (GET /api/v1/ticker).
 * From sdk/js after `pnpm run build`: node examples/get-ticker.mjs
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

const exchange = process.env.DOGABOT_EXCHANGE ?? 'hyperliquid'
const symbol = process.env.DOGABOT_SYMBOL ?? 'BTC'
const client = new Client()
const ticker = await client.resources.getTicker({
  query: { exchange, symbol },
})
console.log(JSON.stringify(ticker, null, 2))
