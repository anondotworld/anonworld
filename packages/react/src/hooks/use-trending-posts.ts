import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers/sdk'
import { Post } from '@anonworld/common'

export function useTrendingPosts({
  fid,
  filter,
}: {
  fid: number
  filter?: (cast: Post) => boolean
}) {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['trending-posts', fid],
    queryFn: async () => {
      const response = await sdk.getTrendingFeed(fid)
      const posts = response?.data?.data || []
      if (filter) {
        return posts.filter(filter)
      }
      return posts
    },
  })
}
