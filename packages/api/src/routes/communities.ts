import { t } from 'elysia'
import { createElysia } from '../utils'
import { db } from '../db'
import { provisioning } from '../services/provisioning'
import { neynar } from '../services/neynar'
import { Token } from '@anonworld/common'
import { tokens } from '../services/tokens'

export const communitiesRoutes = createElysia({ prefix: '/communities' })
  .get('/', async () => {
    const communities = await db.communities.list()
    return {
      data: communities,
    }
  })
  .get(
    '/:id',
    async ({ params }) => {
      const community = await db.communities.get(params.id)
      return community
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .post(
    '/',
    async ({ body }) => {
      const isFnameAvailable = await neynar.checkFnameAvailability(body.username)
      if (!isFnameAvailable.available) {
        throw new Error('Username is not available')
      }

      let token: Token | undefined
      if (body.existingToken) {
        token = await tokens.getOrCreate(body.existingToken)
        if (!token) {
          throw new Error('Failed to find token')
        }
      } else if (!body.newToken) {
        throw new Error('No token provided')
      }

      const { fid, walletId, walletAddress } = await provisioning.deployFarcasterAccount({
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl,
        username: body.username,
      })

      if (body.newToken) {
        token = await provisioning.deployToken({
          name: body.name,
          symbol: body.newToken.symbol,
          imageUrl: body.imageUrl,
          creatorAddress: walletAddress,
          creatorFid: fid,
        })
      }

      if (!token) {
        throw new Error('Failed to deploy token')
      }

      const community = await db.communities.create({
        name: body.name,
        description: body.description,
        image_url: body.imageUrl,
        token_id: token.id,
        fid,
        passkey_id: body.passkeyId,
        wallet_id: walletId,
        wallet_address: walletAddress,
        posts: 0,
        followers: 0,
        hidden: true,
      })

      return await db.communities.get(community.id)
    },
    {
      body: t.Object({
        passkeyId: t.Optional(t.String()),
        name: t.String(),
        description: t.String(),
        imageUrl: t.String(),
        username: t.String(),
        newToken: t.Optional(
          t.Object({
            symbol: t.String(),
          })
        ),
        existingToken: t.Optional(
          t.Object({
            contractType: t.String(),
            chainId: t.Number(),
            address: t.String(),
          })
        ),
      }),
    }
  )
