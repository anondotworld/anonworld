import { drizzle } from 'drizzle-orm/node-postgres'
import { credentialInstancesTable } from '../schema'
import { DBCredential } from '../types'
import { eq, inArray } from 'drizzle-orm'

export class CredentialsRepository {
  private db: ReturnType<typeof drizzle>

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db
  }

  async create(params: typeof credentialInstancesTable.$inferInsert) {
    const [cred] = await this.db
      .insert(credentialInstancesTable)
      .values(params)
      .returning()

    return cred as DBCredential
  }

  async get(id: string) {
    const [cred] = await this.db
      .select()
      .from(credentialInstancesTable)
      .where(eq(credentialInstancesTable.id, id))
      .limit(1)

    return cred as DBCredential | null
  }

  async getBulk(ids: string[]) {
    const creds = await this.db
      .select()
      .from(credentialInstancesTable)
      .where(inArray(credentialInstancesTable.id, ids))

    return creds as DBCredential[]
  }

  async reverify(id: string, reverifiedId: string) {
    await this.db
      .update(credentialInstancesTable)
      .set({ reverified_id: reverifiedId, updated_at: new Date() })
      .where(eq(credentialInstancesTable.id, id))
  }

  async addToVault(credentialId: string, vaultId: string) {
    await this.db
      .update(credentialInstancesTable)
      .set({ vault_id: vaultId })
      .where(eq(credentialInstancesTable.id, credentialId))
  }

  async removeFromVault(credentialId: string) {
    await this.db
      .update(credentialInstancesTable)
      .set({ vault_id: null })
      .where(eq(credentialInstancesTable.id, credentialId))
  }
}
