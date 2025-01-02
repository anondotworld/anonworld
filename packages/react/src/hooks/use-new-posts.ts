import { useInfiniteQuery } from '@tanstack/react-query'
import { useSDK } from '../providers/sdk'
import { Post } from '@anonworld/common'

const pageSize = 25

export function useNewPosts({
  fid,
  filter,
}: {
  fid: number
  filter?: (cast: Post) => boolean
}) {
  const { sdk } = useSDK()
  return useInfiniteQuery<Post[]>({
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
    getNextPageParam: (lastPage: Post[], allPages: Post[][]) => {
      if (lastPage.length < pageSize) return undefined
      return allPages.length + 1
    },
  })
}
