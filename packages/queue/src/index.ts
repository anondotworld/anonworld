import { ProofType } from '@anon/utils/src/proofs'
import { QueueName, getWorker, QueueArgs, getQueue } from './utils'

const run = async () => {
  // Manual run
  if (process.argv[2]) {
    const queue = getQueue(QueueName.Default)
    const job = await queue.getJob(process.argv[2])
    if (job) {
      await handle(job.data)
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
      }).then((res) => res.json())

      console.log(JSON.stringify(response, null, 2))
      break
    }
    case ProofType.DELETE_POST: {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/delete`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json())

      console.log(JSON.stringify(response, null, 2))
      break
    }
    case ProofType.PROMOTE_POST: {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/promote`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json())

      console.log(JSON.stringify(response, null, 2))
      break
    }
  }
}
