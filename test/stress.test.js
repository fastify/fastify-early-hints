'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const autocannon = require('autocannon')
const fastifyEarlyHints = require('../index')

test('Stress for writeEarlyHints', t => {
  t.plan(8)

  const fastify = Fastify({ logger: false })
  fastify.register(fastifyEarlyHints)
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHints([
      { name: 'Link', value: '</style.css>; rel=preload; as=style' },
      { name: 'Link', value: '</script.js>; rel=preload; as=script' }
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
      t.not(result['1xx'], 0)
      t.not(result['2xx'], 0)
      t.equal(result['3xx'], 0)
      t.equal(result['4xx'], 0)
      t.equal(result['5xx'], 0)
      t.strictSame(Object.keys(result.statusCodeStats), ['103', '200'])
      fastify.close()
    })
  })
})

test('Stress for writeEarlyHintsLinks', t => {
  t.plan(8)

  const fastify = Fastify({ logger: false })
  fastify.register(fastifyEarlyHints)
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHintsLinks([
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
      t.not(result['1xx'], 0)
      t.not(result['2xx'], 0)
      t.equal(result['3xx'], 0)
      t.equal(result['4xx'], 0)
      t.equal(result['5xx'], 0)
      t.strictSame(Object.keys(result.statusCodeStats), ['103', '200'])
      fastify.close()
    })
  })
})
