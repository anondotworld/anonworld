import { usePosts } from '../../../hooks/use-posts'
import { Spinner, Text, YStack } from '@anonworld/ui'
import { Post } from '../display'
import { Link } from 'solito/link'

export function PostFeed({
  fid,
  type,
}: {
  fid: number
  type: 'new' | 'trending'
}) {
  const { data, isLoading } = usePosts({
    fid,
    type,
  })

  if (isLoading) {
    return <Spinner color="$color12" />
  }

  if (!data || data.length === 0) {
    return (
      <Text fos="$2" fow="400" color="$color11" textAlign="center">
        No posts yet
      </Text>
    )
  }

  return (
    <YStack gap="$4" $xs={{ gap: '$0', bbw: '$0.5', bc: '$borderColor' }}>
      {data?.map((post) => (
        <Link key={post.hash} href={`/posts/${post.hash}`}>
          <Post post={post} hoverable />
        </Link>
      ))}
    </YStack>
  )
}
