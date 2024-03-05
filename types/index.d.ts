/* eslint no-redeclare: off */
/* eslint no-use-before-define: off */

import { FastifyPluginCallback } from 'fastify'

type FastifyEarlyHints = FastifyPluginCallback<fastifyEarlyHints.EarlyHintPluginOptions>

declare namespace fastifyEarlyHints {
  type EarlyHintAs = 'document' | 'script' | 'image' | 'style' | 'font';
  type EarlyHintCORS = 'anonymous' | 'use-credentials' | 'crossorigin';
  type EarlyHintRel = 'dns-prefetch' | 'preconnect' | 'prefetch' | 'preload' | 'prerender';

  export interface EarlyHintItem {
    href: string;
    rel: EarlyHintRel;
    cors?: boolean | EarlyHintCORS;
    as?: EarlyHintAs;
  }

  export interface EarlyHintPluginOptions {
    warn?: boolean
  }

  export const fastifyEarlyHints: FastifyEarlyHints
  export { fastifyEarlyHints as default }
}

declare module 'fastify' {
  interface FastifyReply { // eslint-disable-line no-unused-vars
    writeEarlyHints: (headers: Record<string, string | string[]> | { name: string, value: string }[]) => Promise<void>;
    writeEarlyHintsLinks: (content: (string | fastifyEarlyHints.EarlyHintItem)[]) => Promise<void>;
  }
}

declare function fastifyEarlyHints(...params: Parameters<FastifyEarlyHints>): ReturnType<FastifyEarlyHints>
export = fastifyEarlyHints
