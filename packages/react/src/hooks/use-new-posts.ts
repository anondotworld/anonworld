import { useInfiniteQuery } from '@tanstack/react-query'
import { useSDK } from '../providers/sdk'
import { Cast } from '../types'

const pageSize = 25

export function useNewPosts({
  fid,
  filter,
}: {
  fid: number
  filter?: (cast: Cast) => boolean
}) {
  const { sdk } = useSDK()
  return useInfiniteQuery<Cast[]>({
    queryKey: ['new-posts', fid],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await sdk.getNewFeed(fid, pageParam as number)
      const posts = response?.data?.data || []
      if (filter) {
        return posts.filter(filter)
      }
      return posts
    },
    getNextPageParam: (lastPage: Cast[], allPages: Cast[][]) => {
      if (lastPage.length < pageSize) return undefined
      return allPages.length + 1
    },
  })
}
