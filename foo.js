const Fastify = require("fastify");
const { realpathSync } = require("fs");
const eh = require("./");

const fastify = Fastify({ logger: true });
fastify.register(eh);

fastify.get("/", async (request, reply) => {
  reply.eh.inject([
    "Link: </style.css>; rel=preload; as=style",
    "Link: </script.js>; rel=preload; as=script",
  ]);
  reply.eh.add([
    "Link: </style.css>; rel=preload; as=style",
    "Link: </script.js>; rel=preload; as=script",
  ]);
  reply.eh.add([
    { href: "//example.com", rel: "preload", as: "style" },
    { href: "//example.com", rel: "preload", as: "style", cors: true },
    { href: "//example.com", rel: "preconnect" },
    { href: "//example2.com", rel: "preconnect", cors: true },
    { href: "//example3.com", rel: "preconnect", cors: "use-credentials" },
  ]);
  return { hello: "world" };
});

const start = async () => {
  try {
    await fastify.listen(3000);
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
