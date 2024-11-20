import { api } from '@/lib/api'
import { generateProof, ProofType } from '@anon/utils/src/proofs'
import { createContext, useContext, useState, ReactNode } from 'react'
import { hashMessage } from 'viem'

type DeleteState =
  | {
      status: 'idle' | 'signature' | 'generating' | 'deleting'
    }
  | {
      status: 'success'
    }
  | {
      status: 'error'
      error: string
    }

type PromoteState =
  | {
      status: 'idle' | 'signature' | 'generating' | 'promoting'
    }
  | {
      status: 'success'
      tweetId: string
    }
  | {
      status: 'error'
      error: string
    }

interface PostContextProps {
  deletePost: (hash: string) => Promise<void>
  deleteState: DeleteState
  promotePost: (hash: string) => Promise<string | undefined>
  promoteState: PromoteState
}

const PostContext = createContext<PostContextProps | undefined>(undefined)

export const PostProvider = ({
  tokenAddress,
  userAddress,
  children,
  getSignature,
}: {
  tokenAddress: string
  userAddress?: string
  children: ReactNode
  getSignature: ({
    address,
    timestamp,
  }: { address: string; timestamp: number }) => Promise<
    | {
        signature: string
        message: string
      }
    | undefined
  >
}) => {
  const [deleteState, setDeleteState] = useState<DeleteState>({ status: 'idle' })
  const [promoteState, setPromoteState] = useState<PromoteState>({ status: 'idle' })

  const deletePost = async (hash: string) => {
    if (!userAddress) return

    setDeleteState({ status: 'signature' })
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const signatureData = await getSignature({
        address: userAddress,
        timestamp,
      })
      if (!signatureData) {
        setDeleteState({ status: 'error', error: 'Failed to get signature' })
        return
      }

      setDeleteState({ status: 'generating' })

      const proof = await generateProof({
        tokenAddress,
        userAddress,
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

      setDeleteState({ status: 'deleting' })

      let response = await api.deletePost(
        Array.from(proof.proof),
        proof.publicInputs.map((i) => Array.from(i))
      )

      // Try aggain
      if (!response?.success) {
        response = await api.deletePost(
          Array.from(proof.proof),
          proof.publicInputs.map((i) => Array.from(i))
        )
      }

      if (!response?.success) {
        setDeleteState({ status: 'error', error: 'Failed to delete' })
        return
      }

      setDeleteState({ status: 'success' })
    } catch (e) {
      setDeleteState({ status: 'error', error: 'Failed to delete' })
      console.error(e)
    }
  }

  const promotePost = async (hash: string) => {
    if (!userAddress) return

    setPromoteState({ status: 'signature' })
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const signatureData = await getSignature({
        address: userAddress,
        timestamp,
      })
      if (!signatureData) {
        setPromoteState({ status: 'error', error: 'Failed to get signature' })
        return
      }

      setPromoteState({ status: 'generating' })

      const proof = await generateProof({
        tokenAddress,
        userAddress,
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

      setPromoteState({ status: 'promoting' })

      let response = await api.promotePost(
        Array.from(proof.proof),
        proof.publicInputs.map((i) => Array.from(i))
      )

      if (!response?.success) {
        response = await api.promotePost(
          Array.from(proof.proof),
          proof.publicInputs.map((i) => Array.from(i))
        )
      }

      if (!response?.success) {
        setPromoteState({ status: 'error', error: 'Failed to promote' })
        return
      }

      setPromoteState({ status: 'success', tweetId: response.tweetId })
      return response.tweetId
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
