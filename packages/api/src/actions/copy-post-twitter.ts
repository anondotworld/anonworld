import { db } from '../db'
import { neynar } from '../services/neynar'
import { twitter } from '../services/twitter'
import { BaseAction } from './base'
import { PostData } from '@anonworld/common'

export type CopyPostTwitterMetadata = {
  twitter: string
}

export type CopyPostTwitterData = {
  hash: string
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
      post.links?.some((link) => unableToPromoteRegex.some((regex) => link.match(regex)))
    ) {
      return false
    }

    return true
  }

  extractTweetId(input: string) {
    const url = new URL(input)
    const isTwitter =
      (url.hostname === 'x.com' || url.hostname === 'twitter.com') &&
      url.pathname.match(/^\/[^/]+\/status\/\d+$/) // /<username>/status/<tweet_id>
    if (isTwitter) {
      return url.pathname.split('/').pop()
    }
  }

  async postToTweet(post: PostData) {
    let text = post.text ?? ''
    let quoteTweetId: string | undefined
    let replyToTweetId: string | undefined
    const images: string[] = post.images ?? []

    if (post.reply) {
      replyToTweetId = this.extractTweetId(post.reply)
    }

    for (const link of post.links ?? []) {
      const tweetId = this.extractTweetId(link)
      if (tweetId) {
        if (!quoteTweetId) {
          quoteTweetId = tweetId
          continue
        }
      }

      const farcasterCast = await neynar.getCastFromURL(link)
      if (farcasterCast) {
        images.push(
          `https://client.warpcast.com/v2/cast-image?castHash=${farcasterCast.hash}`
        )
        continue
      }

      text += `\n\n${link}`
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
    const relationship = await db.relationships.get(
      this.data.hash,
      'twitter',
      this.action.metadata.twitter
    )
    if (relationship) {
      return { success: true, tweetId: relationship.target_id }
    }

    const post = await db.posts.get(this.data.hash)
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

    const parent = await db.relationships.getParent(this.data.hash)

    await db.relationships.create({
      post_hash: parent?.post_hash || this.data.hash,
      target: 'twitter',
      target_account: this.action.metadata.twitter,
      target_id: response.tweetId,
    })

    return { success: true, tweetId: response.tweetId }
  }
}
