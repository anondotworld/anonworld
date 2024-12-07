import type { ProofManager } from '@anonworld/zk'
import { toArray } from './utils'
import { Api } from './api'
import { getPublicKey } from './utils'
import { LeanIMT } from '@zk-kit/lean-imt'
import { pad } from 'viem'
import { ApiResponse } from './types'
import { hashMessage } from 'viem'

type CreatePostData = {
  text?: string
  embeds?: string[]
  quote?: string
  channel?: string
  parent?: string
  revealHash?: string
}

type DeletePostData = {
  hash: string
}

type PromotePostData = {
  hash: string
  reply?: boolean
}

export type PerformActionArgs = {
  address: `0x${string}`
  signature: `0x${string}`
  messageHash: `0x${string}`
  data: CreatePostData | DeletePostData | PromotePostData
  actionId: string
}

export type PerformActionResponse = ApiResponse<{
  success: boolean
  hash?: string
  tweetId?: string
}>

export class AnonWorldSDK {
  private readonly api: Api
  private permissionedAction!: ProofManager
  private hasher!: (a: string, b: string) => string

  constructor(apiUrl?: string) {
    this.api = new Api(apiUrl || 'https://api.anon.world')
  }

  async instantiate() {
    if (this.permissionedAction) return
    const { buildHashFunction, permissionedAction } = await import('@anonworld/zk')
    this.hasher = await buildHashFunction()
    this.permissionedAction = permissionedAction
  }

  async performAction(args: PerformActionArgs) {
    await this.instantiate()

    const tree = await this.getMerkleTree(args.actionId)
    const paddedAddress = pad(args.address).toLowerCase()
    const leafIndex = tree.leaves.indexOf(paddedAddress)
    const { root, index, siblings } = tree.generateProof(leafIndex)
    const { pubKeyX, pubKeyY } = await getPublicKey(args.signature, args.messageHash)

    const input = {
      signature: toArray(args.signature).slice(0, 64),
      message_hash: toArray(args.messageHash),
      pub_key_x: pubKeyX,
      pub_key_y: pubKeyY,
      root,
      index,
      path: siblings,
      data_hash: toArray(hashMessage(JSON.stringify(args.data))),
    }

    const proof = await this.permissionedAction.generate(input)
    return await this.api.submitAction({
      proof,
      actionId: args.actionId,
      data: args.data,
    })
  }

  async getMerkleTree(actionId: string) {
    await this.instantiate()

    const response = await this.api.getMerkleTree(actionId)
    if (response.error) throw new Error(response.error.message)
    return LeanIMT.import(this.hasher, JSON.stringify(response.data), (value) => value)
  }

  async revealPost(args: {
    hash: string
    message: string
    phrase: string
    signature: string
    address: string
  }) {
    return await this.api.revealPost(args)
  }

  async getBulkPostMetadata(hashes: string[]) {
    return await this.api.getBulkPostMetadata(hashes)
  }

  async getTrendingFeed(fid: number) {
    return await this.api.getTrendingFeed(fid)
  }

  async getNewFeed(fid: number) {
    return await this.api.getNewFeed(fid)
  }

  async getPost(hash: string) {
    return await this.api.getPost(hash)
  }

  async getFarcasterCast(identifier: string) {
    return await this.api.getFarcasterCast(identifier)
  }

  async getFarcasterIdentity(address: string) {
    return await this.api.getFarcasterIdentity(address)
  }

  async getFarcasterChannel(channelId: string) {
    return await this.api.getFarcasterChannel(channelId)
  }

  async uploadImage(image: File) {
    return await this.api.uploadImage(image)
  }
}
