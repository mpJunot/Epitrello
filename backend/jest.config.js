module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.e2e-spec.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/*.config.ts',
    '!**/*.dto.ts',
    '!**/*.input.ts',
    '!**/*.type.ts',
    '!**/*.entity.ts',
    '!**/*.interface.ts',
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'json-summary'],
  // Note: Coverage thresholds are checked in CI/CD workflows
  // to avoid false failures when not all modules have tests yet.
  // Individual module coverage is verified in the CI pipeline.
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '\\.spec\\.ts$',
    '\\.e2e-spec\\.ts$',
  ],
  testEnvironment: 'node',
  verbose: true,
};

