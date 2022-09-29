'use strict'

const fp = require('fastify-plugin')
const formatEntry = require('./lib/formatEntry')
const CRLF = '\r\n'
const EarlyHints = `HTTP/1.1 103 Early Hint${CRLF}`

function fastifyEarlyHints (fastify, opts, next) {
  if (fastify.initialConfig.http2 === true) {
    return next(Error('Early Hints cannot be used with a HTTP2 server.'))
  }

  const formatEntryOpts = {
    warn: opts.warn
  }

  fastify.decorateReply('writeEarlyHints', function (headers) {
    const reply = this
    let message = ''
    if (Array.isArray(headers)) {
      for (const nameValues of headers) {
        if (typeof nameValues === 'object' && typeof nameValues.name === 'string' && typeof nameValues.value === 'string') {
          message += `${nameValues.name}: ${nameValues.value}${CRLF}`
        }
      }
    } else if (typeof headers === 'object' && headers !== null) {
      for (const key of Object.keys(headers)) {
        if (Array.isArray(headers[key])) {
          for (const value of headers[key]) {
            message += `${key}: ${value}${CRLF}`
          }
        } else {
          message += `${key}: ${headers[key]}${CRLF}`
        }
      }
    } else {
      throw Error(`"headers" expected to be object or Array, but recieved ${typeof headers}`)
    }

    return new Promise(function (resolve) {
      if (reply.raw.socket === null) {
        resolve()
        return
      }
      reply.raw.socket.write(`${EarlyHints}${message}${CRLF}`, 'ascii', () => {
        // we do not care the message is sent or lost. Since early hints
        // is metadata to instructs the clients to do action before actual
        // content. It should never affect the final result if it lost.
        resolve()
      })
    })
  })

  // we provide a handy method to write link header only
  fastify.decorateReply('writeEarlyHintsLink', function (links) {
    const reply = this
    let message = ''
    for (let i = 0; i < links.length; i++) {
      message += `${formatEntry(links[i], formatEntryOpts)}${CRLF}`
    }

    return new Promise(function (resolve) {
      if (reply.raw.socket === null) {
        resolve()
        return
      }
      reply.raw.socket.write(`${EarlyHints}${message}${CRLF}`, 'ascii', () => {
        // we do not care the message is sent or lost. Since early hints
        // is metadata to instructs the clients to do action before actual
        // content. It should never affect the final result if it lost.
        resolve()
      })
    })
  })

  next()
}

module.exports = fp(fastifyEarlyHints, {
  fastify: '4.x',
  name: '@fastify/early-hints'
})
