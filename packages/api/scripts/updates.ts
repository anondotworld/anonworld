import { getAllActions, getAllFarcasterAccounts } from '@anonworld/db'
import { buildFeeds } from '../src/routes/feeds'
import { buildMerkleTree } from '../src/routes/merkle-tree'

const update = async () => {
  const accounts = await getAllFarcasterAccounts()
  for (const account of accounts) {
    console.log(`[feed] updating feeds for ${account.fid}`)
    await buildFeeds(account.fid)
  }

  const actions = await getAllActions()
  for (const action of actions) {
    console.log(`[merkle] updating merkle tree for ${action.id}`)
    await buildMerkleTree(action.id)
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
