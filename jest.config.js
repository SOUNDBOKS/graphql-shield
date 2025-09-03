module.exports = {
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
