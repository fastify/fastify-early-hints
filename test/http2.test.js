'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const eh = require('../index')

test('Should throw when http2 server', async (t) => {
  t.plan(1)
  const fastify = Fastify({ http2: true })
  fastify.register(eh)
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHintsLinks([
      'Link: </style.css>; rel=preload; as=style',
      'Link: </script.js>; rel=preload; as=script'
    ])
    return { hello: 'world' }
  })
  t.rejects(fastify.ready(), 'Early Hints cannot be used with a HTTP2 server.')
})
