import React from 'react'
import { Check, ChevronDown } from '@tamagui/lucide-icons'
import { Adapt, Select, Sheet } from 'tamagui'
import { credentials, CredentialType } from '@anonworld/common'

export function CredentialTypeSelect({
  credentialType,
  setCredentialType,
}: {
  credentialType: CredentialType
  setCredentialType: (credentialType: CredentialType) => void
}) {
  return (
    <Select
      value={credentialType}
      onValueChange={setCredentialType}
      disablePreventBodyScroll
      id="type"
    >
      <Select.Trigger iconAfter={ChevronDown}>
        <Select.Value placeholder="Something" />
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
            <Select.Label $xs={{ bg: '$color2' }}>Credential Type</Select.Label>
            {credentials.map(({ type, name }) => (
              <Select.Item key={type} index={0} value={type} $xs={{ bg: '$color2' }}>
                <Select.ItemText>{name}</Select.ItemText>
                <Select.ItemIndicator marginLeft="auto">
                  <Check size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select>
  )
}
