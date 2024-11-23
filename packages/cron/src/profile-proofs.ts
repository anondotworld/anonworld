import { generateProof, ProofType, verifyProof } from '@anon/utils/src/proofs'

async function main() {
  console.time('proof')
  const proof = await generateProof({
    tokenAddress: '0x0db510e79909666d6dec7f5e49370838c16d950f',
    userAddress: '0x333601a803CAc32B7D17A38d32c9728A93b422f4',
    proofType: 0,
    signature: {
      timestamp: 1732347401,
      signature:
        '0xeee23083c8d17575d2b3f96afcddc2b31979d5c8c7d2ee0fadd1d42404aa3ee86bc765d1b6dd283f7cb8f27437f748b58e948e764051f4c98f38adb28a0ff65b1c',
      messageHash: '0xd1e49abf2d4d64466cc5d72ee0716aeee5506ff3cf4a5c0e43b74b8bc9580e12',
    },
    input: {
      text: '?',
      embeds: [],
      quote: null,
      channel: null,
      parent: null,
      revealHash: null,
    },
  })
  console.timeEnd('proof')

  if (!proof) {
    throw new Error('No proof generated')
  }

  console.time('verify')
  await verifyProof(ProofType.CREATE_POST, proof)
  console.timeEnd('verify')
}

main()
  .catch(console.error)
  .then(() => process.exit(0))
