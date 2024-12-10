import { createMerkleRoot, Credential, getCredential } from '@anonworld/db'
import { createElysia } from '../utils'
import { t } from 'elysia'
import { redis } from '../services/redis'
import { simplehash } from '../services/simplehash'
import { LeanIMT } from '@zk-kit/lean-imt'
import { pad, zeroAddress } from 'viem'
import { buildHashFunction } from '@anonworld/zk'

const MAX_LEAVES = 2 ** 13

export const merkleTreeRoutes = createElysia({ prefix: '/merkle-tree' })
  .post(
    '/',
    async ({ body }) => {
      const cached = await redis.getMerkleTree(getMerkleTreeKey(body))
      if (cached) {
        return JSON.parse(cached)
      }

      const tree = await buildMerkleTree(body)
      return JSON.parse(tree.export())
    },
    {
      body: t.Object({
        chainId: t.Number(),
        tokenAddress: t.String(),
        minBalance: t.BigInt(),
      }),
    }
  )
  .get(
    '/:credentialId',
    async ({ params }) => {
      const cached = await redis.getMerkleTreeForCredential(params.credentialId)
      if (cached) {
        return JSON.parse(cached)
      }

      const credential = await getCredential(params.credentialId)
      if (!credential) {
        throw new Error('Credential not found')
      }

      const tree = await buildMerkleTreeForCredential(credential)
      return JSON.parse(tree.export())
    },
    {
      params: t.Object({
        credentialId: t.String(),
      }),
    }
  )

export const buildMerkleTreeForCredential = async (credential: Credential) => {
  const { chainId, tokenAddress, minBalance } = credential.metadata as {
    chainId: number
    tokenAddress: string
    minBalance: string
  }

  const tree = await buildMerkleTree({
    chainId,
    tokenAddress,
    minBalance: BigInt(minBalance),
  })

  await redis.setMerkleTreeForCredential(credential.id, tree.export(), tree.root)
  await createMerkleRoot(credential.id, tree.root)

  return tree
}

export const buildMerkleTree = async (params: {
  chainId: number
  tokenAddress: string
  minBalance: bigint
}) => {
  const owners = await simplehash.getTokenOwners(params)

  const leaves = owners.map((owner) => pad(owner)).slice(0, MAX_LEAVES)
  while (leaves.length < MAX_LEAVES) {
    leaves.push(pad(zeroAddress))
  }

  const hasher = await buildHashFunction()
  const tree = new LeanIMT(
    hasher,
    leaves.sort((a, b) => a.localeCompare(b))
  )

  await redis.setMerkleTree(getMerkleTreeKey(params), tree.export(), tree.root)

  return tree
}

const getMerkleTreeKey = (params: {
  chainId: number
  tokenAddress: string
  minBalance: bigint
}) => {
  return `merkle-tree:${params.chainId}:${params.tokenAddress}:${params.minBalance}`
}
