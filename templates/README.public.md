# @dogabot/sdk

Official REST client for the [dogabot public API](https://docs.dogabot.com/).

```bash
npm i @dogabot/sdk
# If the npm package is not visible yet: npm i github:dogabot/dogabot-sdk-js
```

```ts
import { Client } from '@dogabot/sdk'

const client = new Client({ apiKey: process.env.DOGABOT_API_KEY })
const me = await client.getMe()
```

Writes require `idempotencyKey`:

```ts
await client.resources.postTerminalPlaceorder(
  {
    exchange: 'hyperliquid',
    symbol: 'BTC',
    side: 'buy',
    quantity: 0.001,
    order_type: 'market',
    trading_mode: 'paper',
    broadcast_mode: 'personal',
  },
  { idempotencyKey: 'place-paper-btc-1' },
)
```

**Backend-first** (Node 20+). Do not put API keys in browser bundles — call dogabot from your server/BFF.

Runnable samples: [`examples/`](./examples/).

Public repo: https://github.com/dogabot/dogabot-sdk-js · Docs: https://docs.dogabot.com/sdk/
