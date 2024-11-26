import { CreatePostParams } from '@anon/api/src/services/types'
import { generateProof, ProofType, verifyProof } from '@anon/utils/src/proofs'
import { zeroAddress } from 'viem'

const ITERATIONS = 5

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
    const proofTime = Date.now() - proofStartTime

    console.log(`${i + 1} Proof Time: ${proofTime}ms`)

    if (!proof) {
      throw new Error('No proof generated')
    }

    const params = extractCreatePostData(proof.publicInputs)
    console.log(params)

    const verifyStartTime = Date.now()
    await verifyProof(ProofType.CREATE_POST, proof)
    const verifyTime = Date.now() - verifyStartTime

    console.log(`${i + 1} Verify Time: ${verifyTime}ms`)

    results.push({
      iteration: i + 1,
      proofTime: (proofTime / 1000).toFixed(3),
      verifyTime: (verifyTime / 1000).toFixed(3),
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

function extractCreatePostData(data: string[]): CreatePostParams {
  const root = data[0]

  const tokenAddress = `0x${data[1].slice(-40)}`

  const timestamp = parseInt(data[2], 16)

  const textArrays = data.slice(3, 3 + 16)
  const textBytes = textArrays.map((hexString) => Buffer.from(hexString.slice(2), 'hex'))
  const text = Buffer.concat(textBytes).toString('utf-8').replace(/\0/g, '')

  const embed1Array = data.slice(3 + 16, 3 + 32)
  const embed1Bytes = embed1Array.map((hexString) =>
    Buffer.from(hexString.slice(2), 'hex')
  )
  const embed1 = Buffer.concat(embed1Bytes).toString('utf-8').replace(/\0/g, '')

  const embed2Array = data.slice(3 + 32, 3 + 48)
  const embed2Bytes = embed2Array.map((hexString) =>
    Buffer.from(hexString.slice(2), 'hex')
  )
  const embed2 = Buffer.concat(embed2Bytes).toString('utf-8').replace(/\0/g, '')

  const quote = `0x${data[3 + 48].slice(-40)}`

  const channel = Buffer.from(data[3 + 48 + 1].slice(2), 'hex')
    .toString('utf-8')
    .replace(/\0/g, '')

  const parent = `0x${data[3 + 48 + 2].slice(-40)}`

  const revealHashArray = data.slice(3 + 48 + 3, 3 + 48 + 3 + 2)
  const revealHashHexes = revealHashArray.map((b) => b.slice(-32))
  const revealHash = `0x${revealHashHexes.join('')}`

  return {
    timestamp,
    root: root as string,
    text,
    embeds: [embed1, embed2].filter((e) => e !== ''),
    quote: quote === zeroAddress ? '' : quote,
    channel,
    parent: parent === zeroAddress ? '' : parent,
    tokenAddress: tokenAddress as string,
    revealHash,
  }
}
