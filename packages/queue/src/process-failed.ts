import { handler } from './handler'
import { getQueue, QueueName } from './utils'

async function main() {
  const usePromotePost = !!process.argv[2]
  const queueName = usePromotePost ? QueueName.PromotePost : QueueName.Default
  const queue = getQueue(queueName)
  const jobs = (await Promise.all([queue.getDelayed(), queue.getFailed()])).flat()
  console.log(new Date().toISOString(), 'found', jobs.length, 'actions')
  for (const job of jobs) {
    try {
      console.log(`[${job.id}] processing ${job.data.type}`)
      await handler(job.data)
      console.log(`[${job.id}] completed ${job.data.type}`)
    } catch (e) {
      console.error(`[${job.id}] failed with ${e}`)
    }
    await job.remove()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
