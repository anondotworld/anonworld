'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Credential, useSDK } from '@anonworld/react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { Slider } from './ui/slider'
import { useBalance } from '@/lib/hooks/use-balance'
import { formatEther, formatUnits, parseEther } from 'viem'
import { Input } from './ui/input'
import { timeAgo, TOKEN_ADDRESS } from '@/lib/utils'

export function CredentialsSelect({
  selected,
  onSelect,
}: {
  selected: Credential | null
  onSelect: (credential: Credential | null) => void
}) {
  const { credentials } = useSDK()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    onSelect(credentials.credentials[0] ?? null)
  }, [])

  return (
    <>
      <Select
        value={selected?.id}
        onValueChange={(id) => {
          if (id === 'new') {
            setOpen(true)
          } else {
            onSelect(credentials.get(id) ?? null)
          }
        }}
        key={open ? 'open' : 'closed'}
      >
        <SelectTrigger className="resize-none bg-zinc-950 border border-zinc-700">
          <SelectValue placeholder="Select credential to use..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {credentials.credentials.map((credential) => (
              <SelectItem key={credential.id} value={credential.id}>
                <div className="flex flex-row items-center gap-2">
                  <span className="font-semibold">
                    {`${Number.parseFloat(formatEther(BigInt(credential.metadata.balance))).toLocaleString()} ${
                      credential.metadata.tokenAddress === TOKEN_ADDRESS
                        ? 'ANON'
                        : credential.metadata.tokenAddress
                    }`}
                  </span>
                  <span className="text-sm text-zinc-400">
                    {` • ${timeAgo(credential.verified_at)}`}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
          {credentials.credentials.length > 0 && <SelectSeparator />}
          <SelectGroup>
            <SelectItem value="new" className="font-semibold">
              Add new credential...
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <VerifyCredential
        open={open}
        setOpen={setOpen}
        onVerify={onSelect}
        minBalance={5000}
      />
    </>
  )
}

export function VerifyCredential({
  open,
  setOpen,
  onVerify,
  minBalance,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  onVerify: (credential: Credential) => void
  minBalance: number
}) {
  const [isVerifying, setIsVerifying] = useState(false)
  const { data } = useBalance()
  const maxBalance = data ? Number.parseInt(formatUnits(data, 18)) : 0
  const [balance, setBalance] = useState(minBalance)
  const { credentials } = useSDK()
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    setIsVerifying(true)
    const credential = await credentials.addERC20Balance({
      chainId: 8453,
      tokenAddress: TOKEN_ADDRESS,
      balanceSlot: 0,
      verifiedBalance: parseEther(balance.toString()),
    })
    if (credential) {
      onVerify(credential)
      setIsVerifying(false)
      setOpen(false)
    } else {
      setError('Failed to verify credential')
      setIsVerifying(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add $ANON credential</AlertDialogTitle>
          <AlertDialogDescription>
            Credentials are used to add verified public tags to your posts. All posts on
            anoncast require a credential with a minimum of 5,000 $ANON. Promotions /
            deletions require a minimum of 2,000,000 $ANON.
            <br />
            <br />
            You can verify whatever balance you wish. Note, your anonymity will get weaker
            as you verify higher balances.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2 mt-4">
          <Slider
            value={[balance]}
            onValueChange={([balance]) => setBalance(balance)}
            min={minBalance}
            max={maxBalance}
            step={5000}
          />
          <div className="flex flex-row items-center justify-between">
            <p className="text-sm text-zinc-400">{minBalance.toLocaleString()}</p>
            <p className="text-sm text-zinc-400">{maxBalance.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex flex-row gap-2 items-center mt-2">
          <span className="text-sm whitespace-nowrap">Balance to verify</span>
          <Input
            className="w-32"
            value={balance.toString()}
            onChange={(e) => {
              const value = Number(e.target.value)
              if (!Number.isNaN(value)) {
                setBalance(value)
              }
            }}
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            disabled={balance < minBalance || balance > maxBalance || isVerifying}
            onClick={handleVerify}
          >
            {isVerifying ? (
              <div className="flex flex-row items-center gap-2">
                <Loader2 className="animate-spin" />
                <p>Verifying</p>
              </div>
            ) : (
              <p>Verify</p>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
