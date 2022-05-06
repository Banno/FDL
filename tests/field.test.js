import FieldType from '../field-type.js';
import Record from '../record.js';

const reverseAndUpperCase = new FieldType().with
    .formatter(s => s.split('').reverse().join(''))
    .and.parser(s => s.split('').reverse().join(''))
    .and.formatter(s => s.toUpperCase())
    .and.parser(s => s.toLowerCase());

const greaterThanFive = new FieldType().with.validator({
    name: 'value must be greater than 5',
    validate(v) {
        return v > 5;
    },
});

const greaterThanOther = new FieldType().with.validator({
    name: 'value must be greater than 5',
    validate(value, viewValue, record) {
        return value > record.getField('other');
    },
});

const numbersOnly = new FieldType().with.inputMask(/[0-9]/);

describe('Field', () => {
    it('exposes the value of the field in the record after running it through formatters', () => {
        const record = new Record({ test: reverseAndUpperCase }, { test: 'stressed' });
        expect(record.field('test').value).toEqual('DESSERTS');
    });

    it('sets the value of the field in the record after running it through formatters', () => {
        const record = new Record({ test: reverseAndUpperCase }, { test: 'stressed' });
        record.field('test').value = 'STRESSED';
        expect(record.getField('test')).toEqual('desserts');
    });

    it('can obscure the fact that the value is being parsed and formatted', () => {
        // This depends on the FieldTypes parsers and formatters being symmetrical
        const record = new Record({ test: reverseAndUpperCase }, { test: 'stressed' });
        const field = record.field('test');
        field.value = 'DESSERTS';
        expect(field.value).toEqual('DESSERTS');
    });

    it('can appear to change the value from what was entered by the user', () => {
        // Realistic example would be "12345.67" -> "$12,345.67"
        const record = new Record({ test: reverseAndUpperCase }, { test: 'stressed' });
        const field = record.field('test');
        field.value = 'desserts';
        expect(field.value).toEqual('DESSERTS');
    });

    it('exposes the raw value (get)', () => {
        const record = new Record({ test: reverseAndUpperCase }, { test: 'stressed' });
        expect(record.field('test').rawValue).toEqual('stressed');
    });

    it('exposes the raw value (set)', () => {
        const record = new Record({ test: reverseAndUpperCase }, { test: 'stressed' });
        const field = record.field('test');
        record.field('test').rawValue = 'stressed';
        expect(record.getField('test')).toEqual('stressed');
        expect(field.rawValue).toEqual('stressed');
        expect(field.value).toEqual('DESSERTS');
    });

    it('exposes the value formatted for a focused or blurred input', () => {
        const mask = new FieldType().with.formatter((value, record, context) => {
            if (context === 'input-focus') {
                return value;
            }
            if (context === 'input-blur') {
                return value.replace(/./g, '*');
            }
            return '[redacted]';
        });
        const record = new Record({ password: mask }, { password: 'secret' });
        expect(record.field('password').focusedInputValue).toEqual('secret');
        expect(record.field('password').blurredInputValue).toEqual('******');
    });

    it("exposes the field's validity", () => {
        const record = new Record({ test: greaterThanFive }, { test: 5 });
        const field = record.field('test');
        expect(field.valid).toEqual(false);
        expect(field.invalid).toEqual(true);
        field.rawValue = 6;
        expect(field.valid).toEqual(true);
        expect(field.invalid).toEqual(false);
    });

    it('can check whether a given input value would be valid', () => {
        const record = new Record(
            { test: greaterThanFive.with.parser(s => s.replace(/[^0-9]/g, '')) },
            { test: 5 }
        );
        const field = record.field('test');
        expect(field.isValidValue('x6x')).toEqual(true);
        expect(field.isValidValue('x4x')).toEqual(false);
    });

    it('announces when the value has changed on the record', () => {
        const record = new Record({ test: greaterThanFive }, { test: 5 });
        const field = record.field('test');
        let didChange = false;
        field.addEventListener('change', () => {
            didChange = true;
            throw new Error('did change');
        });
        record.setField('test', 6);
        expect(didChange).toEqual(true);
    });

    it('does not announce a change if a different value on the record changed', () => {
        const record = new Record(
            { test: greaterThanFive, other: greaterThanFive },
            { test: 5, other: 0 }
        );
        const field = record.field('test');
        let didChange = false;
        field.onChange(() => {
            didChange = true;
        });
        record.setField('other', 6);
        expect(didChange).toEqual(false);
    });

    it('does announce a change if a change to another field changed the validity of this one', () => {
        const record = new Record(
            { test: greaterThanOther, other: greaterThanOther },
            { test: 5, other: 0 }
        );
        const field = record.field('test');
        let changeCount = 0;
        field.onChange(() => {
            changeCount += 1;
        });

        expect(field.valid).toEqual(true);
        record.setField('other', 6);
        expect(field.valid).toEqual(false);
        expect(changeCount).toEqual(1);
        record.setField('other', 1);
        expect(field.valid).toEqual(true);
        expect(changeCount).toEqual(2);
        record.setField('other', 4);
        expect(field.valid).toEqual(true);
        expect(changeCount).toEqual(2);
    });

    it('knows if an input character is allowed', () => {
        const record = new Record({ test: numbersOnly }, { test: 5 });
        const field = record.field('test');
        expect(field.allowInputChar('0')).toEqual(true);
        expect(field.allowInputChar('A')).toEqual(false);
    });

    it('produces a child field of the same type for a field that has multiple values', () => {
        const excitedCoworker = new FieldType().with.formatter(s => `${s}!`);

        const record = new Record(
            { employees: excitedCoworker.with.multipleValues() },
            { employees: ['Pam', 'Jim', 'Dwight'] }
        );
        expect(record.field('employees').field(0).rawValue).toEqual('Pam');
        expect(record.field('employees').field(1).value).toEqual('Jim!');
    });
});
