import { Image, Popover, ScrollView, Text, XStack } from '@anonworld/ui'
import { Cast, Relationship } from '../../../types'
import { Badge } from '../../badge'
import { ReactNode, useState } from 'react'
import { Farcaster } from '../../svg/farcaster'
import { X } from '../../svg/x'

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
        <Badge icon={<Image src={community.image_url} w={12} h={12} br="$12" />}>
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
                <CommunityItem
                  key={relationship.farcaster?.username}
                  icon={<Farcaster size={12} />}
                  username={relationship.farcaster?.username}
                  onPress={() => {
                    window.open(
                      `https://warpcast.com/${relationship.farcaster?.username}/${relationship.targetId.slice(0, 10)}`,
                      '_blank'
                    )
                  }}
                />
              )
            }
            if (relationship.target === 'twitter' && relationship.twitter?.screen_name) {
              return (
                <CommunityItem
                  key={relationship.twitter?.screen_name}
                  icon={<X size={12} />}
                  username={relationship.twitter?.screen_name}
                  onPress={() => {
                    window.open(
                      `https://x.com/${relationship.twitter?.screen_name}/status/${relationship.targetId}`,
                      '_blank'
                    )
                  }}
                />
              )
            }
            return null
          })}
          <CommunityItem
            username="View community"
            onPress={() => {
              window.location.href = `/communities/${community.id}`
            }}
          />
        </ScrollView>
      </Popover.Content>
    </Popover>
  )
}

function CommunityItem({
  icon,
  username,
  onPress,
}: { icon?: ReactNode; username: string; onPress: () => void }) {
  return (
    <XStack
      gap="$2"
      p="$2"
      hoverStyle={{ bg: '$color5' }}
      bc="$borderColor"
      btw="$0.5"
      ai="center"
      onPress={onPress}
    >
      {icon}
      <Text fos="$1" fow="500">
        {username}
      </Text>
    </XStack>
  )
}
