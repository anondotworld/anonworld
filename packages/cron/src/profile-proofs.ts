import { generateProof, ProofType } from '@anon/utils/src/proofs/generate'
import { verifyProof } from '@anon/utils/src/proofs/verify'
const ITERATIONS = 1

async function main() {
  const results = []

  for (let i = 0; i < ITERATIONS; i++) {
    const proofStartTime = Date.now()
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
        embeds: ['https://anoncast.org'],
        quote: '0x2dcbe2a81c6b7f6b4330ef00307878d482779c8f',
        channel: 'memes',
        parent: '0x2dcbe2a81c6b7f6b4330ef00307878d482779c8f',
        revealHash: '0xf20a9b18aa1bb2d609ae95654e84798a0a958dbda49bb082bd10b427ad6da451',
      },
    })

    const proofTime = (Date.now() - proofStartTime) / 1000
    console.log(`${i + 1} Proof Time: ${proofTime.toFixed(3)}s`)

    if (!proof) {
      throw new Error('Proof not generated')
    }

    const verifyStartTime = Date.now()
    const verified = await verifyProof(ProofType.CREATE_POST, proof)

    const verifyTime = (Date.now() - verifyStartTime) / 1000
    console.log(`${i + 1} Verify Time: ${verifyTime.toFixed(3)}s`)
    if (!verified) {
      throw new Error('Proof not verified')
    }

    results.push({
      iteration: i + 1,
      proofTime: proofTime.toFixed(3),
      verifyTime: verifyTime.toFixed(3),
    })
  }

  console.table(results)

  const averageProofTime = (
    results.reduce((sum, result) => sum + parseFloat(result.proofTime), 0) / ITERATIONS
  ).toFixed(3)
  const averageVerifyTime = (
    results.reduce((sum, result) => sum + parseFloat(result.verifyTime), 0) / ITERATIONS
  ).toFixed(3)

  console.log(`Average Proof Time: ${averageProofTime} seconds`)
  console.log(`Average Verify Time: ${averageVerifyTime} seconds`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => process.exit(0))
