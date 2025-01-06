import {
  base as viemBase,
  mainnet as viemMainnet,
  arbitrum as viemArbitrum,
  optimism as viemOptimism,
  zora as viemZora,
  polygon as viemPolygon,
} from 'viem/chains'
import { createPublicClient, http, Transport, Chain as ViemChain } from 'viem'

const getAlchemyRpcUrl = (subdomain: string) => {
  const alchemyApiKey =
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY || undefined
  if (!alchemyApiKey) return undefined
  return `https://${subdomain}.g.alchemy.com/v2/${alchemyApiKey}`
}

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
  simplehashSupportsTokens: boolean
}

export const mainnet: Chain = {
  ...viemMainnet,
  zerionId: 'ethereum',
  simplehashId: 'ethereum',
  imageUrl: 'https://chain-icons.s3.amazonaws.com/ethereum.png',
  client: createClient(viemMainnet, getAlchemyRpcUrl('eth-mainnet')),
  simplehashSupportsTokens: true,
}

export const base: Chain = {
  ...viemBase,
  zerionId: 'base',
  simplehashId: 'base',
  imageUrl: 'https://chain-icons.s3.amazonaws.com/base.png',
  client: createClient(viemBase, getAlchemyRpcUrl('base-mainnet')),
  simplehashSupportsTokens: true,
}

export const arbitrum: Chain = {
  ...viemArbitrum,
  zerionId: 'arbitrum',
  simplehashId: 'arbitrum',
  imageUrl: 'https://chain-icons.s3.amazonaws.com/arbitrum.png',
  client: createClient(viemArbitrum, getAlchemyRpcUrl('arb-mainnet')),
  simplehashSupportsTokens: true,
}

export const optimism: Chain = {
  ...viemOptimism,
  zerionId: 'optimism',
  simplehashId: 'optimism',
  imageUrl: 'https://chain-icons.s3.amazonaws.com/optimism.png',
  client: createClient(viemOptimism, getAlchemyRpcUrl('opt-mainnet')),
  simplehashSupportsTokens: true,
}

export const zora: Chain = {
  ...viemZora,
  zerionId: 'zora',
  simplehashId: 'zora',
  imageUrl: 'https://chain-icons.s3.amazonaws.com/zora',
  client: createClient(viemZora, getAlchemyRpcUrl('zora-mainnet')),
  simplehashSupportsTokens: true,
}

export const polygon: Chain = {
  ...viemPolygon,
  zerionId: 'polygon',
  simplehashId: 'polygon',
  imageUrl: 'https://chain-icons.s3.amazonaws.com/polygon.png',
  client: createClient(viemPolygon, getAlchemyRpcUrl('polygon-mainnet')),
  simplehashSupportsTokens: false,
}

export const chains = [base, mainnet, arbitrum, optimism, zora, polygon] as const

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
