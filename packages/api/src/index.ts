import { createElysia } from './utils'
import { actionsRoutes } from './routes/actions'
import { postsRoutes } from './routes/posts'
import { feedsRoutes } from './routes/feeds'
import { uploadRoutes } from './routes/upload'
import { farcasterRoutes } from './routes/farcaster'

const app = createElysia()
  .use(actionsRoutes)
  .use(postsRoutes)
  .use(feedsRoutes)
  .use(uploadRoutes)
  .use(farcasterRoutes)

app.listen(3001)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
