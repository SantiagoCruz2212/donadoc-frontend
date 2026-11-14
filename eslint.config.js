// Calidad de código (guía de arquitectura): tipado estricto, orden de imports, sin estilos inline y,
// sobre todo, fronteras entre capas: un feature NO importa de otro feature; lo común va a shared/.
import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { boundaries, import: importPlugin, react, 'react-hooks': reactHooks },
    settings: {
      react: { version: 'detect' },
      'import/resolver': { typescript: { project: './tsconfig.json' } },
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'feature', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'shared', pattern: 'src/shared/**' },
      ],
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'no-console': 'warn',
      'react/forbid-dom-props': ['error', { forbid: ['style'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'import/no-cycle': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin', 'external'],
          'newlines-between': 'always',
        },
      ],
      // Matriz de dependencias: app → feature, shared · feature → shared (y su propio feature) · shared → shared
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'app', allow: ['feature', 'shared'] },
            { from: 'feature', allow: ['shared', ['feature', { feature: '${from.feature}' }]] },
            { from: 'shared', allow: ['shared'] },
          ],
        },
      ],
    },
  },
  { files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*'], rules: { 'no-console': 'off' } },
);
