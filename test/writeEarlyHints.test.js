'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const eh = require('../index')
const { Client } = require('undici')
const { promisify } = require('util')
const sleep = promisify(setTimeout)

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

test('Should add multiple Early Hints headers', async (t) => {
  t.plan(7)
  let _resolve
  const promise = new Promise(function (resolve) {
    _resolve = resolve
  })
  const payload = { hello: 'world' }

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh)
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHints({
      'Content-Security-Policy': 'style-src: self;',
      Link: '</style.css>; rel=preload; as=style'
    })
    await sleep(100)
    await reply.writeEarlyHints([
      { name: 'Link', value: '</image.png>; rel=preload; as=image' }
    ])
    await sleep(400)
    return payload
  })

  await fastify.listen({ port: 0 })

  const client = new Client(`http://localhost:${fastify.server.address().port}`, {
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10
  })
  t.teardown(client.close.bind(client))

  let headerCount = 0
  client.dispatch({
    method: 'GET',
    path: '/'
  }, {
    onConnect () {
      t.pass('connected')
    },
    onError (err) {
      console.log(err)
      t.fail('should not call')
    },
    onUpgrade () {
      t.fail('should not call')
    },
    onHeaders (statusCode, headers) {
      switch (headerCount) {
        case 0: {
          t.equal(statusCode, 103)
          t.same(headers, [
            Buffer.from('Content-Security-Policy'),
            Buffer.from('style-src: self;'),
            Buffer.from('Link'),
            Buffer.from('</style.css>; rel=preload; as=style')
          ])
          break
        }
        case 1: {
          t.equal(statusCode, 103)
          t.same(headers, [
            Buffer.from('Link'),
            Buffer.from('</image.png>; rel=preload; as=image')
          ])
          break
        }
        case 2: {
          t.equal(statusCode, 200)
          break
        }
        default: {
          t.fail('too many header')
          break
        }
      }
      headerCount++
    },
    onData () {
      return true
    },
    onComplete () {
      t.pass('completed')
      _resolve()
    },
    onBodySent () {
      t.fail('should not call')
    }
  })

  await promise
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
