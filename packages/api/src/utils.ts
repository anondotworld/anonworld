import cors from '@elysiajs/cors'
import jwt from '@elysiajs/jwt'
import { Elysia } from 'elysia'
import { Logestic } from 'logestic'

export const createElysia = (config?: ConstructorParameters<typeof Elysia>[0]) =>
  new Elysia(config)
    .use(cors())
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRET!,
      })
    )
    .use(Logestic.preset('common'))
    .derive(async ({ jwt, headers }) => {
      const auth = headers.authorization
      const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
      if (token) {
        const payload = await jwt.verify(token)
        if (payload) {
          return { passkeyId: payload.passkeyId as string }
        }
      }
      return { passkeyId: null }
    })
    .onError(({ server, error, path }) => {
      console.error(path, error)
      if (error.message.toLowerCase().includes('out of memory')) {
        server?.stop()
        process.exit(1)
      }
    })

export function encodeJson(obj: any): string {
  if (Array.isArray(obj)) {
    return '[' + obj.map(encodeJson).join(',') + ']'
  }

  if (typeof obj === 'object' && obj !== null) {
    return (
      '{' +
      Object.keys(obj)
        .sort()
        .map((key) => `"${key}":${encodeJson(obj[key])}`)
        .join(',') +
      '}'
    )
  }

  return JSON.stringify(obj)
}

export function formatHexId(hex: string) {
  let str = ''
  for (let i = 2; i < hex.length - 1; i += 2) {
    const num = Number.parseInt(hex.slice(i, i + 2), 16)
    if (!Number.isNaN(num)) {
      const code = num % 62
      if (code < 26) {
        str += String.fromCharCode(97 + code)
      } else if (code < 52) {
        str += String.fromCharCode(65 + (code - 26))
      } else {
        str += String.fromCharCode(48 + (code - 52))
      }
    }
  }
  return str.slice(0, 8)
}
