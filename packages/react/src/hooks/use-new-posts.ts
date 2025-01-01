import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers/sdk'
import { Cast } from '../types'

export function useNewPosts({
  fid,
  filter,
}: {
  fid: number
  filter?: (cast: Cast) => boolean
}) {
  const { sdk } = useSDK()
  return useQuery({
    queryKey: ['new-posts', fid],
    queryFn: async () => {
      const response = await sdk.getNewFeed(fid)
      const posts = response?.data?.data || []
      if (filter) {
        return posts.filter(filter)
      }
      return posts
    },
  })
}
