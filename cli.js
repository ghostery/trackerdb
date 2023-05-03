#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { FiltersEngine, Request } from '@cliqz/adblocker';
import { generateEngine } from './src/prepare.js';

const debug = process.env.DEBUG === 'true' ? console.log : () => {};

(async () => {
  const startTime = Date.now();
  const [, , url] = process.argv;

  if (!url) {
    console.error('trackerdb takes URL as first argument');
    process.exit(1);
  }

  const trackerEnginePath = await generateEngine();

  const loadingStart = Date.now();
  const engine = FiltersEngine.deserialize(readFileSync(trackerEnginePath));
  const loadingEnd = Date.now();

  const matches = url.startsWith('http')
    ? engine.getPatternMetadata(Request.fromRawDetails({ url, type: 'xhr' }), {
        getDomainMetadata: true,
      })
    : engine.metadata.fromDomain(url);
  const matchingEnd = Date.now();

  debug('Timing:', {
    init: loadingStart - startTime,
    loading: loadingEnd - loadingStart,
    matching: matchingEnd - loadingEnd,
    total: matchingEnd - startTime,
  });

  if (matches.length === 0) {
    console.log('No matches found');
  } else {
    console.log(
      JSON.stringify(
        {
          url,
          matches,
        },
        null,
        2,
      ),
    );
  }
})();
