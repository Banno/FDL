const base = require('../../jest.config.js');

module.exports = {
    ...base,

    setupFilesAfterEnv: ['../../jest-helpers/jest.init.js'],

    roots: ['./tests', './filters'],

    collectCoverageFrom: ['./**/*.js'],
};
