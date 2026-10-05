import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import react from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist/', '.astro/']),

  js.configs.recommended,
  tseslint.configs.recommended,

  // Astro components, including the accessibility rules applied to their markup.
  astro.configs.recommended,
  astro.configs['jsx-a11y-recommended'],

  // React islands.
  {
    files: ['**/*.jsx'],
    extends: [
      react.configs.recommended,
      reactHooks.configs.flat.recommended,
      jsxA11y.configs.recommended,
    ],
    languageOptions: { globals: globals.browser },
  },

  // Build scripts, config files, and Astro's server-side code run in Node.
  {
    files: ['scripts/**', '*.config.{js,mjs,ts}', 'src/pages/**/*.js', 'src/utils/**'],
    languageOptions: { globals: globals.node },
  },

  {
    files: ['tests/**'],
    languageOptions: { globals: { ...globals.node, ...globals.vitest } },
  },

  // Last, so formatting is left entirely to Prettier.
  prettier,
]);
