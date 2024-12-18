import cors from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { Logestic } from 'logestic'
import { Cast } from './services/neynar/types'
import {
  getPostChildren,
  getPostCredentials,
  getPostParentAndSiblings,
} from '@anonworld/db'
import { getBulkPosts } from '@anonworld/db'

export const createElysia = (config?: ConstructorParameters<typeof Elysia>[0]) =>
  new Elysia(config)
    .use(cors())
    .use(Logestic.preset('common'))
    .onError(({ server, error, path }) => {
      console.error(path, error)
      if (error.message.toLowerCase().includes('out of memory')) {
        server?.stop()
        process.exit(1)
      }
    })

export const augmentCasts = async (casts: Cast[]) => {
  const hashes = casts.map((cast) => cast.hash)
  const [posts, children, relationships, credentials] = await Promise.all([
    getBulkPosts(hashes),
    getPostChildren(hashes),
    getPostParentAndSiblings(hashes),
    getPostCredentials(hashes),
  ])

  return casts.map((cast) => {
    const post = posts.find((p) => p.hash === cast.hash)
    const castChildren = children.filter((r) => r.post_hash === cast.hash)
    const castRelationships = relationships[cast.hash]
    const castCredentials = credentials.find((c) => c.hash === cast.hash)

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
      children: castChildren.map((c) => ({
        target: c.target,
        targetAccount: c.target_account,
        targetId: c.target_id,
      })),
      siblings:
        castRelationships?.siblings.map((s) => ({
          target: s.target,
          targetAccount: s.target_account,
          targetId: s.target_id,
        })) ?? [],
      parent: castRelationships?.parent?.post_hash,
      credentials: castCredentials?.credentials.map((c) => ({
        ...c,
        proof: undefined,
      })),
    }
  })
}
