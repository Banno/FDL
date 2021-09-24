import FieldTypeBuilder from './field-type-builder.js';

function functionHasNoArguments(f) {
    return f.length === 0;
}

function isEmptyDefault(value) {
    return value == null || value === '';
}

// eslint-disable-next-line @treasury/filename-match-export
export default class FieldType {
    constructor(properties) {
        this.properties = properties || {
            schema: 'simple',
            type: null,
            validators: [],
            asyncValidators: [],
            formatters: [],
            template: s => s,
            formElement: null,
            parsers: [],
            cellClasses: [],
            conditionalCellClasses: [],
            rowClassFunctions: [],
            compareFunction(a, b) {
                if (a < b) {
                    return -1;
                }

                if (a > b) {
                    return 1;
                }

                return 0;
            },
            hashFunction(a) {
                return a;
            },
            aggregate() {
                return '';
            },
            minColumnWidth: 30,
            maxColumnWidth: 500,
            sortable: true,
            required: false,
            visible: true,
            readonly: false,
            inline: false,
            segmented: false,
            /*
                function that takes text and returns an array, optionally
                wrapped in a promise

                each element in the array an object with two keys

                1. value
                2. either text (escape) or html (do not escape)
            */
            suggestion: null,
            /*
                lookup takes a function with one optional argument, text
                The function returns a value optionally wrapped in a promise
                The function is responsible for opening a dialog and / or whatever
                else it takes to complete the lookup use case
            */
            lookup: null,
            labelFunctions: [],
            search: false,
            options: null,
            hasMultipleValues: false,
            minValueCount: 1,
            maxValueCount: 1,
            minLength: 0,
            // https://www.w3schools.com/tags/att_input_maxlength.asp
            maxLength: 524288,
            disableFunctions: [() => false],
            exampleValue(index) {
                return index;
            },
            inlineFunctions: [() => false],
            requiredFunctions: [() => false],
            visibleFunctions: [() => true],
            readonlyFunctions: [() => false],
            segmentedFunctions: [() => false],
            range: false,
            parseDynamicRange: false,
            placeholder: '',
            filter() {
                return true;
            },
            allowInputChar() {
                return true;
            },
            selectionDisabledFunctions: {},
            numberOfRows: 1,
            toggle: false,
            descriptions: [],
            emptyFunctions: [isEmptyDefault],
            selectOnFocus: false,
            textAlign: 'left',
        };
        this._validators = [];
        this.with = new FieldTypeBuilder(this.properties, FieldType);
        this.and = this.with;
        this.thatIs = this.and;
        this.thatHas = this.thatIs;
        this.andIs = this.thatIs;
        this.resultsText = {};
        this.loaded = Promise.resolve(null);
    }

    hasParts() {
        return false;
    }

    cellClasses(value) {
        return this.properties.cellClasses.concat(
            this.properties.conditionalCellClasses.filter(x => x.fn(value)).map(x => x.className)
        );
    }

    /**
     *
     * @param {*} value
     * @param {Record} record
     * @returns {Array}
     */
    rowClasses(value, record) {
        return this.properties.rowClassFunctions
            .map(getClasses => getClasses(value, record))
            .reduce((classesThusFar, classes) => classesThusFar.concat(classes), []);
    }

    compare(a, b) {
        return this.properties.compareFunction(a, b);
    }

    /**
     *
     * @param {*} value
     * @param {Record} record
     * @param {*} context
     * @returns {*}
     */
    format(value, record, context) {
        let output = this.resultsText[JSON.stringify(value)] ?? value;
        this.properties.formatters.forEach(format => {
            output = format(output, record, context);
        });
        return output;
    }

    /**
     *
     * @param {*} value
     * @param {Record} record
     * @returns {*}
     */
    print(value, record) {
        return this.properties.template(this.format(value, record, 'print'), record);
    }

    parse(value) {
        let output = value;
        this.properties.parsers.forEach(parse => {
            output = parse(output);
        });
        return output;
    }

    aggregate(values) {
        return this.properties.aggregate(values);
    }

    /**
     *
     * @param {Record} record
     * @param {*} options
     * @returns
     */
    angularValidators(record, options) {
        const validators = {};

        this.properties.validators.forEach(v => {
            validators[v.name] = (modelValue, viewValue) =>
                // This should probably be added.
                // record[ERRORS] = record[ERRORS] || {};
                // record[ERRORS][field] = errors;
                v.validate(modelValue, viewValue, record, options);
        });

        return validators;
    }

    /**
     *
     * @param {Record} record
     * @param {*} options
     * @returns
     */
    asyncAngularValidators(record, options) {
        const validators = {};

        // eslint-disable-next-line sonarjs/no-identical-functions
        this.properties.asyncValidators.forEach(v => {
            validators[v.name] = (modelValue, viewValue) =>
                // This should probably be added.
                // record[ERRORS] = record[ERRORS] || {};
                // record[ERRORS][field] = errors;
                v.validate(modelValue, viewValue, record, options);
        });

        return validators;
    }

    validate(field, modelValue, viewValue, record, options) {
        /* eslint-disable no-param-reassign */
        const errors = [];
        this.properties.validators.forEach(validator => {
            if (!validator.validate(modelValue, viewValue, record, options, field)) {
                errors.push({
                    name: validator.name,
                    field,
                    modelValue,
                    viewValue,
                    record,
                    options,
                });
            }
        });

        return errors;
    }

    defaultValue(value) {
        if (this.hasMultipleValues()) {
            return this.properties.defaultValue || 'all';
        }
        if (this.schema() === 'range') {
            return ['range', 0, 100];
        }
        if (value !== null && value !== undefined) {
            return value;
        }
        if (this.properties.defaultValue || this.properties.defaultValue === 0) {
            return this.properties.defaultValue;
        }
        return '';
    }

    exampleValue() {
        return this.properties.exampleValue;
    }

    schema() {
        return this.properties.schema;
    }

    type() {
        return this.properties.type;
    }

    hasSuggestions() {
        return !!this.properties.suggestion;
    }

    suggestions(text) {
        return Promise.resolve(this.properties.suggestion(text));
    }

    lookup(text) {
        return Promise.resolve(this.properties.lookup(text));
    }

    label(record) {
        return this.properties.labelFunctions.reduce(
            (labelSoFar, fn) => fn(record, labelSoFar),
            ''
        );
    }

    search() {
        return !!this.properties.search;
    }

    searchConfig() {
        return this.properties.searchConfig;
    }

    hasSearch() {
        return !!this.properties.search;
    }

    hasOptions() {
        return !!this.properties.options;
    }

    hasLookup() {
        return !!this.properties.lookup;
    }

    hasFilter() {
        return !!this.properties.filtering;
    }

    options(record) {
        if (!this.hasOptions()) return Promise.resolve([]);
        return this.fetchOptions(record);
    }

    fetchOptions(record) {
        const { options } = this.properties;
        const { cache } = options;
        const hash = record?.hashOfFields(this.properties.options.fields);
        if (cache && cache.hash === hash) {
            return cache.results;
        }

        if (cache && functionHasNoArguments(options.fetch)) {
            return cache.results;
        }

        const results = options?.fetch(record).then(data => {
            if (this.properties.schema === 'datepicker') {
                return data;
            }
            return this.filterOptions(this.sortOptions(this.mapOptions(data)), record);
        });
        options.cache = {
            hash,
            results,
        };

        results.then(fetchData => {
            fetchData.forEach(result => {
                if (typeof result.value !== 'object') {
                    this.resultsText[JSON.stringify(result.value)] = result.text;
                }
            });
        });
        this.loaded = results;
        return results;
    }

    filterOptions(options, record) {
        return options.filter((value, index) =>
            this.properties.options.filter(value, index, record)
        );
    }

    sortOptions(options) {
        return options.sort(this.properties.options.compareFunction);
    }

    mapOptions(options) {
        return options.map(
            this.mapTextValue(this.properties.options.text, this.properties.options.value)
        );
    }

    // eslint-disable-next-line class-methods-use-this
    mapTextValue(textKey, valueKey) {
        return item => ({
            ...item,
            text: textKey instanceof Function ? textKey(item) : item[textKey],
            value: valueKey instanceof Function ? valueKey(item) : item[valueKey],
        });
    }

    filteredOptions(record) {
        if (Array.isArray(this.properties.options))
            return this.properties.options.filter(option => this.optionMatches(record, option));
        return null;
    }

    optionMatches(record, option) {
        if (!this.properties.optionsFilter) return true;
        const recordKey = record.values[this.properties.optionsFilter.recordKey].toString();
        const optionsKey = option[this.properties.optionsFilter.optionsKey].toString();
        return recordKey.includes(optionsKey);
    }

    hasMultipleValues() {
        return this.properties.hasMultipleValues;
    }

    minValueCount() {
        return this.properties.minValueCount;
    }

    maxValueCount() {
        return this.properties.maxValueCount;
    }

    isDisabled(record) {
        return this.properties.disableFunctions.some(fn => fn(record));
    }

    hasRange() {
        return this.properties.range;
    }

    getParseDynamicRange() {
        return this.properties.parseDynamicRange;
    }

    match(searchText, value) {
        return this.properties.filter(searchText, value);
    }

    minLength() {
        return this.properties.minLength;
    }

    maxLength() {
        return this.properties.maxLength;
    }

    allowInputChar(char) {
        return this.properties.allowInputChar(char);
    }

    selectionDisabledFunctions() {
        return this.properties.selectionDisabledFunctions;
    }

    required(record) {
        return this.properties.requiredFunctions.some(fn => fn(record));
    }

    visible(record) {
        return this.properties.visibleFunctions.every(fn => fn(record));
    }

    empty(record, field) {
        return this.properties.emptyFunctions.some(fn => fn(record?.getField(field)));
    }

    readonly(record) {
        return this.properties.readonlyFunctions.some(fn => fn(record));
    }

    inline(record) {
        return this.properties.inlineFunctions.some(fn => fn(record));
    }

    segmented(record) {
        return this.properties.segmentedFunctions.some(fn => fn(record));
    }

    rowCount() {
        return this.properties.numberOfRows;
    }

    placeholder() {
        return this.properties.placeholder;
    }

    toggle() {
        return this.properties.toggle;
    }

    formElement(elementName) {
        return this.properties.formElement(elementName);
    }

    info() {
        return this.properties.descriptions;
    }

    selectOnFocus() {
        return this.properties.selectOnFocus;
    }

    textAlign() {
        return this.properties.textAlign;
    }
}

/** @typedef {import('./record.js').default} Record */
