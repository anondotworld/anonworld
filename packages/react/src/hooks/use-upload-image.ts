import { useQuery } from '@tanstack/react-query'
import { useSDK } from '../providers'

export function useUploadImage(file: File | null) {
  const { sdk } = useSDK()

  return useQuery({
    queryKey: ['upload-image', `${file?.name}-${file?.size}`],
    queryFn: async () => {
      if (!file) return null
      const response = await sdk.uploadImage(file)
      return response.data?.data?.link ?? null
    },
    enabled: !!file,
  })
}
