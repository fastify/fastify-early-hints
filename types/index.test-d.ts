import fastify, { FastifyReply } from 'fastify'
import fastifyEarlyHints, { EarlyHintItem } from '..'
import { expectType } from 'tsd'

const runServer = async () => {
  const app = fastify()

  app.register(fastifyEarlyHints, { warn: false })
  app.post('/', async (req, reply: FastifyReply) => {
    expectType<(content: string[] | EarlyHintItem[]) => Promise<void>>(reply.writeEarlyHints)
    expectType<Promise<void>>(reply.writeEarlyHints(['FOO']))
    reply.send()
  })

  await app.ready()
}
runServer().then(
  console.log.bind(console, 'Success'),
  console.error.bind(console, 'Error')
)
