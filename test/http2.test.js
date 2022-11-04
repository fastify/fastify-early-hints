'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const eh = require('../index')
const http2 = require('http2')

test('initial test', (t) => {
  t.plan(3)
  const fastify = Fastify({ http2: true })
  fastify.register(eh)
  fastify.get('/', async (request, reply) => {
    await reply.writeEarlyHintsLinks([
      '</style.css>; rel=preload; as=style',
      '</script.js>; rel=preload; as=script'
    ])
    return { hello: 'world' }
  })

  fastify.listen({ port: 0 }, (err, address) => {
    t.error(err)
    const client = http2.connect(address)
    const req = client.request()

    req.on('headers', (header) => {
      t.equal(header[':status'], 103)
      t.equal(header.link, '</style.css>; rel=preload; as=style,</script.js>; rel=preload; as=script,')
      req.end()
      client.close()
      fastify.close()
    })

    req.on('error', err => t.error(err))
  })
})
