import { CredentialType } from '@anonworld/common'
import { CredentialsManager } from '../..'
import { hashMessage } from 'viem'

const manager = new CredentialsManager()

const signature =
  '0xae4db8aa1a967d3d81e96103b3060482e133fc5c732dc639ffb32b1e9f8830ea61c1f77a8ebf5fee3225eeb4a0393a3255636a3282deffcaae02a8d8e223226b1c'
const messageHash = hashMessage('test')

async function main() {
  const verifier = manager.getVerifier(CredentialType.FARCASTER_FID)

  const { input } = await verifier.buildInput({
    address: '0x333601a803CAc32B7D17A38d32c9728A93b422f4',
    verifiedFid: BigInt(10000),
  })

  console.time('generateProof')
  const proof = await verifier.generateProof({
    ...input,
    signature,
    messageHash,
  })
  console.timeEnd('generateProof')

  console.time('verifyProof')
  const verified = await verifier.verifyProof({
    proof: Uint8Array.from(proof.proof),
    publicInputs: proof.publicInputs,
  })
  console.timeEnd('verifyProof')

  const data = verifier.parseData(proof.publicInputs)

  console.log({
    verified,
    proof,
    data,
  })
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))
