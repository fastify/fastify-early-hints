'use strict'
const warning = require('process-warning')()

const allowedRel = ['dns-prefetch', 'preconnect', 'prefetch', 'preload', 'prerender']
const allowedAs = ['document', 'script', 'image', 'style', 'font']

const WARNING_NAME = 'FastifyWarningEarlyHints'
warning.create(WARNING_NAME, 'FSTEH001', 'as attribute invalid.')
warning.create(WARNING_NAME, 'FSTEH002', 'cors attribute invalid.')
warning.create(WARNING_NAME, 'FSTEH003', 'rel attribute invalid.')

module.exports = function formatEntry (earlyHint) {
  if (typeof earlyHint === 'string') return earlyHint
  if (earlyHint.href === undefined) throw TypeError('href attribute is mandatory')
  if (earlyHint.rel === undefined) throw TypeError('rel attribute is mandatory')

  if (allowedRel.indexOf(earlyHint.rel) === -1) warning.emit('FSTEH003')

  let _as = ''
  if (earlyHint.as !== undefined) {
    if (allowedAs.indexOf(earlyHint.as) === -1) warning.emit('FSTEH001')

    _as = ` as=${earlyHint.as}`
  }

  let _cors
  switch (earlyHint.cors) {
    case true:
    case 'crossorigin':
      _cors = ' crossorigin'
      break
    case 'anonymous':
      _cors = ' crossorigin=anonymous'
      break
    case 'use-credentials':
      _cors = ' crossorigin=use-credentials'
      break
    case false:
    case undefined:
      _cors = ''
      break
    default:
      _cors = ''
      warning.emit('FSTEH002')
      break
  }
  if (_as.length !== 0 && _cors.length !== 0) {
    _as += ';'
  }
  return `Link: <${earlyHint.href}>; rel=${earlyHint.rel}${_as.length === 0 && _cors.length === 0 ? '' : ';'}${_as}${_cors}`
}
