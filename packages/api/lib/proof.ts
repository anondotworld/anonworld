import { BarretenbergBackend } from '@noir-lang/backend_barretenberg'
import { Noir } from '@noir-lang/noir_js'
import createCircuit from '@anon/circuits/create/target/main.json'
import deleteCircuit from '@anon/circuits/delete/target/main.json'
import promoteCircuit from '@anon/circuits/promote/target/main.json'
import { recoverPublicKey } from 'viem'

export interface TreeElement {
  address: string
  balance: string
  path: string[]
}

export interface Tree {
  elements: TreeElement[]
  root: string
}

export type CreatePostProofInput = {
  address: string
  balance: string
  note_root: string
  index: number
  note_hash_path: string[]
  timestamp: number
  text: string[]
  embed_1: string[]
  embed_2: string[]
  quote: string
  channel: string
  parent: string
  token_address: string
  signature: string[]
  message_hash: string[]
  pub_key_x: string[]
  pub_key_y: string[]
}

export type DeletePostProofInput = {
  address: string
  balance: string
  note_root: string
  index: number
  note_hash_path: string[]
  timestamp: number
  hash: string
  token_address: string
  signature: string[]
  message_hash: string[]
  pub_key_x: string[]
  pub_key_y: string[]
}

export type PromotePostProofInput = {
  address: string
  balance: string
  note_root: string
  index: number
  note_hash_path: string[]
  timestamp: number
  hash: string
  token_address: string
  signature: string[]
  message_hash: string[]
  pub_key_x: string[]
  pub_key_y: string[]
}

export interface CreatePostInput {
  timestamp: number
  text: string | null
  embeds: string[]
  quote: string | null
  channel: string | null
  parent: string | null
  address: string
  tokenAddress: string
  signature: string
  messageHash: string
}

export interface DeletePostInput {
  timestamp: number
  hash: string
  address: string
  tokenAddress: string
  signature: string
  messageHash: string
}

export interface PromotePostInput {
  timestamp: number
  hash: string
  address: string
  tokenAddress: string
  signature: string
  messageHash: string
}

export async function fetchCreateTree(tokenAddress: string): Promise<Tree> {
  return await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/merkle-tree/${tokenAddress.toLowerCase()}`
  ).then((res) => res.json())
}

export async function fetchDeleteTree(tokenAddress: string): Promise<Tree> {
  return await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/merkle-tree/${tokenAddress.toLowerCase()}/delete`
  ).then((res) => res.json())
}

export async function fetchPromoteTree(tokenAddress: string): Promise<Tree> {
  return await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/merkle-tree/${tokenAddress.toLowerCase()}/promote`
  ).then((res) => res.json())
}

export async function generateProofForCreate(post: CreatePostInput) {
  // @ts-ignore
  const backend = new BarretenbergBackend(createCircuit)
  // @ts-ignore
  const noir = new Noir(createCircuit, backend)

  const tree = await fetchCreateTree(post.tokenAddress)

  const nodeIndex = tree.elements.findIndex(
    (i) => i.address === post.address.toLowerCase()
  )
  if (nodeIndex === -1) {
    return null
  }

  const node = tree.elements[nodeIndex]

  const pubKey = await recoverPublicKey({
    signature: post.signature as `0x${string}`,
    hash: post.messageHash as `0x${string}`,
  })

  const pubKeyX = pubKey.slice(4, 68)
  const pubKeyY = pubKey.slice(68)

  const input: CreatePostProofInput = {
    address: post.address.toLowerCase() as string,
    balance: `0x${BigInt(node.balance).toString(16)}`,
    note_root: tree.root,
    index: nodeIndex,
    note_hash_path: node.path,
    timestamp: post.timestamp,
    text: stringToHexArray(post.text ?? '', 16),
    embed_1: stringToHexArray(post.embeds.length > 0 ? post.embeds[0] : '', 16),
    embed_2: stringToHexArray(post.embeds.length > 1 ? post.embeds[1] : '', 16),
    quote: post.quote ?? `0x${BigInt(0).toString(16)}`,
    channel: stringToHexArray(post.channel ?? '', 1)[0],
    parent: post.parent ?? `0x${BigInt(0).toString(16)}`,
    token_address: post.tokenAddress.toLowerCase(),
    signature: chunkHexString(post.signature.replace('0x', ''), 2).slice(0, 64),
    message_hash: chunkHexString(post.messageHash.replace('0x', ''), 2).slice(0, 32),
    pub_key_x: chunkHexString(pubKeyX.replace('0x', ''), 2).slice(0, 32),
    pub_key_y: chunkHexString(pubKeyY.replace('0x', ''), 2).slice(0, 32),
  }

  // @ts-ignore
  return await noir.generateFinalProof(input)
}

export async function generateProofForDelete(data: DeletePostInput) {
  // @ts-ignore
  const backend = new BarretenbergBackend(deleteCircuit)
  // @ts-ignore
  const noir = new Noir(deleteCircuit, backend)

  const tree = await fetchDeleteTree(data.tokenAddress)

  const nodeIndex = tree.elements.findIndex(
    (i) => i.address === data.address.toLowerCase()
  )
  if (nodeIndex === -1) {
    return null
  }

  const node = tree.elements[nodeIndex]

  const pubKey = await recoverPublicKey({
    signature: data.signature as `0x${string}`,
    hash: data.messageHash as `0x${string}`,
  })

  const pubKeyX = pubKey.slice(4, 68)
  const pubKeyY = pubKey.slice(68)

  const input: DeletePostProofInput = {
    address: data.address.toLowerCase() as string,
    balance: `0x${BigInt(node.balance).toString(16)}`,
    note_root: tree.root,
    index: nodeIndex,
    note_hash_path: node.path,
    timestamp: data.timestamp,
    hash: data.hash,
    token_address: data.tokenAddress.toLowerCase(),
    signature: chunkHexString(data.signature.replace('0x', ''), 2).slice(0, 64),
    message_hash: chunkHexString(data.messageHash.replace('0x', ''), 2).slice(0, 32),
    pub_key_x: chunkHexString(pubKeyX.replace('0x', ''), 2).slice(0, 32),
    pub_key_y: chunkHexString(pubKeyY.replace('0x', ''), 2).slice(0, 32),
  }

  // @ts-ignore
  return await noir.generateFinalProof(input)
}

export async function generateProofForPromote(data: PromotePostInput) {
  // @ts-ignore
  const backend = new BarretenbergBackend(promoteCircuit)
  // @ts-ignore
  const noir = new Noir(promoteCircuit, backend)

  const tree = await fetchPromoteTree(data.tokenAddress)

  const nodeIndex = tree.elements.findIndex(
    (i) => i.address === data.address.toLowerCase()
  )
  if (nodeIndex === -1) {
    return null
  }

  const node = tree.elements[nodeIndex]

  const pubKey = await recoverPublicKey({
    signature: data.signature as `0x${string}`,
    hash: data.messageHash as `0x${string}`,
  })

  const pubKeyX = pubKey.slice(4, 68)
  const pubKeyY = pubKey.slice(68)

  const input: PromotePostProofInput = {
    address: data.address.toLowerCase() as string,
    balance: `0x${BigInt(node.balance).toString(16)}`,
    note_root: tree.root,
    index: nodeIndex,
    note_hash_path: node.path,
    timestamp: data.timestamp,
    hash: data.hash,
    token_address: data.tokenAddress.toLowerCase(),
    signature: chunkHexString(data.signature.replace('0x', ''), 2).slice(0, 64),
    message_hash: chunkHexString(data.messageHash.replace('0x', ''), 2).slice(0, 32),
    pub_key_x: chunkHexString(pubKeyX.replace('0x', ''), 2).slice(0, 32),
    pub_key_y: chunkHexString(pubKeyY.replace('0x', ''), 2).slice(0, 32),
  }

  // @ts-ignore
  return await noir.generateFinalProof(input)
}

export async function verifyProofForCreate(proof: number[], publicInputs: number[][]) {
  // @ts-ignore
  const backend = new BarretenbergBackend(createCircuit)
  // @ts-ignore
  const noir = new Noir(createCircuit, backend)

  await backend.instantiate()

  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  await backend['api'].acirInitProvingKey(
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    backend['acirComposer'],
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    backend['acirUncompressedBytecode']
  )

  return await noir.verifyFinalProof({
    proof: new Uint8Array(proof),
    publicInputs: publicInputs.map((i) => new Uint8Array(i)),
  })
}

export async function verifyProofForDelete(proof: number[], publicInputs: number[][]) {
  // @ts-ignore
  const backend = new BarretenbergBackend(deleteCircuit)
  // @ts-ignore
  const noir = new Noir(deleteCircuit, backend)

  await backend.instantiate()

  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  await backend['api'].acirInitProvingKey(
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    backend['acirComposer'],
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    backend['acirUncompressedBytecode']
  )

  return await noir.verifyFinalProof({
    proof: new Uint8Array(proof),
    publicInputs: publicInputs.map((i) => new Uint8Array(i)),
  })
}

export async function verifyProofForPromote(proof: number[], publicInputs: number[][]) {
  // @ts-ignore
  const backend = new BarretenbergBackend(promoteCircuit)
  // @ts-ignore
  const noir = new Noir(promoteCircuit, backend)

  await backend.instantiate()

  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  await backend['api'].acirInitProvingKey(
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    backend['acirComposer'],
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    backend['acirUncompressedBytecode']
  )

  return await noir.verifyFinalProof({
    proof: new Uint8Array(proof),
    publicInputs: publicInputs.map((i) => new Uint8Array(i)),
  })
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

function chunkHexString(hexString: string, chunkSize: number): string[] {
  const chunks: string[] = []
  for (let i = 0; i < hexString.length; i += chunkSize) {
    chunks.push(`0x${hexString.slice(i, i + chunkSize)}`)
  }
  return chunks
}
