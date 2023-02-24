import { existsSync, readFileSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import enolib from 'enolib';

export const BASE_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

export function prepareDistFolder() {
  if (
    !existsSync(path.join(BASE_PATH, 'package.json')) ||
    !existsSync(path.join(BASE_PATH, 'db')) ||
    !existsSync(path.join(BASE_PATH, 'scripts'))
  ) {
    throw new Error('Export has to be run from project root');
  }

  if (!existsSync(path.join(BASE_PATH, 'dist'))) {
    mkdirSync(path.join(BASE_PATH, 'dist'));
  }
}

export function getSpecs(kind) {
  const specsPath = path.join(BASE_PATH, 'db', kind);
  const specs = readdirSync(specsPath).filter(
    (file) => path.extname(file) === '.eno',
  );
  return specs.map((specName) => [
    path.basename(specName, '.eno'),
    enolib.parse(readFileSync(path.join(specsPath, specName), 'utf-8')),
  ]);
}
