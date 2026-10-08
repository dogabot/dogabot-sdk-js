/** JSON-compatible values. */
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue }

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ClientOptions {
  /** API key (`dbk_live_…`). Defaults to `process.env.DOGABOT_API_KEY`. */
  apiKey?: string
  /** Defaults to `https://api.dogabot.com`. */
  baseUrl?: string
  /** Optional fetch implementation (tests). */
  fetch?: typeof fetch
  /** Max retries for 429/5xx (default 2). */
  maxRetries?: number
  /** User-Agent override. */
  userAgent?: string
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined | null>
  body?: JsonValue
  headers?: Record<string, string>
  /** Required for write mutations; preferred when retrying the same intent. */
  idempotencyKey?: string
  /** Internal: marks allowlist write routes. */
  write?: boolean
  signal?: AbortSignal
}

export interface APIErrorBody {
  error?: string
  [key: string]: JsonValue | undefined
}
