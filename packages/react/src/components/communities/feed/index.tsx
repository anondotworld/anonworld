import { Spinner, YStack } from '@anonworld/ui'
import { CommunityDisplay } from './display'
import { useCommunities } from '../../../hooks/use-communities'

export function CommunityFeed({ onPress }: { onPress: (id: string) => void }) {
  const { data: communities, isLoading } = useCommunities()

  if (isLoading) {
    return <Spinner color="$color12" />
  }

  return (
    <YStack $gtXs={{ gap: '$4' }}>
      {communities?.map((community) => (
        <CommunityDisplay
          key={community.id}
          community={community}
          onPress={() => onPress(community.id)}
        />
      ))}
    </YStack>
  )
}
