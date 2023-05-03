import path from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { FiltersEngine, ENGINE_VERSION } from '@cliqz/adblocker';

import { BASE_PATH } from '../scripts/helpers.js';

export async function generateEngine() {
  // Generate input JSON if missing
  const trackerDBPath = path.join(BASE_PATH, 'dist', 'trackerdb.json');
  if (!existsSync(trackerDBPath)) {
    await import('../scripts/export-json/index.js');
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

  return trackerEnginePath;
}
