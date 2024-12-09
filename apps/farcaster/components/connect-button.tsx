'use client'

import { useAuth } from '@/lib/context/auth'
import { Button } from './ui/button'
import { useBalance } from '@/lib/hooks/use-balance'
import { formatEther } from 'viem'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu'
import { DropdownMenuTrigger } from './ui/dropdown-menu'
import { LogOut } from 'lucide-react'

export const ConnectButton = () => {
  const { siwe, signIn, signOut, context } = useAuth()

  if (!siwe) {
    return (
      <Button
        onClick={signIn}
        className="font-bold text-md rounded-md hover:scale-105 transition-all duration-300"
      >
        Sign In
      </Button>
    )
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-row rounded-md overflow-hidden bg-white items-center hover:scale-105 transition-all duration-300 cursor-pointer">
          <Balance />
          <div className="text-md font-bold bg-gray-200 text-black rounded-md py-1.5 px-3 m-0.5">
            {context?.user?.username}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem onClick={signOut} className="cursor-pointer">
          <LogOut className="text-red-500" />
          <span className="text-red-500">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Balance() {
  const { data } = useBalance()

  const amount = Number.parseFloat(formatEther(data ?? BigInt(0)))

  return (
    <div className="text-md font-bold bg-white text-black pl-3 pr-2">
      {`${formatNumber(amount)} ANON`}
    </div>
  )
}

function formatNumber(num: number) {
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M`
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(2)}K`
  }
  return num.toFixed(2)
}
