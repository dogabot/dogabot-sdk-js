import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { afterEach, describe, expect, it } from 'vitest'
import { APIError, Client, OPERATION_IDS } from './index.js'

function listen(
  handler: (req: IncomingMessage, res: ServerResponse) => void,
): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  const server = createServer(handler)
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address()
      if (!addr || typeof addr === 'string') throw new Error('no addr')
      resolve({
        baseUrl: `http://127.0.0.1:${addr.port}`,
        close: () =>
          new Promise((r, j) => server.close((e) => (e ? j(e) : r()))),
      })
    })
  })
}

describe('@dogabot/sdk', () => {
  let close: (() => Promise<void>) | undefined
  afterEach(async () => {
    if (close) await close()
    close = undefined
  })

  it('getMe success', async () => {
    const srv = await listen((req, res) => {
      expect(req.url).toBe('/api/v1/me')
      expect(req.headers.authorization).toBe('Bearer dbk_live_test')
      expect(String(req.headers['user-agent'])).toMatch(/^dogabot-sdk-js\//)
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ data: { user_id: 'u1' } }))
    })
    close = srv.close
    const client = new Client({ apiKey: 'dbk_live_test', baseUrl: srv.baseUrl })
    const out = await client.getMe()
    expect(out).toEqual({ data: { user_id: 'u1' } })
  })

  it('requires idempotency on writes', async () => {
    const client = new Client({ apiKey: 'dbk_live_test', baseUrl: 'http://127.0.0.1:9' })
    await expect(client.resources.postTerminalPlaceorder({ symbol: 'BTC' })).rejects.toThrow(
      /Idempotency-Key/,
    )
  })

  it('sends Idempotency-Key on writes', async () => {
    const srv = await listen((req, res) => {
      expect(req.headers['idempotency-key']).toBe('k1')
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end('{"data":{"ok":true}}')
    })
    close = srv.close
    const client = new Client({ apiKey: 'dbk_live_test', baseUrl: srv.baseUrl })
    await client.resources.postTerminalPlaceorder(
      { symbol: 'BTC' },
      { idempotencyKey: 'k1' },
    )
  })

  it('maps API errors', async () => {
    const srv = await listen((_req, res) => {
      res.writeHead(401, { 'content-type': 'application/json' })
      res.end('{"error":"unauthorized"}')
    })
    close = srv.close
    const client = new Client({ apiKey: 'dbk_live_test', baseUrl: srv.baseUrl, maxRetries: 0 })
    await expect(client.getMe()).rejects.toMatchObject({
      name: 'APIError',
      status: 401,
      message: 'unauthorized',
    })
    await expect(client.getMe()).rejects.toBeInstanceOf(APIError)
  })

  it('covers all operationIds', async () => {
    expect(OPERATION_IDS.length).toBeGreaterThanOrEqual(100)
    const client = new Client({ apiKey: 'x', baseUrl: 'http://127.0.0.1:9' })
    for (const id of OPERATION_IDS) {
      expect(typeof (client.resources as unknown as Record<string, unknown>)[id]).toBe('function')
    }
  })
})
