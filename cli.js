#!/usr/bin/env node

import path from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { FiltersEngine, Request, ENGINE_VERSION } from '@cliqz/adblocker';

import { BASE_PATH } from './scripts/helpers.js';

const debug = process.env.DEBUG === 'true' ? console.log : () => {};

(async () => {
  const startTime = Date.now();
  const [, , url] = process.argv;

  if (!url) {
    console.error('trackerdb takes URL as first argument');
    process.exit(1);
  }

  // Generate input JSON if missing
  const trackerDBPath = path.join(BASE_PATH, 'dist', 'trackerdb.json');
  if (!existsSync(trackerDBPath)) {
    await import('./scripts/export-json/index.js');
  }

  // Generate binary engine if missing
  const trackerEnginePath = path.join(
    BASE_PATH,
    'dist',
    `trackerdb_${ENGINE_VERSION}.engine`,
  );
  if (!existsSync(trackerEnginePath)) {
    const rawTrackerDB = JSON.parse(readFileSync(trackerDBPath, 'utf-8'));
    const engine = FiltersEngine.fromTrackerDB(rawTrackerDB);
    writeFileSync(trackerEnginePath, engine.serialize());
  }

  const loadingStart = Date.now();
  const engine = FiltersEngine.deserialize(readFileSync(trackerEnginePath));
  const loadingEnd = Date.now();

  const matches = url.startsWith('http')
    ? engine.getPatternMetadata(Request.fromRawDetails({ url }))
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
