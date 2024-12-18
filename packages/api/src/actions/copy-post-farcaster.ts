import {
  createPost,
  createPostCredentials,
  createPostRelationship,
  getPost,
  getPostRelationship,
  PostData,
} from '@anonworld/db'
import { neynar } from '../services/neynar'
import { BaseAction } from './base'

export type CopyPostFarcasterMetadata = {
  fid: number
}

export type CopyPostFarcasterData = {
  hash: string
}

export class CopyPostFarcaster extends BaseAction<
  CopyPostFarcasterMetadata,
  CopyPostFarcasterData
> {
  async isAbleToPromote(post: PostData) {
    const unableToPromoteRegex = [
      // /.*@clanker.*(launch|deploy|make).*/is,
      /.*dexscreener.com.*/i,
      /.*dextools.io.*/i,
      /.*0x[a-fA-F0-9]{40}.*/i,
      /(^|\s)\$(?!ANON\b)[a-zA-Z]+\b/i,
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

  async handle() {
    const relationship = await getPostRelationship(
      this.data.hash,
      'farcaster',
      this.action.metadata.fid.toString()
    )
    if (relationship) {
      return { success: true, hash: relationship.target_id }
    }

    const post = await getPost(this.data.hash)
    if (!post) {
      return { success: false }
    }

    if (!this.isAbleToPromote(post.data)) {
      return { success: false }
    }

    const response = await neynar.createCast({
      ...post.data,
      fid: this.action.metadata.fid,
    })
    if (!response.success) {
      return { success: false }
    }

    await createPost({
      hash: response.cast.hash,
      fid: this.action.metadata.fid,
      data: post.data,
      reveal_hash: post.reveal_hash,
    })

    await createPostRelationship({
      post_hash: this.data.hash,
      target: 'farcaster',
      target_account: this.action.metadata.fid.toString(),
      target_id: response.cast.hash,
    })

    await createPostCredentials(response.cast.hash, this.credentials)

    return { success: true, hash: response.cast.hash }
  }
}
