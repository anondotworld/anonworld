export type SwapQuote = {
  buyAmount: string
  liquidityAvailable: boolean
  transaction?: {
    to: `0x${string}`
    value: string
    data: `0x${string}`
  }
}

export type SwapQuoteError = {
  liquidityAvailable: boolean
  error: string
}
