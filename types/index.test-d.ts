import fastify, { FastifyReply } from 'fastify'
import fastifyEarlyHints, { EarlyHint } from '..'
import { expectType } from 'tsd'

const runServer = async () => {
  const app = fastify()

  app.register(fastifyEarlyHints, { warn: false })
  app.post('/', async (req, reply: FastifyReply) => {
    expectType<EarlyHint>(reply.eh)
    expectType<Promise<void>>(reply.eh.add(['FOO']))
    reply.send()
  })

  await app.ready()
}
runServer().then(
  console.log.bind(console, 'Success'),
  console.error.bind(console, 'Error')
)
