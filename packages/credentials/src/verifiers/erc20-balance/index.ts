import { CredentialType, getChain } from '@anonworld/common'
import { formatArray } from '../../utils'
import { formatHexArray } from '../../utils'
import { getPublicKey } from '../../utils'
import { Circuit } from '../../utils/circuit'
import type { ProofData } from '@aztec/bb.js'
import { GetProofReturnType, hashMessage, keccak256 } from 'viem'
import { concat } from 'viem'
import { toHex } from 'viem'
import { pad } from 'viem'
import { Verifier } from '../verifier'
import circuit from './circuit/target/0.1.5/main.json'
import vkey from './circuit/target/0.1.5/vkey.json'

export const ERC20_BALANCE_VERSION = '0.1.5'

export type ERC20BalanceArgs = {
  chainId: number
  tokenAddress: string
  address: string
  verifiedBalance: bigint
  balanceSlot: number
}

export type ERC20BalancePublicData = {
  balance: string
  chainId: number
  blockNumber: string
  tokenAddress: string
  balanceSlot: string
  storageHash: string
}

export type ERC20BalanceInputData = {
  address: string
  signature: string
  messageHash: string
  storageHash: string
  storageProof: GetProofReturnType['storageProof']
  chainId: string
  blockNumber: string
  tokenAddress: string
  balanceSlot: string
  verifiedBalance: string
}

export class ERC20BalanceVerifier extends Circuit implements Verifier {
  public version: string

  constructor(version: string) {
    let circuitVersion = version
    if (version === 'latest') {
      circuitVersion = ERC20_BALANCE_VERSION
    }
    super(circuit, vkey)
    this.version = circuitVersion
  }

  async buildInput(args: ERC20BalanceArgs): Promise<{
    input: Omit<ERC20BalanceInputData, 'signature'>
    message
  }> {
    const chain = getChain(args.chainId)
    const balanceSlotHex = pad(toHex(args.balanceSlot))
    const storageKey = keccak256(
      concat([pad(args.address as `0x${string}`), balanceSlotHex])
    )
    const block = await chain.client.getBlock()
    const ethProof = await chain.client.getProof({
      address: args.tokenAddress as `0x${string}`,
      storageKeys: [storageKey],
      blockNumber: block.number,
    })

    const input = {
      address: args.address,
      storageHash: ethProof.storageHash,
      storageProof: ethProof.storageProof,
      chainId: `0x${Number(args.chainId).toString(16)}`,
      blockNumber: `0x${block.number.toString(16)}`,
      tokenAddress: args.tokenAddress,
      balanceSlot: balanceSlotHex,
      verifiedBalance: `0x${args.verifiedBalance.toString(16)}`,
    }

    const message = JSON.stringify({ ...input, storageProof: undefined })
    const messageHash = hashMessage(message)

    return {
      input: {
        ...input,
        messageHash,
      },
      message,
    }
  }

  async generateProof(args: ERC20BalanceInputData) {
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
      token_address: args.tokenAddress,
      balance_slot: args.balanceSlot,
      verified_balance: args.verifiedBalance,
    }

    const proof = await super.generate(input)

    return {
      type: CredentialType.ERC20_BALANCE,
      version: this.version,
      proof: Array.from(proof.proof),
      publicInputs: proof.publicInputs,
    }
  }

  async verifyProof(proof: ProofData) {
    return super.verify(proof)
  }

  parseData(publicInputs: string[]): ERC20BalancePublicData {
    const balance = BigInt(publicInputs[0]).toString()
    const chainId = Number(BigInt(publicInputs[1]).toString())
    const blockNumber = BigInt(publicInputs[2]).toString()
    const tokenAddress = `0x${publicInputs[3].slice(-40)}` as string
    const balanceSlot = BigInt(publicInputs[4]).toString()
    const storageHash = `0x${publicInputs
      .slice(5, 5 + 32)
      .map((b) => BigInt(b).toString(16).padStart(2, '0'))
      .join('')}` as string

    return {
      balance,
      chainId,
      blockNumber,
      tokenAddress,
      balanceSlot,
      storageHash,
    }
  }
}
