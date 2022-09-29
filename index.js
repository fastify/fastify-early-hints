'use strict'

const fp = require('fastify-plugin')
const formatEntry = require('./lib/formatEntry')
const CRLF = '\r\n'

function fastifyEarlyHints (fastify, opts, next) {
  if (fastify.initialConfig.http2 === true) {
    return next(new Error('Early Hints cannot be used with a HTTP2 server.'))
  }

  const formatEntryOpts = {
    warn: opts.warn
  }

  function earlyHints (reply) {
    const promiseBuffer = []
    const serialize = function (c) {
      let message = `HTTP/1.1 103 Early Hints${CRLF}`
      for (let i = 0; i < c.length; i++) {
        message += `${formatEntry(c[i], formatEntryOpts)}${CRLF}`
      }
      return `${message}${CRLF}`
    }

    return {
      close: async function () {
        if (promiseBuffer.length) {
          await Promise.all(promiseBuffer)
        }
      },
      add: function (content) {
        const p = new Promise(resolve => {
          if (reply.raw.socket) {
            reply.raw.socket.write(serialize(content), 'utf-8', resolve)
          } else {
            reply.raw.write(serialize(content), 'utf-8', resolve)
          }
        })
        promiseBuffer.push(p)
        return p
      }
    }
  }

  function onRequest (request, reply, done) {
    reply.eh = earlyHints(reply)
    done()
  }

  async function onSend (request, reply, payload) {
    await reply.eh.close()
  }

  fastify.addHook('onRequest', onRequest)
  fastify.addHook('onSend', onSend)

  next()
}

module.exports = fp(fastifyEarlyHints, {
  fastify: '4.x',
  name: '@fastify/early-hints'
})
