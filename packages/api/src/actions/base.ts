import { redis } from '../services/redis'
import { hashMessage } from 'viem'
import { db } from '../db'
import { ActionRequest, Credential } from '@anonworld/common'
import { DBAction } from '../db/types'

export abstract class BaseAction<TMetadata = any, TData = any> {
  action!: DBAction & { metadata: TMetadata }
  data!: TData
  credentials: Credential[] = []

  constructor(action: DBAction, data: TData, credentials: Credential[]) {
    this.action = action as DBAction & { metadata: TMetadata }
    this.data = data
    this.credentials = credentials
  }

  async execute() {
    try {
      if (
        await redis.actionOccurred(this.action.id, hashMessage(JSON.stringify(this.data)))
      ) {
        throw new Error('Action already occurred')
      }

      const response = await this.handle()

      await db.actions.logExecution({
        action_id: this.action.id,
        action_data: this.data,
        status: 'SUCCESS',
        response,
      })

      await redis.markActionOccurred(
        this.action.id,
        hashMessage(JSON.stringify(this.data))
      )

      return response
    } catch (error) {
      await db.actions.logExecution({
        action_id: this.action.id,
        action_data: this.data,
        status: 'FAILED',
        error: error,
      })
      throw error
    }
  }

  abstract handle(): Promise<any>

  async next(): Promise<ActionRequest[]> {
    return []
  }
}
