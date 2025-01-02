import { Spinner, Text, YStack } from '@anonworld/ui'
import { useNotifications } from '../../hooks/use-notifications'
import { PostDisplay } from '../posts'
import { Link } from 'solito/link'
export { NotificationsCount } from './count'

export function NotificationsFeed() {
  const { data, isLoading } = useNotifications()

  if (isLoading) {
    return <Spinner color="$color12" />
  }

  if (!data || data.length === 0) {
    return (
      <Text fos="$2" fow="400" color="$color11" textAlign="center">
        No notifications yet
      </Text>
    )
  }

  return (
    <YStack gap="$4" $xs={{ gap: '$0', bbw: '$0.5', bc: '$borderColor' }}>
      {data?.map((post) => (
        <Link key={post.hash} href={`/posts/${post.parent_hash ?? post.hash}`}>
          <PostDisplay post={post} hoverable />
        </Link>
      ))}
    </YStack>
  )
}
