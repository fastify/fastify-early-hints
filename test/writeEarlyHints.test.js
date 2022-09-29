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

  const client = new Client(`http://localhost:${fastify.server.address().port}`, {
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10
  })
  t.teardown(client.close.bind(client))

  const { body } = await client.request({
    method: 'GET',
    path: '/',
    onInfo: (x) => { infos.push(x) }
  })
  await body.dump()
  t.equal(infos.length, 0)
})

test('Should add Early Hints headers - object', async (t) => {
  t.plan(4)
  const payload = { hello: 'world' }
  const infos = []

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh)
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHints({
      Link: '</style.css>; rel=preload; as=style'
    })
    return payload
  })
  await fastify.listen({ port: 0 })

  const client = new Client(`http://localhost:${fastify.server.address().port}`, {
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10
  })
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
  t.equal(infos[0].headers.link, '</style.css>; rel=preload; as=style')
})

test('Should add Early Hints headers - object with array property', async (t) => {
  t.plan(6)
  const payload = { hello: 'world' }
  const infos = []

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh)
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHints({
      Link: ['</style.css>; rel=preload; as=style', '</script.js>; rel=preload; as=script']
    })
    return payload
  })
  await fastify.listen({ port: 0 })

  const client = new Client(`http://localhost:${fastify.server.address().port}`, {
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10
  })
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

test('Should add Early Hints headers - array', async (t) => {
  t.plan(4)
  const payload = { hello: 'world' }
  const infos = []

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh)
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHints([
      { name: 'Link', value: '</style.css>; rel=preload; as=style' }
    ])
    return payload
  })
  await fastify.listen({ port: 0 })

  const client = new Client(`http://localhost:${fastify.server.address().port}`, {
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10
  })
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
  t.equal(infos[0].headers.link, '</style.css>; rel=preload; as=style')
})

test('Should add Early Hints headers - array with same header', async (t) => {
  t.plan(6)
  const payload = { hello: 'world' }
  const infos = []

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh)
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHints([
      { name: 'Link', value: '</style.css>; rel=preload; as=style' },
      { name: 'Link', value: '</script.js>; rel=preload; as=script' }
    ])
    return payload
  })
  await fastify.listen({ port: 0 })

  const client = new Client(`http://localhost:${fastify.server.address().port}`, {
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10
  })
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

test('Should throw when invalid input', async (t) => {
  const inputs = [
    'string',
    42,
    null,
    undefined,
    [{ name: 'Foo', value: 42 }],
    [{ name: 'Foo', value: null }],
    [{ name: 'Foo', value: undefined }],
    [{ name: 'Foo', value: [] }]
  ]
  t.plan(inputs.length)
  const payload = { hello: 'world' }

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh)
  fastify.get('/', async (request, reply) => {
    // invalid input
    for (const input of inputs) {
      try {
        await reply.writeEarlyHints(input)
      } catch (err) {
        t.ok(err)
      }
    }

    return payload
  })
  await fastify.listen({ port: 0 })

  const client = new Client(`http://localhost:${fastify.server.address().port}`, {
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10
  })
  t.teardown(client.close.bind(client))

  const { body } = await client.request({ method: 'GET', path: '/' })
  await body.dump()
})
