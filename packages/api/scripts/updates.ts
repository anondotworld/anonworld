import {
  countPostsForCommunity,
  getCommunities,
  getAllFarcasterAccounts,
  updateCommunity,
} from '@anonworld/db'
import { buildFeeds } from '../src/routes/feeds'
import { zerion } from '../src/services/zerion'
import { simplehash } from '../src/services/simplehash'

const updateFeeds = async () => {
  const accounts = await getAllFarcasterAccounts()
  for (const account of accounts) {
    console.log(`[feed] updating feeds for ${account.fid}`)
    await buildFeeds(account.fid)
  }
}

const updateCommunities = async () => {
  const communities = await getCommunities()
  for (const community of communities) {
    console.log(`[community] updating community for ${community.id}`)
    const token = await zerion.getFungible(community.chain_id, community.token_address)
    const simpleHashToken = await simplehash.getFungible(
      community.chain_id,
      community.token_address
    )
    if (!token) continue
    const posts = await countPostsForCommunity(community.fid)
    await updateCommunity(community.id, {
      posts,
      price_usd: token.attributes.market_data.price.toFixed(8),
      market_cap: Math.round(token.attributes.market_data.market_cap),
      total_supply: token.attributes.market_data.total_supply,
      holders: simpleHashToken.holder_count ?? 0,
    })
  }
}

const main = async () => {
  while (true) {
    try {
      await updateFeeds()
      await updateCommunities()
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
