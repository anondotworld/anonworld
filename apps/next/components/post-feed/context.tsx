import { PostCastResponse } from '@/lib/types'
import { generateProofForDelete, generateProofForPromote } from '@anon/api/lib/proof'
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
  promotePost: (hash: string) => Promise<void>
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

      const proof = await generateProofForDelete({
        address: userAddress,
        hash,
        tokenAddress,
        timestamp,
        signature: signatureData.signature,
        messageHash: hashMessage(signatureData.message),
      })
      if (!proof) {
        setDeleteState({ status: 'error', error: 'Not allowed to delete' })
        return
      }

      setDeleteState({ status: 'deleting' })

      let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/delete`, {
        method: 'POST',
        body: JSON.stringify({
          proof: Array.from(proof.proof),
          publicInputs: proof.publicInputs.map((i) => Array.from(i)),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Try aggain
      if (!response.ok) {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/delete`, {
          method: 'POST',
          body: JSON.stringify({
            proof: Array.from(proof.proof),
            publicInputs: proof.publicInputs.map((i) => Array.from(i)),
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }

      if (!response.ok) {
        setDeleteState({ status: 'error', error: 'Failed to delete' })
        return
      }

      // Try again if it failed
      let data: { success: boolean } | undefined = await response.json()
      if (!data?.success) {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/delete`, {
          method: 'POST',
          body: JSON.stringify({
            proof: Array.from(proof.proof),
            publicInputs: proof.publicInputs.map((i) => Array.from(i)),
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        data = await response.json()
      }

      if (data?.success) {
        setDeleteState({ status: 'success' })
      } else {
        setDeleteState({ status: 'error', error: 'Failed to delete' })
      }
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

      const proof = await generateProofForPromote({
        address: userAddress,
        hash,
        tokenAddress,
        timestamp,
        signature: signatureData.signature,
        messageHash: hashMessage(signatureData.message),
      })
      if (!proof) {
        setPromoteState({ status: 'error', error: 'Not allowed to delete' })
        return
      }

      setPromoteState({ status: 'promoting' })

      let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/promote`, {
        method: 'POST',
        body: JSON.stringify({
          proof: Array.from(proof.proof),
          publicInputs: proof.publicInputs.map((i) => Array.from(i)),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Try aggain
      if (!response.ok) {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/promote`, {
          method: 'POST',
          body: JSON.stringify({
            proof: Array.from(proof.proof),
            publicInputs: proof.publicInputs.map((i) => Array.from(i)),
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }

      if (!response.ok) {
        setPromoteState({ status: 'error', error: 'Failed to promote' })
        return
      }

      // Try again if it failed
      let data: { success: true; tweetId: string } | { success: false } | undefined =
        await response.json()
      if (!data?.success) {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/post/promote`, {
          method: 'POST',
          body: JSON.stringify({
            proof: Array.from(proof.proof),
            publicInputs: proof.publicInputs.map((i) => Array.from(i)),
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        data = await response.json()
      }

      if (data?.success) {
        setPromoteState({ status: 'success', tweetId: data.tweetId })
      } else {
        setPromoteState({ status: 'error', error: 'Failed to promote' })
      }
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
