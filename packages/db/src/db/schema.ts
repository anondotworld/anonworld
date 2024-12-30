import {
  pgTable,
  timestamp,
  varchar,
  uuid,
  integer,
  jsonb,
  primaryKey,
  decimal,
  bigint,
} from 'drizzle-orm/pg-core'

export const actionsTable = pgTable('actions', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: varchar({ length: 255 }).notNull(),
  credential_id: varchar({ length: 255 }),
  credential_requirement: jsonb('credential_requirement'),
  metadata: jsonb('metadata'),
  trigger: varchar({ length: 255 }),
  community_id: uuid('community_id').references(() => communitiesTable.id),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})

export const farcasterAccountsTable = pgTable('farcaster_accounts', {
  fid: integer('fid').primaryKey(),
  signer_uuid: varchar({ length: 255 }).notNull(),
  metadata: jsonb('metadata'),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})

export const twitterAccountsTable = pgTable('twitter_accounts', {
  username: varchar({ length: 255 }).primaryKey(),
  secrets: jsonb('secrets'),
  metadata: jsonb('metadata'),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})

export const postsTable = pgTable('posts', {
  hash: varchar({ length: 255 }).primaryKey(),
  fid: integer('fid')
    .references(() => farcasterAccountsTable.fid)
    .notNull(),
  data: jsonb('data').notNull(),
  reveal_hash: varchar({ length: 255 }),
  reveal_metadata: jsonb('reveal_metadata'),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
  deleted_at: timestamp(),
})

export const postRelationshipsTable = pgTable(
  'post_relationships',
  {
    post_hash: varchar({ length: 255 })
      .references(() => postsTable.hash)
      .notNull(),
    target: varchar({ length: 255 }).notNull(),
    target_account: varchar({ length: 255 }).notNull(),
    target_id: varchar({ length: 255 }).notNull(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
    deleted_at: timestamp(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.post_hash, table.target, table.target_account] }),
  })
)

export const postCredentialsTable = pgTable('post_credentials', {
  id: uuid('id').defaultRandom().primaryKey(),
  post_hash: varchar({ length: 255 })
    .references(() => postsTable.hash)
    .notNull(),
  credential_id: varchar({ length: 255 }),
})

export const actionExecutionsTable = pgTable('action_executions', {
  id: uuid('id').defaultRandom().primaryKey(),
  action_id: uuid('action_id')
    .references(() => actionsTable.id)
    .notNull(),
  action_data: jsonb('action_data').notNull(),
  status: varchar({ length: 255 }).notNull(),
  error: jsonb('error'),
  response: jsonb('response'),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})

export const credentialInstancesTable = pgTable('credential_instances', {
  id: varchar({ length: 255 }).primaryKey(),
  credential_id: varchar({ length: 255 }).notNull(),
  metadata: jsonb('metadata').notNull(),
  proof: jsonb('proof').notNull(),
  verified_at: timestamp().notNull(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})

export const communitiesTable = pgTable('communities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  image_url: varchar({ length: 255 }).notNull(),
  token_id: varchar({ length: 255 })
    .references(() => tokensTable.id)
    .notNull(),
  fid: integer('fid')
    .references(() => farcasterAccountsTable.fid)
    .notNull(),
  twitter_username: varchar({ length: 255 }).references(
    () => twitterAccountsTable.username
  ),
  posts: integer('posts').notNull().default(0),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})

export const tokensTable = pgTable('tokens', {
  id: varchar({ length: 255 }).primaryKey(),
  chain_id: integer('chain_id').notNull(),
  address: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  symbol: varchar({ length: 255 }).notNull(),
  decimals: integer('decimals').notNull(),
  image_url: varchar({ length: 255 }).notNull(),
  price_usd: decimal('price_usd', { precision: 18, scale: 8 }).notNull().default('0'),
  market_cap: bigint('market_cap', { mode: 'number' }).notNull().default(0),
  total_supply: bigint('total_supply', { mode: 'number' }).notNull().default(0),
  holders: bigint('holders', { mode: 'number' }).notNull().default(0),
  balance_slot: integer('balance_slot'),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
})
