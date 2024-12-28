import { createElysia } from '../utils'
import { getAccounts } from '@anonworld/db'

export const accountsRoutes = createElysia({ prefix: '/accounts' }).get('/', async () => {
  const accounts = await getAccounts()
  return {
    data: accounts,
  }
})
