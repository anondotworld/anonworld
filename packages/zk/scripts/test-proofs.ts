import { permissionedAction } from '../src'
import { INPUT_DATA } from './utils'

async function main() {
  console.time('generateProof')
  const proofData = await permissionedAction.generate(INPUT_DATA)
  console.timeEnd('generateProof')
  console.time('verifyProof')
  const verified = await permissionedAction.verify(proofData)
  console.timeEnd('verifyProof')
  console.log({ verified })
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))
