/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 2, // Means error
  },
  overrides: [
    {
      files: ['lint.js', 'cli.js', 'scripts/**/*'],
      env: {
        node: true,
      },
    },
  ],
};
