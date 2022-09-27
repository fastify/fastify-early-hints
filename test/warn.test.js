'use strict'

const { test } = require('tap')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const Fastify = require('fastify')
const eh = require('../index')

test('Should not warn on valid entries', (t) => {
  t.plan(4)
  const fastify = Fastify()
  fastify.register(eh, { warn: true })
  fastify.get('/', (req, reply) => {
    reply.eh.add([
      { href: '/style.css', rel: 'preload', as: 'style' },
      { href: '/script.js', rel: 'preload', as: 'script' }
    ])
    return { hello: 'world' }
  })
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.err(new Error('should not have called'))
  }
  fastify.listen({ port: 3001 }, (err) => {
    t.error(err)
    exec('curl -D - http://localhost:3001').then(({ stdout, stderr }) => {
      t.equal(stdout.includes('Link: </style.css>; rel=preload; as=style'), true)
      t.equal(stdout.includes('Link: </script.js>; rel=preload; as=script'), true)
      t.equal(stdout.includes('HTTP/1.1 103 Early Hints'), true)
      fastify.close()
    })
  })
})

test('Should warn on invalid as (FSTEH001)', (t) => {
  t.plan(7)
  const fastify = Fastify()
  fastify.register(eh, { warn: true })
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.equal(warning.name, 'FastifyWarningEarlyHints')
    t.equal(warning.code, 'FSTEH001')
    t.equal(warning.message, 'as attribute invalid.')
  }
  fastify.get('/', (req, reply) => {
    reply.eh.add([
      { href: '/style.css', rel: 'preload', as: 'invalid' },
      { href: '/script.js', rel: 'preload', as: 'script' }
    ])
    return { hello: 'world' }
  })
  fastify.listen({ port: 3001 }, (err) => {
    t.error(err)
    exec('curl -D - http://localhost:3001').then(({ stdout, stderr }) => {
      t.equal(stdout.includes('Link: </style.css>; rel=preload; as=invalid'), true)
      t.equal(stdout.includes('Link: </script.js>; rel=preload; as=script'), true)
      t.equal(stdout.includes('HTTP/1.1 103 Early Hints'), true)
      fastify.close()
    })
  })
})

test('Should warn on invalid cors (FSTEH002)', (t) => {
  t.plan(7)
  const fastify = Fastify()
  fastify.register(eh, { warn: true })
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.equal(warning.name, 'FastifyWarningEarlyHints')
    t.equal(warning.code, 'FSTEH002')
    t.equal(warning.message, 'cors attribute invalid.')
  }
  fastify.get('/', (req, reply) => {
    reply.eh.add([
      { href: '/style.css', rel: 'preload', as: 'style', cors: 'invalid' },
      { href: '/script.js', rel: 'preload', as: 'script' }
    ])
    return { hello: 'world' }
  })
  fastify.listen({ port: 3001 }, (err) => {
    t.error(err)
    exec('curl -D - http://localhost:3001').then(({ stdout, stderr }) => {
      t.equal(stdout.includes('Link: </style.css>; rel=preload; as=style'), true)
      t.equal(stdout.includes('Link: </script.js>; rel=preload; as=script'), true)
      t.equal(stdout.includes('HTTP/1.1 103 Early Hints'), true)
      fastify.close()
    })
  })
})

test('Should warn on invalid rel (FSTEH003)', (t) => {
  t.plan(7)
  const fastify = Fastify()
  fastify.register(eh, { warn: true })
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.equal(warning.name, 'FastifyWarningEarlyHints')
    t.equal(warning.code, 'FSTEH003')
    t.equal(warning.message, 'rel attribute invalid.')
  }
  fastify.get('/', (req, reply) => {
    reply.eh.add([
      { href: '/style.css', rel: 'invalid', as: 'style' },
      { href: '/script.js', rel: 'preload', as: 'script' }
    ])
    return { hello: 'world' }
  })
  fastify.listen({ port: 3001 }, (err) => {
    t.error(err)
    exec('curl -D - http://localhost:3001').then(({ stdout, stderr }) => {
      t.equal(stdout.includes('Link: </style.css>; rel=invalid; as=style'), true)
      t.equal(stdout.includes('Link: </script.js>; rel=preload; as=script'), true)
      t.equal(stdout.includes('HTTP/1.1 103 Early Hints'), true)
      fastify.close()
    })
  })
})

test('Should not warn on invalid as (FSTEH001) if warn is false', (t) => {
  t.plan(4)
  const fastify = Fastify()
  fastify.register(eh, { warn: false })
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.err(new Error('should not be called'))
  }
  fastify.get('/', (req, reply) => {
    reply.eh.add([
      { href: '/style.css', rel: 'preload', as: 'invalid' },
      { href: '/script.js', rel: 'preload', as: 'script' }
    ])
    return { hello: 'world' }
  })
  fastify.listen({ port: 3001 }, (err) => {
    t.error(err)
    exec('curl -D - http://localhost:3001').then(({ stdout, stderr }) => {
      t.equal(stdout.includes('Link: </style.css>; rel=preload; as=invalid'), true)
      t.equal(stdout.includes('Link: </script.js>; rel=preload; as=script'), true)
      t.equal(stdout.includes('HTTP/1.1 103 Early Hints'), true)
      fastify.close()
    })
  })
})

test('Should not warn on invalid cors (FSTEH002) if warn is false', (t) => {
  t.plan(4)
  const fastify = Fastify()
  fastify.register(eh, { warn: false })
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.err(new Error('should not be called'))
  }
  fastify.get('/', (req, reply) => {
    reply.eh.add([
      { href: '/style.css', rel: 'preload', as: 'style', cors: 'invalid' },
      { href: '/script.js', rel: 'preload', as: 'script' }
    ])
    return { hello: 'world' }
  })
  fastify.listen({ port: 3001 }, (err) => {
    t.error(err)
    exec('curl -D - http://localhost:3001').then(({ stdout, stderr }) => {
      t.equal(stdout.includes('Link: </style.css>; rel=preload; as=style'), true)
      t.equal(stdout.includes('Link: </script.js>; rel=preload; as=script'), true)
      t.equal(stdout.includes('HTTP/1.1 103 Early Hints'), true)
      fastify.close()
    })
  })
})

test('Should not warn on invalid rel (FSTEH003) if warn is false', (t) => {
  t.plan(4)
  const fastify = Fastify()
  fastify.register(eh, { warn: false })
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.err(new Error('should not be called'))
  }
  fastify.get('/', (req, reply) => {
    reply.eh.add([
      { href: '/style.css', rel: 'invalid', as: 'style' },
      { href: '/script.js', rel: 'preload', as: 'script' }
    ])
    return { hello: 'world' }
  })
  fastify.listen({ port: 3001 }, (err) => {
    t.error(err)
    exec('curl -D - http://localhost:3001').then(({ stdout, stderr }) => {
      t.equal(stdout.includes('Link: </style.css>; rel=invalid; as=style'), true)
      t.equal(stdout.includes('Link: </script.js>; rel=preload; as=script'), true)
      t.equal(stdout.includes('HTTP/1.1 103 Early Hints'), true)
      fastify.close()
    })
  })
})
