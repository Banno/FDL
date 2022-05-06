import FieldType from '../field-type.js';
import Record from '../record.js';

describe('FieldType', () => {
    describe('validate(modelValue, viewValue, record, options)', () => {
        const oddNumberValidator = {
            name: 'must-be-odd',
            validate(modelValue) {
                return modelValue % 2 === 0;
            },
        };

        const badAccountTypeValidator = {
            name: 'bad-account-type',
            validate(modelValue, viewValue, record, options) {
                const { accountType } = record;
                return modelValue === options.validAccountNumbers[accountType];
            },
        };

        const badAccountTypeAsyncValidator = {
            name: 'bad-account-type',
            async validate(modelValue, viewValue, record, options) {
                const { accountType } = record;
                return Promise.resolve(modelValue === options.validAccountNumbers[accountType]);
            },
        };

        const accountNumber = new FieldType().with.validator(badAccountTypeValidator);
        const oddNumber = new FieldType().with.validator(oddNumberValidator);

        const invalidRecord = {
            accountNumber: '1111',
            accountType: 'DR',
        };

        const options = {
            validAccountNumbers: {
                CR: '1111',
                DR: '2222',
            },
        };
        it('validates a field', () => {
            const errors = accountNumber.validate(
                'accountNumber',
                '1111',
                '1111',
                invalidRecord,
                options
            );

            expect(errors).toEqual([
                {
                    field: 'accountNumber',
                    modelValue: '1111',
                    name: 'bad-account-type',
                    options: {
                        validAccountNumbers: {
                            CR: '1111',
                            DR: '2222',
                        },
                    },
                    record: {
                        accountNumber: '1111',
                        accountType: 'DR',
                    },
                    viewValue: '1111',
                },
            ]);
        });

        it('validates a field when only the model value is passed in', () => {
            const errors = oddNumber.validate(2);

            expect(errors).toEqual([
                {
                    field: 2,
                    modelValue: undefined,
                    name: 'must-be-odd',
                    options: undefined,
                    record: undefined,
                    viewValue: undefined,
                },
            ]);
        });
    });

    describe('with.formatter', () => {
        it('default: no formatting', () => {
            const fd = new FieldType();
            expect(fd.print('identity')).toEqual('identity');
        });

        it('one formatter', () => {
            const fieldType = new FieldType().with.formatter(v => v.toUpperCase());
            expect(fieldType.format('identity')).toEqual('IDENTITY');
        });

        it('two formatters', () => {
            const fieldType = new FieldType().with
                .formatter(v => v.toUpperCase())
                .and.formatter(v => `${v}small`);
            expect(fieldType.format('big')).toEqual('BIGsmall'); // cSpell:disable-line
        });

        it('extension', () => {
            const x = new FieldType().with.formatter(v => `${v}x`);
            const xy = x.with.formatter(v => `${v}y`);
            expect([x.format(''), xy.format('')]).toEqual(['x', 'xy']);
        });

        it('record', () => {
            const greeting = new FieldType().with.formatter(
                (value, record) => `${value} ${record.getField('name')}`
            );
            const record = new Record({ name: new FieldType() }, { name: 'world' });
            expect(greeting.format('hello', record)).toEqual('hello world');
        });

        it('context', () => {
            const fieldType = new FieldType().with.formatter((value, record, context) => context);

            expect(fieldType.format(null, null, 'input-focus')).toEqual('input-focus');
        });
    });

    describe('with.template', () => {
        it('default: no template', () => {
            const fieldType = new FieldType();
            expect(fieldType.print('identity')).toEqual('identity');
        });

        it('one template', () => {
            const fieldType = new FieldType().with.template(input => `<b>${input}</b>`);
            expect(fieldType.print('identity')).toEqual('<b>identity</b>');
        });

        it('calls formatter with the record and context of "print"', () => {
            const greeting = new FieldType().with.formatter(
                (value, record, context) => `${value} ${context} ${record.getField('name')}`
            );
            const record = new Record({ name: new FieldType() }, { name: 'world' });
            expect(greeting.print('hello', record)).toEqual('hello print world');
        });
    });

    describe('with.parser', () => {
        it('default: no parsing', () => {
            const fd = new FieldType();
            expect(fd.parse('identity')).toEqual('identity');
        });

        it('one parser', () => {
            const fd = new FieldType().with.parser(v => v.toLowerCase());
            expect(fd.parse('IDENTITY')).toEqual('identity');
        });

        it('two parsers', () => {
            const fd = new FieldType().with.parser(v => `${v}BIG`).and.parser(v => v.toLowerCase());
            expect(fd.parse('SMALL')).toEqual('smallBIG');
        });

        it('extension', () => {
            const ed = new FieldType().with.parser(word => `${word}ed`);
            const reed = ed.with.parser(word => `re${word}`);
            expect([ed.parse('test'), reed.parse('test')]).toEqual(['tested', 'retested']);
        });
    });

    describe('with.cellClass', () => {
        it('default: empty', () => {
            const fd = new FieldType();
            expect(fd.cellClasses()).toEqual([]);
        });

        it('one class', () => {
            const fd = new FieldType().with.cellClass('passion');
            expect(fd.cellClasses()).toEqual(['passion']);
        });

        it('many classes', () => {
            const fd = new FieldType().with
                .cellClass('passion')
                .and.cellClass('relationships')
                .and.cellClass('integrity')
                .and.cellClass('drive-for-results')
                .and.cellClass('excellence');
            expect(fd.cellClasses()).toEqual([
                'passion',
                'relationships',
                'integrity',
                'drive-for-results',
                'excellence',
            ]);
        });

        it('extension', () => {
            const x = new FieldType().with.cellClass('x');
            const y = x.with.cellClass('y');

            expect([x.cellClasses(), y.cellClasses()]).toEqual([['x'], ['x', 'y']]);
        });

        it('with.conditionalCellClass', () => {
            const fd = new FieldType().with
                .cellClass('number')
                .and.conditionalCellClass(n => n % 2 === 1, 'odd')
                .and.conditionalCellClass(n => n % 2 === 0, 'even');
            expect(fd.cellClasses(1)).toEqual(['number', 'odd']);
        });

        it('with.conditionalCellClass - extension', () => {
            const x = new FieldType().with.conditionalCellClass(() => true, 'x');
            const xy = x.with.conditionalCellClass(() => true, 'y');

            expect([x.cellClasses(1), xy.cellClasses(1)]).toEqual([['x'], ['x', 'y']]);
        });
    });

    describe('with.rowClasses((value, record) => {...})', () => {
        it('determines which classes at runtime', () => {
            const fd = new FieldType().with
                .rowClasses((value, record) => (record.hasError ? ['error'] : []))
                .and.rowClasses(value => (value === 'same-day' ? ['ach', 'sda'] : ['ach']));

            expect(fd.rowClasses('same-day', { hasError: true })).toEqual(['error', 'ach', 'sda']);
        });

        it('extension', () => {
            const x = new FieldType().with.rowClasses(() => ['x']);
            const xy = x.with.rowClasses(() => ['y']);

            expect([x.rowClasses(), xy.rowClasses()]).toEqual([['x'], ['x', 'y']]);
        });
    });

    describe('with.comparator((value, record) => {...})', () => {
        describe('default', () => {
            it('first is smaller (-1)', () => {
                const fieldType = new FieldType();
                expect(fieldType.compare('x', 'y')).toBeLessThan(0);
            });

            it('first is larger (+1)', () => {
                const fieldType = new FieldType();
                expect(fieldType.compare(50, 10)).toBeGreaterThan(0);
            });
            it('equal (0)', () => {
                const fieldType = new FieldType();
                expect(fieldType.compare('', '')).toEqual(0);
            });
        });

        describe('custom', () => {
            it('string as a number', () => {
                const data = ['02', '0001', '003'];
                const accountNumber = new FieldType().with.compareFunction((aString, bString) => {
                    const a = +aString;
                    const b = +bString;

                    if (a < b) {
                        return -1;
                    }

                    if (a > b) {
                        return 1;
                    }

                    return 0;
                });
                data.sort(accountNumber.compare.bind(accountNumber));
                expect(data).toEqual(['0001', '02', '003']);
            });
        });
    });

    describe('with.reducer((a, b) => {...}, <starting value>)', () => {
        it('empty string by default', () => {
            const recipientName = new FieldType();
            expect(recipientName.aggregate(['Alice', 'Bob', 'Eve'])).toEqual('');
        });

        it('custom aggregator', () => {
            const product = values => values.reduce((a, b) => a * b, 1);
            const recipientName = new FieldType().with.reducer(product);
            expect(recipientName.aggregate([2, 3, 5])).toEqual(30);
        });

        it('sum shorthand', () => {
            const recipientName = new FieldType().with.reducer('sum', 0);
            expect(recipientName.aggregate([2, 3, 5])).toEqual(10);
        });
    });

    describe('schema(name)', () => {
        it('defaults to "simple"', () => {
            expect(new FieldType().schema()).toEqual('simple');
        });
        it('can be set to a string value', () => {
            const address = new FieldType().with.schema('address');
            expect(address.schema()).toEqual('address');
        });
    });

    describe('options(config)', () => {
        it('hasOptions', () => {
            const a = new FieldType();
            const b = new FieldType().with.options([1, 2, 3]);
            expect([a.hasOptions(), b.hasOptions()]).toEqual([false, true]);
        });

        it('array of options', async () => {
            const state = new FieldType().with.options([
                { text: 'NC', value: 'north' },
                { text: 'SC', value: 'south' },
            ]);

            expect(await state.options()).toEqual([
                { text: 'NC', value: 'north' },
                { text: 'SC', value: 'south' },
            ]);
        });

        it('data property as an array', async () => {
            const state = new FieldType().with.options({
                data: [
                    { abbr: 'NC', location: 'north' },
                    { abbr: 'SC', location: 'south' },
                ],
                text: 'abbr',
                value: 'location',
            });
            expect(await state.options()).toEqual([
                { text: 'NC', value: 'north', abbr: 'NC', location: 'north' },
                { text: 'SC', value: 'south', abbr: 'SC', location: 'south' },
            ]);
        });

        it('text and value keys as functions', async () => {
            const state = new FieldType().with.options({
                data: [
                    { abbr: 'NC', location: 'north' },
                    { abbr: 'SC', location: 'south' },
                ],
                text: s => s.abbr,
                value: s => s.location,
            });
            expect(await state.options()).toEqual([
                { text: 'NC', value: 'north', abbr: 'NC', location: 'north' },
                { text: 'SC', value: 'south', abbr: 'SC', location: 'south' },
            ]);
        });

        it('options as a promise', async () => {
            const options = Promise.resolve([
                { text: 'NC', value: 'north' },
                { text: 'SC', value: 'south' },
            ]);
            const state = new FieldType().with.options(options);
            expect(await state.options()).toEqual([
                { text: 'NC', value: 'north' },
                { text: 'SC', value: 'south' },
            ]);
        });

        it('data property as a promise', async () => {
            const options = Promise.resolve([
                { text: 'NC', value: 'north' },
                { text: 'SC', value: 'south' },
            ]);

            const state = new FieldType().with.options({ data: options });
            expect(await state.options()).toEqual([
                { text: 'NC', value: 'north' },
                { text: 'SC', value: 'south' },
            ]);
        });

        it('function with options', async () => {
            const state = new FieldType().with.options({
                fetch() {
                    return Promise.resolve([
                        { text: 'NC', value: 'north' },
                        { text: 'SC', value: 'south' },
                    ]);
                },
            });
            expect(await state.options()).toEqual([
                { text: 'NC', value: 'north' },
                { text: 'SC', value: 'south' },
            ]);
        });

        it('sort options with a compare function', async () => {
            const sortOptions = (a, b) => {
                const x = a.text.toString().toLowerCase();
                const y = b.text.toString().toLowerCase();
                if (x < y) {
                    return -1;
                }

                if (x > y) {
                    return 1;
                }

                return 0;
            };
            const state = new FieldType().with.options({
                data: [
                    { text: 'VA', value: 'va' },
                    { text: 'NC', value: 'nc' },
                    { text: 'SC', value: 'sc' },
                    { text: 'GA', value: 'ga' },
                ],
                compareFunction: sortOptions,
            });
            expect(await state.options()).toEqual([
                { text: 'GA', value: 'ga' },
                { text: 'NC', value: 'nc' },
                { text: 'SC', value: 'sc' },
                { text: 'VA', value: 'va' },
            ]);
        });

        it('fetch with a record object', async () => {
            const state = new FieldType().with.options({
                fetch(record) {
                    if (record.getField('isDakota')) {
                        return Promise.resolve([
                            { text: 'ND', value: 'north' },
                            { text: 'SD', value: 'south' },
                        ]);
                    }
                    return Promise.resolve([
                        { text: 'NC', value: 'north' },
                        { text: 'SC', value: 'south' },
                    ]);
                },
            });
            const record = new Record({ isDakota: new FieldType() }, { isDakota: false });

            expect(await state.options(record)).toEqual([
                { text: 'NC', value: 'north' },
                { text: 'SC', value: 'south' },
            ]);

            record.setField('isDakota', true);

            expect(await state.options(record)).toEqual([
                { text: 'ND', value: 'north' },
                { text: 'SD', value: 'south' },
            ]);
        });

        it('does not recompute the options if the relevant fields have not changed', async () => {
            let timesFetched = 0;

            const state = new FieldType().with.options({
                fetch(record) {
                    return Promise.resolve([
                        { text: record.getField('label'), value: ++timesFetched },
                    ]);
                },
                fields: ['label'],
            });
            const record = new Record(
                { label: new FieldType(), irrelevant: new FieldType() },
                { label: 'original', irrelevant: "You're an elephant!" }
            );

            expect(await state.options(record)).toEqual([{ text: 'original', value: 1 }]);
            record.setField('irrelevant', 'I know you are but what am I?');
            expect(await state.options(record)).toEqual([{ text: 'original', value: 1 }]);
            record.setField('label', 'changed');
            expect(await state.options(record)).toEqual([{ text: 'changed', value: 2 }]);
        });

        it('does not recompute the options if the fetch function has no arguments', async () => {
            let timesFetched = 0;

            const state = new FieldType().with.options({
                fetch() {
                    return Promise.resolve([{ text: 'original', value: ++timesFetched }]);
                },
                fields: ['label'],
            });
            const record = new Record(
                { label: new FieldType(), irrelevant: new FieldType() },
                { label: 'original', irrelevant: "You're an elephant!" }
            );

            expect(await state.options(record)).toEqual([{ text: 'original', value: 1 }]);
            record.setField('irrelevant', 'I know you are but what am I?');
            expect(await state.options(record)).toEqual([{ text: 'original', value: 1 }]);
            record.setField('label', 'changed');
            expect(await state.options(record)).toEqual([{ text: 'original', value: 1 }]);
        });

        it('multiple values', async () => {
            const states = new FieldType().with
                .options([
                    { text: 'NC', value: 'north' },
                    { text: 'SC', value: 'south' },
                ])
                .and.multipleValues();
            expect(await states.options()).toEqual([
                { text: 'NC', value: 'north' },
                { text: 'SC', value: 'south' },
            ]);
            expect(states.hasMultipleValues()).toEqual(true);
        });

        it('multiple values - min and max', async () => {
            const favoriteMovies = new FieldType().with.multipleValues(3, 8);
            expect(favoriteMovies.minValueCount()).toEqual(3);
            expect(favoriteMovies.maxValueCount()).toEqual(8);
        });
    });

    describe('column widths', () => {
        it('minColumnWidth', () => {
            const a = new FieldType();
            const b = a.with.minColumnWidth(1);
            const c = a.with.minColumnWidth(2);
            const d = b.with.minColumnWidth(3);
            expect(b.properties.minColumnWidth).toEqual(1);
            expect(c.properties.minColumnWidth).toEqual(2);
            expect(d.properties.minColumnWidth).toEqual(3);
        });

        it('maxColumnWidth', () => {
            const a = new FieldType();
            const b = a.with.maxColumnWidth(1);
            const c = a.with.maxColumnWidth(2);
            const d = b.with.maxColumnWidth(3);
            expect(b.properties.maxColumnWidth).toEqual(1);
            expect(c.properties.maxColumnWidth).toEqual(2);
            expect(d.properties.maxColumnWidth).toEqual(3);
        });

        it('targetColumnWidth', () => {
            const a = new FieldType();
            const b = a.with.targetColumnWidth(1);
            const c = a.with.targetColumnWidth(2);
            const d = b.with.targetColumnWidth(3);
            expect(b.properties.targetColumnWidth).toEqual(1);
            expect(c.properties.targetColumnWidth).toEqual(2);
            expect(d.properties.targetColumnWidth).toEqual(3);
        });
    });

    describe('disabled', () => {
        it('not disabled by default', () => {
            const a = new FieldType();
            expect(a.isDisabled()).toBe(false);
        });

        it('is disabled when any disabledWhen function is true', () => {
            const a = new FieldType().thatIs.disabledWhen(() => true).and.disabledWhen(() => false);
            expect(a.isDisabled()).toBe(true);
        });

        it('alias disabled without passing a function in', () => {
            const a = new FieldType().thatIs.disabled();
            expect(a.isDisabled()).toBe(true);
        });
    });

    describe('.with.exampleValue(fn)', () => {
        it('default exampleValue is the identity function', () => {
            const base = new FieldType();
            expect(base.exampleValue()(0)).toEqual(0);
            expect(base.exampleValue()(100)).toEqual(100);
        });

        it('uses the input as a seed to generate an example value', () => {
            const phoneType = new FieldType().with.exampleValue(i =>
                i % 2 ? 'iPhone' : 'Android'
            );
            expect(phoneType.exampleValue()(0)).toEqual('Android');
            expect(phoneType.exampleValue()(1)).toEqual('iPhone');
        });
    });

    describe('with.filter', () => {
        it('default: do not filter (always match)', () => {
            const type = new FieldType();
            expect(type.match('searchText', 'value')).toEqual(true);
        });

        it('custom filter', () => {
            const type = new FieldType().with.filter((text, value) => value.startsWith(text));

            expect(type.match('searchText', 'value')).toEqual(false);
            expect(type.match('va', 'value')).toEqual(true);
            expect(type.match('ue', 'value')).toEqual(false);
        });

        it('default filter -- case-insensitive text match', () => {
            const type = new FieldType().with.filter();

            expect(type.match('searchText', 'value')).toEqual(false);
            expect(type.match('val', 'value')).toEqual(true);
            expect(type.match('ALU', 'value')).toEqual(true);
        });
    });

    describe('with.inputMask', () => {
        it('allows input if and only if it matches a regex', () => {
            const type = new FieldType().with.inputMask(/[0-9$.,]/);
            expect(type.allowInputChar('0')).toEqual(true);
            expect(type.allowInputChar('x')).toEqual(false);
        });

        it('allows all input by default', () => {
            const type = new FieldType();
            expect(type.allowInputChar('0')).toEqual(true);
            expect(type.allowInputChar('x')).toEqual(true);
        });

        it('always allows input that is not a character', () => {
            const type = new FieldType().with.inputMask(/[0-9]/);
            expect(type.allowInputChar('Left')).toEqual(true);
        });
    });

    describe('with.label()', () => {
        it('takes a label as a string', () => {
            const type = new FieldType().with.label('Name');
            expect(type.label()).toEqual('Name');
        });
        it('takes a label as a function', () => {
            const type = new FieldType().with.label(() => 'Name');
            expect(type.label()).toEqual('Name');
        });

        it('uses information from the record to build a label', () => {
            const record = new Record({ count: new FieldType() }, { count: 10 });
            const type = new FieldType().with.label(`${record.getField('count')} payments(s)`);
            expect(type.label()).toEqual('10 payments(s)');
        });
        it('composes labels', () => {
            const type = new FieldType().with
                .label('Hello')
                .and.label((record, labelSoFar) => `${labelSoFar} World`)
                .and.label((record, labelSoFar) => labelSoFar.toUpperCase());
            expect(type.label()).toEqual('HELLO WORLD');
        });
    });

    describe('visibleWhen', () => {
        it('is visible by default', () => {
            const type = new FieldType();
            expect(type.visible()).toEqual(true);
        });
        it("isn't visible whenVisible() is false", () => {
            const type = new FieldType().thatIs.visibleWhen(() => false);
            expect(type.visible()).toEqual(false);
        });
    });

    describe('requiredWhen', () => {
        it('is not required by default', () => {
            const type = new FieldType();
            expect(type.required()).toEqual(false);
        });
        it('is required when requiredWhen() is true', () => {
            const type = new FieldType().thatIs.requiredWhen(() => true);
            expect(type.required()).toEqual(true);
        });

        it('alias required without passing a function in', () => {
            const a = new FieldType().thatIs.required();
            expect(a.required()).toBe(true);
        });
    });

    describe('readOnlyWhen', () => {
        it("isn't readonly() by default", () => {
            const type = new FieldType();
            expect(type.readonly()).toEqual(false);
        });
        it('is readonly when readOnlyWhen returns true', () => {
            const type = new FieldType().thatIs.readOnlyWhen(() => true);
            expect(type.readonly()).toEqual(true);
        });

        it('alias readOnly without passing a function in', () => {
            const a = new FieldType().thatIs.readOnly();
            expect(a.readonly()).toBe(true);
        });
    });

    describe('Min and Max length', () => {
        let field;
        beforeEach(() => {
            field = new FieldType().with.minLength(3).and.maxLength(10);
        });
        it('adds a validator for min length', () => {
            const minLengthValidator = field.properties.validators.find(
                validator => validator.name === `minimum length is ${3}`
            );
            expect(minLengthValidator).toBeTruthy();
        });
        it('adds a validator for max length', () => {
            const maxLengthValidator = field.properties.validators.find(
                validator => validator.name === `maximum length is ${10}`
            );
            expect(maxLengthValidator).toBeTruthy();
        });
    });

    describe('info()', () => {
        it('reports descriptions -- used for documentation and debugging', () => {
            const account = new FieldType().with.description('a bank account');
            expect(account.info()).toEqual(['a bank account']);
        });

        it('reports other descriptions (using disabledWhen for an example)', () => {
            function amountIsZero() {
                return false;
            }
            const account = new FieldType().thatIs.disabledWhen(amountIsZero);
            expect(account.info()).toEqual(['disabled when amountIsZero']);
        });
    });

    describe('empty', () => {
        it('should be empty when value is null, undefined or 0-length string by default', () => {
            let emptyField = new FieldType();
            expect(emptyField.empty()).toBe(true);
            emptyField = new FieldType().with.defaultValue(null);
            expect(emptyField.empty()).toBe(true);
            emptyField = new FieldType().with.defaultValue(undefined);
            expect(emptyField.empty()).toBe(true);
            emptyField = new FieldType().with.defaultValue('    ');
            expect(emptyField.empty()).toBe(true);
        });
    });

    describe('selectOnFocus', () => {
        it('selectOnFocus() (false by default)', () => {
            expect(new FieldType().selectOnFocus()).toBe(false);
        });
        it('adds a validator for max length', () => {
            expect(new FieldType().with.selectOnFocus().selectOnFocus()).toBe(true);
        });
    });

    describe('form element', () => {
        it('adds a form element', () => {
            const fieldType = new FieldType().with.formElement('input', {
                minLength: 1,
                maxLength: 10,
                placeholder: 'Name...',
            });
            expect(fieldType.properties.formElement.name).toEqual('input');
            expect(fieldType.properties.formElement.properties).toBeTruthy();
        });
    });

    it('x.toggle', () => {
        const toggleField = new FieldType().thatHas.toggle();
        expect(toggleField.toggle()).toEqual(true);
    });

    it('handles text alignment via x.textAlign()', () => {
        const alignRight = new FieldType().with.textAlign('right');
        expect(alignRight.textAlign()).toEqual('right');
    });

    it('stores a row count via x.rowCount(n)', () => {
        const fiveRows = new FieldType().with.rowCount(5);
        expect(fiveRows.rowCount()).toEqual(5);
    });

    it('knows when to be segmented using x.segmented()', () => {
        const segmentField = new FieldType().thatIs.segmented();
        expect(segmentField.segmented()).toEqual(true);
    });

    it('detects when a field should be inline', () => {
        const inlineField = new FieldType().thatIs.inline();
        expect(inlineField.inline()).toEqual(true);
    });

    it('stores a placeholder', () => {
        const withPlaceholder = new FieldType().with.placeholder('Select an option');
        expect(withPlaceholder.placeholder()).toEqual('Select an option');
    });

    it('stores a range property', () => {
        const withRange = new FieldType().with.range();
        expect(withRange.hasRange()).toEqual(true);
    });

    it('takes a hashFunction to determine option matches', () => {
        const withHashAndOptions = new FieldType().with
            .options([
                { text: 'Ben', value: { name: 'Ben', id: 0 } },
                { text: 'Aaron', value: { name: 'Aaron', value: 1 } },
            ])
            .thatHas.hashFunction(item => item?.id);
        expect(withHashAndOptions.properties.hashFunction({ name: 'Ben', id: 0 })).toEqual(0);
    });

    describe('iconMessage', () => {
        it('iconMessage as string', () => {
            const a = new FieldType();
            const b = a.with.iconMessage('some message');
            expect(b.properties.iconMessage).toEqual('some message');
        });

        it('iconMessage as object', () => {
            const messageSettings = {
                message: 'some message',
                direction: 'bottom',
                light: true,
            };
            const a = new FieldType();
            const b = a.with.iconMessage(messageSettings);
            expect(b.properties.iconMessage).toEqual(messageSettings);
        });
    });
    describe('onValueChange', () => {
        let user;
        let record;
        let id;
        beforeEach(() => {
            user = new FieldType();
            id = new FieldType().with.onValueChange(r => {
                const u = r.getField('user');
                record.setField('id', u?.id);
            });
            record = new Record(
                { user, id },
                { user: { name: 'Ben', id: 5678, company: 'Test' }, id: 1234 }
            );
        });
        it('uses onValueChange to react to field changes', () => {
            record.setField('user', { name: 'Aaron', id: 999, company: 'Test' });
            id.onValueChange(record);
            expect(record.getField('id')).toEqual(999);
        });
    });

    describe('tag', () => {
        it('has a default input tag', () => {
            const field = new FieldType();
            expect(field.tag()).toEqual('input');
        });
        it('sets a tag property', () => {
            const field = new FieldType().with.tag('select');
            expect(field.tag()).toEqual('select');
        });
    });

    describe('type', () => {
        it('has a default input type', () => {
            const field = new FieldType();
            expect(field.type()).toEqual('text');
        });
        it('sets a type property', () => {
            const field = new FieldType().with.type('number');
            expect(field.type()).toEqual('number');
        });
        it('throws an error if if the type provided is not valid', () => {
            const field = new FieldType().with.type('invalid');
            expect(field.type()).toEqual(new Error('Invalid input type: invalid'));
        });
    });
});
