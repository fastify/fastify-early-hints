'use strict'

const benchmark = require('benchmark')
const formatEntry = require('../lib/formatEntry')

new benchmark.Suite()
  .add('formatEntry', function () { formatEntry({ href: '/', rel: 'preconnect', cors: 'anonymous', as: 'script' }) }, { minSamples: 100 })
  .on('cycle', function onCycle (event) { console.log(String(event.target)) })
  .run()
