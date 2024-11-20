import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from './ui/button'
import { useBalance } from '@/hooks/use-balance'
import { formatEther } from 'viem'
import { ANON_ADDRESS } from '@anon/utils/src/config'

export const ConnectButton = () => {
  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="font-bold text-md rounded-xl hover:scale-105 transition-all duration-300"
                  >
                    Login
                  </Button>
                )
              }
              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    className="font-bold text-md rounded-xl hover:scale-105 transition-all duration-300"
                  >
                    Switch Network
                  </Button>
                )
              }
              return (
                <button
                  type="button"
                  onClick={openAccountModal}
                  className="flex flex-row rounded-xl overflow-hidden bg-white items-center hover:scale-105 transition-all duration-300"
                >
                  <Balance address={account.address} />
                  <div className="text-md font-bold bg-gray-200 text-black rounded-xl py-1.5 px-3 m-0.5">
                    {account.displayName}
                  </div>
                </button>
              )
            })()}
          </div>
        )
      }}
    </RainbowConnectButton.Custom>
  )
}

function Balance({ address }: { address: string }) {
  const { data } = useBalance(ANON_ADDRESS, address)

  const amount = parseFloat(formatEther(data ?? BigInt(0)))

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
