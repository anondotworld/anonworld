import { BarretenbergSync, Fr } from '@aztec/bb.js'
import { BaseCircuit } from './base'
import erc20BalanceCircuit from '../circuits/erc20-balance/target/0.1.0/main.json'
import erc20BalanceVkey from '../circuits/erc20-balance/target/0.1.0/vkey.json'
import merkleMembershipCircuit from '../circuits/merkle-membership/target/0.1.0/main.json'
import merkleMembershipVkey from '../circuits/merkle-membership/target/0.1.0/vkey.json'
export type { ProofData } from '@aztec/bb.js'

export type ERC20BalanceData = {
  balance: string
  chainId: string
  blockNumber: string
  tokenAddress: `0x${string}`
  balanceSlot: string
  storageHash: `0x${string}`
}

export const buildHashFunction = async () => {
  const bb = await BarretenbergSync.new()
  return (a: string, b: string) =>
    bb.poseidon2Hash([Fr.fromString(a), Fr.fromString(b)]).toString()
}

export class ERC20Balance extends BaseCircuit {
  constructor() {
    super(erc20BalanceCircuit, erc20BalanceVkey)
  }

  parseData(publicInputs: string[]): ERC20BalanceData {
    const balance = BigInt(publicInputs[0]).toString()
    const chainId = BigInt(publicInputs[1]).toString()
    const blockNumber = BigInt(publicInputs[2]).toString()
    const tokenAddress = `0x${publicInputs[3].slice(-40)}` as `0x${string}`
    const balanceSlot = BigInt(publicInputs[4]).toString()
    const storageHash = `0x${publicInputs
      .slice(5, 5 + 32)
      .map((b) => BigInt(b).toString(16).padStart(2, '0'))
      .join('')}` as `0x${string}`

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

export class MerkleMembership extends BaseCircuit {
  constructor() {
    super(merkleMembershipCircuit, merkleMembershipVkey)
  }
}

export const erc20Balance = new ERC20Balance()
export const merkleMembership = new MerkleMembership()
