import { merkleMembership, credErc20Balance } from '../src'
import { INPUT_DATA } from './utils'

async function testMerkleMembership() {
  console.time('generateProof')
  const proofData = await merkleMembership.generate(INPUT_DATA)
  console.timeEnd('generateProof')
  console.time('verifyProof')
  const verified = await merkleMembership.verify(proofData)
  console.timeEnd('verifyProof')
  console.log({ verified })
}

async function testCredErc20Balance() {
  console.time('generateProof')
  const proofData = await credErc20Balance.generate({
    wallet_address: toArray('0x333601a803CAc32B7D17A38d32c9728A93b422f4'),
    block_number: '0x14673d8',
  })
  console.timeEnd('generateProof')
  // console.time('verifyProof')
  // const verified = await credErc20Balance.verify(proofData)
  // console.timeEnd('verifyProof')
  // console.log({ verified })
}

async function main() {
  // await testMerkleMembership()
  await testCredErc20Balance()
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))

function toArray(hexString: string, chunkSize = 2): string[] {
  let hex = hexString.replace('0x', '')
  const chunks: string[] = []
  for (let i = 0; i < hex.length; i += chunkSize) {
    chunks.push(`0x${hex.slice(i, i + chunkSize)}`)
  }
  return chunks
}
