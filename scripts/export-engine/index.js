import { rmSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { prepareDistFolder, DIST_PATH } from '../helpers.js';
import { FiltersEngine } from '@cliqz/adblocker';


(async () => {
  prepareDistFolder();

  const inputPath = path.join(DIST_PATH, `trackerdb.json`);
  const outputPath = path.join(DIST_PATH, `trackerdb.engine`);

  if (existsSync(outputPath)) {
    rmSync(outputPath);
  }

  if (!existsSync(inputPath)) {
    // generate input json if missing
    await import('../export-json/index.js');
  }

  const engine = FiltersEngine.fromTrackerDB(
    JSON.parse(readFileSync(inputPath)),
  );

  const serialized = engine.serialize();

  writeFileSync(outputPath, serialized);
})();
