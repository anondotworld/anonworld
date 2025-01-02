export type Token = {
  id: string
  chain_id: number
  address: string
  name: string
  symbol: string
  decimals: number
  image_url: string | null
  price_usd: string
  market_cap: number
  total_supply: number
  holders: number
  balance_slot: number | null
}
