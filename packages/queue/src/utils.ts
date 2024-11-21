import Redis from 'ioredis'
import { Job, Queue, QueueOptions, Worker } from 'bullmq'
import { ProofType } from '@anon/utils/src/proofs'

export enum QueueName {
  Default = 'default',
}

export type QueueArgs = {
  type: ProofType
  proof: number[]
  publicInputs: number[][]
}

type QueueType = {
  [QueueName.Default]: QueueArgs
}

const connection = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,
})

const queueOptions: QueueOptions = {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
}

const formatQueueName = (queueName: QueueName) => {
  return `{${queueName}}`
}

export const getQueue = <N extends QueueName, T>(queueName: N): Queue<QueueType[N]> => {
  return new Queue<QueueType[N]>(formatQueueName(queueName), queueOptions)
}

export const getWorker = <N extends QueueName>(
  queueName: N,
  jobFunction: (job: Job<QueueType[N]>) => Promise<void>
): Worker<QueueType[N]> => {
  return new Worker(formatQueueName(queueName), jobFunction, {
    connection,
  })
}
