import { getBulkPosts, getPostsFromVault, Post as DBPost } from '@anonworld/db'
import { Post } from '@anonworld/common'
import { neynar } from './neynar'
import { feed } from './feed'

type HubMessage = {
  hash: string
  data: {
    timestamp: number
  }
}

export class NotificationsService {
  private hubUrl = 'https://hoyt.farcaster.xyz:2281'

  async getReplies(vaultId: string) {
    const vaultReplies = await this.getRepliesToVault(vaultId)
    const replies = vaultReplies
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(({ hash }) => hash)
      .slice(0, 100)

    const [casts, posts] = await Promise.all([
      this.getCasts(replies),
      this.getPosts(replies),
    ])

    const data: Post[] = []
    for (const cast of casts) {
      const reply = vaultReplies.find((r) => r.hash === cast.hash)
      const post = posts.find((p) => p.hash === cast.hash)
      if (post) {
        if (!post.credentials.some((credential) => credential.vault_id === vaultId)) {
          data.push({
            ...(post || cast),
            parentText: reply?.parentText || undefined,
          })
        }
        continue
      }

      data.push({
        ...cast,
        parentText: reply?.parentText || undefined,
        relationships: [],
        credentials: [],
        aggregate: { likes: 0, replies: 0 },
      })
    }
    return data
  }

  async getRepliesToVault(vaultId: string) {
    const vaultPosts = await getPostsFromVault(vaultId)
    const posts = vaultPosts.map((post) => post.posts) as DBPost[]
    const replies = await Promise.all(posts.map((post) => this.getRepliesFromHub(post)))
    return replies.flat()
  }

  async getRepliesFromHub({ fid, hash, data }: DBPost) {
    const response = await fetch(
      `${this.hubUrl}/v1/castsByParent?fid=${fid}&hash=${hash}`
    )
    const hubData: { messages: HubMessage[] } = await response.json()
    return hubData.messages.map((message) => ({
      hash: message.hash,
      timestamp: message.data.timestamp,
      parentText: data.text,
    }))
  }

  async getCasts(hashes: string[]) {
    const casts = await neynar.getBulkCasts(hashes)
    return casts.result.casts.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  async getPosts(hashes: string[]) {
    const posts = await getBulkPosts(hashes)
    const formattedPosts = await feed.getFeed(posts)
    return formattedPosts
  }
}

export const notifications = new NotificationsService()
