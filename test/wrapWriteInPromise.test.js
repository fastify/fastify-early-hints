'use strict'

const { test } = require('tap')
const wrapWriteInPromise = require('../lib/wrapWriteInPromise')
const EarlyHintsWriteError = require('../lib/wrapWriteInPromise').EarlyHintsWriteError

test('wrapWriteInPromise: should resolve', async t => {
  t.plan(3)
  await t.resolves(wrapWriteInPromise({ write: (value, encoding, cb) => {
    t.same(value, 'value')
    t.same(encoding, 'utf-8')
    cb(null)
  }}, 'value', 'utf-8'))
})

test('wrapWriteInPromise: should reject', async t => {
  t.plan(3)
  await t.rejects(wrapWriteInPromise({ write: (value, encoding, cb) => {
    t.same(value, 'value')
    t.same(encoding, 'utf-8')
    cb(new Error('something'))
  }}, 'value', 'utf-8'), new EarlyHintsWriteError())
})