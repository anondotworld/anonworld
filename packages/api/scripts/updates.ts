import { getAllCredentials, getAllFarcasterAccounts } from '@anonworld/db'
import { buildFeeds } from '../src/routes/feeds'
import { buildMerkleTreeForCredential } from '../src/routes/merkle-tree'

const updateFeeds = async () => {
  const accounts = await getAllFarcasterAccounts()
  for (const account of accounts) {
    console.log(`[feed] updating feeds for ${account.fid}`)
    await buildFeeds(account.fid)
  }
}

const updateMerkleTrees = async () => {
  const credentials = await getAllCredentials()
  for (const credential of credentials) {
    console.log(`[merkle] updating merkle tree for ${credential.id}`)
    await buildMerkleTreeForCredential(credential)
  }
}

const main = async () => {
  while (true) {
    try {
      await updateFeeds()
      await updateMerkleTrees()
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
