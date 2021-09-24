import FieldType from '../field-type.js';
import Record from '../record.js';
import andFilter from '../filters/and-filter.js';
import containsFilter from '../filters/contains-filter.js';

const name = new FieldType();
const iceCream = new FieldType();

const RECORD = new Record({ name, iceCream }, { name: 'Alice', iceCream: 'chocolate' });

describe('andFilter([filter1, filter2, filter3, ...])', () => {
    it('is true if all of the sub-filers are true', () => {
        const filters = [containsFilter('name', 'Al'), containsFilter('iceCream', 'oco')];
        expect(andFilter(filters)(RECORD)).toBeTruthy();
    });

    it('is false if one of the sub-filters is false', () => {
        const filters = [containsFilter('name', 'Al'), containsFilter('iceCream', 'van')];
        expect(andFilter(filters)(RECORD)).toBeFalsy();
    });

    it('is true if passed no filters', () => {
        const filters = [];
        expect(andFilter(filters)(RECORD)).toBeTruthy();
    });

    it('composes', () => {
        const filters = [
            containsFilter('name', 'Al'),
            containsFilter('iceCream', 'oco'),
            andFilter([containsFilter('name', 'lice')]),
        ];

        expect(andFilter(filters)(RECORD)).toBeTruthy();
    });
});
