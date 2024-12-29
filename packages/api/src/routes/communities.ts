import { t } from 'elysia'
import { createElysia } from '../utils'
import { getCommunities, getCommunity } from '@anonworld/db'

export const communitiesRoutes = createElysia({ prefix: '/communities' })
  .get('/', async () => {
    const communities = await getCommunities()
    return {
      data: communities,
    }
  })
  .get(
    '/:id',
    async ({ params }) => {
      const community = await getCommunity(params.id)
      return community
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
