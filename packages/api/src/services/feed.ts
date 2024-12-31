import {
  CredentialInstance,
  getCommunitiesForAccounts,
  getFarcasterAccounts,
  getLikeCounts,
  getLikedPosts,
  getPost,
  getPostCredentials,
  getPostParent,
  getPostRelationships,
  getTokens,
  getTwitterAccounts,
  Post,
  PostRelationship,
  Token,
} from '@anonworld/db'
import { neynar } from './neynar'
import { Cast } from './neynar/types'
import { encodeJson, formatHexId } from '../utils'

export class FeedService {
  async getFeedPost(hash: string) {
    let post = await getPost(hash)

    // Resolve original post
    if (post?.fid !== 899289) {
      const parent = await getPostParent(hash)
      if (parent) {
        post = await getPost(parent.post_hash)
      }
    }

    if (!post) return null

    const [formattedPost] = await this.getFeed([post])
    return formattedPost
  }

  async getFeed(posts: Array<Post>) {
    if (posts.length === 0) return []

    const [relationships, credentials] = await Promise.all([
      this.getRelationships(posts),
      this.getCredentials(posts),
    ])

    const tokenIds = new Set<string>()
    for (const credential of Object.values(credentials).flat()) {
      if (credential.credential_id.startsWith('ERC20_BALANCE')) {
        tokenIds.add(`${credential.metadata.chainId}:${credential.metadata.tokenAddress}`)
      }
    }

    const fids = new Set<number>()
    const usernames = new Set<string>()
    const hashes = new Set<string>(posts.map((p) => p.hash))
    for (const relationship of Object.values(relationships).flat()) {
      if (relationship.target === 'farcaster') {
        fids.add(Number(relationship.target_account))
        hashes.add(relationship.target_id)
      } else if (relationship.target === 'twitter') {
        usernames.add(relationship.target_account)
      }
    }

    const [tokens, farcasterAccounts, twitterAccounts, communities, likes] =
      await Promise.all([
        this.getRelatedTokens(Array.from(tokenIds)),
        this.getRelatedFarcasterAccounts(Array.from(fids)),
        this.getRelatedTwitterAccounts(Array.from(usernames)),
        this.getRelatedCommunities(Array.from(fids), Array.from(usernames)),
        getLikeCounts(Array.from(hashes)),
      ])

    const casts = await this.getCasts(Array.from(hashes))

    const result: Array<Cast> = []
    for (const post of posts) {
      const cast = casts[post.hash]
      if (!cast) continue

      const formattedPost: Cast = { ...cast }
      if (post.reveal_hash) {
        formattedPost.reveal = {
          ...(post.reveal_metadata || {}),
          revealHash: post.reveal_hash,
          input: encodeJson(post.data),
          revealedAt: post.updated_at.toISOString(),
        }
      }

      formattedPost.credentials =
        credentials[post.hash]?.map((c) => ({
          ...c,
          displayId: formatHexId(c.id),
          token: tokens[`${c.metadata.chainId}:${c.metadata.tokenAddress}`],
          id: undefined,
          proof: undefined,
          verified_at: c.verified_at.toISOString(),
        })) ?? []

      formattedPost.relationships =
        relationships[post.hash]?.map((r) => ({
          target: r.target,
          targetAccount: r.target_account,
          targetId: r.target_id,
          twitter: twitterAccounts[r.target_account],
          farcaster: farcasterAccounts[Number(r.target_account)],
          community: communities[r.target_account],
        })) ?? []

      const relatedCasts =
        relationships[post.hash]?.map((r) => casts[r.target_id]).filter((c) => c) ?? []

      let postLikes = cast.reactions.likes_count
      postLikes += relatedCasts.reduce((acc, c) => acc + c.reactions.likes_count, 0)
      if (likes[post.hash]) {
        postLikes += likes[post.hash]
      }

      let postReplies = cast.replies.count
      postReplies += relatedCasts.reduce((acc, c) => acc + c.replies.count, 0)

      formattedPost.aggregate = {
        likes: postLikes,
        replies: postReplies,
      }

      result.push(formattedPost)
    }

    return result
  }

  private async getCasts(hashes: string[]) {
    const response = await neynar.getBulkCasts(hashes)
    const casts = response.result.casts.reduce(
      (acc, c) => {
        acc[c.hash] = c
        return acc
      },
      {} as Record<string, Cast>
    )
    return casts
  }

  private async getRelationships(posts: Post[]) {
    const relationships = await getPostRelationships(posts.map((p) => p.hash))
    const relationshipsByHash = relationships.reduce(
      (acc, r) => {
        if (!acc[r.post_hash]) {
          acc[r.post_hash] = []
        }
        acc[r.post_hash].push(r)
        return acc
      },
      {} as Record<string, PostRelationship[]>
    )
    return relationshipsByHash
  }

  private async getCredentials(posts: Post[]) {
    const credentials = await getPostCredentials(posts.map((p) => p.hash))
    const credentialsByHash = credentials.reduce(
      (acc, c) => {
        if (!acc[c.post_credentials.post_hash]) {
          acc[c.post_credentials.post_hash] = []
        }
        acc[c.post_credentials.post_hash].push(c.credential_instances)
        return acc
      },
      {} as Record<string, CredentialInstance[]>
    )
    return credentialsByHash
  }

  private async getRelatedTokens(tokenIds: string[]) {
    const tokens = await getTokens(tokenIds)
    const tokensById = tokens.reduce(
      (acc, t) => {
        acc[t.id] = t
        return acc
      },
      {} as Record<string, Token>
    )
    return tokensById
  }

  private async getRelatedFarcasterAccounts(fids: number[]) {
    const farcasterAccounts = await getFarcasterAccounts(fids)
    const farcasterAccountsById = farcasterAccounts.reduce(
      (acc, f) => {
        acc[f.fid] = f.metadata
        return acc
      },
      {} as Record<number, any>
    )
    return farcasterAccountsById
  }

  private async getRelatedTwitterAccounts(usernames: string[]) {
    const twitterAccounts = await getTwitterAccounts(usernames)
    const twitterAccountsById = twitterAccounts.reduce(
      (acc, t) => {
        acc[t.username] = t.metadata
        return acc
      },
      {} as Record<string, any>
    )
    return twitterAccountsById
  }

  private async getRelatedCommunities(fids: number[], usernames: string[]) {
    const communities = await getCommunitiesForAccounts(fids, usernames)
    const communitiesById = communities.reduce(
      (acc, c) => {
        acc[c.fid.toString()] = c
        if (c.twitter_username) {
          acc[c.twitter_username] = c
        }
        return acc
      },
      {} as Record<number | string, any>
    )
    return communitiesById
  }

  public async addUserData(passkeyId: string, posts: Array<Cast>) {
    const hashes = posts.map((p) => p.hash)
    const likes = await getLikedPosts(passkeyId, hashes)
    const likedHashes = likes.map((l) => l.post_hash)
    return posts.map((p) => ({ ...p, user: { liked: likedHashes.includes(p.hash) } }))
  }
}

export const feed = new FeedService()