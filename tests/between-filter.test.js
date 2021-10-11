import FieldType from '../field-type.js';
import Record from '../record.js';
import betweenFilter from '../filters/between-filter.js';

describe('betweenFilter(key, start, end)', () => {
    const name = new FieldType();
    const balance = new FieldType();
    const zero = new FieldType();

    const record = new Record(
        {
            name,
            balance,
            zero,
        },
        {
            name: 'Checking',
            balance: 400,
            zero: 0,
        }
    );
    it('matches a value within the range', () => {
        expect(betweenFilter('balance', 400, 401)(record)).toBeTruthy();
        expect(betweenFilter('balance', 399, 400)(record)).toBeTruthy();
    });
    it('does not match a value outside the range', () => {
        expect(betweenFilter('balance', 401, 500)(record)).toBeFalsy();
        expect(betweenFilter('balance', 300, 399)(record)).toBeFalsy();
    });

    it('matches if the record is missing', () => {
        expect(betweenFilter('missing', 0, 100)(record)).toBeTruthy();
    });

    it('does not match 0 if it is out of range', () => {
        expect(betweenFilter('zero', 1, 10)(record)).toBeFalsy();
    });
});
