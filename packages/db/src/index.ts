import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { postMappingTable, postRevealTable, signersTable } from './db/schema'
import { eq, inArray } from 'drizzle-orm'

const db = drizzle(process.env.DATABASE_URL as string)

export async function getSignerForAddress(address: string) {
  const [user] = await db
    .select()
    .from(signersTable)
    .where(eq(signersTable.address, address))
    .limit(1)
  return user
}

export async function createSignerForAddress(address: string, signerUuid: string) {
  const [user] = await db
    .insert(signersTable)
    .values({ address, signerUuid })
    .onConflictDoUpdate({ target: signersTable.address, set: { signerUuid } })
    .returning()
  return user
}

export async function createPostMapping({
  castHash,
  tweetId,
  bestOfHash,
  launchTweetId,
  launchHash,
}: {
  castHash: string
  tweetId?: string
  bestOfHash?: string
  launchTweetId?: string
  launchHash?: string
}) {
  await db
    .insert(postMappingTable)
    .values({ castHash, tweetId, bestOfHash, launchTweetId, launchHash })
    .onConflictDoNothing()
}

export async function getPostMapping(castHash: string) {
  const [row] = await db
    .select()
    .from(postMappingTable)
    .where(eq(postMappingTable.castHash, castHash))
    .limit(1)
  return row
}

export async function deletePostMapping(castHash: string) {
  await db.delete(postMappingTable).where(eq(postMappingTable.castHash, castHash))
}

export async function getPostMappings(castHashes: string[]) {
  const rows = await db
    .select()
    .from(postMappingTable)
    .where(inArray(postMappingTable.castHash, castHashes))
  return rows
}

export async function createPostReveal(castHash: string, revealHash: string) {
  await db.insert(postRevealTable).values({ castHash, revealHash })
}

export async function getPostReveal(castHash: string) {
  const [row] = await db
    .select()
    .from(postRevealTable)
    .where(eq(postRevealTable.castHash, castHash))
    .limit(1)
  return row
}

export async function markPostReveal(
  castHash: string,
  revealPhrase: string,
  signature: string,
  address: string
) {
  await db
    .update(postRevealTable)
    .set({ revealPhrase, signature, address, revealedAt: new Date() })
    .where(eq(postRevealTable.castHash, castHash))
}

export async function getPostReveals(castHashes: string[]) {
  const rows = await db
    .select()
    .from(postRevealTable)
    .where(inArray(postRevealTable.castHash, castHashes))
  return rows
}
