import { ERC20Balance } from '../credentials/erc20-balance'
import { Circuit, CircuitType } from '../credentials/circuit'
export type { ProofData } from '@aztec/bb.js'
export type { Circuit } from '../credentials/circuit'
export { CircuitType } from '../credentials/circuit'

const circuits: Record<string, Record<string, Circuit>> = {}

type CircuitMap = {
  [CircuitType.ERC20_BALANCE]: ERC20Balance
}

export const getCircuit = <T extends CircuitType>(
  circuitType: T,
  circuitVersion = 'latest'
): CircuitMap[T] => {
  if (circuitType === 'ERC20_BALANCE') {
    if (!circuits[circuitType]) {
      circuits[circuitType] = {}
    }

    if (!circuits[circuitType][circuitVersion]) {
      circuits[circuitType][circuitVersion] = new ERC20Balance(circuitVersion)
    }

    return circuits[circuitType][circuitVersion] as CircuitMap[T]
  }

  throw new Error('Invalid circuit type')
}
