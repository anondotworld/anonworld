import { FileText, Plus, Minus, RefreshCw, Trash } from '@tamagui/lucide-icons'
import { Spinner, Text, View, YGroup } from '@anonworld/ui'
import { Credential, useCredentials } from '../../../..'
import { useVaults } from '../../../../hooks/use-vaults'
import { NamedExoticComponent, useState } from 'react'

export function CredentialActionsContent({
  credential,
  onViewProof,
}: {
  credential: Credential
  onViewProof: (open: boolean) => void
}) {
  const credentials = useCredentials()
  const { data: vaults } = useVaults()

  return (
    <YGroup>
      <ActionButton
        label="View proof"
        onPress={() => onViewProof(true)}
        Icon={FileText}
      />
      {!credential.vault_id && (
        <ActionButton
          label="Add to profile"
          onPress={async () => {
            if (!vaults || vaults.length === 0) return
            await credentials.addToVault(vaults[0].id, credential.id)
          }}
          Icon={Plus}
        />
      )}
      {credential.vault_id && (
        <ActionButton
          label="Remove from profile"
          onPress={async () => {
            if (!credential.vault_id) return
            await credentials.removeFromVault(credential.vault_id, credential.id)
          }}
          Icon={Minus}
        />
      )}
      <ActionButton
        label="Reverify"
        onPress={async () => {
          await credentials.add({
            chainId: credential.metadata.chainId,
            tokenAddress: credential.metadata.tokenAddress,
            verifiedBalance: BigInt(credential.metadata.balance),
            parentId: credential.id,
          })
        }}
        Icon={RefreshCw}
      />
      <ActionButton
        label="Delete"
        onPress={() => credentials.delete(credential.id)}
        Icon={Trash}
        destructive
      />
    </YGroup>
  )
}

function ActionButton({
  label,
  onPress,
  Icon,
  destructive = false,
}: {
  label: string
  onPress: () => Promise<void> | void
  Icon?: NamedExoticComponent<any>
  destructive?: boolean
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePress = async () => {
    setIsLoading(true)
    try {
      await onPress()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <YGroup.Item>
      <View
        onPress={handlePress}
        fd="row"
        ai="center"
        gap="$2"
        px="$3.5"
        py="$2.5"
        hoverStyle={{ bg: '$color5' }}
      >
        {isLoading && <Spinner color="$color12" />}
        {Icon && !isLoading && (
          <Icon size={16} color={destructive ? '$red9' : undefined} />
        )}
        <Text fos="$2" fow="400" color={destructive ? '$red9' : undefined}>
          {label}
        </Text>
      </View>
    </YGroup.Item>
  )
}
