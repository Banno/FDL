import clone from './helpers/clone.js';
import FieldType from './field-type.js';
import Field from './field.js';

export default class Record extends EventTarget {
    /**
     *
     * @param {Array<FieldType>} fieldTypes
     * @param {*} values
     */
    constructor(fieldTypes, values) {
        super();
        this.cachedFields = {};
        this.fieldTypes = fieldTypes;
        this.values =
            values || console.error('You are passing undefined values', fieldTypes, values);
        this.initialValues = clone(values);
        this.listeners = {};
    }

    /**
     *
     * @param {string} field
     * @param {*} context
     */
    getFormattedField(field, context) {
        return this.fieldTypeForField(field).format(this.getField(field), this, context);
    }

    /**
     *
     * @param {string} field
     * @param {number} index
     */
    print(field, index) {
        const value = index === undefined ? this.getField(field) : this.getField(field)[index];
        return this.fieldTypeForField(field).print(value, this);
    }

    /**
     *
     * @param {string} field
     * @param {any} value
     */
    parse(field, value) {
        return this.fieldTypeForField(field).parse(value, this);
    }

    /**
     *
     * @param {{(event:CustomEvent):any}} callback
     * @deprecated - use `this.listenTo(record,'change',callback)` instead
     */
    onChange(callback) {
        console.warn(
            "Record#onChange() is deprecated. Use this.listenTo(record, 'change', callback) instead."
        );
        this.addEventListener('change', callback);
    }

    /**
     *
     * @param {Field} field
     */
    announceChange(field) {
        this.dispatchEvent(new CustomEvent('change', { detail: { field } }));
    }

    errors() {
        return Object.keys(this.values).map(key => {
            if (this.fieldTypeForField(key).hasParts()) {
                return this.fieldTypeForField(key)
                    .parts()
                    .map(part =>
                        part.type.validate(part.key, this.values[key][part.key], null, this)
                    );
            }
            return this.fieldTypeForField(key).validate(key, this.values[key], null, this);
        });
    }

    /**
     *
     * @returns {number}
     */
    errorCount() {
        return this.errors()
            .flat()
            .reduce((a, b) => a.concat(b), []).length;
    }

    hasErrors() {
        return this.errorCount() > 0;
    }

    /**
     *
     * @param {string} key
     * @param {*} value
     */
    isValid(key, value) {
        if (key) {
            return (
                this.fieldTypeForField(key).validate(key, value ?? this.values[key], null, this)
                    .length === 0
            );
        }

        return !this.hasErrors();
    }

    get invalidValues() {
        const invalidValues = [];
        Object.keys(this.fieldTypes).forEach(key => {
            if (!this.isValid(key)) {
                invalidValues.push(key);
            }
        });
        return invalidValues;
    }

    hasRequiredValues() {
        return !Object.keys(this.fieldTypes).some(field => {
            const fieldTypeForField = this.fieldTypes[field];
            const isFieldRequired = fieldTypeForField.required(this);
            const valueIsNotZero = this.values[field] !== 0;
            const isFalsyValue = !this.values[field];
            if (isFieldRequired && !this.values[field]) {
                console.warn(field, 'is required and has a falsy value of', this.values[field]);
            }
            return isFieldRequired && valueIsNotZero && isFalsyValue;
        });
    }

    /**
     *
     * @param {string} field
     * @returns {FieldType} FieldType
     */
    fieldTypeForField(field) {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');

            const parentFieldType = this.fieldTypes[parent];

            if (parentFieldType.hasParts()) {
                return this.fieldTypes[parent].parts().find(p => p.key === child).type;
            }
            return this.fieldTypeForField(parent);
        }
        return this.fieldTypes[field] || new FieldType();
    }

    addField(field, fieldType, value) {
        this.fieldTypes = { ...this.fieldTypes, [field]: fieldType };
        this.values = { ...this.values, [field]: value };
        this.announceChange(field);
    }

    /**
     *
     * @param {string} field
     * @param {*} value
     */
    setField(field, value) {
        const parts = field.split('.');
        let target = this.values;
        while (parts.length > 1) {
            target = target[parts.shift()];
        }
        target[parts.shift()] = value;
        this.announceChange(field);
    }

    /**
     *
     * @param {string} fieldName
     * @param {*} formattedValue
     */
    parseAndSetField(fieldName, formattedValue) {
        this.setField(fieldName, this.fieldTypeForField(fieldName).parse(formattedValue));
    }

    /**
     * Gets the value of a field
     * @param {string} field
     */
    getField(field) {
        const parts = field.split('.');
        let target = this.values;
        /*
         This recursively gets nested object values,
         returning the nested property until we traverse into the final
         descendent
        */
        while (parts.length > 1) {
            target = target[parts.shift()];
        }
        return target[parts.shift()];
    }

    /**
     *
     * @param {string} field
     */
    hasField(field) {
        return this.getField(field) !== undefined;
    }

    reset() {
        this.values = clone(this.initialValues);
        Object.keys(this.values).map(field => this.announceChange(field));
    }

    allowInputChar(field, char) {
        return this.fieldTypeForField(field).allowInputChar(char);
    }

    /**
     *
     * @param {string} name
     * @returns {Field}
     */
    field(name) {
        if (!this.cachedFields[name]) this.cachedFields[name] = new Field(this, name);

        return this.cachedFields[name];
    }

    /**
     *
     * @param {*} fields
     * @returns {Record}
     */
    clone(fields) {
        const fieldsToClone = fields ?? Object.keys(this.fieldTypes);
        const clonedValues = Object.fromEntries(
            Object.entries(this.values).map(([field, value]) => {
                if (fieldsToClone.includes(field)) return [field, value];
                return [field, this.fieldTypeForField(field).defaultValue()];
            })
        );

        return new Record(this.fieldTypes, clonedValues);
    }

    hashOfFields(fields) {
        return JSON.stringify(
            Object.entries(this.values).filter(([key]) => !fields || fields.includes(key))
        );
    }
}
