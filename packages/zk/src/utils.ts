import { CompiledCircuit } from '@noir-lang/noir_js'
/// TODO: Make this dynamic
import merkleMembershipCircuit from '../circuits/merkle-membership/target/0.1.0/main.json'
import merkleMembershipVkey from '../circuits/merkle-membership/target/0.1.0/vkey.json'
import credErc20BalanceCircuit from '../circuits/cred-erc20-balance/target/0.1.0/main.json'
import credErc20BalanceVkey from '../circuits/cred-erc20-balance/target/0.1.0/vkey.json'

export type CircuitConfig = {
  circuitType: CircuitType
  circuit: CompiledCircuit
  vkey: Uint8Array
  version: string
}

export enum CircuitType {
  MerkleMembership = 'merkle-membership',
  CredErc20Balance = 'cred-erc20-balance',
}

const CIRCUIT_VERSIONS = {
  [CircuitType.MerkleMembership]: '0.1.0',
  [CircuitType.CredErc20Balance]: '0.1.0',
}

export async function getCircuitConfig(circuitType: CircuitType): Promise<CircuitConfig> {
  const version = CIRCUIT_VERSIONS[circuitType]

  if (circuitType === CircuitType.MerkleMembership) {
    return {
      circuitType,
      version,
      circuit: merkleMembershipCircuit as CompiledCircuit,
      vkey: Uint8Array.from(merkleMembershipVkey),
    }
  }

  return {
    circuitType,
    version,
    circuit: credErc20BalanceCircuit as CompiledCircuit,
    vkey: Uint8Array.from(credErc20BalanceVkey),
  }
}
