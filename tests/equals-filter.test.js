import FieldType from '../field-type.js';
import Record from '../record.js';
import equalsFilter from '../filters/equals-filter.js';

describe('equalsFilter(key, substring)', () => {
    const name = new FieldType();
    const title = new FieldType();
    const isGroovy = new FieldType();

    const record = new Record(
        { name, title, isGroovy },
        {
            name: 'Austin Powers',
            title: 'International Man of Mystery',
            isGroovy: true,
        }
    );

    it('returns true for an exact match', () => {
        expect(equalsFilter('name', 'Austin Powers')(record)).toBeTruthy();
    });

    it('does not filter when there are no record or test values', () => {
        expect(equalsFilter('', null)(record)).toBeTruthy();
    });

    it('is case-insensitive', () => {
        expect(equalsFilter('name', 'AUSTIN POWERS')(record)).toBeTruthy();
    });

    it('returns false if the strings do not match', () => {
        expect(equalsFilter('name', 'Austin')(record)).toBeFalsy();
    });

    it('returns true if there is no value for the record', () => {
        expect(equalsFilter('company', 'Jack Henry')(record)).toBeTruthy();
    });
    it('returns true if the filter is an empty string', () => {
        expect(equalsFilter('name', '')(record)).toBeTruthy();
    });

    it('returns true if the value is a matching boolean', () => {
        expect(equalsFilter('isGroovy', true)(record)).toBeTruthy();
    });

    it('returns true if the value is a not-matching boolean', () => {
        expect(equalsFilter('isGroovy', false)(record)).toBeFalsy();
    });

    it('returns false if the types do not match', () => {
        expect(equalsFilter('isGroovy', 'oh behave')(record)).toBeFalsy();
    });
});
