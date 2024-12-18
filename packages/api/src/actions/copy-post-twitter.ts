import {
  createPostRelationship,
  getPost,
  getPostRelationship,
  PostData,
} from '@anonworld/db'
import { neynar } from '../services/neynar'
import { twitter } from '../services/twitter'
import { BaseAction } from './base'

export type CopyPostTwitterMetadata = {
  twitter: string
}

export type CopyPostTwitterData = {
  hash: string
  reply?: boolean
}

export class CopyPostTwitter extends BaseAction<
  CopyPostTwitterMetadata,
  CopyPostTwitterData
> {
  async isAbleToPromote(post: PostData) {
    const unableToPromoteRegex = [
      /.*@clanker.*(launch|deploy|make).*/is,
      /.*dexscreener.com.*/i,
      /.*dextools.io.*/i,
      /.*0x[a-fA-F0-9]{40}.*/i,
      /(^|\s)\$(?!ANON\b)[a-zA-Z]+\b/i,
      /.*@bankr.*/i,
    ]

    if (unableToPromoteRegex.some((regex) => post.text?.match(regex))) {
      return false
    }

    if (
      post.embeds?.some((embed) =>
        unableToPromoteRegex.some((regex) => embed.match(regex))
      )
    ) {
      return false
    }

    return true
  }

  async postToTweet(post: PostData) {
    let text = post.text ?? ''
    let quoteTweetId: string | undefined
    let replyToTweetId: string | undefined
    const images: string[] = post.images ?? []

    if (post.quote) {
      images.push(`https://client.warpcast.com/v2/cast-image?castHash=${post.quote}`)
    }

    for (const embed of post.embeds ?? []) {
      if (embed.includes('x.com') || embed.includes('twitter.com')) {
        const url = new URL(embed)
        const tweetId = url.pathname.split('/').pop()
        if (tweetId) {
          if (this.data.reply) {
            replyToTweetId = tweetId
          } else {
            quoteTweetId = tweetId
          }
        }
      } else {
        text += `\n\n${embed}`
      }
    }

    const mentions = post.text?.match(/@[\w-]+(?:\.eth)?/g)
    if (mentions) {
      for (const mention of mentions) {
        try {
          const farcasterUser = await neynar.getUserByUsername(mention.slice(1))

          if (!farcasterUser.user) {
            continue
          }

          const connectedTwitter = farcasterUser.user.verified_accounts?.find(
            (va) => va.platform === 'x'
          )

          if (connectedTwitter) {
            text = text?.replace(mention, `@${connectedTwitter.username}`)
          }
        } catch {
          continue
        }
      }
    }

    return { text, images, quoteTweetId, replyToTweetId }
  }

  async handle() {
    const relationship = await getPostRelationship(
      this.data.hash,
      'twitter',
      this.action.metadata.twitter
    )
    if (relationship) {
      return { success: true, tweetId: relationship.target_id }
    }

    const post = await getPost(this.data.hash)
    if (!post) {
      return { success: false }
    }

    if (!this.isAbleToPromote(post.data)) {
      return { success: false }
    }

    const tweet = await this.postToTweet(post.data)
    const response = await twitter.postTweet(this.action.metadata.twitter, tweet)

    if (!response.tweetId) {
      return { success: false }
    }

    await createPostRelationship({
      post_hash: this.data.hash,
      target: 'twitter',
      target_account: this.action.metadata.twitter,
      target_id: response.tweetId,
    })

    return { success: true, tweetId: response.tweetId }
  }
}
