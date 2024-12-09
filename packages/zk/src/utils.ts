import { CompiledCircuit } from '@noir-lang/noir_js'
/// TODO: Make this dynamic
import merkleMembershipCircuit from '../circuits/merkle-membership/target/0.1.0/main.json'
import merkleMembershipVkey from '../circuits/merkle-membership/target/0.1.0/vkey.json'

export type CircuitConfig = {
  circuitType: CircuitType
  circuit: CompiledCircuit
  vkey: Uint8Array
  version: string
}

export enum CircuitType {
  MerkleMembership = 'merkle-membership',
}

const CIRCUIT_VERSIONS = {
  [CircuitType.MerkleMembership]: '0.1.0',
}

export async function getCircuitConfig(circuitType: CircuitType): Promise<CircuitConfig> {
  const version = CIRCUIT_VERSIONS[circuitType]

  return {
    circuitType,
    version,
    circuit: merkleMembershipCircuit as CompiledCircuit,
    vkey: Uint8Array.from(merkleMembershipVkey),
  }
}
