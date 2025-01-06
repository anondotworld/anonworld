import { drizzle } from 'drizzle-orm/node-postgres'
import {
  credentialsTable,
  postCredentialsTable,
  postRelationshipsTable,
  postsTable,
  vaultsTable,
} from '../schema'
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
        credentialsTable,
        and(
          eq(vaultsTable.id, credentialsTable.vault_id),
          isNull(credentialsTable.deleted_at),
          isNull(credentialsTable.reverified_id)
        )
      )
      .where(eq(vaultsTable.passkey_id, passkeyId))

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
        credentialsTable,
        eq(postCredentialsTable.credential_id, credentialsTable.id)
      )
      .leftJoin(
        postRelationshipsTable,
        eq(postsTable.hash, postRelationshipsTable.target_id)
      )
      .where(
        and(
          eq(credentialsTable.vault_id, vaultId),
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
        credentialsTable,
        eq(postCredentialsTable.credential_id, credentialsTable.id)
      )
      .leftJoin(
        postRelationshipsTable,
        eq(postsTable.hash, postRelationshipsTable.target_id)
      )
      .where(
        and(
          eq(credentialsTable.vault_id, vaultId),
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
      .from(credentialsTable)
      .where(
        and(
          eq(credentialsTable.vault_id, vaultId),
          isNull(credentialsTable.reverified_id)
        )
      )

    return response as DBCredential[]
  }
}
