import FieldType from '../field-type.js';
import Record from '../record.js';
import containsAnyFilter from '../filters/contains-any-filter.js';

describe('containsAnyFilter(key, substring)', () => {
    const name = new FieldType();
    const title = new FieldType();

    const record = new Record(
        { name, title },
        {
            name: 'Austin Powers',
            title: 'International Man of Mystery',
        }
    );

    const testValues = ['Austin Powers', 'Dr.Evil', 'Mini Me', 'Scott Evil'];

    it('returns true for an exact match', () => {
        expect(containsAnyFilter('name', testValues)(record)).toBeTruthy();
    });

    it('is case-insensitive', () => {
        expect(
            containsAnyFilter('name', ['austin powers', 'Dr.Evil', 'Mini Me', 'Scott Evil'])(record)
        ).toBeTruthy();
    });
    it('returns false if the strings do not match', () => {
        expect(containsAnyFilter('title', testValues)(record)).toBeFalsy();
    });

    it('returns true if there is no value for the record', () => {
        expect(containsAnyFilter('company', testValues)(record)).toBeTruthy();
    });

    it('returns true if there are no test values', () => {
        expect(containsAnyFilter('name', [])(record)).toBeTruthy();
    });
});
