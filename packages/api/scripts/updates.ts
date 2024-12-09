import { getAllActions, getAllFarcasterAccounts } from '@anonworld/db'
import { buildFeeds } from '../src/routes/feeds'
import { buildMerkleTree, cacheTree } from '../src/routes/merkle-tree'
import { LeanIMT } from '@zk-kit/lean-imt'

const update = async () => {
  const accounts = await getAllFarcasterAccounts()
  for (const account of accounts) {
    console.log(`[feed] updating feeds for ${account.fid}`)
    await buildFeeds(account.fid)
  }

  const trees: Record<string, LeanIMT<string>> = {}
  const actions = await getAllActions()
  for (const action of actions) {
    console.log(`[merkle] updating merkle tree for ${action.actions.id}`)

    const id = action.actions.id
    const chainId = action.accounts.chain_id
    const tokenAddress = action.accounts.token_address
    const threshold = BigInt(action.actions.threshold)

    const key = `${chainId}:${tokenAddress}:${threshold.toString()}`
    if (!trees[key]) {
      trees[key] = await buildMerkleTree(chainId, tokenAddress, threshold)
    }

    await cacheTree(id, trees[key])
  }
}

const main = async () => {
  while (true) {
    try {
      await update()
    } catch (error) {
      console.error('[error]', error)
    }

    console.log('[sleep] waiting 30 seconds...')
    await new Promise((resolve) => setTimeout(resolve, 30000))
  }
}

main()
  .catch(console.error)
  .then(() => {
    process.exit(0)
  })
