import Database from 'better-sqlite3';

import { rmSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { prepareDistFolder, BASE_PATH, getSpecs } from '../helpers.js';

const migration = readFileSync(
  path.join(
    BASE_PATH,
    'scripts',
    'export-sql',
    'migrations',
    '001-initial.sql',
  ),
  { encoding: 'utf-8' },
);

(async () => {
  prepareDistFolder();

  const dbPath = path.join(BASE_PATH, 'dist', 'trackerdb.db');

  if (existsSync(dbPath)) {
    rmSync(dbPath);
  }
  const db = new Database(dbPath);

  db.pragma('journal_mode = WAL');

  db.exec(migration);

  const categoryIds = new Map();
  for (const [key] of getSpecs('categories')) {
    const { lastInsertRowid } = db
      .prepare('INSERT INTO categories (name) VALUES (?)')
      .run(key);
    categoryIds.set(key, lastInsertRowid);
  }
  const insertCompanies = db.prepare(
    'INSERT INTO companies (id, name, description, privacy_url, website_url, country, privacy_contact, notes, ghostery_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const insertManyCompanies = db.transaction((companies) => {
    for (const company of companies) insertCompanies.run(company);
  });
  const companies = getSpecs('organizations').map(([key, spec]) => [
    key,
    spec.field('name').requiredStringValue(),
    spec.field('description').optionalStringValue(),
    spec.field('privacy_policy_url').optionalStringValue(),
    spec.field('website_url').optionalStringValue(),
    spec.field('country').optionalStringValue(),
    spec.field('privacy_contact').optionalStringValue(),
    spec.field('notes').optionalStringValue(),
    spec.field('ghostery_id').optionalStringValue() || '',
  ]);
  insertManyCompanies(companies);

  const insertTrackers = db.prepare(
    'INSERT INTO trackers (id, name, category_id, website_url, company_id, notes, ghostery_id) VALUES (:id, :name, :category_id, :website_url, :company_id, :notes, :ghostery_id)',
  );
  const insertManyTrackers = db.transaction((trackers) => {
    for (const tracker of trackers) insertTrackers.run(tracker);
  });
  const trackers = getSpecs('patterns').map(([key, spec]) => ({
    id: key,
    name: spec.field('name').requiredStringValue(),
    category_id: '2',
    website_url: spec.field('website_url').optionalStringValue(),
    company_id: 'google',
    notes: spec.field('notes').optionalStringValue(),

    ghostery_id: spec.field('ghostery_id').optionalStringValue() || '',
  }));
  insertManyTrackers(trackers);

  const updateTrackers = db.prepare(
    'UPDATE trackers SET alias = :alias WHERE id = :id',
  );
  const updateManyTrackers = db.transaction((trackers) => {
    for (const tracker of trackers) updateTrackers.run(tracker);
  });
  updateManyTrackers(
    getSpecs('patterns').map(([key, spec]) => ({
      id: key,
      alias: spec.field('alias').optionalStringValue(),
    })),
  );

  const insertDomains = db.prepare(
    'INSERT INTO tracker_domains (tracker, domain) VALUES (?, ?)',
  );
  const insertManyDomains = db.transaction((domains) => {
    for (const domain of domains) insertDomains.run(domain);
  });
  const domains = [];
  for (const [key, spec] of getSpecs('patterns')) {
    for (const domain of (spec.field('domains').optionalStringValue() || '')
      .trim()
      .split(/\n+/g)
      .filter((d) => d !== '')) {
      domains.push([key, domain]);
    }
  }
  insertManyDomains(domains);

  console.log(
    'Exported categories:',
    db.prepare('SELECT count(*) as count FROM categories').pluck().get(),
  );
  console.log(
    'Exported companies:',
    db.prepare('SELECT count(*) as count FROM companies').pluck().get(),
  );
  console.log(
    'Exported trackers:',
    db.prepare('SELECT count(*) as count FROM trackers').pluck().get(),
  );
  console.log(
    'Exported tracker domains:',
    db.prepare('SELECT count(*) as count FROM tracker_domains').pluck().get(),
  );

  await db.close();
})();
