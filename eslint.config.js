import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import { readFileSync } from 'node:fs';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  // https://typescript-eslint.io/users/configs#recommended-configurations
  tseslint.configs.recommended,
  // Apply type-checking only to TypeScript files
  ...tseslint.configs.recommendedTypeChecked.map((sharedConfig) => ({
    ...sharedConfig,
    files: ['**/*.ts'],
  })),
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
      },
    },
    rules: {
      'prettier/prettier': 2, // Means error
    },
  },
  {
    files: ['lint.js', 'cli.js', 'scripts/**/*.js', 'test/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    ignores: readFileSync('./.gitignore', 'utf8').split('\n'),
  },
);
