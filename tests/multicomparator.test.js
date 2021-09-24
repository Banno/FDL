import multicomparator from '../utilities/multicomparator.js';

/* eslint-disable no-unused-vars */
const EQUAL = (a, b) => 0;
const A_IS_SMALLER = (a, b) => -1;
const A_IS_LARGER = (a, b) => 1;

describe('multicomparator', () => {
    it('with only one comparator', () => {
        expect(multicomparator([A_IS_SMALLER])(10, 20)).toEqual(-1);
    });

    it('returns the first non-zero result', () => {
        expect(multicomparator([EQUAL, EQUAL, A_IS_LARGER, A_IS_SMALLER, EQUAL])(10, 20)).toEqual(
            1
        );
    });

    it('returns zero if all comparators are equal', () => {
        expect(multicomparator([EQUAL, EQUAL, EQUAL])(10, 20)).toEqual(0);
    });

    it('returns zero if there are no comparators', () => {
        expect(multicomparator([])(10, 20)).toEqual(0);
    });
    it('can be used to sort multiple columns', () => {
        const data = [
            { last: 'Doe', first: 'John' },
            { last: 'Smith', first: 'John' },
            { last: 'Doe', first: 'Jane' },
        ];

        const comparators = [
            (a, b) => {
                if (a.first < b.first) return -1;
                if (a.first > b.first) return 1;
                return 0;
            },
            (a, b) => {
                if (a.last < b.last) return -1;
                if (a.last > b.last) return 1;
                return 0;
            },
        ];
        data.sort(multicomparator(comparators));
        expect(data).toEqual([
            { last: 'Doe', first: 'Jane' },
            { last: 'Doe', first: 'John' },
            { last: 'Smith', first: 'John' },
        ]);
    });
});
