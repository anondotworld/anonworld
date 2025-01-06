import { CredentialType, optimism, ProofData } from '@anonworld/common'
import { formatArray } from '../../utils'
import { formatHexArray } from '../../utils'
import { getPublicKey } from '../../utils'
import { Circuit } from '../../utils/circuit'
import { GetProofReturnType, hashMessage, keccak256 } from 'viem'
import { concat } from 'viem'
import { toHex } from 'viem'
import { pad } from 'viem'
import { Verifier } from '../verifier'
import circuit from './circuit/target/0.1.0/main.json'
import vkey from './circuit/target/0.1.0/vkey.json'

export const VERSION = '0.1.0'

const ID_REGISTRY_CHAIN = optimism
const ID_REGISTRY_ADDRESS = '0x00000000fc6c5f01fc30151999387bb99a9f489b'
const ID_OF_STORAGE_SLOT = 9

export type FarcasterFidArgs = {
  address: string
  verifiedFid: bigint
  signature: string
  message: string
}

export type FarcasterFidPublicData = {
  fid: number
  chainId: number
  blockNumber: string
  contractAddress: string
  storageSlot: string
  storageHash: string
}

export type FarcasterFidInputData = {
  signature: string
  messageHash: string
  storageHash: string
  storageProof: GetProofReturnType['storageProof']
  chainId: string
  blockNumber: string
  contractAddress: string
  storageSlot: string
  verifiedFid: string
}

export class FarcasterFidVerifier extends Circuit implements Verifier {
  public type: CredentialType
  public version: string

  constructor(type: CredentialType, version: string) {
    let circuitVersion = version
    if (version === 'latest') {
      circuitVersion = VERSION
    }
    super(circuit, vkey)
    this.type = type
    this.version = circuitVersion
  }

  async buildInput(args: FarcasterFidArgs): Promise<{
    input: FarcasterFidInputData
  }> {
    const storageSlotHex = pad(toHex(ID_OF_STORAGE_SLOT))
    const storageKey = keccak256(
      concat([pad(args.address as `0x${string}`), storageSlotHex])
    )
    const block = await ID_REGISTRY_CHAIN.client.getBlock()
    const ethProof = await ID_REGISTRY_CHAIN.client.getProof({
      address: ID_REGISTRY_ADDRESS as `0x${string}`,
      storageKeys: [storageKey],
      blockNumber: block.number,
    })

    const input = {
      storageHash: ethProof.storageHash,
      storageProof: ethProof.storageProof,
      chainId: `0x${Number(ID_REGISTRY_CHAIN.id).toString(16)}`,
      blockNumber: `0x${block.number.toString(16)}`,
      contractAddress: ID_REGISTRY_ADDRESS,
      storageSlot: storageSlotHex,
      verifiedFid: `0x${args.verifiedFid.toString(16)}`,
      signature: args.signature,
      messageHash: hashMessage(args.message),
    }

    return {
      input,
    }
  }

  async generateProof(args: FarcasterFidInputData) {
    const { pubKeyX, pubKeyY } = await getPublicKey(
      args.signature as `0x${string}`,
      args.messageHash as `0x${string}`
    )

    const storageProof = args.storageProof[0]
    const nodes = storageProof.proof.slice(0, storageProof.proof.length - 1)
    const leaf = storageProof.proof[storageProof.proof.length - 1]

    const input = {
      signature: formatHexArray(args.signature, { length: 64 }),
      message_hash: formatHexArray(args.messageHash),
      pub_key_x: formatHexArray(pubKeyX),
      pub_key_y: formatHexArray(pubKeyY),
      storage_hash: formatHexArray(args.storageHash),
      storage_nodes: formatArray(nodes, (node) =>
        formatHexArray(node, { length: 532, pad: 'right' })
      ),
      storage_leaf: formatHexArray(leaf, { length: 69, pad: 'right' }),
      storage_depth: storageProof.proof.length,
      storage_value: `0x${storageProof.value.toString(16)}`,
      chain_id: args.chainId,
      block_number: args.blockNumber,
      contract_address: args.contractAddress,
      storage_slot: args.storageSlot,
      verified_fid: args.verifiedFid,
    }

    const proof = await super.generate(input)

    return {
      type: this.type,
      version: this.version,
      proof: Array.from(proof.proof),
      publicInputs: proof.publicInputs,
    }
  }

  async verifyProof(proof: ProofData) {
    return super.verify(proof)
  }

  parseData(publicInputs: string[]): FarcasterFidPublicData {
    const fid = Number(BigInt(publicInputs[0]))
    const chainId = Number(BigInt(publicInputs[1]).toString())
    const blockNumber = BigInt(publicInputs[2]).toString()
    const contractAddress = `0x${publicInputs[3].slice(-40)}` as string
    const storageSlot = BigInt(publicInputs[4]).toString()
    const storageHash = `0x${publicInputs
      .slice(5, 5 + 32)
      .map((b) => BigInt(b).toString(16).padStart(2, '0'))
      .join('')}` as string

    return {
      fid,
      chainId,
      blockNumber,
      contractAddress,
      storageSlot,
      storageHash,
    }
  }
}
