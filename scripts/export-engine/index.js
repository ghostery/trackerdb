import { rmSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { FiltersEngine } from '@ghostery/adblocker';
import { prepareDistFolder, BASE_PATH } from '../helpers.js';

(async () => {
  prepareDistFolder();

  const inputPath = path.join(BASE_PATH, 'dist', 'trackerdb.json');
  const outputPath = path.join(BASE_PATH, 'dist', 'trackerdb.engine');

  if (existsSync(outputPath)) {
    rmSync(outputPath);
  }

  if (!existsSync(inputPath)) {
    // generate input json if missing
    await import('../export-json/index.js');
  }

  const engine = FiltersEngine.fromTrackerDB(
    JSON.parse(readFileSync(inputPath)),
    {
      enableOptimizations: false,
    },
  );

  const serialized = engine.serialize();

  writeFileSync(outputPath, serialized);
})();
