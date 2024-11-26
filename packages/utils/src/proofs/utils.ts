import createPostCircuit from '@anon/circuits/create-post/target/main.json'
import submitHashCircuit from '@anon/circuits/submit-hash/target/main.json'
import { ProofType } from './generate'

export function getCircuit(type: ProofType) {
  switch (type) {
    case ProofType.CREATE_POST:
      return createPostCircuit
  }
  return submitHashCircuit
}

export function stringToHexArray(input: string, length: number): string[] {
  // Convert the string to a UTF-8 byte array
  const encoder = new TextEncoder()
  const byteArray = encoder.encode(input)

  // Convert the byte array to a hexadecimal string
  let hexString = ''
  for (const byte of Array.from(byteArray)) {
    hexString += byte.toString(16).padStart(2, '0')
  }

  const totalLength = 60 * length // 16 elements of 60 characters
  hexString = hexString.padEnd(totalLength, '0')

  // Split the hexadecimal string into chunks of 60 characters (30 bytes)
  const chunkSize = 60
  const hexArray: string[] = []
  for (let i = 0; i < hexString.length; i += chunkSize) {
    hexArray.push(
      `0x${hexString.substring(i, Math.min(i + chunkSize, hexString.length))}`
    )
  }

  return hexArray
}

export function chunkHexString(hexString: string, chunkSize: number): string[] {
  const chunks: string[] = []
  for (let i = 0; i < hexString.length; i += chunkSize) {
    chunks.push(`0x${hexString.slice(i, i + chunkSize)}`)
  }
  return chunks
}
