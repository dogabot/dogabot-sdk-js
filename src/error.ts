import type { APIErrorBody } from './types.js'

export class APIError extends Error {
  readonly status: number
  readonly body: APIErrorBody | null
  readonly headers: Headers

  constructor(message: string, status: number, body: APIErrorBody | null, headers: Headers) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.body = body
    this.headers = headers
  }
}
