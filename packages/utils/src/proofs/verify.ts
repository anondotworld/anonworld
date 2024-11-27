import { UltraPlonkBackend, ProofData } from '@aztec/bb.js'
import { getCircuit } from './utils'
import { ProofType } from './generate'

export async function verifyProof(proofType: ProofType, proof: ProofData) {
  const circuit = getCircuit(proofType)
  const backend = new UltraPlonkBackend(circuit.bytecode)
  await backend.instantiate()

  return await backend.verifyProof(proof)
}
