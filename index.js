'use strict'

const fp = require('fastify-plugin')
const warning = require('process-warning')()

const allowedRel = ['dns-prefetch', 'preconnect', 'prefetch', 'preload', 'prerender']
const allowedAs = ['document', 'script', 'image', 'style', 'font']
const allowedCors = ['anonymous', 'use-credentials']
const CRLF = '\r\n'

const WARNING_NAME = 'FastifyWarningEarlyHints'
warning.create(WARNING_NAME, 'FSTEH001', 'as attribute invalid.')
warning.create(WARNING_NAME, 'FSTEH002', 'cors attribute invalid.')
warning.create(WARNING_NAME, 'FSTEH003', 'rel attribute invalid.')

function formatEntry (e) {
  if (typeof e === 'string') return e
  if (e.href === undefined) throw Error('href attribute is mandatory')
  if (e.rel === undefined) throw Error('rel attribute is mandatory')

  if (!allowedRel.includes(e.rel)) warning.emit('FSTEH003')

  let _as = ''
  let _cors = ''
  if (e.as !== undefined) {
    if (!allowedAs.includes(e.as)) warning.emit('FSTEH001')

    _as = ` as=${e.as}`
    if (e.cors !== undefined) {
      _as += ';'
    } else {
      _as += ' '
    }
  }
  if (e.cors !== undefined) {
    _cors += ' '
    if (typeof e.cors === 'boolean') {
      _cors += 'crossorigin'
    } else if (typeof e.cors === 'string') {
      if (allowedCors.includes(e.cors)) {
        _cors += `crossorigin=${e.cors}`
      } else {
        warning.emit('FSTEH002')
      }
    }
  }
  return `Link: <${e.href}>; rel=${e.rel}${
    !_as.length && !_cors.length ? '' : ';'
  }${_as}${_cors}`
}

function fastifyEH (fastify, opts, next) {
  if (fastify.initialConfig.http2 === true) {
    return next(new Error('Early Hints cannot be used with a HTTP2 server.'))
  }

  function earlyhints (reply) {
    const promiseBuffer = []
    const serialize = function (c) {
      let message = `HTTP/1.1 103 Early Hints${CRLF}`
      for (let i = 0; i < c.length; i++) {
        message += `${formatEntry(c[i])}${CRLF}`
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
        const p = new Promise((resolve) => {
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
    reply.eh = earlyhints(reply)
    done()
  }

  async function onSend (request, reply, payload) {
    if (reply.eh) {
      await reply.eh.close()
    }
  }

  fastify.addHook('onRequest', onRequest)
  fastify.addHook('onSend', onSend)

  next()
}

module.exports = fp(fastifyEH, {
  fastify: '4.x',
  name: '@fastify/early-hints'
})
