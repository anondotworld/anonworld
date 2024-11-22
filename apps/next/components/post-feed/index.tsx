import { Cast } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { useBalance } from '@/hooks/use-balance'
import { TOKEN_CONFIG } from '@anon/utils/src/config'
import { PostProvider } from '../post/context'
import { ArrowUpDown } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Post } from '../post/post'

export default function PostFeed({
  tokenAddress,
  userAddress,
}: {
  tokenAddress: string
  userAddress?: string
}) {
  const [selected, setSelected] = useState<'new' | 'trending'>('trending')
  const { data: balance } = useBalance(tokenAddress, userAddress)

  const { data: trendingPosts } = useQuery({
    queryKey: ['trending', tokenAddress],
    queryFn: async (): Promise<Cast[]> => {
      const response = await api.getTrendingPosts(tokenAddress)
      return response?.casts || []
    },
  })

  const { data: newPosts } = useQuery({
    queryKey: ['posts', tokenAddress],
    queryFn: async (): Promise<Cast[]> => {
      const response = await api.getNewPosts(tokenAddress)
      return response?.casts || []
    },
  })

  const canDelete =
    !!userAddress &&
    !!balance &&
    balance >= BigInt(TOKEN_CONFIG[tokenAddress].deleteAmount)

  const canPromote =
    !!userAddress &&
    !!balance &&
    balance >= BigInt(TOKEN_CONFIG[tokenAddress].promoteAmount)

  return (
    <PostProvider tokenAddress={tokenAddress} userAddress={userAddress}>
      <div className="flex flex-col gap-4 ">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row items-center gap-2">
            <img src="/incognitoIcon.png" alt="ANON" className="w-4 h-4" />
            <p className="font-medium text-gray-400">Anons posting</p>
          </div>

          <Select
            value={selected}
            onValueChange={(value) => setSelected(value as 'new' | 'trending')}
          >
            <SelectTrigger
              icon={<ArrowUpDown className="w-4 h-4 text-gray-400" />}
              className="w-fit justify-end gap-1 items-center border-0 font-medium"
            >
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="new">New</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selected === 'new' ? (
          newPosts?.length && newPosts?.length > 0 ? (
            <div className="flex flex-col gap-4">
              {newPosts?.map((cast) => (
                <Post
                  key={cast.hash}
                  cast={cast}
                  canDelete={canDelete}
                  canPromote={canPromote}
                />
              ))}
            </div>
          ) : (
            <h1>Something went wrong. Please refresh the page.</h1>
          )
        ) : trendingPosts?.length && trendingPosts?.length > 0 ? (
          <div className="flex flex-col gap-4">
            {trendingPosts?.map((cast) => (
              <Post
                key={cast.hash}
                cast={cast}
                canDelete={canDelete}
                canPromote={canPromote}
              />
            ))}
          </div>
        ) : (
          <h1>Something went wrong. Please refresh the page.</h1>
        )}
      </div>
    </PostProvider>
  )
}
