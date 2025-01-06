import { Adapt, Popover, ScrollView, Sheet, Text, View, XStack } from '@anonworld/ui'
import { Check, Plus } from '@tamagui/lucide-icons'
import { useCredentials } from '../../../providers'
import { Badge } from '../../badge'
import { CredentialWithId, getCredential } from '@anonworld/common'
import { useNewPost } from './context'
import { VaultBadge } from '../../vaults/badge'
import { CREDENTIAL_EXPIRATION_TIME } from '@anonworld/common'
import { LinearGradient } from '@tamagui/linear-gradient'
import { useState } from 'react'
import { CredentialTypeBadge, CredentialTypeSelect } from '../../credentials/types'

export function NewPostCredentials() {
  const { credentials, removeCredential } = useNewPost()
  return (
    <ScrollView horizontal showsVerticalScrollIndicator={false}>
      <XStack gap="$2" ai="center">
        <CredentialSelector />
        {credentials.map((credential) => (
          <View key={credential.id} onPress={() => removeCredential(credential)}>
            <CredentialTypeBadge credential={credential} />
          </View>
        ))}
      </XStack>
    </ScrollView>
  )
}

function CredentialSelector() {
  const { credentials } = useCredentials()
  const { addCredential, removeCredential } = useNewPost()
  const { credentials: postCredentials } = useNewPost()
  const [isOpen, setIsOpen] = useState(false)

  const handlePress = (credential: CredentialWithId) => {
    if (postCredentials.some((c) => c.id === credential.id)) {
      removeCredential(credential)
    } else {
      addCredential(credential)
    }
    setIsOpen(false)
  }

  return (
    <Popover size="$5" placement="bottom" open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger>
        <Badge icon={<Plus size={16} />}>
          {postCredentials.length === 0 && 'Select credential '}
        </Badge>
      </Popover.Trigger>
      <Adapt when="sm">
        <Sheet
          animation="quicker"
          zIndex={200000}
          modal
          dismissOnSnapToBottom
          snapPointsMode="fit"
        >
          <Sheet.Frame py="$3" gap="$3" bg="$color2">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            animation="quicker"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>
      <Popover.Content
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          '100ms',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        padding="$0"
        cursor="pointer"
        bordered
        overflow="hidden"
        ai="flex-start"
      >
        <View>
          <Text fos="$2" fow="600" p="$2">
            Select Credential
          </Text>
        </View>
        <ScrollView maxHeight="$14">
          {credentials.map((credential) => {
            const isExpired =
              credential.verified_at &&
              new Date(credential.verified_at).getTime() + CREDENTIAL_EXPIRATION_TIME <
                Date.now()
            return (
              <XStack
                key={credential.id}
                gap="$2"
                ai="center"
                jc="space-between"
                p="$2"
                hoverStyle={{ bg: '$color5' }}
                bc="$borderColor"
                btw="$0.5"
                onPress={() => {
                  if (isExpired) return
                  handlePress(credential)
                }}
                $xs={{ flexDirection: 'column', ai: 'flex-start', f: 1 }}
              >
                <XStack gap="$2" ai="center" jc="space-between">
                  <XStack gap="$2" ai="center">
                    {!isExpired && <VaultBadge vaultId={credential.vault_id} />}
                    {isExpired && (
                      <Badge
                        icon={
                          <LinearGradient
                            width={16}
                            height={16}
                            borderRadius="$12"
                            colors={['$red10', '$red12']}
                            start={[1, 1]}
                            end={[0, 0]}
                          />
                        }
                        destructive
                      >
                        Expired
                      </Badge>
                    )}
                    <Badge>{getCredential(credential.type)?.name}</Badge>
                  </XStack>
                  <View w={16} $gtXs={{ display: 'none' }}>
                    {postCredentials.some((c) => c.id === credential.id) && (
                      <Check size={16} />
                    )}
                  </View>
                </XStack>
                <XStack gap="$2" ai="center" $xs={{ px: '$2', py: '$1' }}>
                  <CredentialTypeSelect credential={credential} />
                  <View w={16} $xs={{ display: 'none' }}>
                    {postCredentials.some((c) => c.id === credential.id) && (
                      <Check size={16} />
                    )}
                  </View>
                </XStack>
              </XStack>
            )
          })}
        </ScrollView>
      </Popover.Content>
    </Popover>
  )
}
