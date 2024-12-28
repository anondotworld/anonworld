import { createElysia } from '../utils'
import { getCommunities } from '@anonworld/db'

export const communitiesRoutes = createElysia({ prefix: '/communities' }).get(
  '/',
  async () => {
    const communities = await getCommunities()
    return {
      data: communities,
    }
  }
)
