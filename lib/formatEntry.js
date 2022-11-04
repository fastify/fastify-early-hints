'use strict'

const warning = require('process-warning')()

const allowedRel = ['dns-prefetch', 'preconnect', 'prefetch', 'preload', 'prerender']
const allowedAs = ['document', 'script', 'image', 'style', 'font']

const WARNING_NAME = 'FastifyWarningEarlyHints'
warning.create(WARNING_NAME, 'FSTEH001', 'as attribute invalid.')
warning.create(WARNING_NAME, 'FSTEH002', 'cors attribute invalid.')
warning.create(WARNING_NAME, 'FSTEH003', 'rel attribute invalid.')

module.exports = function formatEntry (earlyHint, opts) {
  if (typeof earlyHint === 'string') return earlyHint
  const {
    href,
    rel,
    as = '',
    cors = false
  } = earlyHint

  const {
    warn = false,
    http2 = false
  } = opts || {}

  if (href === undefined) throw TypeError('href attribute is mandatory')
  if (rel === undefined) throw TypeError('rel attribute is mandatory')

  if (warn === true) {
    if (allowedRel.indexOf(rel) === -1) {
      warning.emit('FSTEH003')
    }
    if (as.length !== 0 && allowedAs.indexOf(as) === -1) {
      warning.emit('FSTEH001')
    }
  }

  let _cors
  switch (cors) {
    case true:
    case 'crossorigin':
      _cors = 'crossorigin'
      break
    case 'anonymous':
      _cors = 'crossorigin=anonymous'
      break
    case 'use-credentials':
      _cors = 'crossorigin=use-credentials'
      break
    case false:
      _cors = ''
      break
    default:
      _cors = ''
      warn && warning.emit('FSTEH002')
      break
  }
  return http2
    ? `<${href}>; rel=${rel}${as.length !== 0 ? '; as=' : ''}${as}${_cors.length !== 0 ? '; ' : ''}${_cors}`
    : `Link: <${href}>; rel=${rel}${as.length !== 0 ? '; as=' : ''}${as}${_cors.length !== 0 ? '; ' : ''}${_cors}`
}
