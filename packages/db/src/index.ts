import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import {
  accountsTable,
  actionExecutionsTable,
  actionsTable,
  farcasterAccountsTable,
  postRelationshipsTable,
  postsTable,
} from './db/schema'

export const db = drizzle(process.env.DATABASE_URL as string)

export const getAction = async (actionId: string) => {
  const [action] = await db
    .select()
    .from(actionsTable)
    .innerJoin(accountsTable, eq(actionsTable.account_id, accountsTable.id))
    .where(eq(actionsTable.id, actionId))
    .limit(1)

  return action
}

export const getSignerForFid = async (fid: number) => {
  const [signer] = await db
    .select()
    .from(farcasterAccountsTable)
    .where(eq(farcasterAccountsTable.fid, fid))

  return signer
}

export const createPost = async (
  params: Omit<typeof postsTable.$inferInsert, 'created_at' | 'updated_at'>
) => {
  await db
    .insert(postsTable)
    .values(params)
    .onConflictDoUpdate({ target: [postsTable.hash], set: { deleted_at: null } })
}

export const deletePost = async (hash: string) => {
  await db
    .update(postsTable)
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where(eq(postsTable.hash, hash))
}

export const getPost = async (hash: string) => {
  const [post] = await db
    .select()
    .from(postsTable)
    .where(and(eq(postsTable.hash, hash), isNull(postsTable.deleted_at)))
  return post
}

export const getBulkPosts = async (hashes: string[]) => {
  return await db
    .select()
    .from(postsTable)
    .where(and(inArray(postsTable.hash, hashes), isNull(postsTable.deleted_at)))
}

export const getPostChildren = async (hashes: string[]) => {
  return await db
    .select()
    .from(postRelationshipsTable)
    .where(
      and(
        inArray(postRelationshipsTable.post_hash, hashes),
        isNull(postRelationshipsTable.deleted_at)
      )
    )
}

export const getPostParentAndSiblings = async (hashes: string[]) => {
  const parents = await db
    .select()
    .from(postRelationshipsTable)
    .where(inArray(postRelationshipsTable.target_id, hashes))
  const children = await getPostChildren(parents.map((p) => p.post_hash))

  const result: Record<
    string,
    {
      siblings: (typeof postRelationshipsTable.$inferSelect)[]
      parent: typeof postRelationshipsTable.$inferSelect
    }
  > = {}
  for (const hash of hashes) {
    const parent = parents.find((p) => p.target_id === hash)
    if (!parent) continue
    const siblings = children.filter(
      (c) => c.post_hash === parent.post_hash && c.target_id !== hash
    )
    result[hash] = {
      siblings,
      parent,
    }
  }

  return result
}

export const revealPost = async (
  hash: string,
  revealMetadata: {
    message: string
    phrase: string
    signature: string
    address: string
  }
) => {
  await db
    .update(postsTable)
    .set({ reveal_metadata: revealMetadata, updated_at: new Date() })
    .where(eq(postsTable.hash, hash))
}

export const logActionExecution = async (
  params: Omit<typeof actionExecutionsTable.$inferInsert, 'created_at' | 'updated_at'>
) => {
  await db.insert(actionExecutionsTable).values(params)
}

export const createPostRelationship = async (
  params: Omit<typeof postRelationshipsTable.$inferInsert, 'created_at' | 'updated_at'>
) => {
  await db
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

export const deletePostRelationships = async (hash: string) => {
  await db
    .update(postRelationshipsTable)
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where(eq(postRelationshipsTable.post_hash, hash))
}

export const deletePostRelationship = async (params: {
  post_hash: string
  target: string
  target_account: string
}) => {
  await db
    .update(postRelationshipsTable)
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where(
      and(
        eq(postRelationshipsTable.post_hash, params.post_hash),
        eq(postRelationshipsTable.target, params.target),
        eq(postRelationshipsTable.target_account, params.target_account)
      )
    )
}

export const getAllActions = async () => {
  return await db
    .select()
    .from(actionsTable)
    .innerJoin(accountsTable, eq(actionsTable.account_id, accountsTable.id))
}

export const getAllFarcasterAccounts = async () => {
  return await db.select().from(farcasterAccountsTable)
}
