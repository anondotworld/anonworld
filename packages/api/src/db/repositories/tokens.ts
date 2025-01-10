import { drizzle } from 'drizzle-orm/node-postgres'
import { communitiesTable, tokensTable } from '../schema'
import { and, eq, inArray } from 'drizzle-orm'
import { DBToken } from '../types'

export class TokensRepository {
  private db: ReturnType<typeof drizzle>

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db
  }

  async create(params: typeof tokensTable.$inferInsert) {
    const [token] = await this.db.insert(tokensTable).values(params).returning()
    return token as DBToken
  }

  async update(id: string, params: Partial<typeof tokensTable.$inferInsert>) {
    await this.db.update(tokensTable).set(params).where(eq(tokensTable.id, id))
  }

  async get(id: string) {
    const [token] = await this.db
      .select()
      .from(tokensTable)
      .where(eq(tokensTable.id, id))
      .limit(1)

    return token as DBToken
  }

  async getBulk(ids: string[]) {
    const tokens = await this.db
      .select()
      .from(tokensTable)
      .where(inArray(tokensTable.id, ids))

    const tokensById = tokens.reduce(
      (acc, t) => {
        acc[t.id] = t
        return acc
      },
      {} as Record<string, DBToken>
    )
    return tokensById
  }

  async getClankerTokens(ids: string[]) {
    const tokens = await this.db
      .select()
      .from(tokensTable)
      .where(and(inArray(tokensTable.id, ids), eq(tokensTable.platform, 'clanker')))

    const tokensById = tokens.reduce(
      (acc, t) => {
        acc[t.id] = t
        return acc
      },
      {} as Record<string, DBToken>
    )
    return tokensById
  }

  async list() {
    const response = await this.db
      .select()
      .from(tokensTable)
      .innerJoin(communitiesTable, eq(tokensTable.id, communitiesTable.token_id))
    return response.map((r) => r.tokens) as DBToken[]
  }
}
