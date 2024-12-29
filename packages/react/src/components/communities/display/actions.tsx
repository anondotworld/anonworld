import { useActions } from '../../../hooks/use-actions'
import { ActionType, Community } from '../../../types'
import { Button, Text, XStack, YStack } from '@anonworld/ui'

export function CommunityActions({ community }: { community: Community }) {
  const { data: actions } = useActions()

  const actionGroups =
    actions?.reduce(
      (acc, action) => {
        if (!action.credential_requirement) return acc
        if (action.credential_requirement.tokenAddress !== community.token_address)
          return acc
        if ('fid' in action.metadata && action.metadata.fid !== community.fid) return acc

        const value = action.credential_requirement.minimumBalance
        if (!acc[value]) {
          acc[value] = []
        }
        acc[value].push(action.type)
        return acc
      },
      {} as Record<string, ActionType[]>
    ) ?? {}

  return (
    <YStack gap="$2">
      <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
        Actions
      </Text>
      {Object.entries(actionGroups).map(([value, types], i) => (
        <CommunityAction key={i} value={value} types={types} />
      ))}
      <Button
        size="$2"
        px="$3"
        bg="$background"
        bc="$borderColor"
        bw="$0.25"
        br="$12"
        hoverStyle={{ opacity: 0.9 }}
      >
        <Text fos="$1">5000 ANON: Post to anoncast</Text>
      </Button>
    </YStack>
  )
}

function CommunityAction({ value, types }: { value: string; types: ActionType[] }) {
  return (
    <XStack>
      <Text>{value}</Text>
      <Text>{types.join(', ')}</Text>
    </XStack>
  )
}
