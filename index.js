"use strict";

const fp = require("fastify-plugin");
const warning = require("fastify-warning")();

const allowedRel = [
  "dns-prefetch",
  "preconnect",
  "prefetch",
  "preload",
  "prerender",
];
const allowedAs = ["document", "script", "image", "style"];
const allowedCors = ["anonymous", "use-credentials"];

const WARNING_NAME = "FastifWarningEarlyHints";
warning.create(WARNING_NAME, "FSTEH001", "as attribute invalid.");
warning.create(WARNING_NAME, "FSTEH002", "cors attribute invalid.");

function formatEntry(e) {
  if (typeof e === "string") return e;
  if (e.href === undefined) {
    throw Error("href attribute is mandatory");
  }
  if (e.rel === undefined) {
    throw Error("rel attribute is mandatory");
  }

  let _as = "";
  let _cors = "";
  if (e.as !== undefined) {
    if (!allowedAs.includes(e.as)) {
      warning.emit("FSTEH001");
    }
    _as = ` as=${e.as}`;
    if (e.cors !== undefined) {
      _as += ";";
    } else {
      _as += " ";
    }
  }
  if (e.cors !== undefined) {
    if (e.as === undefined) {
      _cors += " ";
    }
    if (typeof e.cors === "boolean") {
      _cors += "crossorigin";
    } else if (typeof e.cors === "string") {
      if (allowedCors.includes(e.cors)) {
        _cors += `crossorigin=${e.cors}`;
      } else {
        warning.emit("FSTEH002");
      }
    }
  }
  return `Link: <${e.href}>; rel=${e.rel};${_as}${_cors}`;
}

function fastifyEH(fastify, opts, next) {
  function earlyhints(reply) {
    const buffer = [];
    const serialize = function (c) {
      let message = "HTTP/1.1 103 Early Hints\r\n";
      for (var i = 0; i < c.length; i++) {
        message += `${formatEntry(c[i])}\r\n`;
      }
      return `${message}\r\n`;
    };
    return {
      close: function () {
        reply.raw.socket.write(serialize(buffer));
      },
      // directly write to the socket
      // usefull when long runner request flow
      inject: function (content) {
        reply.raw.socket.write(serialize(content));
      },
      // write to the socket on the onSend hook
      add: function (content) {
        for (var i = 0; i < content.length; i++) {
          buffer.push(content[i]);
        }
      },
    };
  }

  // fastify.decorateReply("eh", earlyhints);
  function onRequest(request, reply, done) {
    reply.eh = earlyhints(reply);
    done();
  }

  function onSend(request, reply, payload, done) {
    if (reply.eh) {
      reply.eh.close();
    }
    done();
  }

  fastify.addHook("onRequest", onRequest);
  fastify.addHook("onSend", onSend);

  next();
}

module.exports = fp(fastifyEH, {
  fastify: "3.x",
  name: "fastify-early-hints",
});
