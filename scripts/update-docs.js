import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import ejs from 'ejs';
import { BASE_PATH, getSpecs } from './helpers.js';

function prepareContext() {
  const categories = getSpecs('categories').map(([, x]) => ({
    name: x.field('name').requiredStringValue(),
    description: x.field('description').requiredStringValue(),
  }));
  return { categories };
}

function render(source, target, context) {
  const template = readFileSync(source).toString('utf8');
  const output = ejs.render(template, context);
  console.log('Generating', target, 'from', source, '...');
  writeFileSync(target, output);
  console.log('Generating', target, 'from', source, '...DONE');
}

const templatePath = path.join(BASE_PATH, 'docs/.templates');
const targetPath = path.join(BASE_PATH, 'docs');
if (existsSync(templatePath)) {
  const context = prepareContext();
  const templates = readdirSync(templatePath).filter(
    (file) => path.extname(file) === '.ejs',
  );

  for (const template of templates) {
    const source = path.join(templatePath, template);
    const target = path.join(targetPath, template.replace(/\.ejs$/, ''));
    render(source, target, context);
  }
}
