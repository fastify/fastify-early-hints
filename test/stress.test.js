'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const autocannon = require('autocannon')
const fastifyEarlyHints = require('../index')

test('Should not add Early Hints', t => {
  t.plan(5)

  const fastify = Fastify({ logger: false })
  fastify.register(fastifyEarlyHints)
  fastify.get('/', async (request, reply) => {
    await reply.eh.add([
      'Link: </style.css>; rel=preload; as=style',
      'Link: </script.js>; rel=preload; as=script'
    ])
    return { hello: 'world' }
  })

  fastify.listen({ port: 0 }, async (err, address) => {
    t.error(err)
    autocannon({
      url: address,
      amount: 10000
    }, (err, result) => {
      t.error(err)
      t.equal(result['3xx'], 0)
      t.equal(result['4xx'], 0)
      t.equal(result['5xx'], 0)
      fastify.close()
    })
  })
})
