import { buildHoldersTree, fetchHolders } from '@anon/utils/src/merkle-tree'
import { TOKEN_CONFIG, ANON_ADDRESS } from '@anon/utils/src/config'
import Redis from 'ioredis'
import { ProofType } from '@anon/utils/src/proofs'
const redis = new Redis(process.env.REDIS_URL as string)

const main = async () => {
  const config = TOKEN_CONFIG[ANON_ADDRESS]
  await buildAndCacheTree(ANON_ADDRESS, ProofType.CREATE_POST, config.postAmount)
  await buildAndCacheTree(ANON_ADDRESS, ProofType.DELETE_POST, config.deleteAmount)
  await buildAndCacheTree(ANON_ADDRESS, ProofType.PROMOTE_POST, config.promoteAmount)
}

main().then(() => {
  process.exit(0)
})

async function buildAndCacheTree(
  tokenAddress: string,
  proofType: ProofType,
  minAmount: string
) {
  const holders = await fetchHolders({ tokenAddress, minAmount })
  const tree = await buildHoldersTree(holders)
  console.log(proofType, tree.root)
  await redis.set(
    `anon:tree:${tokenAddress}:${proofType}`,
    JSON.stringify(tree),
    'EX',
    60 * 5
  )
}
