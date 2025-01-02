import { Post, FarcasterUser, TwitterUser } from '@anonworld/common'
import { View } from '@anonworld/ui'
import { Farcaster } from '../../svg/farcaster'
import { X } from '../../svg/x'
import { Badge } from '../../badge'
import { Link } from 'solito/link'

export function PostRelationships({ post }: { post: Post }) {
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
        if (r.farcaster)
          return (
            <FarcasterBadge
              key={r.farcaster.username}
              farcaster={r.farcaster}
              id={r.targetId}
            />
          )
        if (r.twitter)
          return (
            <TwitterBadge
              key={r.twitter.screen_name}
              twitter={r.twitter}
              id={r.targetId}
            />
          )
      })}
    </View>
  )
}

function FarcasterBadge({
  farcaster,
  id,
}: {
  farcaster: FarcasterUser
  id: string
}) {
  return (
    <Link href={`https://warpcast.com/~/conversations/${id}`} target="_blank">
      <Badge icon={<Farcaster size={12} />}>{farcaster.username}</Badge>
    </Link>
  )
}

function TwitterBadge({ twitter, id }: { twitter: TwitterUser; id: string }) {
  return (
    <Link href={`https://x.com/${twitter.screen_name}/status/${id}`} target="_blank">
      <Badge icon={<X size={10} />}>{twitter.screen_name}</Badge>
    </Link>
  )
}
