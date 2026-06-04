import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  js.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  prettierConfig,
]);

export default eslintConfig;
