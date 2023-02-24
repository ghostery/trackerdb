import { existsSync, readFileSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import enolib from 'enolib';

export const DIST_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'dist',
);

export function prepareDistFolder() {
  if (
    !existsSync('package.json') ||
    !existsSync('db') ||
    !existsSync('scripts')
  ) {
    throw new Error('Export has to be run from project root');
  }

  if (!existsSync(DIST_PATH)) {
    mkdirSync(DIST_PATH);
  }
}

export function getSpecs(kind) {
  const specsPath = path.join(process.cwd(), 'db', kind);
  const specs = readdirSync(specsPath).filter(
    (file) => path.extname(file) === '.eno',
  );
  return specs.map((specName) => [
    path.basename(specName, '.eno'),
    enolib.parse(readFileSync(path.join(specsPath, specName), 'utf-8')),
  ]);
}
