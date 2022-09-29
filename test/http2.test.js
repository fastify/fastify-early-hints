'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const eh = require('../index')

test('Should throw when http2 server', (t) => {
  t.plan(2)
  const fastify = Fastify({ http2: true })
  fastify.register(eh)
  fastify.get('/', async (req, reply) => {
    await reply.writeEarlyHints([
      'Link: </style.css>; rel=preload; as=style',
      'Link: </script.js>; rel=preload; as=script'
    ])
    return { hello: 'world' }
  })
  fastify.listen({ port: 3000 }, (err) => {
    t.ok(err)
    t.equal(err.message, 'Early Hints cannot be used with a HTTP2 server.')
    fastify.close()
  })
})
