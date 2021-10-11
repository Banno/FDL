import FieldType from '../field-type.js';
import Record from '../record.js';
import containsFilter from '../filters/contains-filter.js';

describe('containsFilter(key, substring)', () => {
    const name = new FieldType();
    const title = new FieldType();
    const age = new FieldType();

    const record = new Record(
        { name, title, age },
        {
            name: 'Austin Powers',
            title: 'International Man of Mystery',
            age: 42,
        }
    );

    it('matches a string containing the substring', () => {
        expect(containsFilter('name', 'tin')(record)).toBeTruthy();
    });

    it('matches (ignores the filter) when they is no filter string passed', () => {
        expect(containsFilter('name', '')(record)).toBeTruthy();
    });

    it('does not match a string that does not contain the substring', () => {
        expect(containsFilter('title', 'tin')(record)).toBeFalsy();
    });

    it('is case-insensitive', () => {
        expect(containsFilter('title', 'man')(record)).toBeTruthy();
    });

    it('does not match a key that is missing', () => {
        expect(containsFilter('bad-key', 'man')(record)).toBeFalsy();
    });

    it('matches a number', () => {
        expect(containsFilter('age', '2')(record)).toBeTruthy();
        expect(containsFilter('age', '5')(record)).toBeFalsy();
        expect(containsFilter('age', 'a')(record)).toBeFalsy();
    });
});
