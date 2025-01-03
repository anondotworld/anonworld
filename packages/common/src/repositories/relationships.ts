import { drizzle } from 'drizzle-orm/node-postgres'
import { postRelationshipsTable } from '../db/schema'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { DBPostRelationship } from '../types'

export class RelationshipsRepository {
  private db: ReturnType<typeof drizzle>

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db
  }

  async create(params: typeof postRelationshipsTable.$inferInsert) {
    await this.db
      .insert(postRelationshipsTable)
      .values(params)
      .onConflictDoUpdate({
        target: [
          postRelationshipsTable.post_hash,
          postRelationshipsTable.target,
          postRelationshipsTable.target_account,
        ],
        set: { deleted_at: null },
      })
  }

  async delete(target: string, targetId: string) {
    await this.db
      .update(postRelationshipsTable)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where(
        and(
          eq(postRelationshipsTable.target_id, targetId),
          eq(postRelationshipsTable.target, target)
        )
      )
  }

  async get(postHash: string, target: string, targetAccount: string) {
    const [relationship] = await this.db
      .select()
      .from(postRelationshipsTable)
      .where(
        and(
          eq(postRelationshipsTable.post_hash, postHash),
          eq(postRelationshipsTable.target, target),
          eq(postRelationshipsTable.target_account, targetAccount),
          isNull(postRelationshipsTable.deleted_at)
        )
      )
      .limit(1)
    return relationship as DBPostRelationship
  }

  async getBulk(hashes: string[]) {
    const response = await this.db
      .select()
      .from(postRelationshipsTable)
      .where(
        and(
          inArray(postRelationshipsTable.post_hash, hashes),
          isNull(postRelationshipsTable.deleted_at)
        )
      )

    return response as DBPostRelationship[]
  }

  async getChildren(hashes: string[]) {
    const response = await this.db
      .select()
      .from(postRelationshipsTable)
      .where(
        and(
          inArray(postRelationshipsTable.post_hash, hashes),
          isNull(postRelationshipsTable.deleted_at)
        )
      )

    return response as DBPostRelationship[]
  }

  async getParent(hash: string) {
    const [parent] = await this.db
      .select()
      .from(postRelationshipsTable)
      .where(eq(postRelationshipsTable.target_id, hash))
      .limit(1)

    return parent as DBPostRelationship
  }
}
