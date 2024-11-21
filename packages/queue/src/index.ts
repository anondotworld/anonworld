import { ProofType } from '@anon/utils/src/proofs'
import { QueueName, getWorker, QueueArgs, getQueue } from './utils'

const run = async () => {
  // Manual run
  if (process.argv[2]) {
    const queue = getQueue(QueueName.Default)
    const job = await queue.getJob(process.argv[2])
    if (job) {
      const result = await handle(job.data)
      console.log(JSON.stringify(result, null, 2))
    }
    return
  }

  // Start worker
  const worker = getWorker(QueueName.Default, async (job) => await handle(job.data))

  worker.on('failed', (job, err) => {
    if (job) {
      console.log(`[${job.id}] failed with ${err.message}`)
    }
  })
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})

async function handle(data: QueueArgs) {
  console.log(`${data.type}`)
  switch (data.type) {
    case ProofType.CREATE_POST: {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/create`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.statusText}`)
      }

      const result = await response.json()
      if (!result?.success) {
        throw new Error('Failed to create post')
      }
      return result
    }
    case ProofType.DELETE_POST: {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/delete`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.statusText}`)
      }

      const result = await response.json()
      if (!result?.success) {
        throw new Error('Failed to delete post')
      }
      return result
    }
    case ProofType.PROMOTE_POST: {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/promote`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to promote post: ${response.statusText}`)
      }

      const result = await response.json()
      if (!result?.success) {
        throw new Error('Failed to promote post')
      }
      return result
    }
  }
}
