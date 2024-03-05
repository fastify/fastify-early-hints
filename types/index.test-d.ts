import fastify, { FastifyReply } from 'fastify'
import { expectType } from 'tsd'
import fastifyEarlyHints, { type EarlyHintItem } from '..'

const link = 'Link: </>; as=font; rel=preload'
const earlyHintItem = { href: '', as: 'font', rel: 'preload' } satisfies EarlyHintItem

const runServer = async () => {
  const app = fastify()

  app.register(fastifyEarlyHints, { warn: false })
  app.post('/', async (request, reply: FastifyReply) => {
    expectType<Promise<void>>(reply.writeEarlyHints({ Foo: 'Bar', Array: ['Hello', 'World'] }))
    expectType<Promise<void>>(reply.writeEarlyHints([{ name: 'Foo', value: 'Bar' }]))
    expectType<Promise<void>>(reply.writeEarlyHintsLinks([link]))
    expectType<Promise<void>>(reply.writeEarlyHintsLinks([earlyHintItem]))
    expectType<Promise<void>>(reply.writeEarlyHintsLinks([link, earlyHintItem]))
    reply.send()
  })

  await app.ready()
}
runServer().then(
  console.log.bind(console, 'Success'),
  console.error.bind(console, 'Error')
)
