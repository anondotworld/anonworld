import { drizzle } from 'drizzle-orm/node-postgres'
import {
  communitiesTable,
  farcasterAccountsTable,
  tokensTable,
  twitterAccountsTable,
} from '../schema'
import { eq, inArray, or } from 'drizzle-orm'
import { DBCommunity } from '../types'
import { FarcasterUser, TwitterUser, Community } from '@anonworld/common'

const ENABLE_HIDDEN_COMMUNITIES = process.env.ENABLE_HIDDEN_COMMUNITIES === 'true'

export class CommunitiesRepository {
  private db: ReturnType<typeof drizzle>

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db
  }

  async create(params: typeof communitiesTable.$inferInsert) {
    const [community] = await this.db.insert(communitiesTable).values(params).returning()
    return community
  }

  async get(id: string) {
    const [community] = await this.db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.id, id))
      .leftJoin(tokensTable, eq(communitiesTable.token_id, tokensTable.id))
      .leftJoin(
        farcasterAccountsTable,
        eq(communitiesTable.fid, farcasterAccountsTable.fid)
      )
      .leftJoin(
        twitterAccountsTable,
        eq(communitiesTable.twitter_username, twitterAccountsTable.username)
      )
      .limit(1)

    return {
      ...community.communities,
      token: community.tokens,
      farcaster: community.farcaster_accounts?.metadata as FarcasterUser | null,
      twitter: community.twitter_accounts?.metadata as TwitterUser | null,
      created_at: community.communities.created_at.toISOString(),
      wallet_id: undefined,
    } as Community
  }

  async getForAccounts(fids: number[], usernames: string[]) {
    const response = await this.db
      .select()
      .from(communitiesTable)
      .where(
        or(
          inArray(communitiesTable.fid, fids),
          inArray(communitiesTable.twitter_username, usernames)
        )
      )

    return response as DBCommunity[]
  }

  async list() {
    const communities = await this.db
      .select()
      .from(communitiesTable)
      .leftJoin(tokensTable, eq(communitiesTable.token_id, tokensTable.id))
      .leftJoin(
        farcasterAccountsTable,
        eq(communitiesTable.fid, farcasterAccountsTable.fid)
      )
      .leftJoin(
        twitterAccountsTable,
        eq(communitiesTable.twitter_username, twitterAccountsTable.username)
      )
      .where(ENABLE_HIDDEN_COMMUNITIES ? undefined : eq(communitiesTable.hidden, false))

    return communities.map((community) => ({
      ...community.communities,
      token: community.tokens,
      farcaster: community.farcaster_accounts?.metadata as FarcasterUser | null,
      twitter: community.twitter_accounts?.metadata as TwitterUser | null,
      created_at: community.communities.created_at.toISOString(),
      wallet_id: undefined,
    })) as Community[]
  }

  async update(
    communityId: string,
    params: Partial<typeof communitiesTable.$inferInsert>
  ) {
    await this.db
      .update(communitiesTable)
      .set(params)
      .where(eq(communitiesTable.id, communityId))
  }
}
