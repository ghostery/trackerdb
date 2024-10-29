#!/usr/bin/env node

import * as adblocker from '@ghostery/adblocker';
import chalk from 'chalk';

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

function showExplainWarnings() {
  console.log('TrackerDB linter warnings explainer.');
  console.log();
  console.log(chalk.underline('regex'));
  console.log(
    'The filters syntax allows to specify regexps patterns (e.g. /foo/). They start and end with a slash ("/").',
  );
  console.log(
    'These are very powerful, but also dangerous, for multiple reasons:',
  );
  console.log(
    '- They are harder to understand and maintain (the syntax can make them quite obscure).',
  );
  console.log(
    '- Due to how the engine handles them, they are usually much less efficient than regular filters.',
  );
  console.log(
    'This is because the engine will internally tokenize filters and store them in an efficient reverse index data-structure.',
  );
  console.log(
    'RegExps are often not tokenized and will therefor be evaluated against *each* network request.',
  );
  console.log();
  console.log(
    'Example: /example.com/.*.js/ can be converted into ||example.com/*/*.js',
  );
  console.log();
  console.log(chalk.underline('no-token'));
  console.log(
    'Because the adblocker engine internally implements an efficient reverse index data-structure to ensure fast matching,',
  );
  console.log(
    'it is important that filters can be "tokenized". This means that the adblocker needs to be able to extract slices',
  );
  console.log(
    'from the filters, that will be used as keys in the reverse index. If no tokens can be extracted, then the filter',
  );
  console.log(
    'will end up being matched against all network requests, which is not very efficient. A valid token is made of any number',
  );
  console.log(
    'of alphanumeric characters that are found between URL separators (ignoring too short tokens of size 1).',
  );
  console.log();
  console.log(
    'Example: the filter "/tracking/ad" will have tokens "tracking" but not "ad" because it could be the prefix of',
  );
  console.log(
    'a longer token like "advertisement" and using it as a key in the reverse index would prevent retrieving the',
  );
  console.log(
    'relevant filters if a URL contains the token "advertisement" but not "ad".',
  );
  console.log();
  console.log(
    'Example: the filter "ads" does not have any token because there is no separator around it. This filter would thus',
  );
  console.log(
    'be evaluated against every single network request, which is not efficient. In such cases, consider making the filter',
  );
  console.log('more specific like "/ads/" or "/ads.js", etc.');
}

function showHelp() {
  console.log('TrackerDB linter.');
  console.log();
  console.log(
    'Lint files from "db" folder, normalizing the format and providing useful information to keep performance optimal.',
  );
  console.log();
  console.log('USAGE');
  console.log();
  console.log('lint.js [--help] [--explain-warnings]');
  console.log();
  console.log('COMMON COMMANDS');
  console.log();
  console.log(chalk.bold('  > node lint.js --explain-warnings'));
  console.log(
    '  Lint all files from TrackerDB: normalizing format and finding common mistakes.',
  );
  console.log();
  console.log(chalk.bold('  > node lint.js --explain-warnings'));
  console.log('  Display help to explain each of the warnings.');
  console.log();
  console.log(chalk.bold('  > node lint.js --help'));
  console.log('  Display this help message.');
}

function splitlines(source) {
  return source
    .trim()
    .split(/\n+/g)
    .map((line) => {
      if (line.endsWith('^M')) {
        return line.slice(0, -'^M'.length);
      } else {
        return line;
      }
    })
    .filter((line) => line.trim().length !== 0);
}

function extractSection(source, tag) {
  const indexOfDomains = source.indexOf(tag);
  if (indexOfDomains !== -1) {
    const endOfDomains = source.indexOf(tag, indexOfDomains + tag.length);
    if (endOfDomains === -1) {
      console.error(`Missing end of "${tag.trim()}" block`);
      return;
    }

    return [
      indexOfDomains + tag.length,
      endOfDomains,
      source.slice(indexOfDomains + tag.length, endOfDomains),
    ];
  }
}

function* iterPatternFiles() {
  const baseDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'db',
    'patterns',
  );

  for (const filename of fs.readdirSync(baseDir)) {
    if (!filename.endsWith('.eno')) {
      continue;
    }

    const fullPath = path.join(baseDir, filename);
    yield { path: fullPath, source: fs.readFileSync(fullPath, 'utf-8') };
  }
}

function* iterPatterns() {
  for (const { path, source } of iterPatternFiles()) {
    // Read metadata
    const metadata = {};
    for (const line of splitlines(source)) {
      if (!line.includes(':')) {
        break;
      }

      const indexOfColon = line.indexOf(':');
      const key = line.slice(0, indexOfColon).trim();
      const value = line.slice(indexOfColon + 1).trim();
      metadata[key] = value;
    }

    // Read domains
    const domains = extractSection(source, '\n--- domains\n');
    const filters = extractSection(source, '\n--- filters\n');
    const notes = extractSection(source, '\n--- notes\n');

    yield { path, source, metadata, domains, filters, notes };
  }
}

function formatFile(patterns) {
  const out = [];

  // Format metadata
  for (const [key, value] of Object.entries(patterns.metadata)) {
    out.push(`${key}: ${value}`);
  }
  out.push('');

  // Format domains
  if (patterns.domains) {
    out.push('--- domains');
    for (const line of splitlines(patterns.domains[2]).sort()) {
      out.push(line);
    }
    out.push('--- domains');
    out.push('');
  }

  // Format filters
  if (patterns.filters) {
    out.push('--- filters');
    for (const line of splitlines(patterns.filters[2]).sort()) {
      out.push(line);
    }
    out.push('--- filters');
    out.push('');
  }

  // Format notes
  if (patterns.notes) {
    out.push('--- notes');
    out.push(patterns.notes[2]);
    out.push('--- notes');
    out.push('');
  }

  return out.join('\n');
}

(() => {
  if (process.argv.includes('--explain-warnings')) {
    showExplainWarnings();
    return;
  }

  if (process.argv.includes('--help')) {
    showHelp();
    return;
  }

  const startTime = Date.now();
  let numberOfFiles = 0;
  let numberOfCosmeticFilters = 0;
  let numberOfNetworkFilters = 0;
  let numberOfDomains = 0;

  console.log(chalk.bold(chalk.magenta('Linting...')));
  for (const patterns of iterPatterns()) {
    numberOfFiles += 1;
    const warnings = [];

    if (patterns.domains) {
      numberOfDomains += splitlines(patterns.domains[2]).length;
    }

    if (patterns.filters) {
      const filters = adblocker.parseFilters(patterns.filters[2], {
        debug: true,
      });

      numberOfCosmeticFilters += filters.cosmeticFilters.length;
      numberOfNetworkFilters += filters.networkFilters.length;

      // Identify RegExp filters (potentially costly)
      for (const networkFilter of filters.networkFilters) {
        if (networkFilter.isFullRegex()) {
          warnings.push([
            chalk.bold(chalk.red('Found expensive filter(regex):')),
            networkFilter.rawLine,
          ]);
        }
      }

      // Identify filters without tokens (potentially costly)
      for (const networkFilter of filters.networkFilters) {
        if (networkFilter.isFullRegex()) {
          continue;
        }

        for (const tokens of networkFilter.getTokens()) {
          if (tokens.length === 0) {
            warnings.push([
              chalk.yellow('Found expensive filter(no-token):'),
              networkFilter.rawLine,
            ]);
            break;
          }
        }
      }

      // for (const cosmeticFilter of filters.cosmeticFilters) {
      //   console.log(cosmeticFilter.rawLine)
      // }
    }

    if (warnings.length > 0) {
      console.log();
      console.log(chalk.underline(patterns.path));
      for (const warning of warnings) {
        console.log(warning.join(' '));
      }
    }

    fs.writeFileSync(patterns.path, formatFile(patterns), {
      encoding: 'utf-8',
    });
  }
  const endTime = Date.now();

  console.log();
  console.log(`Done linting in ${endTime - startTime} milliseconds!`);
  console.log('Number of files analyzed:', numberOfFiles);
  console.log(
    'Number of filters:',
    numberOfNetworkFilters + numberOfCosmeticFilters,
  );
  console.log(' + network:', numberOfNetworkFilters);
  console.log(' + cosmetic:', numberOfCosmeticFilters);
  console.log('Number of domains:', numberOfDomains);
})();
