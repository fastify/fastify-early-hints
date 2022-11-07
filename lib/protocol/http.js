// TODO: remove after node@18 End-of-Life
'use strict'

const CRLF = '\r\n'
const EarlyHints = `HTTP/1.1 103 Early Hint${CRLF}`

function write (reply, headers) {
  let message = ''
  for (const key of Object.keys(headers)) {
    let value = ''
    if (Array.isArray(headers[key])) {
      value = headers[key].join(', ')
    } else {
      value = headers[key]
    }
    message += `${key}: ${value}${CRLF}`
  }

  return new Promise(function (resolve) {
    if (reply.raw.socket === null) {
      resolve()
      return
    }
    reply.raw.socket.write(`${EarlyHints}${message}${CRLF}`, 'ascii', () => {
      resolve()
    })
  })
}

module.exports = write
