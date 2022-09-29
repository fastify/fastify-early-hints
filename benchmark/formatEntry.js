'use strict'

const benchmark = require('benchmark')
const formatEntry = require('../lib/formatEntry')

const earlyHintString = 'Link: </style.css>; rel=preload; as=style'
const earlyHintObject = { href: '/', rel: 'preconnect', cors: 'anonymous', as: 'script' }

new benchmark.Suite()
  .add('formatEntry: object', function () { formatEntry(earlyHintObject) }, { minSamples: 100 })
  .add('formatEntry: string', function () { formatEntry(earlyHintString) }, { minSamples: 100 })
  .on('cycle', function onCycle (event) { console.log(String(event.target)) })
  .run()
