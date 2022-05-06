/* eslint-disable import/extensions */
import FieldTypeBuilder, { defaultProperties } from './field-type-builder';
import { inputTypes } from './types/input-types.types';

function functionHasNoArguments(f) {
    return f.length === 0;
}

/**
 * @template [T = unknown]
 * Provides a fluent-API for building field validators used within FDL forms.
 */
// eslint-disable-next-line @treasury/filename-match-export
export default class FieldType {
    /**
     *
     * @param { Properties } properties
     */
    constructor(properties = null) {
        this.properties = properties ?? defaultProperties;
        this._validators = [];
        /** @type {FieldTypeBuilder<T>} */
        this.with = new FieldTypeBuilder(this.properties, FieldType);
        /** @type {FieldTypeBuilder<T>} */
        this.and = this.with;
        /** @type {FieldTypeBuilder<T>} */
        this.thatIs = this.and;
        /** @type {FieldTypeBuilder<T>} */
        this.thatHas = this.thatIs;
        /** @type {FieldTypeBuilder<T>} */
        this.andIs = this.thatIs;
        this.as = this.andIs;
        this.thatWill = this.as;
        this.thatUses = this.thatWill;
        this.that = this.thatUses;
        this.resultsText = {};
        this.loaded = Promise.resolve(null);
    }

    get hasParts() {
        return false;
    }

    accept() {
        return this.properties.accept;
    }

    autocomplete() {
        return this.properties.autocomplete;
    }

    autofocus() {
        return this.properties.autofocus;
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
            return this.properties.defaultValue || ['range', 0, 0];
        }
        if (value !== null && value !== undefined) {
            return value;
        }
        if (
            this.properties.defaultValue ||
            this.properties.defaultValue === 0 ||
            this.properties.defaultValue === false
        ) {
            return this.properties.defaultValue;
        }
        return '';
    }

    list() {
        return this.properties.list;
    }

    exampleValue() {
        return this.properties.exampleValue;
    }

    schema() {
        return this.properties.schema;
    }

    type() {
        if (!inputTypes.includes(this.properties.type))
            return new Error(`Invalid input type: ${this.properties.type}`);
        return this.properties.type;
    }

    tag() {
        return this.properties.tag;
    }

    label(record) {
        return this.properties.labelFunctions.reduce(
            (labelSoFar, fn) => fn(record, labelSoFar),
            ''
        );
    }

    iconMessage() {
        return this.properties.iconMessage;
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

    hasFilter() {
        return !!this.properties.filtering;
    }

    options(record) {
        if (!this.hasOptions()) return Promise.resolve([]);
        return this.fetchOptions(record);
    }

    fetchOptions(record) {
        const { options } = this.properties;
        const { cache, noCache } = options;
        const hash = record?.hashOfFields(this.properties.options.fields);

        if (cache && cache.hash === hash && !noCache) {
            return cache.results;
        }

        if (cache && functionHasNoArguments(options.fetch) && !noCache) {
            return cache.results;
        }

        let results = [];
        if (typeof options?.fetch === 'function') {
            let p = options?.fetch(record);

            if (!(p instanceof Promise)) {
                p = Promise.resolve(p);
            }

            results = p.then(data => {
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
        }
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
        if (!Array.isArray(options)) return [];
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

    max() {
        return this.properties.max;
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

    onValueChange(record) {
        return this.properties.onValueChange.forEach(fn => fn(record));
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

    readonlyexception(record) {
        return this.properties.readonlyexceptionFunctions.some(fn => fn(record));
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

    pattern() {
        return this.properties.pattern;
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

    formatOnChange() {
        return this.properties.formatOnChange;
    }

    textAlign() {
        return this.properties.textAlign;
    }

    field() {
        return this.properties.field;
    }

    additionalProperties() {
        return this.properties.additionalProperties;
    }

    step() {
        return this.properties.step;
    }

    hashFunction() {
        return this.properties.hashFunction;
    }

    hideLabel() {
        return this.properties.hideLabel;
    }

    usesCustomPrint() {
        return this.properties.usesCustomPrint;
    }
}

/** @typedef {import('./record.js').default} Record */
