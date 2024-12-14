import { merkleMembership } from '@anonworld/zk'

import { redis } from '../services/redis'
import { hashMessage } from 'viem'
import { Action, logActionExecution, validateMerkleRoots } from '@anonworld/db'
import { ActionRequest } from './types'

type Credential = {
  id: string
  proof: {
    proof: number[]
    publicInputs: string[]
  }
}

export abstract class BaseAction<TMetadata = any, TData = any> {
  action!: Action<TMetadata>
  data!: TData
  credentials: Credential[]

  roots: string[] = []

  constructor(action: Action, data: TData, credentials: Credential[]) {
    this.action = action as Action<TMetadata>
    this.data = data
    this.credentials = credentials
  }

  async validateRoots() {
    const proofs = this.credentials.map(({ proof }) => ({
      proof: new Uint8Array(proof.proof),
      publicInputs: proof.publicInputs,
    }))

    for (const proof of proofs) {
      const verified = await merkleMembership.verify(proof)
      if (!verified) {
        throw new Error('Invalid merkle tree root')
      }

      this.roots.push(proof.publicInputs[0])
    }

    if (this.roots.length === 0) {
      throw new Error('Invalid merkle tree root')
    }

    const rootValidations = await validateMerkleRoots(this.roots)
    if (rootValidations.length === 0) {
      throw new Error('Invalid merkle tree root')
    }
  }

  async execute(skipMerkleValidation = false) {
    try {
      if (!skipMerkleValidation) {
        await this.validateRoots()
      }

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
