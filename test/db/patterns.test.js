import test from 'node:test';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import * as adblocker from '@ghostery/adblocker';
import enolib from 'enolib';
import {
  CATEGORIES,
  ORGANIZATIONS,
  SPEC_FILE_EXTENSION,
  isSpecFile,
  assertUrl,
  partition,
} from '../helpers.js';

const RESOURCE_PATH = path.join('db', 'patterns');
const ALLOWED_CATEGORIES_STRING = CATEGORIES.map((c) => `'${c}'`).join(', ');
const FIELDS_ALLOW_LIST = [
  'alias',
  'category',
  'domains',
  'filters',
  'name',
  'notes',
  'organization',
  'ghostery_id',
  'website_url',
  'archived',
];

function parseSpecFile(specFile) {
  return enolib.parse(
    readFileSync(path.join(RESOURCE_PATH, specFile), 'utf-8'),
  );
}

test(RESOURCE_PATH, async (t) => {
  const [specFiles, nonSpecFiles] = partition(
    readdirSync(RESOURCE_PATH),
    isSpecFile,
  );

  await t.test('All patterns must end with ".eno"', () => {
    assert.ok(
      nonSpecFiles.length === 0,
      `Patterns files detected that do not end on ".eno". Rename the following files to end with .eno:\n${nonSpecFiles.toSorted().join('\n')}\n`,
    );
  });

  await t.test('Patterns must be ASCII without white spaces', () => {
    const badNames = new Set(
      specFiles.filter((file) => !/^[a-z0-9._-]+[.]eno$/.test(file)),
    );

    // these are historical names, but should be avoided in the future:
    for (const exception of ['yume,_inc..eno', 'mark_+_mini.eno']) {
      assert(
        badNames.delete(exception),
        `Exception no longer needed, please remove: ${exception}`,
      );
    }

    assert.ok(
      badNames.size === 0,
      `The following files do not meet the naming conventions. Rename the following files:\n${[...badNames].sort().join('\n')}\n`,
    );
  });

  for (const specFile of specFiles) {
    const specName = path.basename(specFile, SPEC_FILE_EXTENSION);

    await t.test(`pattern: ${specName}`, async (t) => {
      let spec;

      t.test('filename is not a number', () => {
        assert.strictEqual(Number(specName), NaN);
      });

      await t.test('has a valid filename', () => {
        assert(!specName.includes(':'));
      });

      await t.test('has spec file', () => {
        spec = parseSpecFile(specFile);
      });

      await t.test('has a name', () => {
        spec.field('name').requiredStringValue();
      });

      await t.test('has a category', () => {
        const category = spec.field('category').requiredStringValue();
        assert(
          !!CATEGORIES.find((c) => c === category),
          `there is no such category '${category}'. Valid country names are ${ALLOWED_CATEGORIES_STRING}`,
        );
      });

      await t.test('has an organization', () => {
        const organization = spec.field('organization').optionalStringValue();
        if (organization) {
          assert(
            !!ORGANIZATIONS.find((c) => c === organization),
            `there is no such organization '${organization}'`,
          );
        }
      });

      await t.test('has a valid website url', () => {
        const url = spec.field('website_url').optionalStringValue();
        if (url) {
          assertUrl(url);
        }
      });

      await t.test('has at least one domain if not a alias', () => {
        const domains = spec.field('domains').optionalStringValue() || '';
        if (!spec.field('alias').optionalStringValue()) {
          assert.ok(domains.length > 0, `${specFile} has no domains`);
        }
      });

      await t.test('has valid filters', () => {
        const filters = spec.field('filters').optionalStringValue();
        if (filters) {
          for (const line of filters.split(/[\r\n]+/g)) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('!')) {
              assert.ok(adblocker.parseFilter(trimmed), trimmed);
            }
          }
        }
      });

      await t.test('has no additional values but notes', () => {
        const fieldNames = spec.elements().map((e) => e.stringKey());
        const blockedFieldNames = fieldNames.filter(
          (f) => !FIELDS_ALLOW_LIST.includes(f),
        );
        assert.deepEqual(
          blockedFieldNames,
          [],
          `fields: ${blockedFieldNames
            .map((f) => `'${f}'`)
            .join(',')} are not allowed`,
        );
      });
    });
  }

  await t.test('has no overlapping domains', () => {
    const domainsSeen = new Map();
    for (const specFile of specFiles) {
      const specName = path.basename(specFile, SPEC_FILE_EXTENSION);
      const spec = parseSpecFile(specFile);
      const domains = spec.field('domains').optionalStringValue();
      if (domains) {
        for (const line of domains.split(/[\r\n]+/g)) {
          const domain = line.trim();
          const conflict = domainsSeen.get(domain);
          assert.ok(
            !conflict,
            `Domain lists overlap between: "${domain}" is included both in "${conflict}" and "${specName}"`,
          );
          domainsSeen.set(domain, specName);
        }
      }
    }
  });
});
