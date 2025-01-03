import { drizzle } from 'drizzle-orm/node-postgres'
import { farcasterAccountsTable, twitterAccountsTable } from '../db/schema'
import { eq, inArray } from 'drizzle-orm'
import { DBFarcasterAccount, DBTwitterAccount } from '../types'

export class SocialsRepository {
  private db: ReturnType<typeof drizzle>

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db
  }

  async updateFarcasterAccount(
    fid: number,
    params: Partial<typeof farcasterAccountsTable.$inferInsert>
  ) {
    await this.db
      .update(farcasterAccountsTable)
      .set(params)
      .where(eq(farcasterAccountsTable.fid, fid))
  }

  async getFarcasterAccount(fid: number) {
    const [account] = await this.db
      .select()
      .from(farcasterAccountsTable)
      .where(eq(farcasterAccountsTable.fid, fid))
      .limit(1)

    return account as DBFarcasterAccount
  }

  async getFarcasterAccounts(fids: number[]) {
    const response = await this.db
      .select()
      .from(farcasterAccountsTable)
      .where(inArray(farcasterAccountsTable.fid, fids))

    return response as DBFarcasterAccount[]
  }

  async listFarcasterAccounts() {
    const response = await this.db.select().from(farcasterAccountsTable)
    return response as DBFarcasterAccount[]
  }

  async updateTwitterAccount(
    username: string,
    params: Partial<typeof twitterAccountsTable.$inferInsert>
  ) {
    await this.db
      .update(twitterAccountsTable)
      .set(params)
      .where(eq(twitterAccountsTable.username, username))
  }

  async getTwitterAccount(username: string) {
    const [account] = await this.db
      .select()
      .from(twitterAccountsTable)
      .where(eq(twitterAccountsTable.username, username))
      .limit(1)

    return account as DBTwitterAccount
  }

  async getTwitterAccounts(usernames: string[]) {
    const response = await this.db
      .select()
      .from(twitterAccountsTable)
      .where(inArray(twitterAccountsTable.username, usernames))

    return response as DBTwitterAccount[]
  }

  async listTwitterAccounts() {
    const response = await this.db.select().from(twitterAccountsTable)
    return response as DBTwitterAccount[]
  }
}
