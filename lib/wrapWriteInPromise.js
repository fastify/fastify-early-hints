'use strict'

const createError = require('@fastify/error')
const EarlyHintsWriteError = createError('FST_ERR_EH_WRITE_ERROR', 'Error while writing Early Hints', 500)

module.exports = function wrapWriteInPromise (obj, value, encoding) {
  return new Promise((resolve, reject) => {
    obj.write(value, encoding, err => (err && reject(new EarlyHintsWriteError())) || resolve())
  })
}

module.exports.EarlyHintsWriteError = EarlyHintsWriteError
