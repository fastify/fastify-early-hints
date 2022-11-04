'use strict'

const fp = require('fastify-plugin')
const formatEntry = require('./lib/formatEntry')
const EarlyHints = 'HTTP/1.1 103 Early Hint\r\n'

function fastifyEarlyHints (fastify, opts, next) {
  const http2 = fastify.initialConfig.http2 || false
  const separator = http2
    ? ','
    : '\r\n'

  const formatEntryOpts = {
    warn: opts.warn,
    http2
  }

  function writeEarlyHints (headers) {
    let message = ''
    if (Array.isArray(headers)) {
      for (const nameValues of headers) {
        if (typeof nameValues === 'object' && typeof nameValues.name === 'string' && typeof nameValues.value === 'string') {
          message += `${nameValues.name}: ${nameValues.value}${separator}`
        } else {
          return Promise.reject(Error('"headers" expected to be name-value object'))
        }
      }
    } else if (typeof headers === 'object' && headers !== null) {
      for (const key of Object.keys(headers)) {
        if (Array.isArray(headers[key])) {
          for (const value of headers[key]) {
            message += `${key}: ${value}${separator}`
          }
        } else {
          message += `${key}: ${headers[key]}${separator}`
        }
      }
    } else {
      return Promise.reject(Error(`"headers" expected to be object or Array, but received ${typeof headers}`))
    }

    return write(this, message)
  }

  function writeEarlyHintsLinks (links) {
    let message = ''
    for (let i = 0; i < links.length; i++) {
      message += `${formatEntry(links[i], formatEntryOpts)}${separator}`
    }

    return write(this, message)
  }

  const write = http2
    ? function write (reply, message) {
      return new Promise(function (resolve) {
        if (reply.raw.socket === null) {
          resolve()
          return
        }
        reply.raw.stream.additionalHeaders({
          ':status': 103,
          Link: message
        })
        resolve()
      })
    }
    : function write (reply, message) {
      return new Promise(function (resolve) {
        if (reply.raw.socket === null) {
          resolve()
          return
        }
        reply.raw.socket.write(`${EarlyHints}${message}${separator}`, 'ascii', () => {
        // we do not care the message is sent or lost. Since early hints
        // is metadata to instruct the clients to do something before actual
        // content. It should never affect the final result if it lost.
          resolve()
        })
      })
    }

  fastify.decorateReply('writeEarlyHints', writeEarlyHints)

  // we provide a handy method to write link header only
  fastify.decorateReply('writeEarlyHintsLinks', writeEarlyHintsLinks)

  next()
}

module.exports = fp(fastifyEarlyHints, {
  fastify: '4.x',
  name: '@fastify/early-hints'
})
