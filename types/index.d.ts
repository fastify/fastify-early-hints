import { FastifyPluginCallback } from 'fastify'

type EarlyHintAs = 'document' | 'script' | 'image' | 'style' | 'font';
type EarlyHintCORS = 'anonymous' | 'use-credentials' | 'crossorigin';
type EarlyHintRel = 'dns-prefetch' | 'preconnect' | 'prefetch' | 'preload' | 'prerender';

export interface EarlyHintItem {
  href: string;
  rel: EarlyHintRel;
  cors?: boolean | EarlyHintCORS;
  as?: EarlyHintAs;
}

export interface EarlyHint {
  add: (content: string[] | EarlyHintItem[]) => Promise<void>;
}

export interface EarlyHintPluginOptions {
  warn?: boolean
}

declare module 'fastify' {
  interface FastifyReply { // eslint-disable-line no-unused-vars
    eh: EarlyHint;
  }
}

declare const fastifyCors: FastifyPluginCallback<EarlyHintPluginOptions>
export default fastifyCors
