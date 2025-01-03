import { drizzle } from 'drizzle-orm/node-postgres'
import { passkeysTable } from '../schema'
import { eq } from 'drizzle-orm'
import { DBPasskey } from '../types'

export class PasskeysRepository {
  private db: ReturnType<typeof drizzle>

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db
  }

  async create(params: typeof passkeysTable.$inferInsert) {
    const [passkey] = await this.db.insert(passkeysTable).values(params).returning()
    return passkey as DBPasskey
  }

  async get(passkeyId: string) {
    const [passkey] = await this.db
      .select()
      .from(passkeysTable)
      .where(eq(passkeysTable.id, passkeyId))
      .limit(1)

    return passkey as DBPasskey | null
  }
}
