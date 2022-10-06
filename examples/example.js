const Fastify = require('fastify')
const eh = require('../index')

const fastify = Fastify({ logger: false })
fastify.register(eh)

fastify.get('/', async (request, reply) => {
  await reply.writeEarlyHintsLinks([
    'Link: </style.css>; rel=preload; as=style',
    'Link: </script.js>; rel=preload; as=script'
  ])
  return { hello: 'world' }
})

fastify.get('/style.css', async (request, reply) => {
  return 'body { }'
})
fastify.get('/script.js', async (request, reply) => {
  return 'var v = 0xbadc0ffee'
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
