import { BarretenbergBackend, ProofData } from '@noir-lang/backend_barretenberg'
import { getCircuit } from './utils'
import { ProofType } from './generate'

export async function verifyProof(proofType: ProofType, proof: ProofData) {
  const circuit = getCircuit(proofType)
  const backend = new BarretenbergBackend(circuit)

  return await backend.verifyProof(proof)
}
