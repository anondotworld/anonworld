import { usePosts } from '../../../hooks/use-posts'
import { Spinner, YStack } from '@anonworld/ui'
import { Post } from '../display'

export function PostFeed({
  fid,
  type,
  onPress,
}: {
  fid: number
  type: 'new' | 'trending'
  onPress: (hash: string) => void
}) {
  const { data: posts, isLoading } = usePosts({
    fid,
    type,
  })

  if (isLoading) {
    return <Spinner color="$color12" />
  }

  return (
    <YStack $gtXs={{ gap: '$4' }}>
      {posts?.map((post) => (
        <Post key={post.hash} post={post} onPress={() => onPress(post.hash)} />
      ))}
    </YStack>
  )
}
