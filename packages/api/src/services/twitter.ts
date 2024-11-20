import { SendTweetV2Params, TwitterApi } from 'twitter-api-v2'
import { Cast } from './types'
import https from 'https'

export const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY as string,
  appSecret: process.env.TWITTER_API_SECRET as string,
  accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET as string,
})

export async function promoteToTwitter(cast: Cast) {
  const twitterEmbed = cast.embeds?.find(
    (e) => e.url?.includes('x.com') || e.url?.includes('twitter.com')
  )

  let quoteTweetId: string | undefined
  if (twitterEmbed && twitterEmbed.url) {
    const url = new URL(twitterEmbed.url)
    const tweetId = url.pathname.split('/').pop()
    if (tweetId) {
      quoteTweetId = tweetId
    }
  }

  const otherEmbeds = cast.embeds?.filter(
    (e) =>
      !e.url?.includes('x.com') &&
      !e.url?.includes('twitter.com') &&
      !e.metadata?.content_type?.startsWith('image')
  )

  const usedUrls = new Set<string>()

  let text = cast.text
  for (const embed of otherEmbeds) {
    if (embed.url) {
      if (!usedUrls.has(embed.url)) {
        text += `\n\n${embed.url}`
        usedUrls.add(embed.url)
      }
    } else if (embed.cast) {
      const url = `https://warpcast.com/${
        embed.cast.author.username
      }/${embed.cast.hash.slice(0, 10)}`
      if (!usedUrls.has(url)) {
        text += `\n\n${url}`
        usedUrls.add(url)
      }
    }
  }

  const image = cast.embeds?.find((e) =>
    e.metadata?.content_type?.startsWith('image')
  )?.url

  return await formatAndSubmitToTwitter(text, image, quoteTweetId)
}

async function formatAndSubmitToTwitter(
  text: string,
  image?: string,
  quoteTweetId?: string
) {
  try {
    let mediaId: string | undefined
    if (image) {
      const { data: binaryData, mimeType } = await new Promise<{
        data: Buffer
        mimeType: string
      }>((resolve, reject) => {
        https
          .get(image, (res) => {
            res.setEncoding('binary')
            let data = Buffer.alloc(0)

            res.on('data', (chunk) => {
              data = Buffer.concat([data, Buffer.from(chunk, 'binary')])
            })
            res.on('end', () => {
              const mimeType = res.headers['content-type'] || 'image/jpeg'
              resolve({ data, mimeType })
            })
          })
          .on('error', (e) => {
            reject(e)
          })
      })
      mediaId = await twitterClient.v1.uploadMedia(binaryData as unknown as Buffer, {
        mimeType,
      })
    }

    const params: SendTweetV2Params = {}
    if (mediaId) {
      params.media = {
        media_ids: [mediaId],
      }
    }

    if (quoteTweetId) {
      params.quote_tweet_id = quoteTweetId
    }

    const result = await twitterClient.v2.tweet(text, params)

    if (result?.data?.id) {
      return result.data.id
    }
  } catch (e) {
    console.error(e)
  }
}
