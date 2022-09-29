import fastify, { FastifyReply } from 'fastify'
import { expectType } from 'tsd'
import fastifyEarlyHints from '..'

const runServer = async () => {
  const app = fastify()

  app.register(fastifyEarlyHints, { warn: false })
  app.post('/', async (request, reply: FastifyReply) => {
    expectType<Promise<void>>(reply.writeEarlyHints({ Foo: 'Bar', Array: ['Hello', 'World'] }))
    expectType<Promise<void>>(reply.writeEarlyHints([{ name: 'Foo', value: 'Bar' }]))
    expectType<Promise<void>>(reply.writeEarlyHintsLink(['FOO']))
    reply.send()
  })

  await app.ready()
}
runServer().then(
  console.log.bind(console, 'Success'),
  console.error.bind(console, 'Error')
)
