import { ProofType } from '@anon/utils/src/proofs'
import { QueueName, getWorker } from './utils'

const run = async () => {
  const worker = getWorker(QueueName.Default, async (job) => {
    console.log(`[${job.id}] ${job.data.type}`)
    switch (job.data.type) {
      case ProofType.CREATE_POST:
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/create`, {
          method: 'POST',
          body: JSON.stringify(job.data),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        break
      case ProofType.DELETE_POST:
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/delete`, {
          method: 'POST',
          body: JSON.stringify(job.data),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        break
      case ProofType.PROMOTE_POST:
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/promote`, {
          method: 'POST',
          body: JSON.stringify(job.data),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        break
    }
  })

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
