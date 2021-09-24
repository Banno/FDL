module.exports = {
    setupFilesAfterEnv: ['./tests/jest-helpers/jest.init.js'],
    transformIgnorePatterns: [],
    verbose: false,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['lcov', 'text-summary'],
    coverageThreshold: {
        global: {
            lines: 1,
            statements: 1,
            functions: 1,
            branches: 1,
        },
    },
    reporters: ['default'],
    testURL: 'http://localhost',
    roots: ['./tests'],

    collectCoverageFrom: ['./**/*.js'],
};
