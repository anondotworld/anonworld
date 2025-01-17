import { YStack, XStack, Text, Spinner, View, Separator } from '@anonworld/ui'
import { PostCredential } from '../posts/display/credential'
import { useLeaderboard } from '../../hooks/use-leaderboard'
import { VaultAvatar } from '../vaults'
import { Link } from 'solito/link'
import { formatAmount, formatHexId } from '@anonworld/common'
import { Badge } from '../badge'
import { Heart, MessageCircle } from '@tamagui/lucide-icons'
import { keccak256 } from 'viem'
import { useCredentials } from '../../providers'
import { useMemo } from 'react'
export { LeaderboardSelector } from './selector'

export function Leaderboard({
  timeframe,
  community,
}: { timeframe: 'all-time' | 'week' | 'last-week'; community?: string }) {
  const { data, isLoading } = useLeaderboard(timeframe, community)
  const { credentials } = useCredentials()

  const hashes = useMemo(() => {
    return credentials.map((c) => keccak256(c.id as `0x${string}`)) as string[]
  }, [credentials])

  if (isLoading) {
    return <Spinner color="$color12" />
  }

  return (
    <YStack gap="$3" $xs={{ gap: '$0', bbw: '$0.5', bc: '$borderColor' }}>
      {data?.map(({ credential, score, posts, likes, replies }, i) => {
        return (
          <Link key={credential.hash} href={`/credentials/${credential.hash}`}>
            <XStack
              jc="space-between"
              theme="surface1"
              themeShallow
              bg="$background"
              bc="$borderColor"
              bw="$0.5"
              p="$3"
              gap="$3"
              br="$4"
              $xs={{
                br: '$0',
                bw: '$0',
                btw: '$0.5',
              }}
              hoverStyle={{ bg: '$color3' }}
              cursor="pointer"
            >
              <View w={24} ai="center" jc="center">
                <Text fos="$2" fow="600">
                  {i + 1}
                </Text>
              </View>
              <Separator vertical />
              <YStack gap="$2" f={1}>
                <XStack jc="space-between" ai="center">
                  <XStack ai="center" gap="$2">
                    <VaultAvatar
                      vaultId={credential.vault_id}
                      imageUrl={credential.vault?.image_url}
                      size={16}
                    />
                    <Text fos="$2" fow="600">
                      {credential.vault_id
                        ? credential.vault?.username || formatHexId(credential.vault_id)
                        : 'Anonymous'}
                    </Text>
                  </XStack>
                  <Text fos="$3" fow="600">
                    {score.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Text>
                </XStack>
                <XStack ai="center" jc="space-between">
                  <XStack gap="$2" ai="center">
                    <PostCredential credential={credential} />
                    {hashes.includes(credential.hash) && <Badge highlight>You</Badge>}
                  </XStack>
                  <Text fos="$2" fow="400" color="$color11">
                    {`${posts} post${posts > 1 ? 's' : ''}`}
                  </Text>
                </XStack>
              </YStack>
            </XStack>
          </Link>
        )
      })}
    </YStack>
  )
}
