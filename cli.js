#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as url from 'url';
import { FiltersEngine, Request } from '@ghostery/adblocker';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const debug = process.env.DEBUG === 'true' ? console.log : () => {};

function showUsage() {
  console.log(`
Usage: node cli.js [--source-url FIRST_PARTY_URL] URL

Options:
  --source-url URL  Overwrites the source URL (needed to test third-party requests).
  --help            Show help.
`);
}

function parseArguments() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    showUsage();
    process.exit(0);
  }

  let sourceUrl = null;
  const sourceUrlIndex = args.indexOf('--source-url');
  if (sourceUrlIndex !== -1 && sourceUrlIndex + 1 < args.length) {
    sourceUrl = args[sourceUrlIndex + 1];
    args.splice(sourceUrlIndex, 2);
  }

  const url = args[0];
  if (!url) {
    showUsage();
    console.error('ERROR: Missing argument: URL is needed');
    process.exit(1);
  }

  return { url, sourceUrl };
}

(async () => {
  const startTime = Date.now();
  const { url, sourceUrl } = parseArguments();

  const loadingStart = Date.now();
  const engine = FiltersEngine.deserialize(
    readFileSync(path.join(__dirname, 'dist', 'trackerdb.engine')),
  );
  const loadingEnd = Date.now();

  const requestDetails = { url: url, type: 'xhr' };
  if (sourceUrl) {
    requestDetails.sourceUrl = sourceUrl;
  }

  const matches = url.startsWith('http')
    ? engine.getPatternMetadata(Request.fromRawDetails(requestDetails), {
        getDomainMetadata: true,
      })
    : engine.metadata.fromDomain(url);

  // Tags are not provided by the engine, but we can enrich the matches using the json export
  if (matches.length > 0) {
    const db = JSON.parse(
      readFileSync(path.join(__dirname, 'dist', 'trackerdb.json')),
    );
    for (const match of matches) {
      if (match.pattern && db.patterns[match.pattern.key]) {
        match.pattern.tags = db.patterns[match.pattern.key].tags;
      }
    }
  }
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
