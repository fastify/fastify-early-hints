'use strict'

const { createWarning } = require('process-warning')

const allowedRel = ['dns-prefetch', 'preconnect', 'prefetch', 'preload', 'prerender']
const allowedAs = ['document', 'script', 'image', 'style', 'font']

const WARNING_NAME = 'FastifyWarningEarlyHints'
const FSTEH001 = createWarning({ name: WARNING_NAME, code: 'FSTEH001', message: 'as attribute invalid.' })
const FSTEH002 = createWarning({ name: WARNING_NAME, code: 'FSTEH002', message: 'cors attribute invalid.' })
const FSTEH003 = createWarning({ name: WARNING_NAME, code: 'FSTEH003', message: 'rel attribute invalid.' })

module.exports = function formatEntry (earlyHint, opts) {
  if (typeof earlyHint === 'string') return earlyHint
  const {
    href,
    rel,
    as = '',
    cors = false
  } = earlyHint

  const {
    warn = false
  } = opts || {}

  if (href === undefined) throw TypeError('href attribute is mandatory')
  if (rel === undefined) throw TypeError('rel attribute is mandatory')

  if (warn === true) {
    if (allowedRel.indexOf(rel) === -1) {
      FSTEH003()
    }
    if (as.length !== 0 && allowedAs.indexOf(as) === -1) {
      FSTEH001()
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
      warn && FSTEH002()
      break
  }
  return `Link: <${href}>; rel=${rel}${as.length !== 0 ? '; as=' : ''}${as}${_cors.length !== 0 ? '; ' : ''}${_cors}`
}
