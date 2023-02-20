import { rmSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  prepareDistFolder,
  DIST_PATH,
  getCurrentDay,
  getSpecs,
} from '../helpers.js';

(async () => {
  prepareDistFolder();

  const today = getCurrentDay();

  const outputPath = path.join(DIST_PATH, `trackerdb_${today}.json`);

  if (existsSync(outputPath)) {
    rmSync(outputPath);
  }

  const db = {
    categories: {},
    organizations: {},
    patterns: {},
    domains: {},
    filters: {},
  };

  for (const [id, spec] of getSpecs('categories')) {
    db.categories[id] = {
      name: spec.field('name').requiredStringValue(),
      color: spec.field('color').requiredStringValue(),
      description: spec.field('description').requiredStringValue(),
    };
  }

  for (const [id, spec] of getSpecs('organizations')) {
    db.organizations[id] = {
      name: spec.field('name').requiredStringValue(),
      description: spec.field('description').optionalStringValue(),
      website_url: spec.field('website_url').optionalStringValue(),
      country: spec.field('country').optionalStringValue(),
      privacy_policy_url: spec
        .field('privacy_policy_url')
        .optionalStringValue(),
      privacy_contact: spec.field('privacy_contact').optionalStringValue(),
      ghostery_id: spec.field('ghostery_id').optionalStringValue(),
    };
  }

  for (const [id, spec] of getSpecs('patterns')) {
    db.patterns[id] = {
      name: spec.field('name').requiredStringValue(),
      category: spec.field('category').requiredStringValue(),
      organization: spec.field('organization').optionalStringValue(),
      alias: spec.field('alias').optionalStringValue(),
      website_url: spec.field('website_url').optionalStringValue(),
      ghostery_id: spec.field('ghostery_id').optionalStringValue(),
      domains: [],
      filters: [],
    };

    const filters = spec.field('filters').optionalStringValue();
    if (filters) {
      for (const line of filters.split(/[\r\n]+/g)) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('!')) {
          db.patterns[id].filters.push(trimmed);
          db.filters[trimmed] = id;
        }
      }
    }

    const domains = spec.field('domains').optionalStringValue();
    if (domains) {
      for (const line of domains.split(/[\r\n]+/g)) {
        const trimmed = line.trim();
        if (trimmed) {
          db.patterns[id].domains.push(trimmed);
          db.domains[trimmed] = id;
        }
      }
    }
  }

  console.log('Exported categories:', Object.keys(db.categories).length);
  console.log('Exported organizations:', Object.keys(db.organizations).length);
  console.log('Exported patterns:', Object.keys(db.patterns).length);
  console.log('Exported domains:', Object.keys(db.domains).length);
  console.log('Exported filters:', Object.keys(db.filters).length);

  writeFileSync(outputPath, JSON.stringify(db, null, 2));
})();
