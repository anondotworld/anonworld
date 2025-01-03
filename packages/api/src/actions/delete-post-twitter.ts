import { db } from '@anonworld/common'
import { twitter } from '../services/twitter'
import { BaseAction } from './base'

export type DeletePostTwitterMetadata = {
  twitter: string
}

export type DeletePostTwitterData = {
  tweetId: string
}

export class DeletePostTwitter extends BaseAction<
  DeletePostTwitterMetadata,
  DeletePostTwitterData
> {
  async handle() {
    const response = await twitter.deleteTweet(
      this.action.metadata.twitter,
      this.data.tweetId
    )
    if (!response.data.deleted) {
      throw new Error('Failed to delete tweet')
    }

    await db.relationships.delete('twitter', this.data.tweetId)

    return { success: true }
  }
}
