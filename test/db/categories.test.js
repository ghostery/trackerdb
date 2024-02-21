import test from 'node:test';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import enolib from 'enolib';
import { SPEC_FILE_EXTENSION } from '../helpers.js';

const RESOURCE_PATH = path.join('db', 'categories');

test(RESOURCE_PATH, async (t) => {
  const specFiles = readdirSync(RESOURCE_PATH).filter(
    (file) => path.extname(file) === SPEC_FILE_EXTENSION,
  );

  for (const specFile of specFiles) {
    const specName = path.basename(specFile, SPEC_FILE_EXTENSION);

    await t.test(`category: ${specName}`, async (t) => {
      let spec;

      await t.test('has a valid filename', () => {
        assert(!specName.includes(':'));
      });

      await t.test('has spec file', () => {
        spec = enolib.parse(
          readFileSync(path.join(RESOURCE_PATH, specFile), 'utf-8'),
        );
      });

      await t.test('has a name', () => {
        spec.field('name').requiredStringValue();
      });

      await t.test('has a description', () => {
        spec.field('description').requiredStringValue();
      });

      await t.test('has a color', () => {
        const color = spec.field('color').requiredStringValue();
        assert(/^#[0-9A-F]{6}$/i.test(color), 'that is correct RGB color');
      });

      await t.test('has an icon', () => {
        const svgFilePath = path.join(RESOURCE_PATH, `${specName}.svg`);
        assert(existsSync(svgFilePath), 'SVG file should exist');
      });
    });
  }
});
