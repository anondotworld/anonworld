'use client'

import { View, XStack } from '@anonworld/ui'
import { Bell, HelpCircle, Home, UsersRound, WalletMinimal } from '@tamagui/lucide-icons'
import { usePathname, useRouter } from 'next/navigation'
import { NamedExoticComponent, ReactNode } from 'react'
import { Pathname } from './header'
import { NotificationsCount } from '@anonworld/react'

export function Tabs() {
  const pathname = usePathname() as Pathname
  const router = useRouter()

  return (
    <XStack
      bg="$background"
      btw="$0.5"
      bc="$borderColor"
      w="100%"
      jc="space-between"
      $gtXs={{
        display: 'none',
      }}
      $platform-web={{
        position: 'sticky',
        bottom: 0,
        zIndex: 1000,
      }}
      p="$1"
    >
      <TabButton
        Icon={Home}
        active={
          pathname === Pathname.HOME ||
          pathname === Pathname.NEW ||
          pathname.startsWith(Pathname.POST)
        }
        onPress={() => router.push('/')}
      />
      <TabButton
        Icon={UsersRound}
        active={pathname.startsWith(Pathname.COMMUNITIES)}
        onPress={() => router.push('/communities')}
      />
      <TabButton
        Icon={WalletMinimal}
        active={pathname === Pathname.CREDENTIALS}
        onPress={() => router.push('/credentials')}
      />
      <TabButton
        Icon={Bell}
        active={pathname === Pathname.NOTIFICATIONS}
        onPress={() => router.push('/notifications')}
      >
        <View position="absolute" top="$2" right="$2">
          <NotificationsCount />
        </View>
      </TabButton>
      <TabButton
        Icon={HelpCircle}
        active={pathname === Pathname.ABOUT}
        onPress={() => router.push('/about')}
      />
    </XStack>
  )
}

function TabButton({
  Icon,
  active,
  onPress,
  children,
}: {
  Icon: NamedExoticComponent<{ color: string; strokeWidth: number }>
  active: boolean
  onPress: () => void
  children?: ReactNode
}) {
  return (
    <View py="$3" px="$3" onPress={onPress}>
      <Icon color={active ? '$color12' : '$color11'} strokeWidth={active ? 2.5 : 2} />
      {children}
    </View>
  )
}
