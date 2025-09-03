import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  testEnvironment: 'node',
  collectCoverage: false,
  transform: {
    '.(ts|tsx)': '@swc/jest',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  collectCoverageFrom: ['./src/**'],
  moduleDirectories: ['node_modules', __dirname],
  coverageReporters: ['json-summary', 'text', 'lcov'],
};
