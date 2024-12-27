import { Image, Popover, ScrollView, Text, View, XStack } from '@anonworld/ui'
import { Check, Plus } from '@tamagui/lucide-icons'
import { useSDK } from '../../../providers'
import { CredentialId } from '../../credentials/display/id'
import { Badge } from '../../badge'
import { useToken } from '../../../hooks/use-token'
import { Credential } from '../../../types'
import { formatUnits } from 'viem'
import { useNewPost } from './context'
import { CredentialBadge } from '../../credentials/badge'

export function NewPostCredentials() {
  const { credentials, removeCredential } = useNewPost()
  return (
    <ScrollView horizontal showsVerticalScrollIndicator={false}>
      <XStack gap="$2" ai="center">
        <CredentialSelector />
        {credentials.map((credential) => (
          <View key={credential.id} onPress={() => removeCredential(credential)}>
            <CredentialBadge credential={credential} />
          </View>
        ))}
      </XStack>
    </ScrollView>
  )
}

function CredentialSelector() {
  const { credentials } = useSDK()
  const { addCredential, removeCredential } = useNewPost()
  const { credentials: postCredentials } = useNewPost()

  const handlePress = (credential: Credential) => {
    if (postCredentials.some((c) => c.id === credential.id)) {
      removeCredential(credential)
    } else {
      addCredential(credential)
    }
  }

  return (
    <Popover size="$5" placement="bottom">
      <Popover.Trigger>
        <Badge icon={<Plus size={16} />}>
          {postCredentials.length === 0 && 'Select credential '}
        </Badge>
      </Popover.Trigger>
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
          {credentials.credentials.map((credential) => (
            <XStack
              key={credential.id}
              gap="$2"
              ai="center"
              p="$2"
              hoverStyle={{ bg: '$color5' }}
              bc="$borderColor"
              btw="$0.5"
              onPress={() => handlePress(credential)}
            >
              <CredentialId credential={credential} />
              <Badge>ERC20 Balance</Badge>
              <ERC20Credential credential={credential} />
              <View w={16}>
                {postCredentials.some((c) => c.id === credential.id) && (
                  <Check size={16} />
                )}
              </View>
            </XStack>
          ))}
        </ScrollView>
      </Popover.Content>
    </Popover>
  )
}

function ERC20Credential({ credential }: { credential: Credential }) {
  const { data } = useToken({
    chainId: Number(credential.metadata.chainId),
    address: credential.metadata.tokenAddress,
  })

  const symbol = data?.attributes.symbol
  const implementation = data?.attributes.implementations[0]
  const amount = Number.parseFloat(
    formatUnits(BigInt(credential.metadata.balance), implementation?.decimals ?? 18)
  )

  return (
    <XStack gap="$4" ai="center" jc="space-between" f={1}>
      <XStack gap="$2" ai="center">
        {data?.attributes.icon.url && (
          <Image src={data.attributes.icon.url} w={16} h={16} />
        )}
        <Text fos="$1" fow="500" color="$color11" textTransform="uppercase">
          {symbol}
        </Text>
      </XStack>
      <Text fos="$2" fow="600">
        {amount.toLocaleString()}
      </Text>
    </XStack>
  )
}
