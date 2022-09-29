# @fastify/early-hints


[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
![Continuous
Integration](https://github.com/fastify/fastify-early-hints/workflows/CI%20workflow/badge.svg)

Draft proposal of plugin handling the HTTP 103 code.
Based on : https://github.com/fastify/fastify/issues/2683

## Install

```shell
npm i @fastify/early-hints
```

## Options

You can pass the following options during the plugin registration:

```js
await fastify.register(import('@fastify/early-hints'), {
  warn: true // default: false
})
```

- `warn` : indicates if the plugin should log warnings if invalid values are supplied as early hints

## Usage

### Reply.writeEarlyHints

This method used to write early hints with any header you. It accepts
either `object` or `Array` of headers and return `Promise`.

```javascript
const Fastify = require("fastify");
const eh = require("@fastify/early-hints");

const fastify = Fastify({ logger: true });
fastify.register(eh);

fastify.get("/", async (request, reply) => {
  // object
  await reply.writeEarlyHints({
    'Content-Security-Policy': 'style-src: self;',
    Link: ['</style.css>; rel=preload; as=style', '</script.js>; rel=preload; as=script']
  })
  // array
  await reply.writeEarlyHints([
    { name: 'Content-Security-Policy', value: 'style-src: self;' },
    { name: 'Link', value: '</style.css>; rel=preload; as=style' },
    { name: 'Link', value: '</script.js>; rel=preload; as=script' },
  ])
  return { hello: "world" };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
```

Result

```shell
$ curl -D - http://localhost:3000    
HTTP/1.1 103 Early Hints
Content-Security-Policy: style-src: self;
Link: </style.css>; rel=preload; as=style
Link: </script.js>; rel=preload; as=script

HTTP/1.1 103 Early Hints
Content-Security-Policy: style-src: self;
Link: </style.css>; rel=preload; as=style
Link: </script.js>; rel=preload; as=script

HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
content-length: 17
Date: Thu, 12 Nov 2020 22:45:54 GMT
Connection: keep-alive

{"hello":"world"}
```

### Reply.writeEarlyHintsLink

This method used to write only the `Link` header. It accepts an `Array` and
return `Promise`.

```javascript
const Fastify = require("fastify");
const eh = require("@fastify/early-hints");

const fastify = Fastify({ logger: true });
fastify.register(eh);

fastify.get("/", async (request, reply) => {
  await reply.writeEarlyHintsLink([
    "Link: </style.css>; rel=preload; as=style",
    "Link: </script.js>; rel=preload; as=script",
  ])
  await reply.writeEarlyHintsLink([
    { href: "//example.com", rel: "preload", as: "style" },
    { href: "//example.com", rel: "preload", as: "style", cors: true },
    { href: "//example.com", rel: "preconnect" },
    { href: "//example2.com", rel: "preconnect", cors: true },
    { href: "//example3.com", rel: "preconnect", cors: "use-credentials" },
  ])
  return { hello: "world" };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
```

Result

```shell
$ curl -D - http://localhost:3000    
HTTP/1.1 103 Early Hints
Link: </style.css>; rel=preload; as=style
Link: </script.js>; rel=preload; as=script

HTTP/1.1 103 Early Hints
Link: </style.css>; rel=preload; as=style
Link: </script.js>; rel=preload; as=script
Link: <//example.com>; rel=preload; as=style
Link: <//example.com>; rel=preload; as=style; crossorigin
Link: <//example.com>; rel=preconnect
Link: <//example2.com>; rel=preconnect; crossorigin
Link: <//example3.com>; rel=preconnect; crossorigin=use-credentials

HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
content-length: 17
Date: Thu, 12 Nov 2020 22:45:54 GMT
Connection: keep-alive

{"hello":"world"}
```

## References

- https://httpwg.org/specs/rfc8297.html
- https://www.w3.org/TR/resource-hints/

## License

Licensed under [MIT](./LICENSE).
