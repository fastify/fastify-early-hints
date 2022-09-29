'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const eh = require('../index')
const { Client } = require('undici')

test('Should not warn on valid entries', async (t) => {
  t.plan(6)
  const infos = []

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh, { warn: true })
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHintsLink([
      { href: '/style.css', rel: 'preload', as: 'style' },
      { href: '/script.js', rel: 'preload', as: 'script' }
    ])
    return { hello: 'world' }
  })
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.fail('should not have called')
  }
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

test('Should warn on invalid as (FSTEH001)', async (t) => {
  t.plan(9)
  const infos = []

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh, { warn: true })
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.equal(warning.name, 'FastifyWarningEarlyHints')
    t.equal(warning.code, 'FSTEH001')
    t.equal(warning.message, 'as attribute invalid.')
  }
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHintsLink([
      { href: '/style.css', rel: 'preload', as: 'invalid' },
      { href: '/script.js', rel: 'preload', as: 'script' }
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
  t.equal(infos[0].headers.link[0], '</style.css>; rel=preload; as=invalid')
  t.equal(infos[0].headers.link[1], '</script.js>; rel=preload; as=script')
})

test('Should warn on invalid cors (FSTEH002)', async (t) => {
  t.plan(9)
  const infos = []

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh, { warn: true })
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.equal(warning.name, 'FastifyWarningEarlyHints')
    t.equal(warning.code, 'FSTEH002')
    t.equal(warning.message, 'cors attribute invalid.')
  }
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHintsLink([
      { href: '/style.css', rel: 'preload', as: 'style', cors: 'invalid' },
      { href: '/script.js', rel: 'preload', as: 'script' }
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

test('Should warn on invalid rel (FSTEH003)', async (t) => {
  t.plan(9)
  const infos = []

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh, { warn: true })
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.equal(warning.name, 'FastifyWarningEarlyHints')
    t.equal(warning.code, 'FSTEH003')
    t.equal(warning.message, 'rel attribute invalid.')
  }
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHintsLink([
      { href: '/style.css', rel: 'invalid', as: 'style' },
      { href: '/script.js', rel: 'preload', as: 'script' }
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
  t.equal(infos[0].headers.link[0], '</style.css>; rel=invalid; as=style')
  t.equal(infos[0].headers.link[1], '</script.js>; rel=preload; as=script')
})

test('Should not warn on invalid as (FSTEH001) if warn is false', async (t) => {
  t.plan(6)
  const infos = []

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh, { warn: false })
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.fail('should not have called')
  }
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHintsLink([
      { href: '/style.css', rel: 'preload', as: 'invalid' },
      { href: '/script.js', rel: 'preload', as: 'script' }
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
  t.equal(infos[0].headers.link[0], '</style.css>; rel=preload; as=invalid')
  t.equal(infos[0].headers.link[1], '</script.js>; rel=preload; as=script')
})

test('Should not warn on invalid cors (FSTEH002) if warn is false', async (t) => {
  t.plan(6)
  const infos = []

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh, { warn: false })
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.fail('should not have called')
  }
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHintsLink([
      { href: '/style.css', rel: 'preload', as: 'style', cors: 'invalid' },
      { href: '/script.js', rel: 'preload', as: 'script' }
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

test('Should not warn on invalid rel (FSTEH003) if warn is false', async (t) => {
  t.plan(6)
  const infos = []

  const fastify = Fastify()
  t.teardown(fastify.close.bind(fastify))

  fastify.register(eh, { warn: false })
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.fail('should not have called')
  }
  fastify.get('/', (request, reply) => {
    reply.writeEarlyHintsLink([
      { href: '/style.css', rel: 'invalid', as: 'style' },
      { href: '/script.js', rel: 'preload', as: 'script' }
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
  t.equal(infos[0].headers.link[0], '</style.css>; rel=invalid; as=style')
  t.equal(infos[0].headers.link[1], '</script.js>; rel=preload; as=script')
})
