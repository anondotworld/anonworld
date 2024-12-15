import { evmStorage } from '../src'
import { concat, createPublicClient, http, keccak256, pad, toHex, toRlp } from 'viem'
import { base } from 'viem/chains'
import { formatArray, formatHexArray } from './utils'

const client = createPublicClient({
  chain: base,
  transport: http(),
})

const blockNumber = BigInt(23675000)
const address = '0xe4dD432Fe405891AB0118760e3116E371188A1EB'
const tokenAddress = '0x0db510e79909666d6dec7f5e49370838c16d950f'
const balanceSlot = 0

async function main() {
  const storageKey = keccak256(concat([pad(address), pad(toHex(balanceSlot))]))
  const proof = await client.getProof({
    address: tokenAddress,
    storageKeys: [storageKey],
    blockNumber: blockNumber,
  })

  const storageProof = proof.storageProof[0]
  const nodes = storageProof.proof.slice(0, storageProof.proof.length - 1)
  const leaf = storageProof.proof[storageProof.proof.length - 1]

  const nodeHashes = nodes.map((node) => keccak256(node))

  const input = {
    key: formatHexArray(storageProof.key),
    value: formatHexArray(toRlp(`0x${storageProof.value.toString(16)}`), {
      pad: 'right',
    }),
    storage_root: formatHexArray(proof.storageHash),
    nodes: formatArray(nodes, (node) =>
      formatHexArray(node, { length: 532, pad: 'right' })
    ),
    node_hashes: formatArray(nodeHashes, (node) => formatHexArray(node)),
    leaf: formatHexArray(leaf, { length: 69, pad: 'right' }),
    depth: storageProof.proof.length,
  }

  console.time('generateProof')
  const proofData = await evmStorage.generate(input)
  console.timeEnd('generateProof')
  console.time('verifyProof')
  const verified = await evmStorage.verify(proofData)
  console.timeEnd('verifyProof')
  console.log({ verified })
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))
