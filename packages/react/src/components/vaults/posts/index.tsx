import { Spinner, Text, YStack } from '@anonworld/ui'
import { useVaultPosts } from '../../../hooks/use-vault-posts'
import { Post } from '../../posts'

export function VaultPosts({
  id,
  onPress,
}: { id: string; onPress: (hash: string) => void }) {
  const { data, isLoading } = useVaultPosts(id)

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
    <YStack $gtXs={{ gap: '$4' }}>
      {data?.map((post) => (
        <Post key={post.hash} post={post} onPress={() => onPress(post.hash)} />
      ))}
    </YStack>
  )
}
