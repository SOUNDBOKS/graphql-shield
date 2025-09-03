import jsLint from '@eslint/js';
import tsLint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginTypescriptEslint from '@typescript-eslint/eslint-plugin';
import eslintPluginTypescriptParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  jsLint.configs.recommended,
  ...tsLint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      parser: eslintPluginTypescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.node,
    },
    plugins: {
      eslintPluginTypescriptEslint,
    },
    rules: {
      'no-fallthrough': 'off',
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
    ignores: ['src/client/soundboks/gql/*'],
  },
];
