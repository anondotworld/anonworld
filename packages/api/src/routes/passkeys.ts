import { createElysia } from '../utils'
import { t } from 'elysia'
import { toHex } from 'viem'
import { redis } from '../services/redis'
import { WebAuthnP256 } from 'ox'
import { createPasskey, getPasskey, getVaults } from '@anonworld/db'

export const passkeysRoutes = createElysia({ prefix: '/passkeys' })
  .post(
    '/challenge',
    async ({ body }) => {
      const challenge = toHex(crypto.getRandomValues(new Uint8Array(32)))
      await redis.setVaultChallenge(body.nonce, challenge)
      return {
        challenge,
      }
    },
    {
      body: t.Object({
        nonce: t.String(),
      }),
    }
  )
  .post(
    '/create',
    async ({ body }) => {
      const challenge = await redis.getVaultChallenge(body.nonce)
      if (!challenge) {
        return { success: false }
      }

      const passkey = await createPasskey({
        id: body.id,
        public_key: body.publicKey,
      })
      if (!passkey) {
        return { success: false }
      }

      return { success: true }
    },
    {
      body: t.Object({
        nonce: t.String(),
        id: t.String(),
        publicKey: t.Object({
          prefix: t.Number(),
          x: t.String(),
          y: t.String(),
        }),
      }),
    }
  )
  .post(
    '/authenticate',
    async ({ body }) => {
      const challenge = await redis.getVaultChallenge(body.nonce)
      if (!challenge) {
        return { success: false }
      }

      const passkey = await getPasskey(body.raw.id)
      if (!passkey) {
        return { success: false }
      }

      const result = WebAuthnP256.verify({
        challenge,
        signature: {
          r: BigInt(body.signature.r),
          s: BigInt(body.signature.s),
          yParity: body.signature.yParity,
        },
        metadata: body.metadata,
        publicKey: {
          prefix: passkey.public_key.prefix,
          x: BigInt(passkey.public_key.x),
          y: BigInt(passkey.public_key.y),
        },
      })

      if (!result) {
        return { success: false }
      }

      return { success: true }
    },
    {
      body: t.Object({
        nonce: t.String(),
        raw: t.Object({
          id: t.String(),
          type: t.String(),
        }),
        signature: t.Object({
          r: t.String(),
          s: t.String(),
          yParity: t.Optional(t.Number()),
        }),
        metadata: t.Any(),
      }),
    }
  )
  .get(
    '/:passkeyId/vaults',
    async ({ params }) => {
      const data = await getVaults(params.passkeyId)
      return { data }
    },
    {
      params: t.Object({
        passkeyId: t.String(),
      }),
    }
  )
