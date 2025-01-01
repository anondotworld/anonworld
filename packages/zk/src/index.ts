import { BaseCircuit, CircuitType } from './base'
export type { ProofData } from '@aztec/bb.js'
export type { BaseCircuit } from './base'
export { CircuitType } from './base'

export const ERC20_BALANCE_VERSION = '0.1.5'

export type ERC20BalanceData = {
  balance: string
  chainId: number
  blockNumber: string
  tokenAddress: `0x${string}`
  balanceSlot: string
  storageHash: `0x${string}`
}

export class ERC20Balance extends BaseCircuit {
  constructor(version = ERC20_BALANCE_VERSION) {
    super('erc20-balance', version, CircuitType.ERC20_BALANCE)
  }

  parseData(publicInputs: string[]): ERC20BalanceData {
    const balance = BigInt(publicInputs[0]).toString()
    const chainId = Number(BigInt(publicInputs[1]).toString())
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

const circuits: Record<string, Record<string, BaseCircuit>> = {}

type Circuit = {
  [CircuitType.ERC20_BALANCE]: ERC20Balance
}

export const getCircuit = <T extends CircuitType>(
  circuitType: T,
  circuitVersion = ERC20_BALANCE_VERSION
): Circuit[T] => {
  if (circuitType === 'ERC20_BALANCE') {
    if (!circuits[circuitType]) {
      circuits[circuitType] = {}
    }

    if (!circuits[circuitType][circuitVersion]) {
      circuits[circuitType][circuitVersion] = new ERC20Balance(circuitVersion)
    }

    return circuits[circuitType][circuitVersion] as Circuit[T]
  }

  throw new Error('Invalid circuit type')
}
