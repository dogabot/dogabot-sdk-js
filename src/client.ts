import { createRequire } from 'node:module'
import { APIError } from './error.js'
import { Resources } from './resources.generated.js'
import type { ClientOptions, HttpMethod, JsonValue, RequestOptions } from './types.js'

const require = createRequire(import.meta.url)
const { version: pkgVersion } = require('../package.json') as { version: string }

const DEFAULT_BASE = 'https://api.dogabot.com'

export class Client {
  readonly apiKey: string
  readonly baseUrl: string
  readonly maxRetries: number
  readonly userAgent: string
  readonly resources: Resources
  private readonly fetchImpl: typeof fetch

  constructor(options: ClientOptions = {}) {
    const apiKey = options.apiKey ?? process.env.DOGABOT_API_KEY
    if (!apiKey) {
      throw new Error('apiKey is required (pass options.apiKey or set DOGABOT_API_KEY)')
    }
    this.apiKey = apiKey
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE).replace(/\/$/, '')
    this.maxRetries = options.maxRetries ?? 2
    this.userAgent = options.userAgent ?? `dogabot-sdk-js/${pkgVersion}`
    this.fetchImpl = options.fetch ?? fetch
    this.resources = new Resources(this)
  }

  /** Convenience: GET /api/v1/me */
  getMe(options?: RequestOptions): Promise<JsonValue> {
    return this.resources.getMe(options)
  }

  async request(input: {
    method: HttpMethod
    path: string
  } & RequestOptions): Promise<JsonValue> {
    const { method, path, query, body, headers, idempotencyKey, write, signal } = input
    if (write && !idempotencyKey) {
      throw new Error(`Idempotency-Key is required for write operation ${method} ${path}`)
    }

    const url = new URL(path.startsWith('http') ? path : `${this.baseUrl}${path}`)
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue
        url.searchParams.set(k, String(v))
      }
    }

    let attempt = 0
    for (;;) {
      const reqHeaders: Record<string, string> = {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
        'User-Agent': this.userAgent,
        ...headers,
      }
      if (idempotencyKey) {
        reqHeaders['Idempotency-Key'] = idempotencyKey
      }
      let payload: string | undefined
      if (body !== undefined) {
        reqHeaders['Content-Type'] = 'application/json'
        payload = JSON.stringify(body)
      }

      const res = await this.fetchImpl(url.toString(), {
        method,
        headers: reqHeaders,
        body: payload,
        signal,
      })

      const text = await res.text()
      let parsed: JsonValue | null = null
      if (text) {
        try {
          parsed = JSON.parse(text) as JsonValue
        } catch {
          parsed = text
        }
      }

      if (res.ok) {
        return parsed as JsonValue
      }

      const retryable = res.status === 429 || res.status >= 500
      if (retryable && attempt < this.maxRetries) {
        attempt += 1
        const retryAfter = res.headers.get('Retry-After')
        const waitMs = retryAfter ? Number(retryAfter) * 1000 : Math.min(1000 * 2 ** attempt, 8000)
        await sleep(Number.isFinite(waitMs) ? waitMs : 1000)
        continue
      }

      const errBody =
        parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? (parsed as Record<string, JsonValue>)
          : null
      const msg =
        (errBody && typeof errBody.error === 'string' && errBody.error) ||
        `HTTP ${res.status} ${method} ${path}`
      throw new APIError(msg, res.status, errBody, res.headers)
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export function createClient(options?: ClientOptions): Client {
  return new Client(options)
}
