#!/usr/bin/env node

import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { FiltersEngine, Request } from '@cliqz/adblocker';

import { DIST_PATH } from './scripts/helpers.js';

(async () => {
  const [, , url] = process.argv;

  if (!url) {
    console.error('trackerdb takes URL as first argument');
    process.exit(1);
  }

  const trackerDBPath = path.join(DIST_PATH, `trackerdb.json`);

  if (!existsSync(trackerDBPath)) {
    // generate input JSON if missing
    await import('./scripts/export-json/index.js');
  }

  const rawTrackerDB = JSON.parse(readFileSync(trackerDBPath, 'utf-8'));

  const engine = FiltersEngine.fromTrackerDB(rawTrackerDB);

  let matches = [];

  if (url.startsWith('http')) {
    const request = Request.fromRawDetails({ url });
    matches = engine.getPatternMetadata(request);
  } else {
    matches = engine.metadata.fromDomain(url);
  }

  if (matches.length === 0) {
    console.log('No matches found');
  } else {
    const results = {
      url,
      matches,
    };
    console.log(JSON.stringify(results, null, 2));
  }
})();
