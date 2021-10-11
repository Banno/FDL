import FieldType from '../field-type.js';
import Record from '../record.js';
import orFilter from '../filters/or-filter.js';
import containsFilter from '../filters/contains-filter.js';

const name = new FieldType();
const iceCream = new FieldType();

const RECORD = new Record({ name, iceCream }, { name: 'Alice', iceCream: 'chocolate' });

describe('orFilter([filter1, filter2, filter3, ...])', () => {
    it('is true if any of the sub-filters are true', () => {
        const filters = [containsFilter('name', 'X'), containsFilter('iceCream', 'oco')];
        expect(orFilter(filters)(RECORD)).toBeTruthy();
    });

    it('is false if none of the sub-filters is true', () => {
        const filters = [containsFilter('name', 'choc'), containsFilter('iceCream', 'Al')];
        expect(orFilter(filters)(RECORD)).toBeFalsy();
    });

    it('is true if passed no filters', () => {
        const filters = [];
        expect(orFilter(filters)(RECORD)).toBeTruthy();
    });

    it('composes', () => {
        const filters = [
            containsFilter('name', 'X'),
            containsFilter('iceCream', 'X'),
            orFilter([containsFilter('name', 'lice')]),
        ];

        expect(orFilter(filters)(RECORD)).toBeTruthy();
    });
});
