import { createElysia } from '../utils'
import { t } from 'elysia'
import { neynar } from '../services/neynar'
import { augmentCasts } from './feed'

export const postRoutes = createElysia({ prefix: '/posts' }).get(
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
