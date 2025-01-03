import { createElysia } from '../utils'
import { t } from 'elysia'
import { feed } from '../services/feed'
import { db } from '../db'

export const vaultsRoutes = createElysia({ prefix: '/vaults' })
  .put(
    '/:vaultId/credentials',
    async ({ body, params }) => {
      await db.credentials.addToVault(body.credentialId, params.vaultId)
      return {
        success: true,
      }
    },
    {
      body: t.Object({
        credentialId: t.String(),
      }),
      params: t.Object({
        vaultId: t.String(),
      }),
    }
  )
  .delete(
    '/:vaultId/credentials',
    async ({ body }) => {
      await db.credentials.removeFromVault(body.credentialId)
      return {
        success: true,
      }
    },
    {
      body: t.Object({
        credentialId: t.String(),
      }),
      params: t.Object({
        vaultId: t.String(),
      }),
    }
  )
  .get(
    '/:vaultId',
    async ({ params }) => {
      const [vault, credentials] = await Promise.all([
        db.vaults.get(params.vaultId),
        db.vaults.getCredentials(params.vaultId),
      ])
      return {
        ...vault,
        credentials: credentials.map((c) => ({
          ...c,
          id: undefined,
          proof: undefined,
        })),
      }
    },
    { params: t.Object({ vaultId: t.String() }) }
  )
  .get(
    '/:vaultId/posts',
    async ({ params }) => {
      const response = await db.vaults.getFeed(params.vaultId, {
        limit: 100,
        offset: 0,
      })

      if (response.length === 0) return { data: [] }

      const posts = response.map((p) => p.posts)
      const data = await feed.getFeed(posts)

      return {
        data,
      }
    },
    { params: t.Object({ vaultId: t.String() }) }
  )
