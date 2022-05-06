/* eslint-disable import/no-cycle */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable lines-between-class-members */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-classes-per-file */
import { TemplateResult } from 'lit';
import { Record, FieldType as _FieldType } from '.';
import { inputType } from './types/input-types.types';

function caseInsensitiveTextMatch(searchText: string, value: any) {
    return value.toString().toLowerCase().includes(searchText.toLowerCase());
}

const defaultTrueFunction = () => true;

function printFunction(fn: Function) {
    if (typeof fn === 'undefined') {
        return '<none>';
    }
    return fn.name || fn.toString();
}

function defaultCompareFunction<T = unknown>(a: T, b: T) {
    if (a === b) {
        return 0;
    }

    return a < b ? -1 : 1;
}

function defaultEmptyFunction(value: unknown) {
    if (typeof value === 'string') return value.replace(/\s/g, '').length === 0;
    return value == null || value === '';
}

type FetchFn<T, FetchArgs = unknown> = (args: FetchArgs) => Promise<T[]>;
type FunctionCollection = { [fnName: string]: Function };

interface OptionsApi<T = unknown, F = unknown> {
    data?: T | Promise<T> | T[];
    fetch?: FetchFn<T, F>;
    text?: string | ((data: T) => string);
    value?: (data: T) => any;
    compareFunction?: Function;
    filter?: Function;
    fields?: Array<any>;
    hideSelectAll?: boolean;
    noCache?: boolean;
}

type BooleanPredicate = (value: any) => boolean;

type ValidatorFunction<T> = (
    modelValue: any,
    viewValue: any,
    record: Record<T>,
    options: OptionsApi,
    field: any
) => boolean | Function;

interface Validator<T> {
    name: string;
    validate: ValidatorFunction<T>;
}

interface SearchConfig<T = unknown> {
    title?: string;
    columns?: Array<{ label: string; field: keyof T; fieldType?: _FieldType<any> }>;
    filters?: { (record: Record): boolean };
}

interface FormElement<T> {
    name: string;
    // eslint-disable-next-line no-use-before-define
    properties: Properties<T>;
}

type AutoComplete =
    | 'off'
    | 'on'
    | 'name'
    | 'honorific-prefix'
    | 'given-name'
    | 'additional-name'
    | 'family-name'
    | 'honorific-suffix'
    | 'nickname'
    | 'email'
    | 'username'
    | 'new-password'
    | 'current-password'
    | 'one-time-code';

export interface Properties<T = unknown> {
    accept: string;
    additionalProperties: object;
    aggregate: Function | string;
    allowInputChar?: (char: string) => boolean;
    asyncValidators: Array<Validator<T>>;
    autocomplete?: AutoComplete;
    autofocus: boolean;
    cellClasses: Array<string>;
    compareFunction: typeof defaultCompareFunction;
    conditionalCellClasses: Array<{ fn: Function; className: string }>;
    defaultValue?: any;
    descriptions: Array<string>;
    disableFunctions: Array<BooleanPredicate>;
    emptyFunctions: Array<BooleanPredicate>;
    exampleValue: (index: number) => number;
    field?: string;
    filter: ((record: Record) => boolean) | typeof caseInsensitiveTextMatch;
    filtering?: boolean;
    formatOnChange: boolean;
    formatters: Array<Function>;
    formElement: FormElement<T> | null;
    hashFunction: (a: any) => any;
    hasMultipleValues: boolean;
    hideLabel: boolean;
    iconMessage: string | null;
    inline: boolean;
    inlineFunctions: Array<BooleanPredicate>;
    labelFunctions: Array<string | Function>;
    list?: string;
    max?: number;
    maxColumnWidth?: number;
    /**
     * https://www.w3schools.com/tags/att_input_maxlength.asp
     */
    maxLength: number;
    maxValueCount: number;
    minColumnWidth: number;
    minLength?: number;
    minValueCount: number;
    numberOfRows: number;
    onValueChange: Array<Function>;
    options: OptionsApi | null;
    parseDynamicRange: boolean;
    parsers: Array<Function>;
    pattern?: RegExp;
    placeholder: string;
    range: boolean;
    readonly: boolean;
    readonlyexception: boolean;
    readonlyexceptionFunctions: Array<BooleanPredicate>;
    readonlyFunctions: Array<BooleanPredicate>;
    required: boolean;
    requiredFunctions: Array<BooleanPredicate>;
    rowClassFunctions: Array<Function>;
    schema: string;
    search: boolean;
    searchConfig?: SearchConfig<T>;
    segmented: boolean;
    segmentedFunctions: Array<BooleanPredicate>;
    selectionDisabledFunctions: Object;
    x?: boolean;
    selectOnFocus: boolean;
    sortable?: boolean;
    specificDate?: boolean;
    step?: number;
    tag: string;
    targetColumnWidth?: number;
    template: Function;
    textAlign: 'left' | 'right';
    toggle: boolean;
    type: string;
    usesCustomPrint: boolean;
    validators: Array<Validator<T>>;
    visible: boolean;
    visibleFunctions: Array<BooleanPredicate>;
}

export const defaultProperties: Properties = {
    accept: '',
    additionalProperties: {},
    aggregate: () => '',
    allowInputChar: () => true,
    asyncValidators: [],
    autocomplete: 'off',
    autofocus: false,
    cellClasses: [],
    compareFunction: defaultCompareFunction,
    conditionalCellClasses: [],
    descriptions: [],
    disableFunctions: [() => false],
    emptyFunctions: [defaultEmptyFunction],
    exampleValue: (index: number) => index,
    filter: (record: Record) => true,
    formatters: [],
    formatOnChange: false,
    formElement: null,
    hashFunction: (a: any) => a,
    hasMultipleValues: false,
    hideLabel: false,
    iconMessage: null,
    inline: false,
    inlineFunctions: [() => false],
    labelFunctions: [],
    // maxColumnWidth: 30,
    /**
     * https://www.w3schools.com/tags/att_input_maxlength.asp
     */
    maxLength: 524288,
    maxValueCount: 1,
    minColumnWidth: 30,
    minValueCount: 1,
    numberOfRows: 1,
    onValueChange: [],
    options: null,
    parseDynamicRange: false,
    parsers: [],
    placeholder: '',
    range: false,
    readonly: false,
    readonlyexception: false,
    readonlyexceptionFunctions: [() => false],
    readonlyFunctions: [() => false],
    required: false,
    requiredFunctions: [() => false],
    rowClassFunctions: [],
    schema: 'simple',
    search: false,
    segmented: false,
    segmentedFunctions: [() => false],
    selectionDisabledFunctions: {},
    tag: 'input',
    selectOnFocus: false,
    sortable: true,
    template: (value: any) => value,
    textAlign: 'left',
    toggle: false,
    type: 'text',
    usesCustomPrint: false,
    validators: [],
    visible: true,
    visibleFunctions: [() => true],
};

export default class FieldTypeBuilder<T> {
    constructor(private properties: Properties, private FieldType: typeof _FieldType) {
        this.properties = properties;
        this.FieldType = FieldType;
    }

    private copy() {
        return new this.FieldType<T>({ ...this.properties });
    }

    accept(string: string) {
        const copy = this.copy();
        copy.properties.accept = string;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `accept: ${copy.properties.accept}}`,
        ];
        return copy;
    }

    autofocus() {
        const copy = this.copy();
        copy.properties.autofocus = true;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `autofocus: ${copy.properties.autofocus}}`,
        ];
        return copy;
    }

    list(id: string) {
        const copy = this.copy();
        copy.properties.list = id;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `list: ${copy.properties.list}}`,
        ];
        return copy;
    }

    max(number: number) {
        const copy = this.copy();
        copy.properties.max = number;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `max: ${copy.properties.max}}`,
        ];
        return copy;
    }

    pattern(p: RegExp) {
        const copy = this.copy();
        copy.properties.pattern = p;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `pattern: ${copy.properties.pattern}}`,
        ];
        return copy;
    }

    step(increment: number) {
        const copy = this.copy();
        copy.properties.step = increment;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `step: ${copy.properties.step}}`,
        ];
        return copy;
    }

    /**
     * Adds a new custom validator to a field type
     */
    validator(validator: Validator<T>) {
        const copy = this.copy();
        copy.properties.validators = [...copy.properties.validators, validator];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `validator: ${validator.name}}`,
        ];
        return copy;
    }

    asyncValidator(validator: Validator<T>) {
        const copy = this.copy();
        copy.properties.asyncValidators = [...copy.properties.asyncValidators, validator];

        return copy;
    }

    formatter(fn: (value: T) => any) {
        const copy = this.copy();
        copy.properties.formatters = [...copy.properties.formatters, fn];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `formatter: ${printFunction(fn)}}`,
        ];
        return copy;
    }

    /**

     * Provide a transform function to the current `FieldType` that is applied during rendering.
     * Can be used to achieve a view over the original data or to generate a new value entirely.
     *
     * Also supports Lit's `html` tag to render custom markup in a cell.
     *

     * @param fn Transform function that receives a copy of the field data 
     * and returns a transformed result.
     */
    template(
        fn: (
            field: T,
            record: Record<any>
        ) => string | number | boolean | TemplateResult | Array<TemplateResult>
    ) {
        const copy = this.copy();
        copy.properties.template = fn;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `template: ${printFunction(fn)}}`,
        ];
        return copy;
    }

    /**
     * @deprecated use tag(element) and additionalProperties({props}) instead
     */
    formElement(name: string, properties = {}) {
        const copy = this.copy();
        copy.properties.formElement = { name, properties };
        copy.properties.descriptions = [...copy.properties.descriptions, `form element: ${name}}`];
        return copy;
    }

    parser(fn: () => any) {
        const copy = this.copy();
        copy.properties.parsers = [fn, ...copy.properties.parsers];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `parser: ${printFunction(fn)}}`,
        ];
        return copy;
    }

    cellClass(c: string) {
        const copy = this.copy();
        copy.properties.cellClasses = [...copy.properties.cellClasses, c];
        return copy;
    }

    textAlign(direction: 'left' | 'right') {
        const copy = this.copy();
        copy.properties.textAlign = direction;
        return copy;
    }

    conditionalCellClass(fn: Function, className: string) {
        const copy = this.copy();
        copy.properties.conditionalCellClasses = [
            ...copy.properties.conditionalCellClasses,
            { fn, className },
        ];
        return copy;
    }

    rowClasses(fn: Function) {
        const copy = this.copy();
        copy.properties.rowClassFunctions = [...copy.properties.rowClassFunctions, fn];
        return copy;
    }

    compareFunction(fn: (a: any, b: any) => 1 | -1 | 0) {
        const copy = this.copy();
        copy.properties.compareFunction = fn;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `compare function: ${printFunction(fn)}}`,
        ];
        return copy;
    }

    hashFunction<V = unknown>(fn: (values: V) => string) {
        const copy = this.copy();
        copy.properties.hashFunction = fn;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `equality function: ${printFunction(fn)}}`,
        ];
        return copy;
    }

    hideLabel() {
        const copy = this.copy();
        copy.properties.hideLabel = true;
        return copy;
    }

    usesCustomPrint() {
        const copy = this.copy();
        copy.properties.usesCustomPrint = true;
        return copy;
    }

    /**
     *
     * @param width
     */
    minColumnWidth(width: number) {
        const copy = this.copy();
        copy.properties.minColumnWidth = width;
        copy.properties.x = true;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `min column width: ${width}`,
        ];
        return copy;
    }

    /**
     *
     * @param width
     */
    maxColumnWidth(width: number) {
        const copy = this.copy();
        copy.properties.maxColumnWidth = width;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `max column width: ${width}`,
        ];
        return copy;
    }

    /**
     *
     * @param width
     */
    targetColumnWidth(width: number) {
        const copy = this.copy();
        copy.properties.targetColumnWidth = width;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `target column width: ${width}`,
        ];
        return copy;
    }

    /**
     *
     * @param sortable
     */
    sortable(sortable: boolean) {
        const copy = this.copy();
        copy.properties.sortable = sortable;
        copy.properties.descriptions = [...copy.properties.descriptions, `sortable: ${sortable}`];
        return copy;
    }

    reducer(nameOrFunction: string | Function) {
        const copy = this.copy();
        if (nameOrFunction === 'sum') {
            copy.properties.aggregate = (values: Array<any>) => values.reduce((a, b) => a + b, 0);
        } else {
            copy.properties.aggregate = nameOrFunction as Function;
        }
        return copy;
    }

    defaultValue(value: T | string | null) {
        const copy = this.copy();
        copy.properties.defaultValue = value;
        copy.properties.descriptions = [...copy.properties.descriptions, `default value: ${value}`];
        return copy;
    }

    exampleValue(val: string | ((index: number) => number)) {
        const copy = this.copy();
        copy.properties.exampleValue = val;
        return copy;
    }

    /**
     * @deprecated
     * @param name
     */
    schema(name: string) {
        const copy = this.copy();
        copy.properties.schema = name;
        copy.properties.descriptions = [...copy.properties.descriptions, `schema: ${name}`];
        return copy;
    }

    type(type: inputType) {
        const copy = this.copy();
        copy.properties.type = type;
        copy.properties.descriptions = [...copy.properties.descriptions, `type: ${type}`];
        return copy;
    }

    /**
     * the html tag to be used on this field type
     * @param tag
     */
    tag(tag: string) {
        const copy = this.copy();
        copy.properties.tag = tag;
        copy.properties.descriptions = [...copy.properties.descriptions, `tag: ${tag}`];
        return copy;
    }

    /**
     * provides a label to our omega-field component.
     * @param label
     */
    label(label: string | ((record: Record) => string)) {
        const copy = this.copy();
        if (label instanceof Function) {
            copy.properties.labelFunctions = [...copy.properties.labelFunctions, label];
            copy.properties.descriptions = [
                ...copy.properties.descriptions,
                `label (function): "${label}"`,
            ];
        } else {
            copy.properties.labelFunctions = [...copy.properties.labelFunctions, () => label];
            copy.properties.descriptions = [...copy.properties.descriptions, `label: "${label}"`];
        }

        return copy;
    }

    /**
     * Supply a message to be used with an information icon tooltip for fields displayed in Omega forms.
     */
    iconMessage(message: string) {
        const copy = this.copy();
        copy.properties.iconMessage = message;
        return copy;
    }

    autocomplete(string: AutoComplete) {
        const copy = this.copy();
        copy.properties.autocomplete = string;
        copy.properties.descriptions = [...copy.properties.descriptions, `autocomplete`];
        return copy;
    }

    // TODO: need check here for filtering as arg to be used in report factory
    filtering() {
        const copy = this.copy();
        copy.properties.filtering = true;
        copy.properties.descriptions = [...copy.properties.descriptions, `filtering`];
        return copy;
    }

    options<F = unknown>(
        optionsConfig: OptionsApi<T, F> | ((args: unknown) => T) | Promise<T> | Array<T>
    ) {
        const copy = this.copy();
        if (!optionsConfig) return copy;

        let config = optionsConfig;

        if (config instanceof Function) {
            config = {
                fetch: (...args: any) => Promise.resolve((optionsConfig as Function)(...args)),
            };
        }

        if (config instanceof Promise || Array.isArray(config)) {
            config = { data: config };
        }

        const cfg = config as OptionsApi<T>;

        copy.properties.options = {
            fetch: cfg.data ? () => Promise.resolve(cfg.data) : cfg.fetch,
            text: cfg.text || 'text',
            value: cfg.value || 'value',
            noCache: cfg.noCache || false,
            compareFunction: cfg.compareFunction,
            filter: cfg.filter ?? (() => true),
            fields: cfg.fields,
            hideSelectAll: cfg.hideSelectAll,
        };
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `options (${Object.keys(optionsConfig)})`,
        ];

        return copy;
    }

    /**
     *
     * @param {number} [min=1]
     * @param {number}[max=4]
     * @returns
     */
    multipleValues(min = 1, max = Number.MAX_SAFE_INTEGER) {
        const copy = this.copy();
        copy.properties.hasMultipleValues = true;
        copy.properties.minValueCount = min;
        copy.properties.maxValueCount = max;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `multiple values (${min} to ${max})`,
        ];
        return copy;
    }

    disabled() {
        const copy = this.copy();
        copy.properties.disableFunctions = [
            ...copy.properties.disableFunctions,
            defaultTrueFunction,
        ];
        copy.properties.descriptions = [...copy.properties.descriptions, `disabled`];
        return copy;
    }

    /**
     *
     * @param {{(record:Record) : boolean}} fn
     */
    disabledWhen(fn: BooleanPredicate) {
        const copy = this.copy();
        copy.properties.disableFunctions = [...copy.properties.disableFunctions, fn];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `disabled when ${printFunction(fn)}`,
        ];
        return copy;
    }

    range() {
        const copy = this.copy();
        copy.properties.range = true;
        copy.properties.specificDate = false;
        copy.properties.descriptions = [...copy.properties.descriptions, `range`];
        return copy;
    }

    parseDynamicRange() {
        const copy = this.copy();
        copy.properties.parseDynamicRange = true;
        copy.properties.descriptions = [...copy.properties.descriptions, `parse dynamic range`];
        return copy;
    }

    visibleWhen(fn: BooleanPredicate) {
        const copy = this.copy();
        copy.properties.visibleFunctions = [...copy.properties.visibleFunctions, fn];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `visible when ${printFunction(fn)}}`,
        ];
        return copy;
    }

    emptyWhen(fn: BooleanPredicate) {
        const copy = this.copy();
        copy.properties.emptyFunctions = [...copy.properties.emptyFunctions, fn];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `empty when ${printFunction(fn)}`,
        ];
        return copy;
    }

    /**
     * Sets a field to readonly
     *
     */
    readOnly() {
        const copy = this.copy();
        copy.properties.readonlyFunctions = [
            ...copy.properties.readonlyFunctions,
            defaultTrueFunction,
        ];
        copy.properties.descriptions = [...copy.properties.descriptions, `read only`];
        return copy;
    }

    /**
     * Sets a field to inline
     *
     */
    inline() {
        const copy = this.copy();
        copy.properties.inlineFunctions = [...copy.properties.inlineFunctions, defaultTrueFunction];
        copy.properties.descriptions = [...copy.properties.descriptions, `inline`];
        return copy;
    }

    /**
     * Sets a field to inline based on a conditional expression
     * @param {{(record:Record) : boolean}} fn - Conditional expression that should return true when a field should be inline
     */
    inlineWhen(fn: BooleanPredicate) {
        const copy = this.copy();
        copy.properties.inlineFunctions = [...copy.properties.inlineFunctions, fn];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `inline when ${printFunction(fn)}}`,
        ];
        return copy;
    }

    segmented() {
        const copy = this.copy();
        copy.properties.segmentedFunctions = [
            ...copy.properties.segmentedFunctions,
            defaultTrueFunction,
        ];
        copy.properties.descriptions = [...copy.properties.descriptions, `segmented`];
        return copy;
    }

    /**
     * Sets a field to readonly based on a conditional expression
     * @param {{(record:Record) : boolean}} fn
     */
    readOnlyWhen(fn: BooleanPredicate) {
        const copy = this.copy();
        copy.properties.readonlyFunctions = [...copy.properties.readonlyFunctions, fn];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `read only when ${printFunction(fn)}}`,
        ];
        return copy;
    }

    /**
     * Determines whether an exception exists for another read only condition.
     * For example, if a field has multiple sub-components with different read-only conditions
     * @param {{(record:Record) : boolean}} fn
     */
    readOnlyExceptionWhen(fn: BooleanPredicate) {
        const copy = this.copy();
        copy.properties.readonlyexceptionFunctions = [
            ...copy.properties.readonlyexceptionFunctions,
            fn,
        ];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `read only exception when ${printFunction(fn)}}`,
        ];
        return copy;
    }

    /**
     * Sets the field to required
     *
     */
    required() {
        const copy = this.copy();
        copy.properties.requiredFunctions = [
            ...copy.properties.requiredFunctions,
            defaultTrueFunction,
        ];
        // add validator
        copy.properties.validators = [
            ...copy.properties.validators,
            {
                name: 'is required',
                validate: (
                    modelValue: any,
                    viewValue: any,
                    record: Record<any>,
                    options: OptionsApi<T>,
                    field: any
                ) =>
                    !copy.properties.emptyFunctions.some((fn: Function) =>
                        fn(record.getField(field))
                    ),
            },
        ];
        copy.properties.descriptions = [...copy.properties.descriptions, `required`];
        return copy;
    }

    /**
     * Sets a field to required based on a conditional expression
     * @param {(record:Record) => boolean} fn
     */
    requiredWhen(fn: BooleanPredicate) {
        const copy = this.copy();
        copy.properties.requiredFunctions = [...copy.properties.requiredFunctions, fn];
        copy.properties.validators = [
            ...copy.properties.validators,
            {
                name: 'is required',
                validate: (mv: any, vv: any, record: Record, options: any, field: never) => {
                    if (!fn(record)) return true;
                    return (
                        fn(record) &&
                        !copy.properties.emptyFunctions.some((emptyFn: Function) =>
                            emptyFn(record.getField(field))
                        )
                    );
                },
            },
        ];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `required when ${printFunction(fn)}}`,
        ];
        return copy;
    }

    search(config: SearchConfig<T>) {
        const copy = this.copy();
        copy.properties.search = true;
        copy.properties.searchConfig = config;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `search config: ${config}`,
        ];
        return copy;
    }

    hasSearch() {
        const copy = this.copy();
        copy.properties.search = true;
        copy.properties.descriptions = [...copy.properties.descriptions, `has search`];
        return copy;
    }

    /**
     *
     * @param {{(record:Record):boolean}} [fn]
     */
    filter(fn: (record: Record) => boolean) {
        const copy = this.copy();
        copy.properties.filter = fn ?? caseInsensitiveTextMatch;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `filter: ${printFunction(fn)}`,
        ];
        return copy;
    }

    /**
     * Sets an input mask based on a regular expression
     * @param {RegExp} regex
     */
    inputMask(regex: RegExp) {
        const copy = this.copy();
        copy.properties.allowInputChar = (char: string) => char.length !== 1 || regex.test(char);
        copy.properties.descriptions = [...copy.properties.descriptions, `input mask: ${regex}`];
        return copy;
    }

    selectionDisabledFunctions(functions: FunctionCollection) {
        const copy = this.copy();
        copy.properties.selectionDisabledFunctions = functions;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `selectionDisabledFunctions: ${functions}`,
        ];
        return copy;
    }

    /**
     * Sets the number of rows on a field
     * @param {number} numberOfRows
     */
    rowCount(numberOfRows: number) {
        const copy = this.copy();
        copy.properties.numberOfRows = numberOfRows;
        copy.properties.descriptions = [...copy.properties.descriptions, `${numberOfRows} rows`];
        return copy;
    }

    /**
     * Sets the placeholder on a field
     * @param {string} placeholder - Placeholder value
     */
    placeholder(placeholder: string) {
        const copy = this.copy();
        copy.properties.placeholder = placeholder;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `placeholder = "${placeholder}"`,
        ];
        return copy;
    }

    /**
     * Sets the minimum length on a field
     * @param {number} length - Minimum length
     */
    minLength(length: number) {
        const copy = this.copy();
        copy.properties.minLength = length;
        const minLengthValidator = {
            name: `minimum length is ${length}`,
            validate: (value: any) => {
                if (!value) return true;
                return value.length >= length;
            },
        };
        copy.properties.validators = [...copy.properties.validators, minLengthValidator];
        copy.properties.descriptions = [...copy.properties.descriptions, `minlength = ${length}`];
        return copy;
    }

    /**
     *
     * @param {number} length
     */
    maxLength(length: number) {
        const copy = this.copy();
        copy.properties.maxLength = length;
        const maxLengthValidator = {
            name: `maximum length is ${length}`,
            validate: (value: any) => {
                if (!value) return true;
                const valueString = value.toString();
                return valueString.length <= length;
            },
        };
        copy.properties.validators = [...copy.properties.validators, maxLengthValidator];
        copy.properties.descriptions = [...copy.properties.descriptions, `maxlength = ${length}`];
        return copy;
    }

    toggle() {
        const copy = this.copy();
        copy.properties.toggle = true;
        copy.properties.descriptions = [...copy.properties.descriptions, 'toggle()'];
        return copy;
    }

    /**
     *
     * @param {string} text
     */
    description(text: string) {
        const copy = this.copy();
        copy.properties.descriptions = [...copy.properties.descriptions, text];
        return copy;
    }

    selectOnFocus() {
        const copy = this.copy();
        copy.properties.selectOnFocus = true;
        copy.properties.descriptions = [...copy.properties.descriptions, 'select on focus'];
        return copy;
    }

    formatOnChange() {
        const copy = this.copy();
        copy.properties.formatOnChange = true;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            'format input value on keydown',
        ];
        return copy;
    }

    onValueChange(fn: Function) {
        const copy = this.copy();
        copy.properties.descriptions = [...copy.properties.descriptions, 'on value change'];
        copy.properties.onValueChange = [...copy.properties.onValueChange, fn];
        return copy;
    }

    /**
     * The field used on this field type's record / recordset
     */
    field(field: string) {
        const copy = this.copy();
        copy.properties.field = field;
        copy.properties.descriptions = [...copy.properties.descriptions, `field = ${field}`];
        return copy;
    }

    additionalProperties(additionalProperties: any) {
        const copy = this.copy();
        copy.properties.additionalProperties = additionalProperties;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `additional properties = ${additionalProperties}`,
        ];
        return copy;
    }
}
