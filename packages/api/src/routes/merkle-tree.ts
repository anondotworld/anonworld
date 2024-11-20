import { Redis } from 'ioredis'
import { createElysia } from '../utils'
import { t } from 'elysia'
import {
  buildHoldersTree,
  fetchHolders,
  MERKLE_TREE_LEVELS,
} from '@anon/utils/src/merkle-tree'
import { ProofType } from '@anon/utils/src/proofs'
import { TOKEN_CONFIG } from '@anon/utils/src/config'
import { zeroAddress } from 'viem'

const redis = new Redis(process.env.REDIS_URL as string)

export const merkleTreeRoutes = createElysia({ prefix: '/merkle-tree' }).post(
  '/',
  async ({ body }) => {
    const cachedShards = await redis.get(
      `anon:trees:${body.tokenAddress}:${body.proofType}`
    )
    if (cachedShards) {
      return { trees: JSON.parse(cachedShards) }
    }

    const config = TOKEN_CONFIG[body.tokenAddress]

    let minAmount = config.postAmount
    if (body.proofType === ProofType.DELETE_POST) {
      minAmount = config.deleteAmount
    } else if (body.proofType === ProofType.PROMOTE_POST) {
      minAmount = config.promoteAmount
    }

    const holders = await fetchHolders({
      tokenAddress: body.tokenAddress,
      minAmount,
    })

    const nodesPerTree = 2 ** MERKLE_TREE_LEVELS

    const trees = []
    for (let i = 0; i < holders.length; i += nodesPerTree) {
      const treeHolders = holders.slice(i, i + nodesPerTree)
      while (treeHolders.length < nodesPerTree) {
        treeHolders.push({ address: zeroAddress, balance: '0' })
      }

      const tree = await buildHoldersTree(treeHolders)
      trees.push(tree)
    }

    await redis.set(
      `anon:trees:${body.tokenAddress}:${body.proofType}`,
      JSON.stringify(trees),
      'EX',
      60 * 10
    )

    return { trees }
  },
  {
    body: t.Object({
      tokenAddress: t.String(),
      proofType: t.Enum(ProofType),
    }),
  }
)
