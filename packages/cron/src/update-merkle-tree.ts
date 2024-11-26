import { buildHoldersTree, setTree } from '@anon/utils/src/merkle-tree'
import { TOKEN_CONFIG, ANON_ADDRESS } from '@anon/utils/src/config'
import { ProofType } from '@anon/utils/src/proofs/generate'

const main = async () => {
  const config = TOKEN_CONFIG[ANON_ADDRESS]
  await buildAndCacheTree(ANON_ADDRESS, ProofType.CREATE_POST, config.postAmount)
  await buildAndCacheTree(ANON_ADDRESS, ProofType.LAUNCH_POST, config.launchAmount)
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
  const nextTree = await buildHoldersTree({ tokenAddress, minAmount })
  if (!nextTree) {
    return
  }
  console.log(proofType, nextTree.root)
  await setTree(tokenAddress, proofType, nextTree)
}
