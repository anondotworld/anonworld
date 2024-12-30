import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Input,
  Text,
  View,
  XStack,
  YStack,
} from '@anonworld/ui'
import { Token } from './context'
import { useSwapTokens } from './context'
import { useToken } from '../../../hooks'
import { ChevronDown } from '@tamagui/lucide-icons'
import { toHslColors } from '../../../utils'
import { LinearGradient } from '@tamagui/linear-gradient'

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
  const { background, secondary } = toHslColors(token.address)
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
        <Avatar circular size={28}>
          <AvatarImage src={data?.image_url} />
          <AvatarFallback>
            <LinearGradient
              colors={[secondary, background]}
              start={[1, 1]}
              end={[0, 0]}
              fg={1}
            />
          </AvatarFallback>
        </Avatar>
        <Text fow="600" fos="$4">
          {data?.symbol}
        </Text>
      </XStack>
    </XStack>
  )
}
