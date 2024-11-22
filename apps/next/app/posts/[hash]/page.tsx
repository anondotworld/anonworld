'use client'

import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export default function Page({ params }: { params: { hash: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ['post', params.hash],
    queryFn: () => api.getPost(params.hash),
  })

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>Cast not found</div>

  return <div>{`Created by ${data.reveal?.address || 'anoncast'}`}</div>
}
