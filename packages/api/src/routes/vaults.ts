import { createElysia } from '../utils'
import { t } from 'elysia'
import { addCredentialToVault, removeCredentialFromVault } from '@anonworld/db'

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
