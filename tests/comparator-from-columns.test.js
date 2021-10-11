import comparatorFromColumns from '../utilities/comparator-from-columns.js';
import { string, number } from '../primitives.js';

const stats = [
    { name: 'Andy', battingAverage: 0.321 },
    { name: 'Bob', battingAverage: 0.286 },
    { name: 'Chuck', battingAverage: 0.315 },
    { name: 'Dave', battingAverage: 0.315 },
    { name: 'Eve', battingAverage: 0.315 },
    { name: 'Fred', battingAverage: 0.345 },
    { name: 'Gina', battingAverage: 0.322 },
    { name: 'Henry', battingAverage: 0.233 },
    { name: 'Iris', battingAverage: 0.256 },
    { name: 'Jon', battingAverage: 0.235 },
    { name: 'Kim', battingAverage: 0.133 },
    { name: 'Ben', battingAverage: 0.133 },
    { name: 'Laura', battingAverage: 0.145 },
    { name: 'Maya', battingAverage: 0.351 },
];

const fields = {
    name: string,
    battingAverage: number,
};

describe('comparatorFromColumns(columns, fields) - compare and sort columns', () => {
    it('sorts by column in ascending order', () => {
        const sorters = [
            {
                field: 'battingAverage',
                sort: 'ascending',
            },
        ];

        expect(stats.sort(comparatorFromColumns(sorters, fields)).slice(0, 4)).toEqual([
            { battingAverage: 0.133, name: 'Kim' },
            { battingAverage: 0.133, name: 'Ben' },
            { battingAverage: 0.145, name: 'Laura' },
            { battingAverage: 0.233, name: 'Henry' },
        ]);
    });

    it('sorts by multiple columns', () => {
        const sorters = [
            {
                field: 'battingAverage',
                sort: 'descending',
            },
            {
                field: 'name',
                sort: 'descending',
            },
            {
                field: 'other',
            },
        ];

        expect(stats.sort(comparatorFromColumns(sorters, fields)).slice(4, 7)).toEqual([
            { battingAverage: 0.315, name: 'Eve' },
            { battingAverage: 0.315, name: 'Dave' },
            { battingAverage: 0.315, name: 'Chuck' },
        ]);
    });
});
