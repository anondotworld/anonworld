'use client'

import { Accounts } from '@anonworld/react'
import { View, XStack } from '@anonworld/ui'

export default function AccountsPage() {
  return (
    <View maxWidth={700} mx="auto" my="$3" gap="$3">
      <XStack ai="center" jc="space-between"></XStack>
      <Accounts />
    </View>
  )
}
