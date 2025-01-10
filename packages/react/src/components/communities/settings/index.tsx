import {
  Adapt,
  Dialog,
  Sheet,
  Text,
  Unspaced,
  View,
  YStack,
  XStack,
  Input,
  Button,
  Spinner,
} from '@anonworld/ui'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { ActionType, Community, CredentialRequirement } from '@anonworld/common'
import { useSDK } from '../../../providers'
import { useActions, useCommunity } from '../../../hooks'
import { useMutation } from '@tanstack/react-query'
import { X } from '@tamagui/lucide-icons'
import { formatUnits, parseUnits } from 'viem'

export function CommunitySettings({
  community,
  children,
}: {
  community: Community
  children?: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { sdk } = useSDK()
  const { refetch: refetchCommunity } = useCommunity({ id: community.id })
  const { data: actions, refetch: refetchActions } = useActions()

  const [postAmount, setPostAmount] = useState<string>('0')
  const setAmount = (amount: string) => {
    const sanitizedAmount = amount.replace(/[^0-9.]/g, '')
    setPostAmount(sanitizedAmount)
  }

  const postAction = useMemo(() => {
    const action = actions?.find(
      (action) =>
        action.community?.id === community.id &&
        action.type === ActionType.COPY_POST_FARCASTER
    )
    if (!action) return null

    let minimumBalance = '0'
    if (
      action.credential_requirement &&
      'minimumBalance' in action.credential_requirement
    ) {
      minimumBalance = formatUnits(
        BigInt(action.credential_requirement.minimumBalance),
        community.token.decimals
      )
    }

    return {
      id: action.id,
      credential_requirement: action.credential_requirement,
      minimumBalance,
    }
  }, [actions, community.id])

  useEffect(() => {
    if (postAction) {
      setPostAmount(postAction.minimumBalance)
    }
  }, [postAction])

  const { mutate: updateCommunityAction, isPending } = useMutation({
    mutationFn: (args: {
      communityId: string
      type: ActionType
      credentialId: string
      credentialRequirement: CredentialRequirement
    }) => sdk.updateCommunityAction(args),
    onSuccess: () => {
      refetchCommunity()
      refetchActions()
      setIsOpen(false)
    },
  })

  return (
    <Dialog modal open={isOpen} onOpenChange={setIsOpen}>
      {children}

      <Adapt when="sm">
        <Sheet
          animation="quicker"
          zIndex={200000}
          modal
          dismissOnSnapToBottom
          snapPointsMode="fit"
        >
          {isOpen && (
            <Sheet.Frame padding="$3" pb="$5" gap="$3" bg="$color2">
              <Adapt.Contents />
            </Sheet.Frame>
          )}
          <Sheet.Overlay
            animation="quicker"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quicker"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={['transform', 'opacity']}
          animation={[
            'quicker',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
          w={600}
        >
          <Dialog.Title fos="$5">Edit Actions</Dialog.Title>
          <YStack gap="$2">
            <XStack jc="space-between">
              <YStack gap="$1">
                <Text fos="$3" fow="600">
                  Post requirement
                </Text>
                <Text fos="$2" fow="400" color="$color11">
                  {`Users with at least ${postAmount} ${community.token.symbol} can post`}
                </Text>
              </YStack>
            </XStack>
            <Input value={postAmount} onChangeText={setAmount} disabled={isPending} />
          </YStack>
          <YStack gap="$2">
            <Button
              bg="$color12"
              br="$4"
              disabledStyle={{ opacity: 0.5, bg: '$color12' }}
              hoverStyle={{ opacity: 0.9, bg: '$color12' }}
              pressStyle={{ opacity: 0.9, bg: '$color12' }}
              disabled={isPending}
              onPress={() => {
                updateCommunityAction({
                  communityId: community.id,
                  type: ActionType.COPY_POST_FARCASTER,
                  credentialId: `${community.token.type}_BALANCE:${community.token.chain_id}:${community.token.address.toLowerCase()}`,
                  credentialRequirement: {
                    chainId: community.token.chain_id,
                    tokenAddress: community.token.address as `0x${string}`,
                    minimumBalance: parseUnits(
                      postAmount,
                      community.token.decimals
                    ).toString(),
                  },
                })
              }}
            >
              {!isPending ? (
                <Text fos="$3" fow="600" color="$color1">
                  Save
                </Text>
              ) : (
                <XStack gap="$2" alignItems="center">
                  <Spinner color="$color1" />
                  <Text fos="$2" fow="600" color="$color1">
                    Saving
                  </Text>
                </XStack>
              )}
            </Button>
          </YStack>
          <Unspaced>
            <Dialog.Close asChild>
              <View
                bg="$background"
                p="$2"
                br="$12"
                hoverStyle={{ bg: '$color5' }}
                cursor="pointer"
                pos="absolute"
                top="$3"
                right="$3"
              >
                <X size={20} />
              </View>
            </Dialog.Close>
          </Unspaced>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}
