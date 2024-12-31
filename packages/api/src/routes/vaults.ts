import { createElysia } from '../utils'
import { t } from 'elysia'
import {
  addCredentialToVault,
  getCredentialsFromVault,
  getPostsFromVault,
  getVault,
  Post,
  removeCredentialFromVault,
} from '@anonworld/db'
import { formatPosts } from './feeds'

export const vaultsRoutes = createElysia({ prefix: '/vaults' })
  .put(
    '/:vaultId/credentials',
    async ({ body, params }) => {
      await addCredentialToVault(params.vaultId, body.credentialId)
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
    async ({ params, body }) => {
      await removeCredentialFromVault(body.credentialId)
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
        getVault(params.vaultId),
        getCredentialsFromVault(params.vaultId),
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
      const response = await getPostsFromVault(params.vaultId, {
        limit: 100,
        offset: 0,
      })

      if (response.length === 0) return { data: [] }

      const posts = response.map((p) => p.posts) as Array<Post>
      const data = await formatPosts(posts)

      return {
        data,
      }
    },
    { params: t.Object({ vaultId: t.String() }) }
  )
