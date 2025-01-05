export type SimplehashNFT = {
  nft_id: string
  chain: string
  contract_address: string
  token_id: string
  name: string
  description?: string
  previews: {
    image_small_url: string
    image_medium_url: string
    image_large_url: string
    image_opengraph_url: string
    blurhash: string
    predominant_color: string
  }
  image_url: string
  image_properties: {
    width: number
    height: number
    size: number
    mime_type: string
    exif_orientation: any
  }
  video_url: any
  video_properties: any
  audio_url: any
  audio_properties: any
  model_url: any
  model_properties: any
  other_url: any
  other_properties: any
  background_color: any
  external_url?: string
  created_date: string
  status: string
  token_count: number
  owner_count: number
  owners: Array<{
    owner_address: string
    quantity: number
    quantity_string: string
    first_acquired_date: string
    last_acquired_date: string
  }>
  contract: {
    type: string
    name?: string
    symbol?: string
    deployed_by: string
    deployed_via_contract?: string
    owned_by?: string
    has_multiple_collections: boolean
    has_erc5643_subscription_standard?: boolean
  }
  collection: SimplehashNFTCollection
  last_sale?: {
    from_address?: string
    to_address: string
    quantity: number
    quantity_string: string
    timestamp: string
    transaction: string
    marketplace_id: string
    marketplace_name: string
    is_bundle_sale: boolean
    payment_token: {
      payment_token_id: string
      name: string
      symbol: string
      address: any
      decimals: number
    }
    unit_price: number
    total_price: number
    unit_price_usd_cents: number
  }
  primary_sale?: {
    from_address: any
    to_address: string
    quantity: number
    quantity_string: string
    timestamp: string
    transaction: string
    marketplace_id: string
    marketplace_name: string
    is_bundle_sale: boolean
    payment_token: {
      payment_token_id: string
      name: string
      symbol: string
      address: any
      decimals: number
    }
    unit_price: number
    total_price: number
    unit_price_usd_cents: number
  }
  first_created: {
    minted_to: string
    quantity: number
    quantity_string: string
    timestamp: string
    block_number: number
    transaction: string
    transaction_initiator: string
  }
  rarity: {
    rank?: number
    score?: number
    unique_attributes?: number
  }
  royalty: Array<{
    source: string
    total_creator_fee_basis_points: number
    recipients: Array<{
      address: string
      percentage: number
      basis_points: number
    }>
  }>
  extra_metadata: {
    attributes: Array<{
      trait_type: string
      value: string
      display_type?: string
    }>
    image_original_url: string
    animation_original_url: any
    metadata_original_url?: string
    token_id?: string
    symbol?: string
    address?: string
    is_normalized?: boolean
    name_length?: number
    segment_length?: number
    version?: number
    background_image?: string
    image_url?: string
  }
}

export type SimplehashNFTCollection = {
  collection_id: string
  name: string
  description?: string
  image_url: string
  image_properties: {
    width: number
    height: number
    mime_type: string
  }
  banner_image_url?: string
  category?: string
  is_nsfw: boolean
  external_url?: string
  twitter_username?: string
  discord_url?: string
  instagram_username: any
  medium_username?: string
  telegram_url: any
  marketplace_pages: Array<{
    marketplace_id: string
    marketplace_name: string
    marketplace_collection_id: string
    nft_url: string
    collection_url: string
    verified?: boolean
  }>
  metaplex_mint: any
  metaplex_candy_machine: any
  metaplex_first_verified_creator: any
  mpl_core_collection_address: any
  floor_prices: Array<{
    marketplace_id: string
    marketplace_name: string
    value: number
    payment_token: {
      payment_token_id: string
      name: string
      symbol: string
      address: any
      decimals: number
    }
    value_usd_cents: number
  }>
  top_bids: Array<{
    marketplace_id: string
    marketplace_name: string
    value: number
    payment_token: {
      payment_token_id: string
      name: string
      symbol: string
      address: any
      decimals: number
    }
    value_usd_cents: number
  }>
  distinct_owner_count: number
  distinct_nft_count: number
  total_quantity: number
  chains: Array<string>
  top_contracts: Array<string>
  collection_royalties: Array<{
    source: string
    total_creator_fee_basis_points: number
    recipients: Array<{
      address: string
      percentage: number
      basis_points: number
    }>
  }>
}
