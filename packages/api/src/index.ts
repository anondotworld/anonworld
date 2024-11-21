import { t } from 'elysia'
import { createElysia } from './utils'
import { feedRoutes } from './routes/feed'
import { merkleTreeRoutes } from './routes/merkle-tree'
import { getPostRoutes } from './routes/post'
import { neynar } from './services/neynar'
import { getProvingBackend, ProofType } from '@anon/utils/src/proofs'
;(async () => {
  const [createPostBackend, submitHashBackend] = await Promise.all([
    getProvingBackend(ProofType.CREATE_POST),
    getProvingBackend(ProofType.PROMOTE_POST),
  ])
  const postRoutes = getPostRoutes(createPostBackend, submitHashBackend)

  const app = createElysia()
    .use(feedRoutes)
    .use(merkleTreeRoutes)
    .use(postRoutes)
    .get(
      '/get-cast',
      async ({ query }) => {
        const response = await neynar.getCast(query.identifier)
        return response.cast
      },
      {
        query: t.Object({
          identifier: t.String(),
        }),
      }
    )
    .get(
      '/get-channel',
      async ({ query }) => {
        const response = await neynar.getChannel(query.identifier)
        return response.channel
      },
      {
        query: t.Object({
          identifier: t.String(),
        }),
      }
    )
    .get(
      '/validate-frame',
      async ({ query }) => {
        return await neynar.validateFrame(query.data)
      },
      {
        query: t.Object({
          data: t.String(),
        }),
      }
    )

  app.listen(3001)

  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
})()
