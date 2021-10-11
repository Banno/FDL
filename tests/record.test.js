/* eslint-disable sonarjs/no-duplicate-string */

import FieldType from '../field-type.js';
import Record from '../record.js';

function helloFormat(name) {
    return `Hello, ${name}!`;
}

const alwaysInvalid = {
    name: 'always-invalid',
    validate() {
        return false;
    },
};

const types = {
    personName: new FieldType().with.formatter(helloFormat),
    battingAverage: new FieldType().with.validator(alwaysInvalid),
};

const record = new Record(
    {
        name: types.personName,
        battingAverage: types.battingAverage,
    },
    {
        name: 'Alice',
        battingAverage: '0.3',
    }
);

describe('Record', () => {
    it('prints a value according to its formatter(s)', () => {
        expect(record.print('name')).toEqual('Hello, Alice!');
    });

    it('getField() returns a fields value', () => {
        expect(record.getField('name')).toEqual('Alice');
    });

    it('setField() updates the records value for a field', () => {
        record.setField('battingAverage', '0.250');
        expect(record.values.battingAverage).toEqual('0.250');
    });

    it('knows how many errors it has', () => {
        expect(record.errorCount()).toEqual(1);
    });

    it('is invalid when errors are present', () => {
        const errors = record.hasErrors();
        const valid = record.isValid();
        expect(errors).toEqual(!valid);
    });
    it('resets record back to initial load', () => {
        record.setField('name', 'Tyler');
        record.setField('battingAverage', '0.4');

        expect(record.values).toEqual({
            name: 'Tyler',
            battingAverage: '0.4',
        });
        record.reset();
        expect(record.values).toEqual({
            name: 'Alice',
            battingAverage: '0.3',
        });
    });

    describe('clone()', () => {
        const original = new Record(
            { role: new FieldType(), password: new FieldType() },
            { role: 'admin', password: 'lover_b0i' }
        );

        const clone = original.clone();

        it('copies the values', () => {
            expect(clone.getField('role')).toEqual(original.getField('role'));
        });

        it('copies only the specified columns', () => {
            expect(original.clone(['role']).getField('password')).not.toEqual(
                original.getField('password')
            );
        });

        it('does not change the clone when the original changes', () => {
            original.setField('role', 'user');
            expect(clone.getField('role')).not.toEqual(original.getField('role'));
        });

        it('does not copy the event listeners', () => {
            let timesChanged = 0;
            original.addEventListener('change', () => {
                timesChanged++;
            });
            original.setField('role', 'teller');
            clone.setField('role', 'auditor');

            expect(timesChanged).toEqual(1);
        });
    });

    describe('field definition references', () => {
        const fieldRecord = new Record(
            {
                charCheck: new FieldType().with.inputMask(/[0-9$.,]/),
                parseField: new FieldType().with.parser(s => parseInt(s, 10)),
            },
            {
                charCheck: '9',
                parseField: '10',
            }
        );
        it('refers to a field definition to validate an input character', () => {
            expect(fieldRecord.allowInputChar('charCheck', '9')).toEqual(true);
            expect(fieldRecord.allowInputChar('charCheck', 'B')).toEqual(false);
        });
        it('parses a field in a record', () => {
            expect(fieldRecord.parse('parseField', '123')).toEqual(123);
        });
    });

    describe('hashOfFields()', () => {
        let changingRecord;
        beforeEach(() => {
            changingRecord = new Record(
                {
                    a: new FieldType(),
                    b: new FieldType(),
                    c: new FieldType(),
                },
                { a: 1, b: 2, c: 3 }
            );
        });

        it('returns the same hash value when the specified fields have not changed', () => {
            const oldHash = changingRecord.hashOfFields(['a', 'c']);
            changingRecord.setField('b', 1000);
            expect(changingRecord.hashOfFields(['a', 'c'])).toEqual(oldHash);
        });

        it('returns a different hash value when the specified fields have changed', () => {
            const oldHash = changingRecord.hashOfFields(['a', 'c']);
            changingRecord.setField('c', 1000);
            expect(changingRecord.hashOfFields(['a', 'c'])).not.toEqual(oldHash);
        });

        it('returns a different hash value when no fields are specified', () => {
            const oldHash = changingRecord.hashOfFields();
            changingRecord.setField('c', 1000);
            expect(changingRecord.hashOfFields()).not.toEqual(oldHash);
        });

        it('returns the same hash value when nothing changed', () => {
            const oldHash = changingRecord.hashOfFields();
            changingRecord.setField('c', 3); // it was already 3
            expect(changingRecord.hashOfFields()).toEqual(oldHash);
        });

        it('returns the same hash value when the fields array is empty', () => {
            const oldHash = changingRecord.hashOfFields([]);
            changingRecord.setField('c', 1000);
            expect(changingRecord.hashOfFields([])).toEqual(oldHash);
        });
    });
});
