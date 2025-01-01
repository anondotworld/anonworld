import { Spinner, YStack } from '@anonworld/ui'
import { CommunityDisplay } from './display'
import { useCommunities } from '../../../hooks/use-communities'
import { Link } from 'solito/link'

export function CommunityFeed({ sort }: { sort: string }) {
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
    <YStack gap="$4" $xs={{ gap: '$0', bbw: '$0.5', bc: '$borderColor' }}>
      {sortedCommunities?.map((community) => (
        <Link key={community.id} href={`/communities/${community.id}`}>
          <CommunityDisplay community={community} hoverable />
        </Link>
      ))}
    </YStack>
  )
}
