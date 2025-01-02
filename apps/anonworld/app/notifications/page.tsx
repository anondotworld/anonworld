'use client'

import { Content } from '@/components/content'
import { NotificationsFeed, useNotificationsCount } from '@anonworld/react'
import { Text, View, XStack } from '@anonworld/ui'
import { useEffect } from 'react'

export default function NotificationsPage() {
  const { markSeen, data: count } = useNotificationsCount()

  useEffect(() => {
    if (count) {
      markSeen()
    }
  }, [count])

  return (
    <Content>
      <XStack gap="$2" $xs={{ px: '$2' }}>
        <View bg="$color12" py="$2" px="$3" br="$12">
          <Text fow="600" fos="$2" color="$color1">
            Notifications
          </Text>
        </View>
      </XStack>
      <NotificationsFeed />
    </Content>
  )
}
