/**
 * Place a tiny paper market order (Idempotency-Key required).
 * Dry-run unless CONFIRM_PLACE=1. trading_mode stays paper.
 * From sdk/js after `pnpm run build`: CONFIRM_PLACE=1 node examples/place-paper-order.mjs
 */
import { randomUUID } from 'node:crypto'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { Client } = await import(pathToFileURL(join(root, 'dist/index.js')).href)

if (!process.env.DOGABOT_API_KEY) {
  console.error('Set DOGABOT_API_KEY=dbk_live_...')
  process.exit(1)
}

const body = {
  exchange: process.env.DOGABOT_EXCHANGE ?? 'hyperliquid',
  symbol: process.env.DOGABOT_SYMBOL ?? 'BTC',
  side: 'buy',
  quantity: 0.001,
  order_type: 'market',
  trading_mode: 'paper',
  broadcast_mode: 'personal',
}
const idempotencyKey = process.env.DOGABOT_IDEMPOTENCY_KEY ?? `example-paper-${randomUUID()}`

if (process.env.CONFIRM_PLACE !== '1') {
  console.log('Dry-run only. Would POST placeorder with:')
  console.log(JSON.stringify({ body, idempotencyKey }, null, 2))
  console.log('Re-run with CONFIRM_PLACE=1 to submit (still paper).')
  process.exit(0)
}

const client = new Client()
const out = await client.resources.postTerminalPlaceorder(body, { idempotencyKey })
console.log(JSON.stringify(out, null, 2))
