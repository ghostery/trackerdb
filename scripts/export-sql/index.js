import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { prepareDistFolder, BASE_PATH, getSpecs } from '../helpers.js';

(async () => {
  prepareDistFolder();

  const dbPath = path.join(BASE_PATH, 'dist', 'trackerdb.db');

  if (existsSync(dbPath)) {
    rmSync(dbPath);
  }

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.migrate({
    migrationsPath: path.join(
      process.cwd(),
      'scripts',
      'export-sql',
      'migrations',
    ),
  });

  const categoryIds = new Map();
  for (const [key] of getSpecs('categories')) {
    const { lastID } = await db.run(
      'INSERT INTO categories (name) VALUES (?)',
      key,
    );
    categoryIds.set(key, lastID);
  }

  for (const [key, spec] of getSpecs('organizations')) {
    await db.run(
      'INSERT INTO companies (id, name, description, privacy_url, website_url, country, privacy_contact, notes, ghostery_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      key,
      spec.field('name').requiredStringValue(),
      spec.field('description').optionalStringValue(),
      spec.field('privacy_policy_url').optionalStringValue(),
      spec.field('website_url').optionalStringValue(),
      spec.field('country').optionalStringValue(),
      spec.field('privacy_contact').optionalStringValue(),
      spec.field('notes').optionalStringValue(),
      spec.field('ghostery_id').optionalStringValue() || '',
    );
  }

  for (const [key, spec] of getSpecs('patterns')) {
    await db.run(
      'INSERT INTO trackers (id, name, category_id, website_url, company_id, notes, alias, ghostery_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      key,
      spec.field('name').requiredStringValue(),
      categoryIds.get(spec.field('category').requiredStringValue()),
      spec.field('website_url').optionalStringValue(),
      spec.field('organization').optionalStringValue() || null,
      spec.field('notes').optionalStringValue(),
      spec.field('alias').optionalStringValue(),
      spec.field('ghostery_id').optionalStringValue() || '',
    );

    const domains = (spec.field('domains').optionalStringValue() || '')
      .trim()
      .split(/\n+/g)
      .filter((d) => d !== '');

    for (const domain of domains) {
      await db.run(
        'INSERT INTO tracker_domains (tracker, domain) VALUES (?, ?)',
        key,
        domain,
      );
    }
  }

  await db.run('DROP TABLE migrations');

  console.log(
    'Exported categories:',
    (await db.get('SELECT count(*) as count FROM categories')).count,
  );
  console.log(
    'Exported companies:',
    (await db.get('SELECT count(*) as count FROM companies')).count,
  );
  console.log(
    'Exported trackers:',
    (await db.get('SELECT count(*) as count FROM trackers')).count,
  );
  console.log(
    'Exported tracker domains:',
    (await db.get('SELECT count(*) as count FROM tracker_domains')).count,
  );

  await db.close();
})();
