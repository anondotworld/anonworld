import { Input, Label, Slider, Text, View, XStack, YStack } from '@anonworld/ui'
import { SubmitButton } from '../components/submit-button'
import { SiwfField } from '../components/siwf-field'
import { useEffect, useMemo } from 'react'
import { NewFarcasterFidProvider, useNewFarcasterFid } from './context'

export function FarcasterFidForm({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) {
  return (
    <NewFarcasterFidProvider isOpen={isOpen} setIsOpen={setIsOpen}>
      <YStack gap="$2">
        <FarcasterFidSiwfField />
        <FidField />
        <FarcasterSubmitButton />
      </YStack>
    </NewFarcasterFidProvider>
  )
}

function FarcasterFidSiwfField() {
  const { connectFarcaster, disconnectFarcaster, farcasterAuth } = useNewFarcasterFid()
  return (
    <SiwfField
      onConnect={connectFarcaster}
      onDisconnect={disconnectFarcaster}
      farcasterAuth={farcasterAuth}
    />
  )
}

function FidField() {
  const { fid, setFid, farcasterAuth } = useNewFarcasterFid()

  const minFid = useMemo(() => {
    return farcasterAuth?.profile?.fid ?? 0
  }, [farcasterAuth])

  useEffect(() => {
    if (farcasterAuth?.profile?.fid) {
      setFid(farcasterAuth.profile.fid)
    }
  }, [farcasterAuth])

  if (!farcasterAuth) return null

  return (
    <YStack>
      <Label fos="$1" fow="400" color="$color11" textTransform="uppercase">
        {`< FID`}
      </Label>
      <Slider
        value={[Math.max(fid, minFid)]}
        max={1_000_000}
        min={minFid}
        step={1000}
        onValueChange={(value) => {
          const rounded = Math.floor(value[0] / 1000) * 1000
          if (minFid <= value[0] && value[0] <= rounded) {
            setFid(value[0])
          } else if (rounded >= minFid) {
            setFid(rounded)
          } else {
            setFid(minFid)
          }
        }}
      >
        <Slider.Track>
          <Slider.TrackActive bg="$color12" />
        </Slider.Track>
        <Slider.Thumb size="$1" index={0} circular />
      </Slider>
      <XStack jc="space-between" mt="$3" ai="center">
        <Input
          unstyled
          value={fid.toString()}
          onChangeText={(value) => setFid(Number(value))}
          bc="$borderColor"
          bw="$0.5"
          br="$2"
          py="$1.5"
          px="$2"
          w="$12"
          theme="surface1"
          bg="$background"
        />
        <View
          onPress={() => setFid(1_000_000)}
          cursor="pointer"
          opacity={0.75}
          hoverStyle={{ opacity: 1 }}
        >
          <Text fos="$2" fow="500">
            Max
          </Text>
        </View>
      </XStack>
    </YStack>
  )
}

function FarcasterSubmitButton() {
  const { handleAddCredential, isLoading, error, fid } = useNewFarcasterFid()
  return (
    <SubmitButton
      onSubmit={handleAddCredential}
      disabled={!fid}
      disabledText="Connect Account"
      isLoading={isLoading}
      error={error}
    />
  )
}
