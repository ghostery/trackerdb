import test from 'node:test';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import enolib from 'enolib';
import iso3311a2 from 'iso-3166-1-alpha-2';
import { SPEC_FILE_EXTENSION, assertUrl } from '../helpers.js';

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
  const specFiles = readdirSync(RESOURCE_PATH).filter(
    (file) => path.extname(file) === SPEC_FILE_EXTENSION,
  );
  for (const specFile of specFiles) {
    const specName = path.basename(specFile, SPEC_FILE_EXTENSION);

    await t.test(`organization: ${specName}`, async (t) => {
      let spec;

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
