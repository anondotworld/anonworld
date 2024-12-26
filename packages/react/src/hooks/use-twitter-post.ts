import { useQuery } from '@tanstack/react-query'

export function useTwitterPost(identifier: string) {
  return useQuery({
    queryKey: ['twitter-embed', identifier],
    queryFn: async () => {
      const url = new URL(identifier)
      const username = url.pathname.split('/')[1]
      const tweetId = url.pathname.split('/').pop()
      const response = await fetch(
        `https://api.fxtwitter.com/${username}/status/${tweetId}`
      )
      const data: TwitterPost = await response.json()
      return data.tweet
    },
  })
}

type TwitterPost = {
  code: number
  message: string
  tweet: {
    url: string
    id: string
    text: string
    author: {
      id: string
      name: string
      screen_name: string
      avatar_url: string
      banner_url: string
      description: string
      location: string
      url: string
      followers: number
      following: number
      joined: string
      likes: number
      website: any
      tweets: number
      avatar_color: any
    }
    replies: number
    retweets: number
    likes: number
    created_at: string
    created_timestamp: number
    possibly_sensitive: boolean
    views: number
    is_note_tweet: boolean
    community_note: any
    lang: string
    replying_to: string
    replying_to_status: string
    media: {
      all: Array<{
        type: string
        url: string
        width: number
        height: number
        altText: string
      }>
      photos: Array<{
        type: string
        url: string
        width: number
        height: number
        altText: string
      }>
    }
    source: string
    twitter_card: string
    color: any
    provider: string
  }
}
