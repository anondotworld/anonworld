'use client'

import { Cast } from '@/lib/types'
import { useBalance } from '@/hooks/use-balance'
import { TOKEN_CONFIG } from '@anon/utils/src/config'
import { PostProvider } from '../post/context'
import { Post } from './post'
import { useAccount } from 'wagmi'

export default function SinglePost({
  cast,
  tokenAddress,
}: {
  cast: Cast
  tokenAddress: string
}) {
  const { address } = useAccount()
  const { data: balance } = useBalance(tokenAddress, address)

  const canDelete =
    !!address && !!balance && balance >= BigInt(TOKEN_CONFIG[tokenAddress].deleteAmount)

  const canPromote =
    !!address && !!balance && balance >= BigInt(TOKEN_CONFIG[tokenAddress].promoteAmount)

  return (
    <PostProvider tokenAddress={tokenAddress} userAddress={address}>
      <Post key={cast.hash} cast={cast} canDelete={canDelete} canPromote={canPromote} />
    </PostProvider>
  )
}
