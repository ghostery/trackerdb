import test from 'node:test';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import enolib from 'enolib';
import iso3311a2 from 'iso-3166-1-alpha-2';
import {
  SPEC_FILE_EXTENSION,
  isSpecFile,
  assertUrl,
  partition,
} from '../helpers.js';

const ALLOWED_COUNTRIES = iso3311a2.getCodes();
const ALLOWER_COUNTRIES_STRING = ALLOWED_COUNTRIES.sort()
  .map((c) => `'${c}'`)
  .join(', ');
const RESOURCE_PATH = path.join('db', 'organizations');
const FIELDS_ALLOW_LIST = [
  'name',
  'website_url',
  'privacy_policy_url',
  'privacy_contact',
  'country',
  'description',
  'ghostery_id',
  'notes',
  'archived',
];

test(RESOURCE_PATH, async (t) => {
  const [specFiles, nonSpecFiles] = partition(
    readdirSync(RESOURCE_PATH),
    isSpecFile,
  );

  await t.test('All organizations must end with ".eno"', () => {
    const unexpectedFiles = new Set(nonSpecFiles);
    unexpectedFiles.delete('.gitkeep');

    assert.ok(
      unexpectedFiles.size === 0,
      `Organization files detected that do not end on ".eno". Rename the following files to end with .eno:\n${[...unexpectedFiles].sort().join('\n')}\n`,
    );
  });

  await t.test('Organizations must be ASCII without white spaces', () => {
    const badNames = new Set(
      specFiles.filter((file) => !/^[a-z0-9._-]+[.]eno$/.test(file)),
    );

    // these are historical names, but should be avoided in the future:
    for (const exception of [
      'AO Kaspersky Lab.eno',
      'dun_&_bradstreet.eno',
      'contact_at_once!.eno',
      'financeads_gmbh_&_co._kg.eno',
      'green_&_red_technologies.eno',
      "i'mad_republic.eno",
      'livechatnow!.eno',
      'lucini_&_lucini_communications.eno',
      'press+.eno',
      'sitemeter,_inc..eno',
    ]) {
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

    await t.test(`organization: ${specName}`, async (t) => {
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

      await t.test('has a valid website url that can be empty', () => {
        const url = spec.field('website_url').optionalStringValue();
        if (url) {
          assertUrl(url);
        }
      });

      await t.test('has a privacy policy url', () => {
        const url = spec.field('privacy_policy_url').optionalStringValue();
        if (url) {
          assertUrl(url);
        }
      });

      await t.test('has a privacy contact that can be empty', () => {
        spec.field('privacy_contact').optionalStringValue();
      });

      await t.test('has a country that can be empty', () => {
        const country = spec.field('country').optionalStringValue();

        if (country) {
          assert(
            !!ALLOWED_COUNTRIES.find((c) => c === country),
            `country '${country}' is not on iso-3166-1-alpha-2 list. Valid country names are ${ALLOWER_COUNTRIES_STRING}`,
          );
        }
      });

      await t.test('has a description that can be empty', () => {
        spec.field('description').optionalStringValue();
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
});
