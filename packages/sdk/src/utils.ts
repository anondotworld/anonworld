import { recoverPublicKey } from 'viem'

export async function getPublicKey(signature: `0x${string}`, messageHash: `0x${string}`) {
  const pubKey = await recoverPublicKey({
    hash: messageHash,
    signature,
  })
  const pubKeyX = toArray(pubKey.slice(4, 68))
  const pubKeyY = toArray(pubKey.slice(68))

  return { pubKeyX, pubKeyY }
}

export function toArray(hexString: string, chunkSize = 2): string[] {
  let hex = hexString.replace('0x', '')
  const chunks: string[] = []
  for (let i = 0; i < hex.length; i += chunkSize) {
    chunks.push(`0x${hex.slice(i, i + chunkSize)}`)
  }
  return chunks
}
