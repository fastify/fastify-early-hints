'use strict'

const fp = require('fastify-plugin')
const formatEntry = require('./lib/formatEntry')
const nativeSupport = require('./lib/support')

function fastifyEarlyHints (fastify, opts, next) {
  let write
  if (nativeSupport === true) {
    // we use native method if possible
    write = require('./lib/protocol/native')
  } else if (fastify.initialConfig.http2 === true) {
    // TODO: remove after node@18 End-of-Life
    // if not, we fallback to our own method for http2
    write = require('./lib/protocol/http2')
  } else {
    // TODO: remove after node@18 End-of-Life
    // if not, we fallback to our own method for http
    write = require('./lib/protocol/http')
  }

  const formatEntryOpts = {
    warn: opts.warn
  }

  function writeEarlyHints (_headers) {
    const reply = this
    let headers = Object.create(null)
    if (Array.isArray(_headers)) {
      // we support more than node native
      // so, we change to the node supported format
      for (const nameValues of _headers) {
        if (typeof nameValues === 'object' && typeof nameValues.name === 'string' && typeof nameValues.value === 'string') {
          if (nameValues.name in headers) {
            if (Array.isArray(headers[nameValues.name])) {
              headers[nameValues.name].push(nameValues.value)
            } else {
              headers[nameValues.name] = [headers[nameValues.name], nameValues.value]
            }
          } else {
            headers[nameValues.name] = nameValues.value
          }
        } else {
          return Promise.reject(Error('"headers" expected to be name-value object'))
        }
      }
    } else if (typeof _headers === 'object' && _headers !== null) {
      headers = _headers
    } else {
      return Promise.reject(Error(`"headers" expected to be object or Array, but received ${typeof headers}`))
    }
    return write(reply, headers)
  }

  function writeEarlyHintsLinks (links) {
    const reply = this
    return write(reply, { Link: links.map((link) => formatEntry(link, formatEntryOpts)) })
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
