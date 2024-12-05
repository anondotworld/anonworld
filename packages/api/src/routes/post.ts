import { createElysia } from '../utils'
import { t } from 'elysia'
import { verifyMessage } from 'viem'
import { neynar } from '../services/neynar'
import { markPostReveal } from '@anon/db'
import { augmentCasts } from './feed'

export const postRoutes = createElysia({ prefix: '/posts' })
  .post(
    '/reveal',
    async ({ body }) => {
      const isValidSignature = await verifyMessage({
        message: body.message,
        signature: body.signature as `0x${string}`,
        address: body.address as `0x${string}`,
      })
      if (!isValidSignature) {
        return {
          success: false,
        }
      }

      const address = body.address.toLowerCase()
      const users = await neynar.getBulkUsers([address])

      await markPostReveal(body.castHash, body.revealPhrase, body.signature, body.address)

      const username = users?.[address]?.[0]?.username

      await neynar.post({
        text: `REVEALED: Posted by ${username ? `@${username}` : `${address}`}`,
        embeds: [`https://anoncast.org/posts/${body.castHash}`],
        quote: body.castHash,
        tokenAddress: body.tokenAddress,
      })

      return {
        success: true,
      }
    },
    {
      body: t.Object({
        castHash: t.String(),
        message: t.String(),
        revealPhrase: t.String(),
        signature: t.String(),
        address: t.String(),
        tokenAddress: t.String(),
      }),
    }
  )
  .get(
    '/:hash',
    async ({ params, error }) => {
      const cast = await neynar.getCast(params.hash)
      if (!cast?.cast) {
        return error(404, 'Cast not found')
      }

      const revealedCast = await augmentCasts([cast.cast])
      return revealedCast[0]
    },
    {
      params: t.Object({
        hash: t.String(),
      }),
    }
  )
