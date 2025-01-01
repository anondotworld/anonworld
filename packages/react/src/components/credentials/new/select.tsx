import React from 'react'
import { Check, ChevronDown } from '@tamagui/lucide-icons'
import { Adapt, Select, Sheet } from 'tamagui'
import { useNewCredential } from './context'
import { CredentialType } from '../../../types'

export function CredentialTypeSelect() {
  const { credentialType, setCredentialType } = useNewCredential()

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
            <Select.Item
              index={0}
              value={CredentialType.ERC20_BALANCE}
              $xs={{ bg: '$color2' }}
            >
              <Select.ItemText>ERC20 Balance</Select.ItemText>
              <Select.ItemIndicator marginLeft="auto">
                <Check size={16} />
              </Select.ItemIndicator>
            </Select.Item>
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select>
  )
}
