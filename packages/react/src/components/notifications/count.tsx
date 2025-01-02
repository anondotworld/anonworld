import { useNotificationsCount } from '../../hooks/use-notifications-count'
import { Circle, Text } from '@anonworld/ui'

export function NotificationsCount() {
  const { data: count } = useNotificationsCount()
  if (!count) return null
  return (
    <Circle bg="$red9" w={16} h={16} jc="center" ai="center">
      <Text fos="$1" fow="600">
        {count}
      </Text>
    </Circle>
  )
}
