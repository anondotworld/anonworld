import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { and, desc, eq, inArray, isNull, or, sql } from 'drizzle-orm'
import {
  communitiesTable,
  actionExecutionsTable,
  actionsTable,
  credentialInstancesTable,
  farcasterAccountsTable,
  postCredentialsTable,
  postRelationshipsTable,
  postsTable,
  twitterAccountsTable,
  tokensTable,
} from './db/schema'

export type PostCredential = typeof postCredentialsTable.$inferSelect
export type CredentialInstance = typeof credentialInstancesTable.$inferSelect & {
  metadata: {
    chainId: number
    tokenAddress: string
    balance: string
  }
}
export type Action<T = unknown> = typeof actionsTable.$inferSelect & {
  metadata: T
}
export type Post = typeof postsTable.$inferSelect & {
  data: PostDataV1
}

type FarcasterAccount = {
  follower_count: number
}
type TwitterAccount = {
  followers: number
}

export type Community = typeof communitiesTable.$inferSelect & {
  token: typeof tokensTable.$inferSelect | null
  farcaster: FarcasterAccount | null
  twitter: TwitterAccount | null
}

export type PostDataV0 = {
  text?: string
  embeds?: string[]
  images?: string[]
  quote?: string
  channel?: string
  parent?: string
}

export type PostDataV1 = {
  text: string | null
  reply: string | null
  links: string[]
  images: string[]
}

export type PostData = PostDataV0 | PostDataV1

export const db = drizzle(process.env.DATABASE_URL as string)

export const getAction = async (actionId: string) => {
  const [action] = await db
    .select()
    .from(actionsTable)
    .where(eq(actionsTable.id, actionId))
    .limit(1)

  return action
}

export const getAllActions = async () => {
  const actions = await db
    .select()
    .from(actionsTable)
    .leftJoin(communitiesTable, eq(actionsTable.community_id, communitiesTable.id))
    .leftJoin(tokensTable, eq(communitiesTable.token_id, tokensTable.id))
    .where(eq(actionsTable.hidden, false))

  return actions.map((action) => ({
    ...action.actions,
    community: {
      ...action.communities,
      token: action.tokens,
    },
  }))
}

export const getActionsForTrigger = async (trigger: string) => {
  return await db.select().from(actionsTable).where(eq(actionsTable.trigger, trigger))
}

export const getActions = async (ids: string[]) => {
  return await db.select().from(actionsTable).where(inArray(actionsTable.id, ids))
}

export const getSignerForFid = async (fid: number) => {
  const [signer] = await db
    .select()
    .from(farcasterAccountsTable)
    .where(eq(farcasterAccountsTable.fid, fid))

  return signer
}

export const getPosts = async (
  fid: number,
  opts: { limit: number; offset: number }
): Promise<Post[]> => {
  const posts = await db
    .select()
    .from(postsTable)
    .where(
      and(
        isNull(postsTable.deleted_at),
        eq(postsTable.fid, fid),
        sql`data->>'reply' IS NULL`
      )
    )
    .orderBy(desc(postsTable.created_at))
    .limit(opts.limit)
    .offset(opts.offset)

  return posts as Post[]
}

export const createPost = async (params: {
  hash: string
  fid: number
  data: PostDataV1
  reveal_hash?: string
}) => {
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

export const getPost = async (hash: string): Promise<Post | null> => {
  const [post] = await db
    .select()
    .from(postsTable)
    .where(and(eq(postsTable.hash, hash), isNull(postsTable.deleted_at)))
    .limit(1)
  return post as Post | null
}

export const getBulkPosts = async (hashes: string[]): Promise<Post[]> => {
  const posts = await db
    .select()
    .from(postsTable)
    .where(and(inArray(postsTable.hash, hashes), isNull(postsTable.deleted_at)))

  return posts as Post[]
}

export const getPostParent = async (hash: string) => {
  const [parent] = await db
    .select()
    .from(postRelationshipsTable)
    .where(eq(postRelationshipsTable.target_id, hash))
    .limit(1)
  return parent
}

export const revealPost = async (
  revealHash: string,
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
    .where(eq(postsTable.reveal_hash, revealHash))
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

export const getPostRelationships = async (hashes: string[]) => {
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

export const getPostRelationship = async (
  postHash: string,
  target: string,
  targetAccount: string
) => {
  const [relationship] = await db
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
  return relationship
}

export const deletePostRelationship = async (target: string, targetId: string) => {
  await db
    .update(postRelationshipsTable)
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where(
      and(
        eq(postRelationshipsTable.target_id, targetId),
        eq(postRelationshipsTable.target, target)
      )
    )
}

export const getAllFarcasterAccounts = async () => {
  return await db.select().from(farcasterAccountsTable)
}

export const getAllTwitterAccounts = async () => {
  return await db.select().from(twitterAccountsTable)
}

export const createPostCredentials = async (
  hash: string,
  credentials: CredentialInstance[]
) => {
  await db.insert(postCredentialsTable).values(
    credentials.map((credential) => ({
      post_hash: hash,
      credential_id: credential.id,
    }))
  )
}

export const getPostCredentials = async (hashes: string[]) => {
  const credentials = await db
    .select()
    .from(postCredentialsTable)
    .innerJoin(
      credentialInstancesTable,
      eq(postCredentialsTable.credential_id, credentialInstancesTable.id)
    )
    .where(inArray(postCredentialsTable.post_hash, hashes))

  return credentials as {
    credential_instances: CredentialInstance
    post_credentials: PostCredential
  }[]
}

export const getTwitterAccount = async (username: string) => {
  const [account] = await db
    .select()
    .from(twitterAccountsTable)
    .where(eq(twitterAccountsTable.username, username))
  return account
}

export const getCredentialInstance = async (id: string) => {
  const [credential] = await db
    .select()
    .from(credentialInstancesTable)
    .where(eq(credentialInstancesTable.id, id))
    .limit(1)

  return credential
}

export const createCredentialInstance = async (
  params: Omit<typeof credentialInstancesTable.$inferInsert, 'created_at' | 'updated_at'>
) => {
  const [credential] = await db
    .insert(credentialInstancesTable)
    .values(params)
    .returning()
  return credential
}

export const getCredentials = async (ids: string[]): Promise<CredentialInstance[]> => {
  const credentials = await db
    .select()
    .from(credentialInstancesTable)
    .where(inArray(credentialInstancesTable.id, ids))

  return credentials as CredentialInstance[]
}

export const getCommunities = async (): Promise<Community[]> => {
  const communities = await db
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
  return communities.map((community) => ({
    ...community.communities,
    token: community.tokens,
    farcaster: community.farcaster_accounts?.metadata as FarcasterAccount | null,
    twitter: community.twitter_accounts?.metadata as TwitterAccount | null,
  }))
}

export const getCommunity = async (id: string): Promise<Community> => {
  const [community] = await db
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
    farcaster: community.farcaster_accounts?.metadata as FarcasterAccount | null,
    twitter: community.twitter_accounts?.metadata as TwitterAccount | null,
  }
}

export const updateCommunity = async (
  communityId: string,
  params: Partial<typeof communitiesTable.$inferInsert>
) => {
  await db
    .update(communitiesTable)
    .set(params)
    .where(eq(communitiesTable.id, communityId))
}

export const countPostsForCommunity = async (fid: number) => {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(postsTable)
    .where(eq(postsTable.fid, fid))
  return result.count
}

export const getAllTokens = async () => {
  return await db.select().from(tokensTable)
}

export const getTokens = async (ids: string[]) => {
  return await db.select().from(tokensTable).where(inArray(tokensTable.id, ids))
}

export const getToken = async (id: string) => {
  const [token] = await db
    .select()
    .from(tokensTable)
    .where(eq(tokensTable.id, id))
    .limit(1)
  return token
}

export const updateToken = async (
  id: string,
  params: Partial<typeof tokensTable.$inferInsert>
) => {
  await db.update(tokensTable).set(params).where(eq(tokensTable.id, id))
}

export const createToken = async (
  params: Omit<typeof tokensTable.$inferInsert, 'created_at' | 'updated_at'>
) => {
  const [token] = await db.insert(tokensTable).values(params).returning()
  return token
}

export const updateFarcasterAccount = async (
  fid: number,
  params: Partial<typeof farcasterAccountsTable.$inferInsert>
) => {
  await db
    .update(farcasterAccountsTable)
    .set(params)
    .where(eq(farcasterAccountsTable.fid, fid))
}

export const updateTwitterAccount = async (
  username: string,
  params: Partial<typeof twitterAccountsTable.$inferInsert>
) => {
  await db
    .update(twitterAccountsTable)
    .set(params)
    .where(eq(twitterAccountsTable.username, username))
}

export const getFarcasterAccounts = async (fids: number[]) => {
  return await db
    .select()
    .from(farcasterAccountsTable)
    .where(inArray(farcasterAccountsTable.fid, fids))
}

export const getTwitterAccounts = async (usernames: string[]) => {
  return await db
    .select()
    .from(twitterAccountsTable)
    .where(inArray(twitterAccountsTable.username, usernames))
}

export const getComunnitiesForAccounts = async (fids: number[], usernames: string[]) => {
  return await db
    .select()
    .from(communitiesTable)
    .where(
      or(
        inArray(communitiesTable.fid, fids),
        inArray(communitiesTable.twitter_username, usernames)
      )
    )
}
