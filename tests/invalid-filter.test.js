import FieldType from '../field-type.js';
import Record from '../record.js';
import invalidFilter from '../filters/invalid-filter.js';

const amount = new FieldType().with.validator({
    name: 'greater than zero',
    validate(n) {
        return n > 0;
    },
});

describe('invalidFilter', () => {
    it('is false when there are no errors', () => {
        const record = new Record({ amount }, { amount: 100 });
        expect(invalidFilter()(record)).toEqual(false);
    });

    it('is true when there are some errors', () => {
        const record = new Record({ amount }, { amount: -1 });
        expect(invalidFilter()(record)).toEqual(true);
    });
});
