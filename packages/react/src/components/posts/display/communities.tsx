import { Image, Popover, ScrollView, Text, XStack } from '@anonworld/ui'
import { Cast, Relationship } from '../../../types'
import { Badge } from '../../badge'
import { ReactNode, useState } from 'react'
import { Farcaster } from '../../svg/farcaster'
import { X } from '../../svg/x'
import { Link } from 'solito/link'

export function PostCommunities({ post }: { post: Cast }) {
  const relationshipsByCommunity = post.relationships.reduce(
    (acc, relationship) => {
      if (!relationship.community) return acc
      if (!acc[relationship.community.id]) {
        acc[relationship.community.id] = []
      }
      acc[relationship.community.id].push(relationship)
      return acc
    },
    {} as Record<string, Relationship[]>
  )

  return (
    <XStack gap="$2" jc="flex-end" ai="center">
      {Object.values(relationshipsByCommunity).map((relationships, index) => {
        return <CommunitySelector key={index} relationships={relationships} />
      })}
    </XStack>
  )
}

function CommunitySelector({ relationships }: { relationships: Relationship[] }) {
  const [isOpen, setIsOpen] = useState(false)

  const community = relationships[0].community!

  return (
    <Popover size="$5" placement="bottom" open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger>
        <Badge icon={<Image src={community.image_url} w={16} h={16} br="$12" />}>
          {community.name}
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
        <ScrollView maxHeight="$14">
          {relationships.map((relationship) => {
            if (relationship.target === 'farcaster' && relationship.farcaster?.username) {
              return (
                <Link
                  key={relationship.farcaster?.username}
                  href={`https://warpcast.com/${relationship.farcaster?.username}/${relationship.targetId.slice(0, 10)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CommunityItem
                    icon={<Farcaster size={16} />}
                    username={relationship.farcaster?.username}
                  />
                </Link>
              )
            }
            if (relationship.target === 'twitter' && relationship.twitter?.screen_name) {
              return (
                <Link
                  key={relationship.twitter?.screen_name}
                  href={`https://x.com/${relationship.twitter?.screen_name}/status/${relationship.targetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CommunityItem
                    icon={<X size={16} />}
                    username={relationship.twitter?.screen_name}
                  />
                </Link>
              )
            }
            return null
          })}
          <Link href={`/communities/${community.id}`}>
            <CommunityItem username="View community" bordered />
          </Link>
        </ScrollView>
      </Popover.Content>
    </Popover>
  )
}

function CommunityItem({
  icon,
  username,
  bordered,
}: { icon?: ReactNode; username: string; bordered?: boolean }) {
  return (
    <XStack
      gap="$2"
      p="$2"
      hoverStyle={{ bg: '$color5' }}
      bc={bordered ? '$borderColor' : 'transparent'}
      btw={bordered ? '$0.5' : '0'}
      ai="center"
    >
      {icon}
      <Text fos="$1" fow="500">
        {username}
      </Text>
    </XStack>
  )
}
