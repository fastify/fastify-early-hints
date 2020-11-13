import fastify, { FastifyReply } from 'fastify'
import fastifyEH, { earlyHint } from '..'
import { expectType } from 'tsd'

const runServer = async () => {
  const app = fastify()

  app.register(fastifyEH)
  app.post('/', async (req, reply: FastifyReply) => {
    expectType<earlyHint>(reply.eh)
    expectType<Promise<void>>(reply.eh.inject(['FOO']))
    expectType<void>(reply.eh.add(['FOO']))
    reply.send()
  })

  await app.ready()
}
runServer().then(
  console.log.bind(console, 'Success'),
  console.error.bind(console, 'Error')
)
