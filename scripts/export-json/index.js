import { rmSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { prepareDistFolder, BASE_PATH, getSpecs } from '../helpers.js';

(async () => {
  prepareDistFolder();

  const outputPath = path.join(BASE_PATH, 'dist', 'trackerdb.json');

  if (existsSync(outputPath)) {
    rmSync(outputPath);
  }

  const db = {
    categories: {},
    organizations: {},
    patterns: {},
    domains: {},
    filters: {},
    cookies: {},
    headers: {},
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
      tags:
        spec
          .field('tags')
          .optionalStringValue()
          ?.split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0) || [],
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
      tags:
        spec
          .field('tags')
          .optionalStringValue()
          ?.split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0) || [],
      domains: [],
      filters: [],
      cookies: [],
      headers: [],
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

    const cookies = spec.field('cookies').optionalStringValue();
    if (cookies) {
      for (const line of cookies.split(/[\r\n]+/g)) {
        const trimmed = line.trim();
        if (trimmed) {
          db.patterns[id].cookies.push(trimmed);
          db.cookies[trimmed] = id;
        }
      }
    }

    const headers = spec.field('headers').optionalStringValue();
    if (headers) {
      for (const line of headers.split(/[\r\n]+/g)) {
        const trimmed = line.trim();
        if (trimmed) {
          db.patterns[id].headers.push(trimmed);
          db.headers[trimmed.toLowerCase()] = id;
        }
      }
    }
  }

  console.log('Exported categories:', Object.keys(db.categories).length);
  console.log('Exported organizations:', Object.keys(db.organizations).length);
  console.log('Exported patterns:', Object.keys(db.patterns).length);
  console.log('Exported domains:', Object.keys(db.domains).length);
  console.log('Exported filters:', Object.keys(db.filters).length);
  console.log('Exported cookies:', Object.keys(db.cookies).length);
  console.log('Exported headers:', Object.keys(db.headers).length);

  writeFileSync(outputPath, JSON.stringify(db, null, 2));
})();
