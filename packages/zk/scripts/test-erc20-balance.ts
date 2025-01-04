import { getCircuit, CircuitType } from '../src'
import { bytesToHex, concat, keccak256, pad, toHex } from 'viem'
import { formatArray, formatHexArray } from './utils'
import { base } from '@anonworld/common'

const circuit = getCircuit(CircuitType.ERC20_BALANCE)

const signature =
  '0x2d37b16631b67cbe79e8b115cda1ee74dde8492beef9fac0746777c463e0c8cc5cfd2cea5f1e2e6d8899e4fe33ab709a449e262cc9fc56c3d63b789d99270954'
const messageHash = '0x9d447d956f18f06efc4e1fa2b715e6a46fe680d3d35e1ebe90b9d56ad1eddca1'
const pubKeyX = '0x1209769585e7ea6b1d48fb8e7a49ad4a687f3f219c802b167132b3456ad8d2e4'
const pubKeyY = '0x733284ca267f3c5e6fa75bade823fdabd5b4b6a91385d1a6ded76cb55d73611c'
const address = '0x8b7467AF8A6AAba2FBD254B043aFefD44195Fa9f'
const tokenAddress = '0x0db510e79909666d6dec7f5e49370838c16d950f'
const balanceSlot = pad(toHex(0))

async function main() {
  const blockNumber = await base.client.getBlockNumber()
  const storageKey = keccak256(concat([pad(address), balanceSlot]))
  const ethProof = await base.client.getProof({
    address: tokenAddress,
    storageKeys: [storageKey],
    blockNumber: blockNumber,
  })

  const storageProof = ethProof.storageProof[0]
  const nodes = storageProof.proof.slice(0, storageProof.proof.length - 1)
  const leaf = storageProof.proof[storageProof.proof.length - 1]

  const input = {
    signature: formatHexArray(signature, { length: 64 }),
    message_hash: formatHexArray(messageHash),
    pub_key_x: formatHexArray(pubKeyX),
    pub_key_y: formatHexArray(pubKeyY),
    storage_hash: formatHexArray(ethProof.storageHash),
    storage_nodes: formatArray(nodes, (node) =>
      formatHexArray(node, { length: 532, pad: 'right' })
    ),
    storage_leaf: formatHexArray(leaf, { length: 69, pad: 'right' }),
    storage_depth: storageProof.proof.length,
    storage_value: `0x${storageProof.value.toString(16)}`,
    chain_id: `0x${base.id.toString(16)}`,
    block_number: `0x${blockNumber.toString(16)}`,
    token_address: tokenAddress,
    balance_slot: `0x${BigInt(0).toString(16)}`,
    verified_balance: `0x${BigInt(1_000_000).toString(16)}`,
  }

  console.time('generateProof')
  const proof = await circuit.generate(input)
  console.timeEnd('generateProof')

  console.time('verifyProof')
  const verified = await circuit.verify(proof)
  console.timeEnd('verifyProof')

  const data = circuit.parseData(proof.publicInputs)

  const id = keccak256(bytesToHex(proof.proof))

  console.log({
    id,
    verified,
    proof,
    data,
  })
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))
