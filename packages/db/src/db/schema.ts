import { integer, pgTable, varchar } from 'drizzle-orm/pg-core'

export const signersTable = pgTable('signers', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  address: varchar({ length: 255 }).notNull().unique(),
  signerUuid: varchar({ length: 255 }).notNull().unique(),
  bestOfSignerUuid: varchar({ length: 255 }),
})

export const postMappingTable = pgTable('post_mapping', {
  castHash: varchar({ length: 255 }).primaryKey(),
  tweetId: varchar({ length: 255 }).notNull(),
})
