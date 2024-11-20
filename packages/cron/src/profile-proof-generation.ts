import {} from '@anon/utils/src/config'
import { generateProof, verifyProof } from '@anon/utils/src/proofs'

const input = {
  tokenAddress: '0x0db510e79909666d6dec7f5e49370838c16d950f',
  userAddress: '0x333601a803CAc32B7D17A38d32c9728A93b422f4',
  proofType: 0,
  signature: {
    timestamp: 1732136908,
    signature:
      '0xb121c72f6fb7d265ea1b37ceeeb26f60f2b702c33ac89c8bb6319ffa3e1893126cd4609a298dab462f2af62e21980b95f7a4e2d988318166c8c829c115780c4e1b',
    messageHash: '0xee271c656f6d9942a2b0fba2e66215836d6dd43961cec73ac2dbd250e6231388',
  },
  input: {
    text: 'test',
    embeds: [],
    quote: null,
    channel: null,
    parent: null,
  },
}

const main = async () => {
  console.time('Proof generation')
  const proof = await generateProof(input)
  if (!proof) {
    console.error('Proof generation failed')
    return
  }
  console.timeEnd('Proof generation')

  console.time('Proof verification')
  const verification = await verifyProof(input.proofType, proof)
  if (!verification) {
    console.error('Proof verification failed')
    return
  }
  console.timeEnd('Proof verification')
}

main().then(() => {
  process.exit(0)
})
