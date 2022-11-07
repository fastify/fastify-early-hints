const { version } = require('process')

const [major, minor, patch] = version.slice(1).split('.').map(Number)

// Added in v18.11.0
// Refs: https://nodejs.org/dist/latest-v18.x/docs/api/http.html#responsewriteearlyhintshints-callback
// TODO: remove after node@18 End-of-Life
const nativeSupport = (major === 18 && minor >= 11 && patch >= 0) || major > 18

module.exports = nativeSupport
