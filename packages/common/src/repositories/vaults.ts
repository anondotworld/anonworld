import { drizzle } from 'drizzle-orm/node-postgres'
import {
  credentialInstancesTable,
  postCredentialsTable,
  postRelationshipsTable,
  postsTable,
  vaultsTable,
} from '../db/schema'
import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import {
  DBCredential,
  DBPost,
  DBPostCredential,
  DBPostRelationship,
  DBVault,
} from '../types'

export class VaultsRepository {
  private db: ReturnType<typeof drizzle>

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db
  }

  async create(params: typeof vaultsTable.$inferInsert) {
    const [vault] = await this.db.insert(vaultsTable).values(params).returning()
    return vault as DBVault
  }

  async get(vaultId: string) {
    const [vault] = await this.db
      .select()
      .from(vaultsTable)
      .where(eq(vaultsTable.id, vaultId))
      .limit(1)
    return vault as DBVault
  }

  async getForPasskey(passkeyId: string) {
    const response = await this.db
      .select()
      .from(vaultsTable)
      .leftJoin(
        credentialInstancesTable,
        eq(vaultsTable.id, credentialInstancesTable.vault_id)
      )
      .where(
        and(
          eq(vaultsTable.passkey_id, passkeyId),
          isNull(credentialInstancesTable.deleted_at),
          isNull(credentialInstancesTable.reverified_id)
        )
      )

    return response as {
      vaults: DBVault
      credential_instances: DBCredential | null
    }[]
  }

  async getFeed(
    vaultId: string,
    opts: { limit: number; offset: number } = { limit: 100, offset: 0 }
  ) {
    const response = await this.db
      .select()
      .from(postsTable)
      .innerJoin(
        postCredentialsTable,
        eq(postsTable.hash, postCredentialsTable.post_hash)
      )
      .innerJoin(
        credentialInstancesTable,
        eq(postCredentialsTable.credential_id, credentialInstancesTable.id)
      )
      .leftJoin(
        postRelationshipsTable,
        eq(postsTable.hash, postRelationshipsTable.target_id)
      )
      .where(
        and(
          eq(credentialInstancesTable.vault_id, vaultId),
          isNull(postRelationshipsTable.target_id)
        )
      )
      .orderBy(desc(postsTable.created_at))
      .limit(opts.limit)
      .offset(opts.offset)

    return response as {
      posts: DBPost
      post_credentials: DBPostCredential
      credential_instances: DBCredential
      post_relationships: DBPostRelationship | null
    }[]
  }

  async countPosts(vaultId: string) {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(postsTable)
      .innerJoin(
        postCredentialsTable,
        eq(postsTable.hash, postCredentialsTable.post_hash)
      )
      .innerJoin(
        credentialInstancesTable,
        eq(postCredentialsTable.credential_id, credentialInstancesTable.id)
      )
      .leftJoin(
        postRelationshipsTable,
        eq(postsTable.hash, postRelationshipsTable.target_id)
      )
      .where(
        and(
          eq(credentialInstancesTable.vault_id, vaultId),
          isNull(postRelationshipsTable.target_id)
        )
      )
    return result.count
  }

  async list() {
    const response = await this.db.select().from(vaultsTable)
    return response as DBVault[]
  }

  async update(vaultId: string, params: Partial<typeof vaultsTable.$inferInsert>) {
    await this.db.update(vaultsTable).set(params).where(eq(vaultsTable.id, vaultId))
  }

  async getCredentials(vaultId: string) {
    const response = await this.db
      .select()
      .from(credentialInstancesTable)
      .where(
        and(
          eq(credentialInstancesTable.vault_id, vaultId),
          isNull(credentialInstancesTable.reverified_id)
        )
      )

    return response as DBCredential[]
  }
}
