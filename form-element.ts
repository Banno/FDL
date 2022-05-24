/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LitElement, html, css, nothing } from 'lit';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { property, state, customElement } from 'lit/decorators.js';
import FieldType from './field-type.js';
import Record from './record.js';
import { ListeningElementMixin } from './utilities/listening-element';
import { Events } from './types/events.types';

const ListeningElement = ListeningElementMixin(LitElement);

class FormElement extends ListeningElement {
    constructor() {
        super();
        this.field = '';
    }

    dispatchEvent: any;

    @property({ type: String, reflect: true })
    public field: string;

    @property({ type: Object })
    public record?: Record;

    @state()
    private fieldType?: FieldType;

    @state()
    private element?: any;

    async firstUpdated() {
        if (!this.record) throw new Error('OmegaFormElement: record is required');
        if (!this.field) throw new Error('OmegaFormElement: field is required');
        this.fieldType = this.record.fieldTypeForField(this.field);
        const tag = this.fieldType?.tag();
        this.element = document.createElement(tag);
        await this.destructureFieldType();
        this.addListenersToElement();
        this.addListenersToRecord();
    }

    addListenersToElement() {
        Events.forEach(e => {
            this.listenTo(this.element, e, async (event: any) => {
                let value;
                if (event.detail) {
                    value = event.detail.value ?? event.detail.values ?? event.detail;
                } else {
                    value = event.target.value;
                }
                // @ts-ignore
                this.record?.setField(this.field, value);
                this.fieldType?.onValueChange(this.record);
                this.element.dispatchEvent(new CustomEvent('update', { detail: { value, event } }));
            });
        });
    }

    addListenersToRecord() {
        // @ts-ignore
        this.listenTo(this.record, 'change', async () => this.destructureFieldType());
        // @ts-ignore
        // this.listenTo(this.record, 'blur', async () => this.destructureFieldType());
    }

    async destructureFieldType() {
        /**
         * used to conform to a components API where the property may not
         * be assignable via a field type modifier
         */
        const properties = this.fieldType?.additionalProperties();
        Object.keys(properties).forEach((key: string) => {
            this.element[key] = properties[key];
        });
        /**
         * assign all standard properties we can from the modifiers
         */
        // @ts-ignore
        this.element.value = this.record?.getField(this.field);
        this.element.id = this.field;
        this.element.type = this.fieldType?.type();
        this.element.required = this.fieldType?.required(this.record);
        this.element.visible = this.fieldType?.visible(this.record);
        this.element.readonly = this.fieldType?.readonly(this.record);
        this.element.label = this.fieldType?.label(this.record);
        this.element.inline = this.fieldType?.inline(this.record);
        this.element.segmented = this.fieldType?.segmented(this.record);
        this.element.empty = this.fieldType?.empty(this.record, this.field);
        this.element.disabled = this.fieldType?.isDisabled(this.record);
        this.element.name = this.field;
        this.element.rows = this.fieldType?.rowCount();
        this.element.maxLength = this.fieldType?.maxLength();
        this.element.minLength = this.fieldType?.minLength();
        this.element.placeholder = this.fieldType?.placeholder();
        this.element.multiple = this.fieldType?.hasMultipleValues();
        this.element.accept = this.fieldType?.accept();
        this.element.autocomplete = this.fieldType?.autocomplete();
        this.element.autofocus = this.fieldType?.autofocus();
        // this.element.list = this.fieldType?.list();
        this.element.max = this.fieldType?.max();
        this.element.pattern = this.fieldType?.pattern();
        this.element.step = this.fieldType?.step();
        this.element.hashFunction = this.fieldType?.hashFunction();
        this.element.record = this.record;

        /**
         * some uglier APIs we should attempt to clean up in omega/field-type - these don't really
         * follow form elements standard html attributes
         */
        this.element.fieldModel = this.record?.field(this.field);
        this.element.field = this.record?.field(this.field); // weird name here, we need to deprecate this and fieldModel
        this.element.selectOnFocus = this.fieldType?.selectOnFocus();
        this.element.formatOnChange = this.fieldType?.formatOnChange();
        this.element.searchConfig = this.fieldType?.searchConfig();
        this.element.hasSearch = this.fieldType?.hasSearch();
        this.element.hasFilter = this.fieldType?.hasFilter();
        this.element.readonlyexception = this.fieldType?.readonlyexception(this.record);
        this.element.readOnly = this.fieldType?.readonly(this.record); // case change only on omega-frequency - should update there and remove this
        this.element.readOnlyException = this.fieldType?.readonlyexception(this.record); // case change only on omega-frequency - should update there and remove this
        this.element.parseDynamicRange = this.fieldType?.getParseDynamicRange();
        this.element.dateDisabledFunction =
            this.fieldType?.selectionDisabledFunctions().dateDisabledFunction;
        this.element.hideSelectAll = this.fieldType?.properties.options?.hideSelectAll;
        this.element.maxValueCount = this.fieldType?.maxValueCount();

        if (this.fieldType?.hasOptions()) {
            this.element.loading = true;
            const options = await this.fieldType?.options(this.record);
            this.element.options = options;
            this.element.items = options; // should deprecate and use options
            this.element.radios = options; // should deprecate and use options
            this.element.loading = false;
        }
        this.requestUpdate();
    }

    renderRequired() {
        if (!this.fieldType) return nothing;
        if (!this.fieldType?.required(this.record)) return nothing;
        if (this.fieldType?.readonly(this.record)) return nothing;
        return html`<span class="required">&nbsp;*</span>`;
    }

    renderLabel() {
        if (!this.record) return nothing;
        if (!this.fieldType?.label(this.record)) return nothing;
        if (this.fieldType?.hideLabel()) return nothing;
        if (!this.fieldType?.visible(this.record)) return nothing;
        return html`<label for=${this.field}
            >${this.fieldType?.label()}${this.renderRequired()}<slot name="label"></slot
        ></label>`;
    }

    // eslint-disable-next-line sonarjs/cognitive-complexity
    renderElement() {
        if (!this.record) return nothing;
        if (!this.element) return nothing;
        if (this.element.readonly && !this.fieldType?.usesCustomPrint())
            return html`<div class="control">${this.record.print(this.field)}</div>`;
        return html`<div class="control" id=${this.field}>${this.element}</div>`;
    }

    render() {
        return [this.renderLabel(), this.renderElement()];
    }

    static get styles() {
        return css`
            * {
                box-sizing: border-box;
            }
            :host {
                display: flex;
                flex-flow: row;
                flex-wrap: var(--field-flex-wrap, wrap);
                align-items: center;
                color: var(--field-color);
                font-weight: var(--field-font-weight);
            }
            :host([no-align]) {
                align-items: unset;
            }
            :host([no-align]) .label {
                padding-top: 7px;
            }
            .control {
                font-size: var(--field-control-font-size);
                font-weight: var(--field-control-font-weight);
                flex: var(--field-control-width, 250px) 3 1;
            }
            .required {
                color: var(--error);
            }
            label {
                flex: 1 1 var(--field-label-width, 200px);
                font-size: var(--label, 14px);
                font-weight: var(--label-font-weight, 400);
                color: var(--label-color);
                margin-bottom: var(--field-label-margin-bottom, 4px);
                max-width: var(--field-label-max-width, none);
            }
        `;
    }
}

export const FormElementTagName = 'form-element';
// @ts-ignore
customElements.define('form-element', FormElement);
export default FormElement;
