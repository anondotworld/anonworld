import { useEffect, useState } from 'react'
import { useAccount, useConfig, useSignMessage } from 'wagmi'
import { concat, hashMessage, keccak256, pad, toHex } from 'viem'
import { AnonWorldSDK } from '@anonworld/sdk'
import { Credential } from '@anonworld/sdk/types'
import { getBlock, getProof } from 'wagmi/actions'

const LOCAL_STORAGE_KEY = 'anon:credentials:v1'

export function useCredentials(sdk: AnonWorldSDK) {
  const [isInitializing, setIsInitializing] = useState(true)
  const [credentials, setCredentials] = useState<Credential[]>([])
  const { signMessageAsync } = useSignMessage()
  const { address } = useAccount()
  const config = useConfig()

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored) {
      try {
        setCredentials(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse stored credentials:', e)
      }
    }
    setIsInitializing(false)
  }, [])

  useEffect(() => {
    if (isInitializing) return
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(credentials))
  }, [credentials])

  const addERC20Balance = async (args: {
    chainId: number
    tokenAddress: `0x${string}`
    balanceSlot: number
    verifiedBalance: bigint
  }) => {
    if (!address) return

    const balanceSlot = pad(toHex(args.balanceSlot))
    const storageKey = keccak256(concat([pad(address), balanceSlot]))
    const block = await getBlock(config, { chainId: args.chainId })
    const proof = await getProof(config, {
      address: args.tokenAddress,
      storageKeys: [storageKey],
      blockNumber: block.number,
    })

    try {
      const message = JSON.stringify({
        chainId: args.chainId.toString(),
        blockNumber: block.number.toString(),
        storageHash: proof.storageHash,
        tokenAddress: args.tokenAddress,
        balanceSlot: args.balanceSlot.toString(),
        balance: args.verifiedBalance.toString(),
      })
      const messageHash = hashMessage(message)
      const signature = await signMessageAsync({ message })

      const credential = await sdk.verifyERC20Balance({
        address,
        signature,
        messageHash,
        storageHash: proof.storageHash,
        storageProof: proof.storageProof,
        chainId: args.chainId,
        blockNumber: block.number,
        tokenAddress: args.tokenAddress,
        balanceSlot,
        verifiedBalance: args.verifiedBalance,
        blockTimestamp: block.timestamp,
      })

      if (credential.error) {
        throw new Error(credential.error.message)
      }

      setCredentials((prev) => [...prev, credential.data!])

      return credential
    } catch (e) {
      console.error('Failed to add credential:', e)
    }
  }

  const remove = (id: string) => {
    setCredentials((prev) => prev.filter((cred) => cred.id !== id))
  }

  const get = (id: string) => {
    return credentials.find((cred) => cred.id === id)
  }

  return {
    credentials,
    remove,
    get,
    addERC20Balance,
  }
}
