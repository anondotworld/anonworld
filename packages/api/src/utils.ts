import cors from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { Logestic } from 'logestic'

export const createElysia = (config?: ConstructorParameters<typeof Elysia>[0]) =>
  new Elysia(config)
    .use(cors())
    .use(Logestic.preset('common'))
    .onError(({ server, error, path }) => {
      console.log(path, error)
      server?.stop()
      process.exit(1)
    })
