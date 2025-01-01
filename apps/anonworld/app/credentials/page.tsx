'use client'

import { CredentialDisplay, NewCredential, useCredentials } from '@anonworld/react'
import { Text, View, XStack, YStack } from '@anonworld/ui'

export default function Credentials() {
  const { credentials } = useCredentials()

  const sortedCredentials = credentials.sort((a, b) => {
    return new Date(b.verified_at).getTime() - new Date(a.verified_at).getTime()
  })

  return (
    <View maxWidth={700} mx="auto" my="$3" gap="$3">
      <XStack ai="center" jc="space-between" $xs={{ px: '$2' }}>
        <Text fos="$2" fow="400" color="$color11">
          {`${sortedCredentials.length} Credential${sortedCredentials.length === 1 ? '' : 's'}`}
        </Text>
        <NewCredential />
      </XStack>
      <YStack gap="$4" $xs={{ gap: '$0', bbw: '$0.5', bc: '$borderColor' }}>
        {sortedCredentials.map((credential) => (
          <CredentialDisplay key={credential.id} credential={credential} />
        ))}
      </YStack>
    </View>
  )
}
