'use client'

import { About } from '@anonworld/react'
import { Image, Text, View } from '@anonworld/ui'
import { WalletMinimal } from '@tamagui/lucide-icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

enum Pathname {
  HOME = '/',
  NEW = '/new',
  POST = '/posts',
  ACCOUNTS = '/accounts',
  CREDENTIALS = '/credentials',
  ABOUT = '/about',
  NOT_FOUND = '/404',
}

export function Header() {
  const pathname = usePathname() as Pathname

  return (
    <View
      py="$3"
      px="$4"
      jc="space-between"
      ai="center"
      fd="row"
      bbw="$0.5"
      bc="$borderColor"
      bg="$background"
      $platform-web={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <View fd="row" gap="$8" ai="center">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <View fd="row" gap="$2" ai="center">
            <Image src="/logo.svg" alt="anon.world" width={32} height={32} />
            <Text fow="600" fos="$3">
              ANON.WORLD
            </Text>
          </View>
        </Link>
        <View fd="row" gap="$2" ai="center">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <View
              bg="$background"
              py="$2"
              px="$3"
              br="$12"
              themeInverse={
                pathname === Pathname.HOME ||
                pathname === Pathname.NEW ||
                pathname.startsWith(Pathname.POST)
              }
              hoverStyle={{ bg: '$color5' }}
            >
              <Text fow="600" fos="$2">
                Posts
              </Text>
            </View>
          </Link>
          <Link href="/accounts" style={{ textDecoration: 'none' }}>
            <View
              bg="$background"
              py="$2"
              px="$3"
              br="$12"
              themeInverse={pathname === Pathname.ACCOUNTS}
              hoverStyle={{ bg: '$color5' }}
            >
              <Text fow="600" fos="$2">
                Accounts
              </Text>
            </View>
          </Link>
        </View>
      </View>
      <View fd="row" gap="$3" ai="center">
        <Link
          href={pathname === Pathname.CREDENTIALS ? Pathname.HOME : Pathname.CREDENTIALS}
          style={{ textDecoration: 'none' }}
        >
          <View
            bg="$background"
            p="$2"
            br="$12"
            themeInverse={pathname === Pathname.CREDENTIALS}
            hoverStyle={{ bg: '$color5' }}
          >
            <WalletMinimal size={20} strokeWidth={2.5} />
          </View>
        </Link>
        <About />
      </View>
    </View>
  )
}
