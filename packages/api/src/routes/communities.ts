import { t } from 'elysia'
import { createElysia } from '../utils'
import { db } from '@anonworld/common'

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
