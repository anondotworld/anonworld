import { Spinner, YStack } from '@anonworld/ui'
import { CommunityDisplay } from './display'
import { useCommunities } from '../../../hooks/use-communities'

export function CommunityFeed({
  onPress,
  sort,
}: { onPress: (id: string) => void; sort: string }) {
  const { data: communities, isLoading } = useCommunities()

  if (isLoading) {
    return <Spinner color="$color12" />
  }

  const sortedCommunities = communities?.sort((a, b) => {
    if (sort === 'popular') {
      return b.posts - a.posts
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <YStack $gtXs={{ gap: '$4' }}>
      {sortedCommunities?.map((community) => (
        <CommunityDisplay
          key={community.id}
          community={community}
          onPress={() => onPress(community.id)}
        />
      ))}
    </YStack>
  )
}
