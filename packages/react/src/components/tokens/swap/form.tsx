import { Input, Text, View, XStack, YStack } from '@anonworld/ui'
import { Token } from './context'
import { useSwapTokens } from './context'
import { useToken } from '../../../hooks'
import { ChevronDown } from '@tamagui/lucide-icons'
import { TokenImage } from '../image'

export function SwapForm() {
  const { sellToken, buyToken } = useSwapTokens()
  return (
    <YStack theme="surface1">
      {sellToken && <TokenField token={sellToken} />}
      <View ai="center" jc="center">
        <View
          bw="$0.5"
          bc="$borderColor"
          bg="$background"
          br="$12"
          p="$1.5"
          mt="$-2"
          mb="$-2"
          zi={1}
        >
          <ChevronDown size={16} strokeWidth={2.5} />
        </View>
      </View>
      {buyToken && <TokenField token={buyToken} disabled />}
    </YStack>
  )
}

function TokenField({ token, disabled }: { token: Token; disabled?: boolean }) {
  const { data } = useToken(token)
  if (!data) return null
  return (
    <XStack
      ai="center"
      jc="space-between"
      bc="$borderColor"
      bw="$0.5"
      br="$4"
      p="$4"
      theme="surface1"
      bg="$background"
    >
      <Input
        unstyled
        placeholder="0"
        fow="600"
        fos={24}
        disabled={disabled}
        autoFocus={!disabled}
      />
      <XStack gap="$2" ai="center">
        <TokenImage token={data} />
        <Text fow="600" fos="$4">
          {data.symbol}
        </Text>
      </XStack>
    </XStack>
  )
}
