// eslint-disable-next-line @treasury/filename-match-export
export default class Field extends EventTarget {
    constructor(record, fieldName) {
        super();
        this.record = record;
        this.fieldName = fieldName;

        this.previousState = {
            rawValue: this.rawValue,
            valid: this.valid,
        };

        this.fieldType = this.record.fieldTypeForField(fieldName);

        // Note: there's no mechanism to clean up this listener when the Field is destroyed.
        // The assumption is the Field object will only be garbage collected after the Record is garbage collected.
        this.record.addEventListener('change', () => {
            if (
                this.rawValue !== this.previousState.rawValue ||
                this.valid !== this.previousState.valid
            ) {
                this.dispatchEvent(new CustomEvent('change'));
            }
            this.previousState.rawValue = this.rawValue;
            this.previousState.valid = this.valid;
        });
    }

    get value() {
        return this.record.print(this.fieldName);
    }

    set value(inputValue) {
        this.record.parseAndSetField(this.fieldName, inputValue);
        this.previousState.rawValue = this.rawValue;
    }

    get rawValue() {
        return this.record.getField(this.fieldName);
    }

    set rawValue(value) {
        this.record.setField(this.fieldName, value);
        this.previousState.rawValue = this.rawValue;
    }

    get focusedInputValue() {
        return this.record.getFormattedField(this.fieldName, 'input-focus');
    }

    get blurredInputValue() {
        return this.record.getFormattedField(this.fieldName, 'input-blur');
    }

    get valid() {
        return this.record.isValid(this.fieldName, this.rawValue);
    }

    get invalid() {
        return !this.valid;
    }

    isValidValue(inputValue) {
        const value = this.fieldType.parse(inputValue);
        return this.record.isValid(this.fieldName, value);
    }

    onChange(fn) {
        this.addEventListener('change', fn);
    }

    allowInputChar(char) {
        return this.fieldType.allowInputChar(char);
    }

    field(nameOrIndex) {
        return new Field(this.record, `${this.fieldName}.${nameOrIndex}`);
    }

    maxValueCount() {
        return this.fieldType.maxValueCount();
    }

    minValueCount() {
        return this.fieldType.minValueCount();
    }
}
