import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

export const signersTable = pgTable('signers', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  address: varchar({ length: 255 }).notNull().unique(),
  signerUuid: varchar({ length: 255 }).notNull().unique(),
  bestOfSignerUuid: varchar({ length: 255 }),
  launchSignerUuid: varchar({ length: 255 }),
})

export const postMappingTable = pgTable('post_mapping', {
  castHash: varchar({ length: 255 }).primaryKey(),
  tweetId: varchar({ length: 255 }),
  bestOfHash: varchar({ length: 255 }),
  launchTweetId: varchar({ length: 255 }),
  launchHash: varchar({ length: 255 }),
})

export const postRevealTable = pgTable('post_reveal', {
  castHash: varchar({ length: 255 }).primaryKey(),
  revealHash: varchar({ length: 255 }),
  revealPhrase: varchar({ length: 255 }),
  signature: varchar({ length: 255 }),
  address: varchar({ length: 255 }),
  revealedAt: timestamp(),
})

export const launchMappingTable = pgTable('launch_mapping', {
  castHash: varchar({ length: 255 }).primaryKey(),
  tweetId: varchar({ length: 255 }),
  promotedAt: timestamp(),
})
