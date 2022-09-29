'use strict'

const fp = require('fastify-plugin')
const formatEntry = require('./lib/formatEntry')
const CRLF = '\r\n'
const earlyHintsHeader = `HTTP/1.1 103 Early Hints${CRLF}`

function fastifyEarlyHints (fastify, opts, next) {
  if (fastify.initialConfig.http2 === true) {
    return next(new Error('Early Hints cannot be used with a HTTP2 server.'))
  }

  const formatEntryOpts = {
    warn: opts.warn
  }

  const serialize = function (c) {
    let message = ''
    for (let i = 0; i < c.length; i++) {
      message += `${formatEntry(c[i], formatEntryOpts)}${CRLF}`
    }
    return `${earlyHintsHeader}${message}${CRLF}`
  }

  fastify.decorateReply('writeEarlyHints', function (earlyHints) {
    const raw = this.raw
    const serialized = serialize(earlyHints)
    return new Promise(resolve => {
      if (raw.socket) {
        raw.socket.write(serialized, 'utf-8', resolve)
      } else {
        raw.write(serialized, 'utf-8', resolve)
      }
    })
  })

  next()
}

module.exports = fp(fastifyEarlyHints, {
  fastify: '4.x',
  name: '@fastify/early-hints'
})
