'use strict'

const { test } = require('tap')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const Fastify = require('fastify')
const eh = require('../')

test('Should not add Early Hints', (t) => {
  t.plan(4)
  const fastify = Fastify()
  fastify.register(eh)
  fastify.get('/', (req, reply) => {
    return { hello: 'world' }
  })
  fastify.listen({ port: 3000 }, (err) => {
    t.error(err)
    exec('curl -D - http://localhost:3000').then(({ stdout, stderr }) => {
      t.equal(stdout.includes('Link: </style.css>; rel=preload; as=style'), false)
      t.equal(stdout.includes('Link: </script.js>; rel=preload; as=script'), false)
      t.equal(stdout.includes('HTTP/1.1 103 Early Hints'), false)
      fastify.close()
    })
  })
})

test('Should add Early Hints headers', (t) => {
  t.plan(4)
  const fastify = Fastify()
  fastify.register(eh)
  fastify.get('/', (req, reply) => {
    reply.eh.add([
      'Link: </style.css>; rel=preload; as=style',
      'Link: </script.js>; rel=preload; as=script'
    ])
    return { hello: 'world' }
  })
  fastify.listen({ port: 3000 }, (err) => {
    t.error(err)
    exec('curl -D - http://localhost:3000').then(({ stdout, stderr }) => {
      t.equal(stdout.includes('Link: </style.css>; rel=preload; as=style'), true)
      t.equal(stdout.includes('Link: </script.js>; rel=preload; as=script'), true)
      t.equal(stdout.includes('HTTP/1.1 103 Early Hints'), true)
      fastify.close()
    })
  })
})
