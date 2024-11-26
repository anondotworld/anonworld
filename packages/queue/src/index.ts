import { QueueName, getWorker } from './utils'
import { handler } from './handler'
import { Redis } from 'ioredis'
import { ProofType } from '@anon/utils/src/proofs/generate'

const redis = new Redis(process.env.REDIS_URL as string)

const run = async () => {
  const usePromotePost = !!process.argv[2]
  const queueName = usePromotePost ? QueueName.PromotePost : QueueName.Default
  console.log(`Starting worker for ${queueName}`)
  const worker = getWorker(queueName, async (job) => {
    if (job.data.type === ProofType.PROMOTE_POST) {
      const rateLimit = await redis.get('twitter:rate-limit')
      if (rateLimit) {
        job.moveToDelayed(parseInt(rateLimit) * 1000)
        console.log(`[${job.id}] rate limit hit, delaying ${job.data.type}`)
        return
      }
    }

    console.log(`[${job.id}] started ${job.data.type}`)
    await handler(job.data)
    console.log(`[${job.id}] completed ${job.data.type}`)
  })

  worker.on('failed', (job, err) => {
    if (job) {
      console.log(`[${job.id}] failed with ${err.message}`)
    }
  })
}

run().catch((e) => {
  console.error(e)
})
