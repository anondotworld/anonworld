'use client'

import { VaultDisplay, VaultPosts, useVault } from '@anonworld/react'
import { Text, View, XStack } from '@anonworld/ui'

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { data: vault } = useVault(params.id)

  if (!vault) {
    return null
  }

  return (
    <View maxWidth={700} mx="auto" my="$4" gap="$4">
      <VaultDisplay vault={vault} />
      <XStack gap="$2">
        <View bg="$background" py="$2" px="$3" br="$12" themeInverse>
          <Text fow="600" fos="$2">
            Posts
          </Text>
        </View>
      </XStack>
      <VaultPosts id={vault.id} />
    </View>
  )
}
