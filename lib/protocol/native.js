'use strict'

function write (reply, headers) {
  return new Promise(function (resolve) {
    reply.raw.writeEarlyHints(headers, () => {
      resolve()
    })
  })
}

module.exports = write
