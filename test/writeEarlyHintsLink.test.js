'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const eh = require('../index')
const { Client } = require('undici')

test('Should not add Early Hints', async (t) => {
  t.plan(1)
  const payload = { hello: 'world' }
  const infos = []

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh)
  fastify.get('/', (request, reply) => {
    return payload
  })
  await fastify.listen({ port: 0 })

  const client = new Client(`http://localhost:${fastify.server.address().port}`)
  t.teardown(client.close.bind(client))

  const { body } = await client.request({
    method: 'GET',
    path: '/',
    onInfo: (x) => { infos.push(x) }
  })
  await body.dump()
  t.equal(infos.length, 0)
})

test('Should add Early Hints headers', async (t) => {
  t.plan(6)
  const infos = []

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh)
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHintsLink([
      'Link: </style.css>; rel=preload; as=style',
      'Link: </script.js>; rel=preload; as=script'
    ])
    return { hello: 'world' }
  })
  await fastify.listen({ port: 0 })

  const client = new Client(`http://localhost:${fastify.server.address().port}`)
  t.teardown(client.close.bind(client))

  const { body } = await client.request({
    method: 'GET',
    path: '/',
    onInfo: (x) => { infos.push(x) }
  })
  await body.dump()
  t.equal(infos.length, 1)
  t.equal(infos[0].statusCode, 103)
  t.equal(typeof infos[0].headers === 'object', true)
  t.equal(Array.isArray(infos[0].headers.link), true)
  t.equal(infos[0].headers.link[0], '</style.css>; rel=preload; as=style')
  t.equal(infos[0].headers.link[1], '</script.js>; rel=preload; as=script')
})
