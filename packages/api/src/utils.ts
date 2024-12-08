import cors from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { Logestic } from 'logestic'
import { Cast } from './services/neynar/types'
import { getPostChildren, getPostParentAndSiblings } from '@anonworld/db'
import { getBulkPosts } from '@anonworld/db'

export const createElysia = (config?: ConstructorParameters<typeof Elysia>[0]) =>
  new Elysia(config)
    .use(cors())
    .use(Logestic.preset('common'))
    .onError(({ server, error, path }) => {
      console.log(path, error)
      if (error.message.includes('Out of memory')) {
        server?.stop()
        process.exit(1)
      }
    })

export const augmentCasts = async (casts: Cast[]) => {
  const hashes = casts.map((cast) => cast.hash)
  const [posts, children, relationships] = await Promise.all([
    getBulkPosts(hashes),
    getPostChildren(hashes),
    getPostParentAndSiblings(hashes),
  ])

  return casts.map((cast) => {
    const post = posts.find((p) => p.hash === cast.hash)
    const c = children.filter((r) => r.post_hash === cast.hash)
    const r = relationships[cast.hash]

    return {
      ...cast,
      reveal: post?.reveal_hash
        ? {
            ...(post?.reveal_metadata || {}),
            revealHash: post.reveal_hash,
            input: JSON.stringify(post?.data),
            revealedAt: post?.updated_at.toISOString(),
          }
        : undefined,
      children: c.map((c) => ({
        target: c.target,
        targetAccount: c.target_account,
        targetId: c.target_id,
      })),
      siblings:
        r?.siblings.map((s) => ({
          target: s.target,
          targetAccount: s.target_account,
          targetId: s.target_id,
        })) ?? [],
      parent: r?.parent
        ? {
            target: r.parent.target,
            targetAccount: r.parent.target_account,
            targetId: r.parent.target_id,
          }
        : undefined,
    }
  })
}
