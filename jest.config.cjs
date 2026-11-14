/** Jest + Testing Library. Los archivos de prueba van junto al archivo que prueban: use-login.ts → use-login.test.ts */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testRegex: '.*\\.test\\.tsx?$',
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx', esModuleInterop: true, module: 'commonjs', moduleResolution: 'node', isolatedModules: true, types: ['jest', '@testing-library/jest-dom'] } }] },
  moduleNameMapper: {
    // import.meta.env solo existe en Vite: en pruebas se sustituye por un módulo equivalente
    '^@/shared/config/env$': '<rootDir>/src/test/env.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^axios$': '<rootDir>/node_modules/axios/dist/node/axios.cjs',
    '\\.module\\.css$': 'identity-obj-proxy',
    '\\.css$': '<rootDir>/src/test/style-mock.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  collectCoverageFrom: [
    'src/features/**/*.{ts,tsx}',
    'src/shared/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/models/**',
    '!**/props.ts',
    '!src/shared/config/env.ts',
    '!src/shared/theme.ts',
    '!src/shared/config/i18n/types.ts',
    '!**/index.ts',
  ],
  coverageThreshold: { global: { branches: 70, functions: 70, lines: 70, statements: 70 } },
};
