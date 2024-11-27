import { BarretenbergBackend } from '@noir-lang/backend_barretenberg'
import { Noir } from '@noir-lang/noir_js'
import { ProofData } from '@noir-lang/types'
import { getCircuit } from './utils'
import { ProofType } from './generate'

export async function getProvingBackend(proofType: ProofType) {
  const circuit = getCircuit(proofType)
  // @ts-ignore
  const backend = new BarretenbergBackend(circuit)
  // @ts-ignore
  const noir = new Noir(circuit, backend)

  await backend.instantiate()

  await backend['api'].acirInitProvingKey(
    backend['acirComposer'],
    backend['acirUncompressedBytecode']
  )

  return noir
}

export async function verifyProof(proofType: ProofType, proof: ProofData) {
  const noir = await getProvingBackend(proofType)
  return await noir.verifyFinalProof(proof)
}
