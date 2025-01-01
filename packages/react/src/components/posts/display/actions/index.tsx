import { MoreHorizontal } from '@tamagui/lucide-icons'
import { View } from '@anonworld/ui'
import { PostReveal } from '../../reveal'
import { PostActionsContent } from './content'
import { useState } from 'react'
import { Popover } from '@tamagui/popover'
import { Cast } from '../../../../types'

export function PostActions({ post }: { post: Cast }) {
  const [isOpen, setIsOpen] = useState(false)
  const [postRevealOpen, setPostRevealOpen] = useState(false)

  return (
    <>
      <Popover size="$5" placement="bottom" open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger>
          <View p="$2" br="$12" hoverStyle={{ bg: '$color5' }} cursor="pointer">
            <MoreHorizontal size={20} />
          </View>
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
          userSelect="none"
        >
          {isOpen && (
            <PostActionsContent post={post} setPostRevealOpen={setPostRevealOpen} />
          )}
        </Popover.Content>
      </Popover>
      {isOpen && (
        <PostReveal post={post} open={postRevealOpen} onOpenChange={setPostRevealOpen} />
      )}
    </>
  )
}
