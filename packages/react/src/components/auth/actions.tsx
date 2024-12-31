import { LogOut } from '@tamagui/lucide-icons'
import { Popover, Text, View, YGroup } from '@anonworld/ui'
import { NamedExoticComponent, ReactNode } from 'react'
import { useAuth } from '../../providers'
import { formatHexId } from '../../utils'
import { useVaults } from '../../hooks/use-vaults'
import { VaultAvatar } from '../vaults/avatar'
import { Link } from 'solito/link'

export function AuthActions() {
  const { logout } = useAuth()
  const { data: vaults } = useVaults()
  const id = formatHexId(vaults?.[0]?.id ?? '')

  return (
    <Popover size="$5" placement="bottom">
      <Popover.Trigger
        onPress={(e) => {
          e.stopPropagation()
        }}
        cursor="pointer"
      >
        <VaultAvatar id={id} size={32} />
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
        bordered
        overflow="hidden"
      >
        <YGroup>
          {vaults?.map((vault) => {
            const displayId = formatHexId(vault.id)
            return (
              <Link key={vault.id} href={`/profiles/${vault.id}`}>
                <ActionItem
                  label={displayId}
                  image={<VaultAvatar id={displayId} size={16} />}
                />
              </Link>
            )
          })}
          <ActionItem label="Logout" onPress={logout} Icon={LogOut} destructive />
        </YGroup>
      </Popover.Content>
    </Popover>
  )
}

function ActionItem({
  label,
  onPress,
  Icon,
  image,
  destructive = false,
}: {
  label: string
  onPress?: () => void
  Icon?: NamedExoticComponent<any>
  image?: ReactNode
  destructive?: boolean
}) {
  return (
    <YGroup.Item>
      <View
        onPress={onPress}
        fd="row"
        ai="center"
        gap="$2"
        px="$3.5"
        py="$2.5"
        hoverStyle={onPress ? { bg: '$color5' } : {}}
        cursor={onPress ? 'pointer' : 'default'}
      >
        {Icon && <Icon size={16} color={destructive ? '$red9' : undefined} />}
        {image}
        <Text fos="$2" fow="400" color={destructive ? '$red9' : undefined}>
          {label}
        </Text>
      </View>
    </YGroup.Item>
  )
}
