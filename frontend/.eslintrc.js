module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier', // Disables ESLint rules that might conflict with Prettier
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    // Enforce consistent code style
    'prettier/prettier': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/naming-convention': [
      'error',
      // Enforce camelCase for variables and functions
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
      },
      // PascalCase for classes, interfaces, etc.
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
    ],
    // Enforce consistent member delimiter style
    '@typescript-eslint/member-delimiter-style': 'error',
    // Require explicit return types on functions and class methods
    '@typescript-eslint/explicit-module-boundary-types': 'error',
  },
  env: {
    node: true,
    es6: true,
  },
};