import {
  Adapt,
  Button,
  Image,
  Input,
  Select,
  Sheet,
  Spinner,
  Text,
  useDebounceValue,
  View,
  XStack,
  YStack,
} from '@anonworld/ui'
import {
  CheckCircle,
  Coins,
  DollarSign,
  Image as ImageIcon,
  WalletMinimal,
  XCircle,
} from '@tamagui/lucide-icons'
import { useNewCommunity } from './context'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth, useCredentials } from '../../../providers'
import { CredentialType } from '@anonworld/common'
import { useToken } from '../../../hooks'
import { TokenImage } from '../../tokens/image'
import { useUploadImage } from '../../../hooks/use-upload-image'
import { useCheckFnameAvailability } from '../../../hooks/use-check-fname-availability'

export function NewCommunityForm() {
  const { tokenType, token } = useNewCommunity()
  return (
    <YStack gap="$4" mt="$2">
      <View bg="$green1" p="$3" br="$4" bc="$green8" bw="$0.5">
        <Text fos="$2" fow="400" color="$green12">
          Communities are groups of users with shared credentials. Every community is
          backed by a token, a shared Farcaster account, and a shared wallet. Members of a
          community can take anonymous actions on behalf of the community, such as posting
          to Farcaster.
        </Text>
      </View>
      <YStack gap="$2">
        <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
          Community Details
        </Text>
        <XStack gap="$3" ai="center">
          <ImageField />
          <YStack gap="$3" f={1}>
            <NameField />
            <DescriptionField />
          </YStack>
        </XStack>
      </YStack>
      <FarcasterUsernameField />
      <YStack gap="$2">
        <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
          Token Details
        </Text>
        <View gap="$4" p="$3" bg="$color2" br="$4" bc="$borderColor" bw="$0.5">
          <TokenTypeSelector />
          <XStack ai="center" jc="space-between">
            {tokenType === 'new' && <TickerField />}
            {tokenType === 'existing' && <CredentialField />}
            {(tokenType === 'new' || (token && token.contractType === 'ERC20')) && (
              <AmountField />
            )}
          </XStack>
        </View>
      </YStack>
      <PasskeyField />
      <SubmitButton />
    </YStack>
  )
}

function NameField() {
  const { name, setName, isLoading } = useNewCommunity()
  return (
    <Input placeholder="Name" value={name} onChangeText={setName} disabled={isLoading} />
  )
}

function DescriptionField() {
  const { description, setDescription, isLoading } = useNewCommunity()
  return (
    <Input
      placeholder="Description"
      value={description}
      onChangeText={setDescription}
      disabled={isLoading}
    />
  )
}

function FarcasterUsernameField() {
  const { setUsername, isLoading } = useNewCommunity()
  const [value, setValue] = useState('')

  const debouncedValue = useDebounceValue(value, 1000)
  const { data: available, isLoading: isChecking } =
    useCheckFnameAvailability(debouncedValue)

  useEffect(() => {
    if (available) {
      setUsername(debouncedValue)
    } else {
      setUsername('')
    }
  }, [available])

  const handleSetValue = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    const noLeadingHyphens = sanitized.replace(/^-+/, '')
    const truncated = noLeadingHyphens.slice(0, 16)
    setValue(truncated)
  }

  return (
    <YStack gap="$2">
      <XStack gap="$2" ai="center">
        <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
          Farcaster Username
        </Text>
        {!available && debouncedValue !== '' && (
          <Text fos="$2" fow="400" color="$red11">
            Username is not available
          </Text>
        )}
      </XStack>
      <View pos="relative">
        <Input
          placeholder="Username"
          value={value}
          onChangeText={handleSetValue}
          disabled={isLoading || isChecking}
        />
        <View pos="absolute" t="$0" b="$0" r="$2.5" jc="center" ai="center">
          {isChecking ? (
            <Spinner color="$color11" />
          ) : available ? (
            <CheckCircle size={16} color="$green11" />
          ) : debouncedValue !== '' ? (
            <XCircle size={16} color="$red11" />
          ) : null}
        </View>
      </View>
    </YStack>
  )
}

function ImageField() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { data, isLoading: isUploading } = useUploadImage(selectedFile)
  const { imageUrl, setImageUrl, isLoading } = useNewCommunity()

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      return
    }

    setSelectedFile(file)
  }

  useEffect(() => {
    if (data) {
      setImageUrl(data)
    }
  }, [data])

  return (
    <View position="relative">
      <input
        ref={fileInputRef}
        type="file"
        multiple={false}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageSelect}
      />
      <View
        w="$10"
        h="$10"
        br="$4"
        bc="$borderColor"
        bw="$0.5"
        bg="$background"
        theme="surface1"
        overflow="hidden"
        onPress={(e) => {
          if (isLoading || isUploading) return
          e.stopPropagation()
          e.preventDefault()
          fileInputRef.current?.click()
        }}
        hoverStyle={{ bg: '$color5' }}
        cursor="pointer"
      >
        {isUploading ? (
          <View f={1} ai="center" jc="center">
            <Spinner color="$color12" />
          </View>
        ) : imageUrl ? (
          <Image w="$10" h="$10" br="$4" bc="$borderColor" bw="$0.5" src={imageUrl} />
        ) : (
          <YStack f={1} ai="center" jc="center" gap="$1">
            <ImageIcon color="$color10" />
            <Text fos="$2" fow="400" color="$color10">
              Image
            </Text>
          </YStack>
        )}
      </View>
    </View>
  )
}

function TokenTypeSelector() {
  const { tokenType, setTokenType } = useNewCommunity()
  return (
    <XStack ai="center" w="100%" jc="space-between" userSelect="none">
      <View
        bg={tokenType === 'new' ? '$color5' : '$color3'}
        p="$3"
        br="$4"
        bc={tokenType === 'new' ? '$color10' : '$borderColor'}
        bw="$0.5"
        onPress={() => setTokenType('new')}
        w="49%"
        cursor="pointer"
      >
        <XStack gap="$2" ai="center">
          <Coins size={16} color={tokenType === 'new' ? '$color12' : '$color11'} />
          <Text fos="$2" fow="500" color={tokenType === 'new' ? '$color12' : '$color11'}>
            Launch a new token
          </Text>
        </XStack>
      </View>
      <View
        bg={tokenType === 'existing' ? '$color5' : '$color3'}
        p="$3"
        br="$4"
        bc={tokenType === 'existing' ? '$color10' : '$borderColor'}
        bw="$0.5"
        onPress={() => setTokenType('existing')}
        w="49%"
        cursor="pointer"
      >
        <XStack gap="$2" ai="center">
          <WalletMinimal
            size={16}
            color={tokenType === 'existing' ? '$color12' : '$color11'}
          />
          <Text
            fos="$2"
            fow="500"
            color={tokenType === 'existing' ? '$color12' : '$color11'}
          >
            From an existing credential
          </Text>
        </XStack>
      </View>
    </XStack>
  )
}

function TickerField() {
  const { symbol, setSymbol, isLoading } = useNewCommunity()

  const handleChange = (text: string) => {
    const sanitizedText = text.toUpperCase().replace(/[^A-Z]/g, '')
    setSymbol(sanitizedText)
  }

  return (
    <YStack gap="$2" w="49%">
      <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
        Ticker
      </Text>
      <XStack pos="relative" w="100%">
        <Input
          pl="$6"
          value={symbol}
          onChangeText={handleChange}
          w="100%"
          placeholder="TICKER"
          disabled={isLoading}
        />
        <View pos="absolute" t="$0" b="$0" l="$2.5" jc="center" ai="center">
          <DollarSign size={16} />
        </View>
      </XStack>
    </YStack>
  )
}

function AmountField() {
  const { postAmount, setPostAmount, symbol, isLoading } = useNewCommunity()

  const setAmount = (amount: string) => {
    const sanitizedAmount = amount.replace(/[^0-9.]/g, '')
    setPostAmount(sanitizedAmount)
  }

  return (
    <YStack gap="$2" w="49%">
      <Text
        fos="$1"
        fow="400"
        color="$color11"
        textTransform="uppercase"
        numberOfLines={1}
      >
        {symbol ? `$${symbol} required to post` : 'Amount required to post'}
      </Text>
      <Input
        pr="$10"
        value={postAmount}
        onChangeText={setAmount}
        placeholder="0"
        disabled={isLoading}
      />
    </YStack>
  )
}

function CredentialField() {
  const { credentials } = useCredentials()
  const { token, setToken, isLoading } = useNewCommunity()

  const uniqueTokens = useMemo(() => {
    const tokens: {
      id: string
      contractType: string
      chainId: number
      address: string
    }[] = []
    for (const credential of credentials) {
      if (
        credential.type !== CredentialType.ERC20_BALANCE &&
        credential.type !== CredentialType.ERC721_BALANCE
      ) {
        continue
      }

      const id = `${credential.metadata.chainId}:${credential.metadata.tokenAddress}`
      if (tokens.find((t) => t.id === id)) {
        continue
      }

      tokens.push({
        id,
        contractType:
          credential.type === CredentialType.ERC20_BALANCE ? 'ERC20' : 'ERC721',
        chainId: credential.metadata.chainId,
        address: credential.metadata.tokenAddress,
      })
    }
    return tokens
  }, [credentials])

  const selectedToken = useMemo(() => {
    if (!token) return null
    return uniqueTokens.find((t) => t.id === `${token.chainId}:${token.address}`)
  }, [token, uniqueTokens])

  function CredentialValue({
    token,
  }: {
    token: { contractType: string; chainId: number; address: string }
  }) {
    const { data } = useToken({ chainId: token.chainId, address: token.address })
    if (!data) return null
    return (
      <XStack gap="$2" ai="center" jc="space-between" w="100%">
        <XStack gap="$2" ai="center">
          <TokenImage token={data} />
          <Text fos="$2">{token.contractType === 'ERC20' ? data.symbol : data.name}</Text>
        </XStack>
        <Text fos="$2" fow="400" color="$color11">
          {token.contractType}
        </Text>
      </XStack>
    )
  }

  return (
    <YStack gap="$2" w="49%">
      <Text fos="$1" fow="400" color="$color11" textTransform="uppercase">
        Token
      </Text>
      <Select
        value={token?.id}
        onValueChange={(id) => {
          if (isLoading) return
          setToken(uniqueTokens.find((token) => token.id === id))
        }}
        disablePreventBodyScroll
      >
        <Select.Trigger>
          {!selectedToken ? (
            <Select.Value placeholder="Select a token" fos="$2" />
          ) : (
            <CredentialValue token={selectedToken} />
          )}
        </Select.Trigger>

        <Adapt when="sm" platform="touch">
          <Sheet
            animation="quicker"
            zIndex={200000}
            modal
            dismissOnSnapToBottom
            snapPointsMode="fit"
          >
            <Sheet.Frame padding="$3" pb="$5" gap="$3" bg="$color2">
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            <Sheet.Overlay
              animation="lazy"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
          </Sheet>
        </Adapt>

        <Select.Content zIndex={200000}>
          <Select.Viewport minWidth={200}>
            <Select.Group>
              <Select.Label $xs={{ bg: '$color2' }}>Select a token</Select.Label>
              {useMemo(
                () =>
                  uniqueTokens.map((token, index) => (
                    <Select.Item
                      key={token.id}
                      index={index}
                      value={token.id}
                      $xs={{ bg: '$color2' }}
                    >
                      <CredentialValue token={token} />
                    </Select.Item>
                  )),
                [uniqueTokens]
              )}
            </Select.Group>
          </Select.Viewport>
        </Select.Content>
      </Select>
    </YStack>
  )
}

function PasskeyField() {
  const { passkeyId, authenticate } = useAuth()

  if (passkeyId) return null

  return (
    <View bg="$red1" p="$3" br="$4" bc="$red8" bw="$0.5">
      <XStack gap="$2" ai="center">
        <Text fos="$2" fow="400" color="$red12">
          You are not logged in. You will not be able to edit this community after
          creation.
        </Text>
        <Button
          size="$2.5"
          bg="$color12"
          br="$4"
          bw="$0"
          disabledStyle={{ opacity: 0.5, bg: '$color12' }}
          hoverStyle={{ opacity: 0.9, bg: '$color12' }}
          pressStyle={{ opacity: 0.9, bg: '$color12' }}
          onPress={authenticate}
        >
          <Text fos="$2" fow="600" color="$color1">
            Login
          </Text>
        </Button>
      </XStack>
    </View>
  )
}

function SubmitButton() {
  const {
    name,
    description,
    imageUrl,
    username,
    symbol,
    tokenType,
    token,
    postAmount,
    createCommunity,
    isLoading,
  } = useNewCommunity()

  const disabled =
    !name ||
    !description ||
    !imageUrl ||
    !username ||
    !postAmount ||
    (tokenType === 'new' && !symbol) ||
    (tokenType === 'existing' && !token)

  return (
    <YStack gap="$2">
      {isLoading && (
        <Text color="$color11" fos="$1" textAlign="center" mt="$-2">
          Please wait. This may take a few seconds.
        </Text>
      )}
      <Button
        bg="$color12"
        br="$4"
        disabled={disabled}
        disabledStyle={{ opacity: 0.5, bg: '$color12' }}
        hoverStyle={{ opacity: 0.9, bg: '$color12' }}
        pressStyle={{ opacity: 0.9, bg: '$color12' }}
        onPress={createCommunity}
      >
        {!isLoading ? (
          <Text fos="$3" fow="600" color="$color1">
            Create Community
          </Text>
        ) : (
          <XStack gap="$2" alignItems="center">
            <Spinner color="$color1" />
            <Text fos="$2" fow="600" color="$color1">
              Creating Community
            </Text>
          </XStack>
        )}
      </Button>
    </YStack>
  )
}
