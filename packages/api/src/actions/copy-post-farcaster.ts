import { db } from '../db'
import { neynar } from '../services/neynar'
import { BaseAction } from './base'
import { PostData } from '@anonworld/common'

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
      post.links?.some((link) => unableToPromoteRegex.some((regex) => link.match(regex)))
    ) {
      return false
    }

    return true
  }

  async handle() {
    const relationship = await db.relationships.get(
      this.data.hash,
      'farcaster',
      this.action.metadata.fid.toString()
    )
    if (relationship) {
      return { success: true, hash: relationship.target_id }
    }

    const post = await db.posts.get(this.data.hash)
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

    await db.posts.create({
      hash: response.cast.hash,
      fid: this.action.metadata.fid,
      data: post.data,
      reveal_hash: post.reveal_hash ?? undefined,
    })

    const parent = await db.relationships.getParent(this.data.hash)

    await db.relationships.create({
      post_hash: parent?.post_hash || this.data.hash,
      target: 'farcaster',
      target_account: this.action.metadata.fid.toString(),
      target_id: response.cast.hash,
    })

    const credentialIds = this.credentials.map((credential) => credential.id!)
    await db.posts.addCredentials(response.cast.hash, credentialIds)

    return { success: true, hash: response.cast.hash }
  }
}
