// TODO: remove after node@18 End-of-Life
'use strict'

function writeEarlyHints (reply, headers) {
  return new Promise(function (resolve) {
    if (reply.raw.socket === null) {
      resolve()
      return
    }
    reply.raw.stream.additionalHeaders({
      ':status': '103',
      ...headers
    })
    resolve()
  })
}

module.exports = writeEarlyHints
