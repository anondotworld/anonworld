import {
  bytesToHexString,
  createDefaultMetadataKeyInterceptor,
  getSSLHubRpcClient,
  HubEvent,
  HubEventType,
  MessageType,
  ReactionType,
} from '@farcaster/hub-nodejs'
import { redis } from '../src/services/redis'
import { db } from '../src/db'
import { DrizzleError } from 'drizzle-orm'
import { backfill } from './backfill-farcaster'

const client = getSSLHubRpcClient('hub-grpc-api.neynar.com', {
  interceptors: [
    createDefaultMetadataKeyInterceptor('x-api-key', process.env.NEYNAR_API_KEY!),
  ],
  'grpc.max_receive_message_length': 1024 * 1024 * 1024 * 1024,
})

const getFidSets = async () => {
  const accounts = await db.socials.listFarcasterAccounts()
  const result = await client.getFids({ reverse: true, pageSize: 1 })
  if (result.isErr()) {
    throw new Error(result.error.message)
  }
  const { fids } = result.value
  const maxFid = fids[0]
  const anonFids = new Set(accounts.map((account) => account.fid))

  const otherFids = new Set(
    Array.from({ length: maxFid }, (_, i) => i + 1).filter((fid) => !anonFids.has(fid))
  )

  return { anonworldFid: 899289, anonFids, otherFids, maxFid }
}

async function handleEvent(
  sets: Awaited<ReturnType<typeof getFidSets>>,
  event: HubEvent
) {
  if (event.type !== HubEventType.MERGE_MESSAGE) {
    return
  }

  const message = event.mergeMessageBody?.message
  const messageData = message?.data
  if (!messageData) {
    return
  }

  if (messageData.castAddBody) {
    const castAdd = messageData.castAddBody
    if (!castAdd.parentCastId) {
      return
    }

    const fid = messageData.fid
    const parentFid = castAdd.parentCastId.fid
    if (parentFid > sets.maxFid) {
      sets = await getFidSets()
    }

    if (sets.otherFids.has(parentFid)) {
      return
    }

    if (sets.anonFids.has(fid) && fid !== sets.anonworldFid) {
      return
    }

    const hashValue = bytesToHexString(castAdd.parentCastId.hash)
    if (hashValue.isErr()) {
      return
    }

    const messageHashValue = bytesToHexString(message.hash)
    if (messageHashValue.isErr()) {
      return
    }

    console.log(`[reply] ${messageData.fid} replied ${hashValue.value}`)
    try {
      await db.posts.replyFromFarcaster(
        hashValue.value,
        messageData.fid,
        messageHashValue.value
      )
    } catch (e) {
      console.error(e)
    }
  } else if (messageData.castRemoveBody) {
    const castRemove = messageData.castRemoveBody
    if (!castRemove.targetHash) {
      return
    }

    const hashValue = bytesToHexString(castRemove.targetHash)
    if (hashValue.isErr()) {
      return
    }

    try {
      const result = await db.posts.unreplyFromFarcaster(hashValue.value)
      if (result.length > 0) {
        console.log(`[unreply] ${messageData.fid} unreplied ${hashValue.value}`)
      }
    } catch (e) {
      console.error(e)
    }
  } else if (messageData.reactionBody) {
    const reaction = messageData.reactionBody
    if (!reaction.targetCastId || reaction.type !== ReactionType.LIKE) {
      return
    }

    const fid = reaction.targetCastId.fid
    if (fid > sets.maxFid) {
      sets = await getFidSets()
    }

    if (sets.otherFids.has(fid)) {
      return
    }

    const hashValue = bytesToHexString(reaction.targetCastId.hash)
    if (hashValue.isErr()) {
      return
    }

    if (messageData.type === MessageType.REACTION_ADD) {
      console.log(`[like] ${messageData.fid} liked ${hashValue.value}`)
      try {
        await db.posts.likeFromFarcaster(messageData.fid, hashValue.value)
      } catch (e) {
        if (e instanceof DrizzleError) {
          // TODO: Backfill first post of communities before 1/13/2025
          if (!e.message.includes('violates foreign key constraint')) {
            console.error(e)
          }
        }
      }
    } else if (messageData.type === MessageType.REACTION_REMOVE) {
      console.log(`[unlike] ${messageData.fid} unliked ${hashValue.value}`)
      try {
        await db.posts.unlikeFromFarcaster(messageData.fid, hashValue.value)
      } catch (e) {
        console.error(e)
      }
    }
  }
}

const getSubscription = async (lastEventId?: number) => {
  let subscriptionValue = await client.subscribe({
    eventTypes: [HubEventType.MERGE_MESSAGE],
    ...(lastEventId && { fromId: lastEventId }),
  })

  if (!subscriptionValue.isOk()) {
    throw new Error('Failed to subscribe')
  }

  let subscription = subscriptionValue.value
  return subscription
}

async function live() {
  let lastEventId = Number(await redis.getLastEventId())

  let sets = await getFidSets()

  console.log(`[live] fromId: ${lastEventId}`)

  let subscription = await getSubscription(lastEventId)

  let i = 0

  for await (const event of subscription) {
    if (subscription.closed || subscription.destroyed) {
      subscription = await getSubscription(lastEventId)
    }

    try {
      await handleEvent(sets, event as HubEvent)
    } catch (e) {
      console.error(e)
    }

    lastEventId = event.id

    i++
    if (i > 1000) {
      i = 0
      await redis.setLastEventId(event.id.toString())
      console.log(`[live] lastEventId: ${event.id}`)
    }
  }
}

async function main() {
  while (true) {
    try {
      await live()
    } catch (e) {
      console.error(e)
    }
  }
}

main()
  .catch(console.error)
  .then(() => {
    process.exit(1)
  })