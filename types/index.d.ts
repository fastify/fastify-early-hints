import { FastifyPluginCallback } from 'fastify'

type EarlyHintAs = 'document' | 'script' | 'image' | 'style' | 'font';
type EarlyHintCORS = 'anonymous' | 'use-credentials' | 'crossorigin';
type EarlyHintRel = 'dns-prefetch' | 'preconnect' | 'prefetch' | 'preload' | 'prerender';

export interface earlyHintItem {
  href: string;
  rel: EarlyHintRel;
  cors?: boolean | EarlyHintCORS;
  as?: EarlyHintAs;
}

export interface EarlyHint {
  add: (content: string[] | earlyHintItem[]) => Promise<void>;
}

declare module 'fastify' {
  interface FastifyReply { // eslint-disable-line no-unused-vars
    eh: EarlyHint;
  }
}

declare const fastifyCors: FastifyPluginCallback<() => string>
export default fastifyCors
