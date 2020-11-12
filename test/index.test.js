"use strict";

const { test } = require("tap");
const Fastify = require("fastify");
const eh = require("../");

test("Should add cors headers", (t) => {
  const fastify = Fastify();
  fastify.register(eh);
  fastify.get("/", (req, reply) => {
    reply.eh.add([
      "Link: </style.css>; rel=preload; as=style",
      "Link: </script.js>; rel=preload; as=script",
    ]);
    reply.send("ok");
  });
  fastify.inject(
    {
      method: "GET",
      url: "/",
    },
    (err, res) => {
      t.error(err);
      t.strictEqual(res.statusCode, 200);
      t.strictEqual(res.payload, "ok");
    }
  );
});
