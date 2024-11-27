import { BarretenbergBackend } from '@noir-lang/backend_barretenberg'
import { Noir } from '@noir-lang/noir_js'
import { ProofData } from '@noir-lang/types'
import { getCircuit } from './utils'
import { ProofType } from './generate'

export async function getProvingBackend(proofType: ProofType) {
  const circuit = getCircuit(proofType)
  const backend = new BarretenbergBackend(circuit)
  const noir = new Noir(circuit, backend)
  return noir
}

export async function verifyProof(proofType: ProofType, proof: ProofData) {
  const circuit = getCircuit(proofType)
  const backend = new BarretenbergBackend(circuit)
  const noir = new Noir(circuit, backend)
  await backend.instantiate()

  await backend['api'].acirInitProvingKey(
    backend['acirComposer'],
    backend['acirUncompressedBytecode']
  )
  return await noir.verifyFinalProof(proof)
}
