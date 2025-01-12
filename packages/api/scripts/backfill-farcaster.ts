import { db } from '../src/db'
import { postLikesTable, postRepliesTable, postsTable } from '../src/db/schema'
import { eq, inArray, isNull } from 'drizzle-orm'
import { neynar } from '../src/services/neynar'

const backfillReplies = async () => {
  const posts = await db.db.select().from(postsTable).where(isNull(postsTable.deleted_at))

  console.log(`[backfill-replies] ${posts.length} posts`)

  const toInsert = []

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]

    let cursor: string | undefined | null
    do {
      try {
        const conversation = await neynar.getConversation(
          post.hash,
          1,
          cursor ?? undefined
        )
        for (const cast of conversation.conversation.cast.direct_replies) {
          toInsert.push({
            post_hash: post.hash,
            fid: cast.author.fid,
            reply_hash: cast.hash,
          })
        }
        cursor = conversation.next.cursor
      } catch (e) {
        const error = e as Error
        if (error.message.includes('404')) {
          await db.db
            .update(postsTable)
            .set({ deleted_at: new Date() })
            .where(eq(postsTable.hash, post.hash))
          break
        }
        if (error.message.includes('429')) {
          await new Promise((resolve) => setTimeout(resolve, 60000))
          continue
        }
        console.error(error.message)
      }
    } while (cursor === undefined || cursor !== null)

    if (i % 100 === 0) {
      console.log(`[backfill-replies] ${i} / ${posts.length}`)
    }
  }

  for (let i = 0; i < toInsert.length; i += 1000) {
    console.log(`[backfill-replies] inserting ${i} / ${toInsert.length}`)
    await db.db
      .insert(postRepliesTable)
      .values(toInsert.slice(i, i + 1000))
      .onConflictDoNothing()
  }
}

const backfillLikes = async () => {
  const posts = await db.db.select().from(postsTable).where(isNull(postsTable.deleted_at))

  console.log(`[backfill-likes] ${posts.length} posts`)

  const toInsert = []

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]

    let cursor: string | undefined | null
    do {
      try {
        const response = await neynar.getLikesForCast(post.hash, cursor ?? undefined)
        for (const like of response.reactions) {
          toInsert.push({
            post_hash: post.hash,
            fid: like.user.fid,
          })
        }
        cursor = response.next.cursor
      } catch (e) {
        const error = e as Error
        if (error.message.includes('404')) {
          await db.db
            .update(postsTable)
            .set({ deleted_at: new Date() })
            .where(eq(postsTable.hash, post.hash))
          break
        }
        if (error.message.includes('429')) {
          await new Promise((resolve) => setTimeout(resolve, 60000))
          continue
        }
        console.error(error.message)
      }
    } while (cursor === undefined || cursor !== null)

    if (i % 100 === 0) {
      console.log(`[backfill-likes] ${i} / ${posts.length}`)
    }
  }

  for (let i = 0; i < toInsert.length; i += 1000) {
    console.log(`[backfill-likes] inserting ${i} / ${toInsert.length}`)
    await db.db
      .insert(postLikesTable)
      .values(toInsert.slice(i, i + 1000))
      .onConflictDoNothing()
  }
}

async function deleteIrrelevantReplies() {
  const accounts = await db.socials.listFarcasterAccounts()
  const fids = accounts.map((account) => account.fid).filter((fid) => fid !== 899289)
  await db.db.delete(postRepliesTable).where(inArray(postRepliesTable.fid, fids))
}

export async function backfill() {
  await backfillReplies()
  await deleteIrrelevantReplies()
  await backfillLikes()
}