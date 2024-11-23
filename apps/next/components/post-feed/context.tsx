import { api } from '@/lib/api'
import { generateProof, ProofType } from '@anon/utils/src/proofs'
import { createContext, useContext, useState, ReactNode } from 'react'
import { hashMessage } from 'viem'
import { useAccount, useSignMessage } from 'wagmi'

type DeleteState =
  | {
      status: 'idle' | 'signature' | 'generating' | 'done'
    }
  | {
      status: 'error'
      error: string
    }

type PromoteState =
  | {
      status: 'idle' | 'signature' | 'generating' | 'done'
    }
  | {
      status: 'error'
      error: string
    }

interface PostContextProps {
  deletePost: (hash: string) => Promise<void>
  deleteState: DeleteState
  promotePost: (hash: string, asReply?: boolean) => Promise<void>
  promoteState: PromoteState
}

const PostContext = createContext<PostContextProps | undefined>(undefined)

export const PostProvider = ({
  tokenAddress,
  children,
}: {
  tokenAddress: string
  children: ReactNode
}) => {
  const [deleteState, setDeleteState] = useState<DeleteState>({ status: 'idle' })
  const [promoteState, setPromoteState] = useState<PromoteState>({ status: 'idle' })
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const getSignature = async ({
    address,
    timestamp,
  }: {
    address: string
    timestamp: number
  }) => {
    try {
      const message = `${address}:${timestamp}`
      const signature = await signMessageAsync({
        message,
      })
      return { signature, message }
    } catch {
      return
    }
  }

  const deletePost = async (hash: string) => {
    if (!address) return

    setDeleteState({ status: 'signature' })
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const signatureData = await getSignature({
        address,
        timestamp,
      })
      if (!signatureData) {
        setDeleteState({ status: 'error', error: 'Failed to get signature' })
        return
      }

      setDeleteState({ status: 'generating' })

      const proof = await generateProof({
        tokenAddress,
        userAddress: address,
        proofType: ProofType.DELETE_POST,
        signature: {
          timestamp,
          signature: signatureData.signature,
          messageHash: hashMessage(signatureData.message),
        },
        input: {
          hash,
        },
      })
      if (!proof) {
        setDeleteState({ status: 'error', error: 'Not allowed to delete' })
        return
      }

      if (process.env.NEXT_PUBLIC_DISABLE_QUEUE) {
        await api.deletePost(
          Array.from(proof.proof),
          proof.publicInputs.map((i) => Array.from(i))
        )
      } else {
        await api.submitAction(
          ProofType.DELETE_POST,
          Array.from(proof.proof),
          proof.publicInputs.map((i) => Array.from(i)),
          {}
        )
      }

      setDeleteState({ status: 'idle' })
    } catch (e) {
      setDeleteState({ status: 'error', error: 'Failed to delete' })
      console.error(e)
    }
  }

  const promotePost = async (hash: string, asReply?: boolean) => {
    if (!address) return

    setPromoteState({ status: 'signature' })
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const signatureData = await getSignature({
        address,
        timestamp,
      })
      if (!signatureData) {
        setPromoteState({ status: 'error', error: 'Failed to get signature' })
        return
      }

      setPromoteState({ status: 'generating' })

      const proof = await generateProof({
        tokenAddress,
        userAddress: address,
        proofType: ProofType.PROMOTE_POST,
        signature: {
          timestamp,
          signature: signatureData.signature,
          messageHash: hashMessage(signatureData.message),
        },
        input: {
          hash,
        },
      })
      if (!proof) {
        setPromoteState({ status: 'error', error: 'Not allowed to delete' })
        return
      }

      if (process.env.NEXT_PUBLIC_DISABLE_QUEUE) {
        await api.promotePost(
          Array.from(proof.proof),
          proof.publicInputs.map((i) => Array.from(i)),
          { asReply }
        )
      } else {
        await api.submitAction(
          ProofType.PROMOTE_POST,
          Array.from(proof.proof),
          proof.publicInputs.map((i) => Array.from(i)),
          { asReply }
        )
      }

      setPromoteState({ status: 'idle' })
    } catch (e) {
      setPromoteState({ status: 'error', error: 'Failed to promote' })
      console.error(e)
    }
  }

  return (
    <PostContext.Provider
      value={{
        deletePost,
        deleteState,
        promotePost,
        promoteState,
      }}
    >
      {children}
    </PostContext.Provider>
  )
}

export const usePost = () => {
  const context = useContext(PostContext)
  if (context === undefined) {
    throw new Error('usePost must be used within a PostProvider')
  }
  return context
}
