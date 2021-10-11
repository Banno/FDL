const defaultTrueFunction = () => true;

function printFunction(fn) {
    if (typeof fn === 'undefined') {
        return '<none>';
    }
    return fn.name || fn.toString();
}
export default class FieldTypeBuilder {
    /**
     * @constructor
     * @param {object} properties
     * @param {FieldTypeClass} FieldType
     */
    constructor(properties, FieldType) {
        this.properties = properties;
        this.FieldType = FieldType;
    }

    /**
     * @private
     */
    copy() {
        const clone = { ...this.properties };
        return new this.FieldType(clone);
    }

    /**
     *
     * @param {{name:string, validate:{(modelValue:any, viewValue:any, record:Record, config:any):boolean}}} validator
     */
    validator(validator) {
        const copy = this.copy();
        copy.properties.validators = [...copy.properties.validators, validator];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `validator: ${validator.name}}`,
        ];
        return copy;
    }

    /**
     *
     * @param {{name:string, validate:{(modelValue:any, viewValue:any, record:Record, config:any):Promise<boolean>}}} validator
     */
    asyncValidator(validator) {
        const copy = this.copy();
        copy.properties.asyncValidators = [...copy.properties.asyncValidators, validator];

        return copy;
    }

    /**
     *
     * @param {{(value:any):any}} fn
     */
    formatter(fn) {
        const copy = this.copy();
        copy.properties.formatters = [...copy.properties.formatters, fn];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `formatter: ${printFunction(fn)}}`,
        ];
        return copy;
    }

    template(fn) {
        const copy = this.copy();
        copy.properties.template = fn;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `template: ${printFunction(fn)}}`,
        ];
        return copy;
    }

    formElement(name, properties = {}) {
        const copy = this.copy();
        copy.properties.formElement = { name, properties };
        copy.properties.descriptions = [...copy.properties.descriptions, `form element: ${name}}`];
        return copy;
    }

    parser(fn) {
        const copy = this.copy();
        copy.properties.parsers = [fn, ...copy.properties.parsers];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `parser: ${printFunction(fn)}}`,
        ];
        return copy;
    }

    cellClass(c) {
        const copy = this.copy();
        copy.properties.cellClasses = [...copy.properties.cellClasses, c];
        return copy;
    }

    textAlign(direction) {
        const copy = this.copy();
        copy.properties.textAlign = direction;
        return copy;
    }

    conditionalCellClass(fn, className) {
        const copy = this.copy();
        copy.properties.conditionalCellClasses = [
            ...copy.properties.conditionalCellClasses,
            { fn, className },
        ];
        return copy;
    }

    rowClasses(fn) {
        const copy = this.copy();
        copy.properties.rowClassFunctions = [...copy.properties.rowClassFunctions, fn];
        return copy;
    }

    compareFunction(fn) {
        const copy = this.copy();
        copy.properties.compareFunction = fn;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `compare function: ${printFunction(fn)}}`,
        ];
        return copy;
    }

    hashFunction(fn) {
        const copy = this.copy();
        copy.properties.hashFunction = fn;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `equality function: ${printFunction(fn)}}`,
        ];
        return copy;
    }

    /**
     *
     * @param {number} width
     */
    minColumnWidth(width) {
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
     * @param {number} width
     */
    maxColumnWidth(width) {
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
     * @param {number} width
     */
    targetColumnWidth(width) {
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
     * @param {boolean} sortable
     */
    sortable(sortable) {
        const copy = this.copy();
        copy.properties.sortable = sortable;
        copy.properties.descriptions = [...copy.properties.descriptions, `sortable: ${sortable}`];
        return copy;
    }

    reducer(nameOrFunction) {
        const copy = this.copy();
        if (nameOrFunction === 'sum') {
            copy.properties.aggregate = values => values.reduce((a, b) => a + b, 0);
        } else {
            copy.properties.aggregate = nameOrFunction;
        }
        return copy;
    }

    defaultValue(value) {
        const copy = this.copy();
        copy.properties.defaultValue = value;
        copy.properties.descriptions = [...copy.properties.descriptions, `default value: ${value}`];
        return copy;
    }

    exampleValue(fn) {
        const copy = this.copy();
        copy.properties.exampleValue = fn;
        return copy;
    }

    /**
     * @deprecated
     * @param {string} name
     */
    schema(name) {
        const copy = this.copy();
        copy.properties.schema = name;
        copy.properties.descriptions = [...copy.properties.descriptions, `schema: ${name}`];
        return copy;
    }

    type(type) {
        const copy = this.copy();
        copy.properties.type = type;
        copy.properties.descriptions = [...copy.properties.descriptions, `type: ${type}`];
        return copy;
    }

    suggestions(fn) {
        const copy = this.copy();
        copy.properties.suggestion = fn;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `suggestions: ${printFunction(fn)}}`,
        ];
        return copy;
    }

    lookup(fn) {
        const copy = this.copy();
        copy.properties.lookup = fn;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `lookup: ${printFunction(fn)}}`,
        ];
        return copy;
    }

    /**
     * provides a label to our omega-field component.
     * @param {string|{(record:Record):string}} label
     */
    label(label) {
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

    autocomplete() {
        const copy = this.copy();
        copy.properties.autocomplete = true;
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

    /**
     *
     * @param {OptionsConfig|fetch|Array|Promise<*>} optionsConfig
     */
    options(optionsConfig) {
        const copy = this.copy();
        if (!optionsConfig) return copy;
        let config = optionsConfig;
        if (config instanceof Function) {
            config = { fetch: (...args) => Promise.resolve(optionsConfig(...args)) };
        }
        if (config instanceof Promise || Array.isArray(config)) {
            config = { data: config };
        }
        // JR: tsc gets a little confused here
        const cfg = /** @type{OptionsConfig} */ (config);
        copy.properties.options = {
            fetch: cfg.data ? () => Promise.resolve(cfg.data) : cfg.fetch,
            text: cfg.text || 'text',
            value: cfg.value || 'value',
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
    disabledWhen(fn) {
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

    /**
     *
     * @param {{(record:Record) : boolean}} fn
     */
    visibleWhen(fn) {
        const copy = this.copy();
        copy.properties.visibleFunctions = [...copy.properties.visibleFunctions, fn];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `visible when ${printFunction(fn)}}`,
        ];
        return copy;
    }

    emptyWhen(fn) {
        const copy = this.copy();
        copy.properties.emptyFunctions = [...copy.properties.emptyFunctions, fn];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `empty when ${printFunction(fn)}`,
        ];
        return copy;
    }

    readOnly() {
        const copy = this.copy();
        copy.properties.readonlyFunctions = [
            ...copy.properties.readonlyFunctions,
            defaultTrueFunction,
        ];
        copy.properties.descriptions = [...copy.properties.descriptions, `read only`];
        return copy;
    }

    inline() {
        const copy = this.copy();
        copy.properties.inlineFunctions = [...copy.properties.inlineFunctions, defaultTrueFunction];
        copy.properties.descriptions = [...copy.properties.descriptions, `inline`];
        return copy;
    }

    /**
     *
     * @param {{(record:Record) : boolean}} fn
     */
    inlineWhen(fn) {
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
     *
     * @param {{(record:Record) : boolean}} fn
     */
    readOnlyWhen(fn) {
        const copy = this.copy();
        copy.properties.readonlyFunctions = [...copy.properties.readonlyFunctions, fn];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `read only when ${printFunction(fn)}}`,
        ];
        return copy;
    }

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
                name: 'required',
                validate: (modelValue, viewValue, record, options, field) =>
                    !copy.properties.emptyFunctions.some(fn => fn(record.getField(field))),
            },
        ];
        copy.properties.descriptions = [...copy.properties.descriptions, `required`];
        return copy;
    }

    /**
     *
     * @param {{(record:Record) : boolean}} fn
     */
    requiredWhen(fn) {
        const copy = this.copy();
        copy.properties.requiredFunctions = [...copy.properties.requiredFunctions, fn];
        copy.properties.validators = [
            ...copy.properties.validators,
            {
                name: 'required-when',
                validate: () => fn,
            },
        ];
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `required when ${printFunction(fn)}}`,
        ];
        return copy;
    }

    /**
     *
     * @param {{title?:string, columns?:Array<{label:string, field:string, fieldType?:FieldType}>,filters?:{(record:Record):boolean}}} config
     * @returns
     */
    search(config) {
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
     * @param {{(record:Record):boolean}} fn
     */
    filter(fn) {
        function caseInsensitiveTextMatch(searchText, value) {
            return value.toString().toLowerCase().includes(searchText.toLowerCase());
        }

        const copy = this.copy();
        copy.properties.filter = fn ?? caseInsensitiveTextMatch;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `filter: ${printFunction(fn)}`,
        ];
        return copy;
    }

    /**
     *
     * @param {RegExp} regex
     */
    inputMask(regex) {
        const copy = this.copy();
        copy.properties.allowInputChar = char => char.length !== 1 || regex.test(char);
        copy.properties.descriptions = [...copy.properties.descriptions, `input mask: ${regex}`];
        return copy;
    }

    selectionDisabledFunctions(functions) {
        const copy = this.copy();
        copy.properties.selectionDisabledFunctions = functions;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `selectionDisabledFunctions: ${functions}`,
        ];
        return copy;
    }

    /**
     *
     * @param {number} numberOfRows
     */
    rowCount(numberOfRows) {
        const copy = this.copy();
        copy.properties.numberOfRows = numberOfRows;
        copy.properties.descriptions = [...copy.properties.descriptions, `${numberOfRows} rows`];
        return copy;
    }

    /**
     *
     * @param {string} string
     */
    placeholder(string) {
        const copy = this.copy();
        copy.properties.placeholder = string;
        copy.properties.descriptions = [
            ...copy.properties.descriptions,
            `placeholder = "${string}"`,
        ];
        return copy;
    }

    /**
     *
     * @param {number} length
     */
    minLength(length) {
        const copy = this.copy();
        copy.properties.minLength = length;
        const minLengthValidator = {
            name: 'min-length',
            validate: value => {
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
    maxLength(length) {
        const copy = this.copy();
        copy.properties.maxLength = length;
        const maxLengthValidator = {
            name: 'max-length',
            validate: value => {
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
    description(text) {
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
}

// JR: we want the constructor and not an instance, so use typeof
/** @typedef {typeof import('./field-type.js').default} FieldTypeClass */
/** @typedef {import('./field-type.js').default} FieldType */
/** @typedef {import('./record.js').default} Record */
/** @typedef {{(values: *) : Promise<*>}=} fetch - takes the record values as an object and returns a promise with source data */

/** @typedef {Object} OptionsConfig
 * @property {Array=} data
 * @property {fetch=} fetch
 * @property {string|{(values: *) : string}=} text
 * @property {string|{(source: *) : string}=} value - defaults to 'value'. a string corresponding to the key containing value (e.g. "id"), or
a function that takes the source object and returns the value (e.g. user => user.id)
 * @property {{(a:*, b:*):number}=} sort
 * @property {{(a:*, b:*):number}=} compareFunction
 * @property {{(value:*):boolean}=} filter
 * @property {boolean=} hideSelectAll
 * @property {Array<string>=} fields - an array of field names that, when changed, can cause the options to be updated.
    only applies when fetch is used. used for performance tuning to prevent Omega from looking up new options when nothing significant changed to cache (memoize) the results and not look up options for the same input twice
 */
