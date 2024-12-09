import { CompiledCircuit } from '@noir-lang/noir_js'

export type CircuitConfig = {
  circuitType: CircuitType
  circuit: CompiledCircuit
  vkey: Uint8Array
  version: string
}

export enum CircuitType {
  PermissionedAction = 'permissioned-action',
}

const CIRCUIT_VERSIONS = {
  [CircuitType.PermissionedAction]: '0.1.0',
}

export async function getCircuitConfig(circuitType: CircuitType): Promise<CircuitConfig> {
  const version = CIRCUIT_VERSIONS[circuitType]
  const circuit = await import(`../circuits/${circuitType}/target/${version}/main.json`)
  const vkey = await import(`../circuits/${circuitType}/target/${version}/vkey.json`)

  return {
    circuitType,
    version,
    circuit: circuit as CompiledCircuit,
    vkey: Uint8Array.from(vkey),
  }
}
