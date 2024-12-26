import { useQuery } from '@tanstack/react-query'

export function useWebsiteMetadata(url: string) {
  return useQuery({
    queryKey: ['website-metadata', url],
    queryFn: async () => {
      const response = await fetch(`https://api.dub.co/metatags?url=${url}`)
      if (!response.ok) {
        return null
      }
      const data: {
        title: string
        description: string
        image: string
      } = await response.json()
      return data
    },
  })
}
