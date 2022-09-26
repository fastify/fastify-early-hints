import { FastifyPluginCallback } from "fastify";

export interface earlyHintItem {
  href: string;
  rel: string;
  cors?: boolean | string;
  as?: string;
}
export interface earlyHint {
  add: (content: string[] | earlyHintItem[]) => Promise<void>;
}

declare module "fastify" {
  interface FastifyReply {
    eh: earlyHint;
  }
}

declare const fastifyCors: FastifyPluginCallback<() => string>;
export default fastifyCors;
