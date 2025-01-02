'use client'

import { About, Auth, NotificationsCount, useAuth } from '@anonworld/react'
import { Image, Text, View } from '@anonworld/ui'
import { Bell, WalletMinimal } from '@tamagui/lucide-icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export enum Pathname {
  HOME = '/',
  NEW = '/new',
  POST = '/posts',
  COMMUNITIES = '/communities',
  CREDENTIALS = '/credentials',
  ABOUT = '/about',
  NOT_FOUND = '/404',
  NOTIFICATIONS = '/notifications',
}

export function Header() {
  const pathname = usePathname() as Pathname
  const { passkeyId } = useAuth()

  return (
    <View
      bbw="$0.5"
      bc="$borderColor"
      bg="$background"
      $platform-web={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <View
        py="$3"
        px="$4"
        jc="space-between"
        ai="center"
        fd="row"
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
                  color={
                    pathname.startsWith(Pathname.COMMUNITIES) ? '$color1' : '$color12'
                  }
                >
                  Communities
                </Text>
              </View>
            </Link>
          </View>
        </View>
        <View fd="row" gap="$3" ai="center">
          <View $xs={{ display: 'none' }}>
            <About />
          </View>
          {passkeyId && (
            <Link
              href={
                pathname === Pathname.NOTIFICATIONS
                  ? Pathname.HOME
                  : Pathname.NOTIFICATIONS
              }
              style={{ textDecoration: 'none' }}
            >
              <View
                bg={pathname === Pathname.NOTIFICATIONS ? '$color12' : '$color1'}
                br="$12"
                disabledStyle={{
                  opacity: 0.5,
                  bg: pathname === Pathname.NOTIFICATIONS ? '$color12' : '$color1',
                }}
                hoverStyle={{
                  opacity: 0.9,
                  bg: pathname === Pathname.NOTIFICATIONS ? '$color12' : '$color5',
                }}
                w={32}
                h={32}
                jc="center"
                ai="center"
                $xs={{ display: 'none' }}
              >
                <Bell
                  size={20}
                  strokeWidth={2.5}
                  color={pathname === Pathname.NOTIFICATIONS ? '$color1' : '$color12'}
                />
                <View position="absolute" top="$0" right="$0">
                  <NotificationsCount />
                </View>
              </View>
            </Link>
          )}
          <Link
            href={
              pathname === Pathname.CREDENTIALS ? Pathname.HOME : Pathname.CREDENTIALS
            }
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
              $xs={{ display: 'none' }}
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
    </View>
  )
}
