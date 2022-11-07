'use strict'

const { test } = require('tap')
const formatEntry = require('../lib/formatEntry')

test('formatEntry: remove Link: prefix', t => {
  t.plan(1)
  t.equal(formatEntry('Link: </style.css>; rel=preload; as=style'), '</style.css>; rel=preload; as=style')
})

test('formatEntry: entryHint without href attribute should throw an error', t => {
  t.plan(1)
  t.throws(() => formatEntry({}), new TypeError('href attribute is mandatory'))
})

test('formatEntry: entryHint without rel attribute should throw an error', t => {
  t.plan(1)
  t.throws(() => formatEntry({ href: '/' }), new TypeError('rel attribute is mandatory'))
})

test('formatEntry: entryHint should create valid values', t => {
  t.plan(8)
  t.equal(formatEntry({ href: '/', rel: 'preconnect', cors: 'anonymous', as: 'script' }), '</>; rel=preconnect; as=script; crossorigin=anonymous')
  t.equal(formatEntry({ href: '/', rel: 'preconnect', cors: 'use-credentials', as: 'script' }), '</>; rel=preconnect; as=script; crossorigin=use-credentials')
  t.equal(formatEntry({ href: '/', rel: 'preconnect', cors: true, as: 'script' }), '</>; rel=preconnect; as=script; crossorigin')
  t.equal(formatEntry({ href: '/', rel: 'preconnect', cors: 'crossorigin', as: 'script' }), '</>; rel=preconnect; as=script; crossorigin')
  t.equal(formatEntry({ href: '/', rel: 'preconnect', cors: false, as: 'script' }), '</>; rel=preconnect; as=script')
  t.equal(formatEntry({ href: '/', rel: 'preconnect', cors: false }), '</>; rel=preconnect')
  t.equal(formatEntry({ href: '/', rel: 'preconnect' }), '</>; rel=preconnect')
  t.equal(formatEntry({ href: '/', rel: 'preconnect', cors: 'anonymous' }), '</>; rel=preconnect; crossorigin=anonymous')
})

test('formatEntry: check for warning FSTEH001', t => {
  t.plan(4)
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.equal(warning.name, 'FastifyWarningEarlyHints')
    t.equal(warning.code, 'FSTEH001')
    t.equal(warning.message, 'as attribute invalid.')
  }
  t.equal(formatEntry({ href: '/', rel: 'preconnect', cors: false, as: 'invalid' }, { warn: true }), '</>; rel=preconnect; as=invalid')
  t.teardown(() => {
    process.removeAllListeners('warning')
  })
})

test('formatEntry: check for warning FSTEH002', t => {
  t.plan(4)
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.equal(warning.name, 'FastifyWarningEarlyHints')
    t.equal(warning.code, 'FSTEH002')
    t.equal(warning.message, 'cors attribute invalid.')
  }
  t.equal(formatEntry({ href: '/', rel: 'preconnect', cors: 'invalid', as: 'script' }, { warn: true }), '</>; rel=preconnect; as=script')
  t.teardown(() => {
    process.removeAllListeners('warning')
  })
})

test('formatEntry: check for warning FSTEH003', t => {
  t.plan(4)
  process.removeAllListeners('warning')
  process.on('warning', onWarning)
  function onWarning (warning) {
    t.equal(warning.name, 'FastifyWarningEarlyHints')
    t.equal(warning.code, 'FSTEH003')
    t.equal(warning.message, 'rel attribute invalid.')
  }
  t.equal(formatEntry({ href: '/', rel: 'invalid', cors: false, as: 'script' }, { warn: true }), '</>; rel=invalid; as=script')
  t.teardown(() => {
    process.removeAllListeners('warning')
  })
})
