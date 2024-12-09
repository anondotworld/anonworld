import { getAction } from '@anonworld/db'
import { createElysia } from '../utils'
import { t } from 'elysia'
import { redis } from '../services/redis'
import { simplehash } from '../services/simplehash'
import { LeanIMT } from '@zk-kit/lean-imt'
import { pad, zeroAddress } from 'viem'
import { buildHashFunction } from '@anonworld/zk'

const MAX_LEAVES = 2 ** 13

export const merkleTreeRoutes = createElysia({ prefix: '/merkle-tree' }).get(
  '/:actionId',
  async ({ params }) => {
    const cached = await redis.getMerkleTree(params.actionId)
    if (cached) {
      return JSON.parse(cached)
    }

    const action = await getAction(params.actionId)
    const id = action.actions.id
    const chainId = action.accounts.chain_id
    const tokenAddress = action.accounts.token_address
    const threshold = BigInt(action.actions.threshold)

    const tree = await buildMerkleTree(chainId, tokenAddress, threshold)
    return await cacheTree(id, tree)
  },
  {
    params: t.Object({
      actionId: t.String(),
    }),
  }
)

export const buildMerkleTree = async (
  chainId: number,
  tokenAddress: string,
  threshold: bigint
) => {
  const owners = await simplehash.getTokenOwners(chainId, tokenAddress, threshold)

  const leaves = owners.map((owner) => pad(owner)).slice(0, MAX_LEAVES)
  while (leaves.length < MAX_LEAVES) {
    leaves.push(pad(zeroAddress))
  }

  const hasher = await buildHashFunction()
  const tree = new LeanIMT(
    hasher,
    leaves.sort((a, b) => a.localeCompare(b))
  )
  return tree
}

export const cacheTree = async (id: string, tree: LeanIMT<string>) => {
  const exported = tree.export()
  await redis.setMerkleTree(id, exported, tree.root)
  return JSON.parse(exported)
}
