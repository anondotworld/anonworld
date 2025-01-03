import { drizzle } from 'drizzle-orm/node-postgres'
import { tokensTable } from '../schema'
import { eq, inArray } from 'drizzle-orm'
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
    const response = await this.db
      .select()
      .from(tokensTable)
      .where(inArray(tokensTable.id, ids))

    return response as DBToken[]
  }

  async list() {
    const response = await this.db.select().from(tokensTable)
    return response as DBToken[]
  }
}
