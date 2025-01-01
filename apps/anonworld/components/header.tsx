'use client'

import { About, Auth } from '@anonworld/react'
import { Image, Text, View } from '@anonworld/ui'
import { UsersRound, WalletMinimal } from '@tamagui/lucide-icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

enum Pathname {
  HOME = '/',
  NEW = '/new',
  POST = '/posts',
  COMMUNITIES = '/communities',
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
      $xs={{
        px: '$3',
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
        <View fd="row" gap="$2" ai="center" $xs={{ display: 'none' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <View
              bg={
                pathname === Pathname.HOME ||
                pathname === Pathname.NEW ||
                pathname.startsWith(Pathname.POST)
                  ? '$color12'
                  : '$color1'
              }
              py="$2"
              px="$3"
              br="$12"
              disabledStyle={{
                opacity: 0.5,
                bg:
                  pathname === Pathname.HOME ||
                  pathname === Pathname.NEW ||
                  pathname.startsWith(Pathname.POST)
                    ? '$color12'
                    : '$color1',
              }}
              hoverStyle={{
                opacity: 0.9,
                bg:
                  pathname === Pathname.HOME ||
                  pathname === Pathname.NEW ||
                  pathname.startsWith(Pathname.POST)
                    ? '$color12'
                    : '$color5',
              }}
            >
              <Text
                fow="600"
                fos="$2"
                color={
                  pathname === Pathname.HOME ||
                  pathname === Pathname.NEW ||
                  pathname.startsWith(Pathname.POST)
                    ? '$color1'
                    : '$color12'
                }
              >
                Posts
              </Text>
            </View>
          </Link>
          <Link href="/communities" style={{ textDecoration: 'none' }}>
            <View
              bg={pathname.startsWith(Pathname.COMMUNITIES) ? '$color12' : '$color1'}
              py="$2"
              px="$3"
              br="$12"
              disabledStyle={{
                opacity: 0.5,
                bg: pathname.startsWith(Pathname.COMMUNITIES) ? '$color12' : '$color1',
              }}
              hoverStyle={{
                opacity: 0.9,
                bg: pathname.startsWith(Pathname.COMMUNITIES) ? '$color12' : '$color5',
              }}
            >
              <Text
                fow="600"
                fos="$2"
                color={pathname.startsWith(Pathname.COMMUNITIES) ? '$color1' : '$color12'}
              >
                Communities
              </Text>
            </View>
          </Link>
        </View>
      </View>
      <View fd="row" gap="$3" ai="center" $xs={{ gap: '$2' }}>
        <View display="none" $xs={{ display: 'flex' }}>
          <Link href="/communities" style={{ textDecoration: 'none' }}>
            <View
              bg={pathname.startsWith(Pathname.COMMUNITIES) ? '$color12' : '$color1'}
              br="$12"
              disabledStyle={{
                opacity: 0.5,
                bg: pathname.startsWith(Pathname.COMMUNITIES) ? '$color12' : '$color1',
              }}
              hoverStyle={{
                opacity: 0.9,
                bg: pathname.startsWith(Pathname.COMMUNITIES) ? '$color12' : '$color5',
              }}
              w={32}
              h={32}
              jc="center"
              ai="center"
            >
              <UsersRound
                size={20}
                strokeWidth={2.5}
                color={pathname.startsWith(Pathname.COMMUNITIES) ? '$color1' : '$color12'}
              />
            </View>
          </Link>
        </View>
        <View $xs={{ display: 'none' }}>
          <About />
        </View>
        <Link
          href={pathname === Pathname.CREDENTIALS ? Pathname.HOME : Pathname.CREDENTIALS}
          style={{ textDecoration: 'none' }}
        >
          <View
            bg={pathname === Pathname.CREDENTIALS ? '$color12' : '$color1'}
            br="$12"
            disabledStyle={{
              opacity: 0.5,
              bg: pathname === Pathname.CREDENTIALS ? '$color12' : '$color1',
            }}
            hoverStyle={{
              opacity: 0.9,
              bg: pathname === Pathname.CREDENTIALS ? '$color12' : '$color5',
            }}
            w={32}
            h={32}
            jc="center"
            ai="center"
          >
            <WalletMinimal
              size={20}
              strokeWidth={2.5}
              color={pathname === Pathname.CREDENTIALS ? '$color1' : '$color12'}
            />
          </View>
        </Link>
        <Auth />
      </View>
    </View>
  )
}
