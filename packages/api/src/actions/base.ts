import { redis } from '../services/redis'
import { hashMessage } from 'viem'
import { Action, CredentialInstance, logActionExecution } from '@anonworld/db'
import { ActionRequest } from './types'

export abstract class BaseAction<TMetadata = any, TData = any> {
  action!: Action<TMetadata>
  data!: TData
  credentials: CredentialInstance[] = []

  constructor(action: Action, data: TData, credentials: CredentialInstance[]) {
    this.action = action as Action<TMetadata>
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

      await logActionExecution({
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
      await logActionExecution({
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
