import { Cast, FarcasterAccount, TwitterAccount } from '../../../types'
import { View } from '@anonworld/ui'
import { Farcaster } from '../../svg/farcaster'
import { X } from '../../svg/x'
import { Badge } from '../../badge'

export function PostRelationships({ post }: { post: Cast }) {
  const relationships = post.relationships.sort((a, b) => {
    if (a.farcaster && !b.farcaster) return -1
    if (b.farcaster && !a.farcaster) return 1
    if (a.twitter && !b.twitter) return -1
    if (b.twitter && !a.twitter) return 1
    return 0
  })

  return (
    <View fd="row" gap="$2" ai="center">
      {relationships.map((r) => {
        if (r.farcaster) return <FarcasterBadge farcaster={r.farcaster} id={r.targetId} />
        if (r.twitter) return <TwitterBadge twitter={r.twitter} id={r.targetId} />
      })}
    </View>
  )
}

function FarcasterBadge({ farcaster, id }: { farcaster: FarcasterAccount; id: string }) {
  return (
    <Badge
      onPress={() => {
        window.open(`https://warpcast.com/~/conversations/${id}`, '_blank')
      }}
      icon={<Farcaster size={12} />}
    >
      {farcaster.username}
    </Badge>
  )
}

function TwitterBadge({ twitter, id }: { twitter: TwitterAccount; id: string }) {
  return (
    <Badge
      onPress={() => {
        window.open(`https://x.com/${twitter.screen_name}/status/${id}`, '_blank')
      }}
      icon={<X size={10} />}
    >
      {twitter.screen_name}
    </Badge>
  )
}
