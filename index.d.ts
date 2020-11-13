import { FastifyPlugin } from "fastify";

export interface earlyHintItem {
  href: string;
  rel: string;
  cors?: boolean | string;
  as?: string;
}
export interface earlyHint {
  add: (content: string[] | earlyHintItem[]) => void;
  inject: (content: string[] | earlyHintItem[]) => Promise<void>;
}

declare module "fastify" {
  interface FastifyReply {
    eh: earlyHint;
  }
}

declare const fastifyCors: FastifyPlugin<() => string>;
export default fastifyCors;
