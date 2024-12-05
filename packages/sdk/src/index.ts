import { buildHashFunction, permissionedAction, ProofData } from '@anonworld/zk'
import { toArray } from './utils'
import { Api } from './api'
import { getPublicKey } from './utils'
import { LeanIMT } from '@zk-kit/lean-imt'
import { pad } from 'viem'

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

type PerformActionArgs = {
  address: `0x${string}`
  signature: `0x${string}`
  messageHash: `0x${string}`
  data: CreatePostData | DeletePostData | PromotePostData
  actionId: string
}

export class AnonWorldSDK {
  private readonly api: Api

  constructor(apiUrl: string) {
    this.api = new Api(apiUrl)
  }

  async performAction(args: PerformActionArgs) {
    const { root, index, siblings } = await this.getMerkleTreeInputs(
      args.actionId,
      args.address
    )
    const { pubKeyX, pubKeyY } = await getPublicKey(args.signature, args.messageHash)

    const input = {
      signature: toArray(args.signature).slice(0, 64),
      message_hash: toArray(args.messageHash),
      pub_key_x: pubKeyX,
      pub_key_y: pubKeyY,
      root,
      index,
      path: siblings,
    }

    const proof = await permissionedAction.generate(input)
    return await this.api.submitAction({
      proof,
      actionId: args.actionId,
      data: args.data,
    })
  }

  private async getMerkleTreeInputs(actionId: string, address: `0x${string}`) {
    const response = await this.api.getMerkleTree(actionId)
    if (response.error) throw new Error(response.error.message)
    const hasher = await buildHashFunction()
    const tree = LeanIMT.import(hasher, JSON.stringify(response.data), (value) => value)
    const paddedAddress = pad(address).toLowerCase()
    const leafIndex = tree.leaves.indexOf(paddedAddress)
    return tree.generateProof(leafIndex)
  }
}
