import { rmSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { prepareDistFolder, BASE_PATH, getSpecs } from '../helpers.js';

(async () => {
  prepareDistFolder();

  const outputPath = path.join(BASE_PATH, 'dist', 'trackerdb.txt');

  if (existsSync(outputPath)) {
    rmSync(outputPath);
  }

  const FILTERS = [];

  for (const [id, spec] of getSpecs('patterns')) {
    const category = spec.field('category').requiredStringValue();
    const filters = spec.field('filters').optionalStringValue();
    const domains = spec.field('domains').optionalStringValue();
    const comment = `! trackerdb_id:${id} trackerdb_category:${category}`;
    if (filters) {
      for (const line of filters.split(/[\r\n]+/g)) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('!')) {
          FILTERS.push(`${comment} trackerdb_filter`);
          FILTERS.push(trimmed);
        }
      }
    }
    if (domains) {
      for (const line of domains.split(/[\r\n]+/g)) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('!')) {
          FILTERS.push(`${comment} trackerdb_domain`);
          FILTERS.push(`||${trimmed}^$third-party`);
        }
      }
    }
  }

  writeFileSync(outputPath, FILTERS.join('\n'));
})();
