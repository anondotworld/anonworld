import {
  base as viemBase,
  mainnet as viemMainnet,
  arbitrum as viemArbitrum,
  optimism as viemOptimism,
  zora as viemZora,
} from 'viem/chains'
import { createPublicClient, http, Transport, Chain as ViemChain } from 'viem'

const createClient = (chain: ViemChain, rpcUrl?: string) => {
  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  })
}

type Chain = ViemChain & {
  zerionId: string
  simplehashId: string
  imageUrl: string
  client: ReturnType<typeof createClient>
}

export const mainnet: Chain = {
  ...viemMainnet,
  zerionId: 'ethereum',
  simplehashId: 'ethereum',
  imageUrl: 'https://chain-icons.s3.amazonaws.com/ethereum.png',
  client: createClient(
    viemMainnet,
    `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
  ),
}

export const base: Chain = {
  ...viemBase,
  zerionId: 'base',
  simplehashId: 'base',
  imageUrl: 'https://chain-icons.s3.amazonaws.com/base.png',
  client: createClient(viemBase),
}

export const arbitrum: Chain = {
  ...viemArbitrum,
  zerionId: 'arbitrum',
  simplehashId: 'arbitrum',
  imageUrl: 'https://chain-icons.s3.amazonaws.com/arbitrum.png',
  client: createClient(viemArbitrum),
}

export const optimism: Chain = {
  ...viemOptimism,
  zerionId: 'optimism',
  simplehashId: 'optimism',
  imageUrl: 'https://chain-icons.s3.amazonaws.com/optimism.png',
  client: createClient(viemOptimism),
}

export const zora: Chain = {
  ...viemZora,
  zerionId: 'zora',
  simplehashId: 'zora',
  imageUrl: 'https://chain-icons.s3.amazonaws.com/zora',
  client: createClient(viemZora),
}

export const chains = [base, mainnet, arbitrum, optimism, zora] as const

export const viemConfig = {
  chains,
  transports: chains.reduce(
    (acc, chain) => {
      acc[chain.id] = http()
      return acc
    },
    {} as Record<number, Transport>
  ),
}

export const getZerionChain = (zerionId: string) => {
  const chain = chains.find((chain) => chain.zerionId === zerionId)
  if (!chain) {
    throw new Error(`Chain ${zerionId} not found`)
  }
  return chain
}

export const getSimplehashChain = (simplehashId: string) => {
  const chain = chains.find((chain) => chain.simplehashId === simplehashId)
  if (!chain) {
    throw new Error(`Chain ${simplehashId} not found`)
  }
  return chain
}

export const getChain = (chainId: number) => {
  const chain = chains.find((chain) => chain.id === chainId)
  if (!chain) {
    throw new Error(`Chain ${chainId} not found`)
  }
  return chain
}
