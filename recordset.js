/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
import { delay, exists, clone } from '@treasury/utils/functions';
import { Observable } from '@treasury/utils/types';

import FdlRecord from './record.js';
import FieldType from './field-type.js';
import comparatorFromColumns from './utilities/comparator-from-columns.js';
import { RecordsetEvent } from './recordset.events';

/**
 * @template T
 * @typedef FetchResult<T>
 * @property {T[]} data
 * @property {number} totalCount
 * @property {string} [summary]
 */

/**
 * @typedef {Object} ListenerEntry
 * @property {string} event
 * @property {EventTarget} target
 * @property {Function} fn
 */

/**
 * @typedef {Object} Validator<T>
 * @property {string} name
 * @property {(recordset: Recordset<T>) => boolean} validate
 */

/**
 * @template [T = unknown]
 */
export default class Recordset extends EventTarget {
    /**
     * @param {Object.<string, FieldType>} [fieldTypes]
     * @param {{(...args:any[]) => Promise<T[]> | T[] | FetchResult<T> | Promise<FetchResult<T>>} |  Promise<T[]> | T[] | FetchResult<T> | Promise<FetchResult<T>>} [fetch]
     * @param {number} [debounceInterval]
     */
    constructor(fieldTypes = {}, fetch, debounceInterval = 0) {
        super();
        this.debounceInterval = debounceInterval;
        this.isClone = false;

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const rs = this;
        let isFetchNeeded = true;

        /**
         * Timeout ID of the last running queued update timer.
         *
         * @type number | null
         */
        let updateHandle = null;

        this._ = {
            isFirstFetch: true,
            get isFetchNeeded() {
                return isFetchNeeded || rs.isServerSide;
            },
            set isFetchNeeded(val) {
                isFetchNeeded = val;
            },
            extraRowCount: 0,
            /** @type {() => Promise<T> | T | FetchResult<T> | Promise<FetchResult<T>>} */
            fetch: typeof fetch === 'function' ? fetch : () => fetch,
            /** @type {Object.<string, FieldType<T>>} */
            fieldTypes,
            filter: () => true,
            isLoading: false,
            /**
             * @type {Promise<void> | null}
             */
            currentUpdatePromise: null,
            /** @type {ListenerEntry[]} */
            listeningTo: [],
            pageIndex: 0,
            pageSize: 10,
            parameters: {},
            /** @type {FdlRecord[]} */
            records: [],
            sortColumns: [],
            /** @type {FdlRecord[]} */
            sortedFilteredRecords: [],
            totalCount: 0,
            hasFetched: false,
            queueUpdate() {
                this.cancelUpdate();

                updateHandle = setTimeout(() => {
                    this.cancelUpdate();
                    rs.requestUpdate();
                }, 100);
            },
            cancelUpdate() {
                if (!exists(updateHandle)) {
                    return;
                }

                clearTimeout(updateHandle);
                updateHandle = null;
            },
            updatedObservable: new Observable(),
            /**
             * Data the `Recordset` was original hydrated with.
             * Useful for resetting state.
             *
             * @type { T | FetchResult<T> | null}
             */
            originalData: null,
            /**
             * Hydrate the `Recordset` from fetch result payload.
             *
             * @param {T | FetchResult<T>} result
             */
            hydrateFromFetch: result => {
                const [data, totalCount, summary] =
                    'data' in result
                        ? [result.data, result.totalCount, result.summary]
                        : [result, result.length];
                this._.summary = summary;
                this._.totalCount = totalCount;
                this._.records.forEach(record => this.stopListeningTo(record));
                this._.records = data.map(values => this.createRecord(values));

                // store a copy of the data for resetting purposes
                if (this._.isFirstFetch && this._.originalData === null) {
                    // clone the data so mutations aren't reflected in the stored copy
                    this._.originalData = Object.freeze(clone(result));
                }

                this._.isFirstFetch = false;
            },
            dispatchUpdateEvents: () => {
                this.dispatchEvent(new CustomEvent(RecordsetEvent.Changed)); // deprecated
                this.dispatchEvent(new CustomEvent(RecordsetEvent.PageChanged));
                this.dispatchEvent(new CustomEvent(RecordsetEvent.CountsChanged));
                this._.updatedObservable.emit();
            },
            sortAndFilterRecords: () => {
                this._.sortedFilteredRecords = this._.records
                    .filter(this._.filter)
                    .sort((a, b) =>
                        comparatorFromColumns(this._.sortColumns, this._.fieldTypes)(
                            a.values,
                            b.values
                        )
                    );
            },
            /**
             * List of in-memory recordset validators
             *
             * @type {Validator[]}
             */
            validators: [],
        };

        this._.cursor = {
            recordsPerPage: () => rs.pageSize,
            setRecordsPerPage: n => {
                rs.pageSize = n;
            },
            currentPageNumber: () => rs.pageNumber,
            pageNumber: () => rs.pageNumber,
            setPageNumber: n => {
                rs.pageNumber = n;
            },
            pageCount: () => Math.ceil(rs.filteredCount / rs.pageSize),
            totalCount: () => rs.totalCount,
            firstRecordNumber: () => rs.firstRecordNumberOnPage,
            lastRecordNumber: () => rs.lastRecordNumberOnPage,
            onChange: fn => rs.listenTo(rs, RecordsetEvent.PageChanged, fn),
            get isLoading() {
                return rs.isLoading;
            },
            get visibleRecords() {
                return rs.currentPage;
            },
        };
    }

    /**
     * Collection of `Record` instances contained within the set.
     * @type { FdlRecord<T>[] }
     */
    get allRecords() {
        return this._.records;
    }

    get cursor() {
        return this._.cursor;
    }

    get filter() {
        return this._.filter;
    }

    set filter(f) {
        this.pageNumber = 1;
        this._.filter = f;
        this._.queueUpdate();
    }

    get isLoading() {
        return this._.isLoading;
    }

    /**
     * A promise that resolves when the `Recordset` finishes its most recent update.
     * May be interrogated across multiple updates.
     * @type Promise<void>
     */
    get updating() {
        return this._.updatedObservable.toPromise(false);
    }

    get pageIndex() {
        return this._.pageIndex;
    }

    set pageIndex(n) {
        this._.pageIndex = n;
        this._.queueUpdate();
    }

    get pageSize() {
        return this._.pageSize;
    }

    set pageSize(n) {
        this.pageNumber = 1;
        this._.pageSize = n;
        this._.queueUpdate();
    }

    get pageNumber() {
        return this._.pageIndex + 1;
    }

    set pageNumber(n) {
        this._.pageIndex = n - 1;
        this._.queueUpdate();
    }

    get sortColumns() {
        return this._.sortColumns;
    }

    set sortColumns(s) {
        this.pageNumber = 1;
        this._.sortColumns = s;
        this._.queueUpdate();
    }

    get parameters() {
        return this._.parameters;
    }

    set parameters(p) {
        this.pageNumber = 1;
        this._.parameters = p;
        this._.queueUpdate();
    }

    get totalCount() {
        return this._.totalCount;
    }

    get filteredCount() {
        if (this.isServerSide) return this._.totalCount;
        return this._.sortedFilteredRecords.length;
    }

    /**
     * @type boolean
     */
    get isClientSide() {
        return this._.totalCount !== 0 && this._.totalCount === this._.records.length;
    }

    get isServerSide() {
        return !this.isClientSide;
    }

    get currentPage() {
        if (this.isServerSide) return this._.sortedFilteredRecords;

        return this._.sortedFilteredRecords.slice(
            this._.pageIndex * this._.pageSize,
            this._.pageIndex * this._.pageSize + this._.pageSize + this._.extraRowCount
        );
    }

    get firstRecordNumberOnPage() {
        return this._.pageIndex * this._.pageSize + 1;
    }

    get lastRecordNumberOnPage() {
        const pageMax = (this._.pageIndex + 1) * this._.pageSize;
        return Math.min(pageMax, this.filteredCount);
    }

    get fieldNames() {
        return Object.keys(this._.fieldTypes);
    }

    get summary() {
        return this._.summary;
    }

    set summary(value) {
        this._.summary = value;
    }

    get hasChanged() {
        return this._.records?.some(record => record.hasChanged);
    }

    isValid() {
        return this.invalidRecordCount() === 0 && this.errors().length === 0;
    }

    errors() {
        const errors = [];
        this._.validators.forEach(validator => {
            if (!validator.validate(this._.records)) {
                errors.push(validator.name);
            }
        });
        return errors;
    }

    /**
     * Adds a validator to the recordset
     *
     * @param {Validator} validator
     */
    addValidator(validator) {
        this._.validators = [...this._.validators, validator];
    }

    /**
     *
     * Adds multiple validators to the recordset
     *
     * @param {Array<Validator>} validators
     */
    addValidators(validators) {
        validators.forEach(validator => this.addValidator(validator));
    }

    async update() {
        this._.isLoading = true;
        if (this._.isFetchNeeded) {
            this._.isFetchNeeded = false;
            try {
                this.dispatchEvent(
                    new CustomEvent(RecordsetEvent.Loading, { detail: { loading: true } })
                );

                const response = this._.fetch({
                    parameters: this.parameters,
                    startIndex: this.pageIndex * this.pageSize,
                    pageSize: this.pageSize,
                    page: this.pageNumber,
                    sort: this.sortColumns,
                    isFirstFetch: this._.isFirstFetch,
                });

                const result = response instanceof Promise ? await response : response;
                if (exists(result)) {
                    this._.hydrateFromFetch(result);
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                this._.isLoading = false;
                this.dispatchEvent(
                    new CustomEvent(RecordsetEvent.Error, {
                        bubbles: true,
                        composed: true,
                        detail: { error },
                    })
                );
            } finally {
                this.dispatchEvent(
                    new CustomEvent(RecordsetEvent.Loading, { detail: { loading: false } })
                );
            }
        }

        this._.extraRowCount = 0;
        this._.isLoading = false;
        this._.sortAndFilterRecords();
        this._.dispatchUpdateEvents();
    }

    async requestHardUpdate() {
        this._.isFetchNeeded = true;
        return this.debouncedUpdate();
    }

    async requestSoftUpdate() {
        // TODO: add check here to determine if a fetch has already been made
        return this.debouncedUpdate();
    }

    /**
     * Performs an update and no-ops on repeated requests
     * until the pending update finishes.
     */
    async requestUpdate() {
        // perform an update only if a previous one is not outstanding
        if (!this._.currentUpdatePromise) {
            this._.currentUpdatePromise = this.update();
            this._.currentUpdatePromise.then(() => {
                this._.currentUpdatePromise = null;
            });
        }

        return this._.currentUpdatePromise;
    }

    /**
     * Perform a delayed update.
     */
    async debouncedUpdate() {
        await delay(this.debounceInterval);
        return this.requestUpdate();
    }

    async sort(column) {
        const otherColumns = this.sortColumns.filter(s => s.field !== column.field);
        this.sortColumns = column.sort === 'UNSORTED' ? otherColumns : [column, ...otherColumns];
    }

    setInitialPageSize(n) {
        this._.pageSize = n;
    }

    /**
     * Reset the `Recordset` to its original sate.
     *
     * @param {boolean} hardReset
     * If `true`, rehydrates the recordset with the raw data obtained from its first fetch.
     * This has the side effect of also recreating the underlying `Record` references, listeners, and counts.
     *
     * Otherwise, the existing records are only reset to their initial values.
     */
    reset(hardReset = false) {
        if (hardReset && this._.originalData) {
            this._.hydrateFromFetch(this._.originalData);
            this._.sortAndFilterRecords();
            this._.dispatchUpdateEvents();
        } else {
            this._.records.forEach(record => record.reset());
        }
    }

    notify(/* event, record */) {
        // just placeholder for testing
        // this.dispatchEvent(new CustomEvent(event, { detail: { record } }));
    }

    /**
     * Create and listen to a new record using the field types
     * associated with this `Recordset`.
     *
     * @param {T} values
     */
    createRecord(values) {
        const record = new FdlRecord(this._.fieldTypes, values);

        this.listenTo(record, RecordsetEvent.Changed, ({ detail }) => {
            this.dispatchEvent(
                new CustomEvent(RecordsetEvent.Updated, { detail: { record, ...detail } })
            );
            this.dispatchEvent(new CustomEvent(RecordsetEvent.CountsChanged));
        });
        return record;
    }

    appendRecord() {
        let defaultValues = Object.keys(this._.fieldTypes).reduce((acc, curr) => {
            acc[curr] = this._.fieldTypes[curr].defaultValue
                ? this._.fieldTypes[curr].defaultValue()
                : '';
            return acc;
        }, {});

        const firstRecord = this._.records[0];
        const proto = Object.getPrototypeOf(firstRecord.values);

        // support class-based backing objects by making a clone and copying over default values
        if (proto !== Object) {
            const clonedValues = clone(firstRecord.values);
            Object.keys(defaultValues).forEach(k => {
                clonedValues[k] = defaultValues[k];
            });

            defaultValues = clonedValues;
        }

        const rec = this.createRecord(defaultValues);
        this.insertRecord(rec, this._.sortedFilteredRecords.length);
    }

    isLastRecord(record) {
        return this.allRecords.indexOf(record) === this.filteredCount - 1;
    }

    /**
     * @deprecated use `appendRecord()` instead
     */
    addRecord() {
        this.appendRecord();
    }

    clone() {
        const { fieldTypes, fetch } = this._;

        /** @type {Object.<string, FieldType>} */
        const clonedFieldTypes = Object.keys(fieldTypes).reduce((cloned, k) => {
            const clonedFieldType = fieldTypes[k].with.copy();
            cloned[k] = clonedFieldType;

            return cloned;
        }, {});
        const clone = new Recordset(clonedFieldTypes, fetch);

        clone.isClone = true;
        clone.copyFrom(this);

        return clone;
    }

    /**
     * Copy the records from another recordset to this one.
     * @param { Recordset } recordset
     * @param { (keyof T)[] } [fields]
     */
    copyFrom(recordset, fields) {
        recordset._.records.forEach((r, i) => {
            this.cloneRecord(r, i, fields);
        });

        this._.isFetchNeeded = false;
        this._.isFirstFetch = false;
    }

    /**
     * Clones a record and inserts it into this `Recordset`.
     *
     * @param { FdlRecord } record
     * @param { number } rowIndex
     * @param { (keyof T)[] } [fields]
     * @returns
     */
    cloneRecord(record, rowIndex, fields) {
        const clonedRecord = record.clone(fields);

        this.listenTo(clonedRecord, RecordsetEvent.Changed, ({ detail }) => {
            this.dispatchEvent(
                new CustomEvent(RecordsetEvent.Updated, {
                    detail: { record: clonedRecord, ...detail },
                })
            );
            this.dispatchEvent(new CustomEvent(RecordsetEvent.CountsChanged));
        });
        this.insertRecord(clonedRecord, rowIndex);

        return clonedRecord;
    }
    /**
     * Deletes a record at a given index
     *
     * @param { Record } rec
     */

    deleteRecord(rec) {
        const rowIndex = this._.sortedFilteredRecords.indexOf(rec);
        const record = this._.sortedFilteredRecords[rowIndex];
        this.stopListeningTo(record);
        this._.sortedFilteredRecords.splice(rowIndex, 1);
        this._.records.splice(
            this._.records.findIndex(r => r === record),
            1
        );
        this._.totalCount--;
        this._.extraRowCount = Math.max(0, this._.extraRowCount - 1);
        this.dispatchEvent(new CustomEvent(RecordsetEvent.Changed)); // deprecated
        this.dispatchEvent(new CustomEvent(RecordsetEvent.PageChanged));
        this.dispatchEvent(new CustomEvent(RecordsetEvent.CountsChanged));
    }

    /**
     * Inserts a new record at a given index.
     *
     * @param { FdlRecord<T> } record
     * @param { number } [index]
     */
    insertRecord(record, index = 0) {
        // records inserted from outside the recordset should share field types
        record.fieldTypes = this._.fieldTypes;

        this._.records.splice(index + 1, 0, record);
        this._.sortedFilteredRecords.splice(index + 1, 0, record);
        this._.totalCount++;
        this._.extraRowCount++;
        this.dispatchEvent(new CustomEvent(RecordsetEvent.Changed)); // deprecated
        this.dispatchEvent(new CustomEvent(RecordsetEvent.PageChanged));
        this.dispatchEvent(new CustomEvent(RecordsetEvent.CountsChanged));
        this.dispatchEvent(
            new CustomEvent(RecordsetEvent.RecordAdded, {
                detail: {
                    record,
                    index,
                },
            })
        );
    }

    /**
     * Updates an existing record within a recordset.
     *
     * @param { Record } record
     */
    updateRecord(record) {
        let index = this._.records.indexOf(record);
        this._.records.splice(index, 1, record);
        index = this._.sortedFilteredRecords.indexOf(record);
        this._.sortedFilteredRecords.splice(index, 1, record);
        this.dispatchEvent(new CustomEvent('change')); // deprecated
        this.dispatchEvent(new CustomEvent('page-changed'));
        this.dispatchEvent(new CustomEvent('counts-changed'));
    }

    /**
     * Listen for an event on the provided target.
     *
     * @param {FdlRecord<T> | Recordset<T>} target
     * @param {'change'|'page-changed'|'counts-changed'} event Name of the event to listen to.
     * @param {Function} fn Callback to be invoked when the event occurs.
     */
    listenTo(target, event, fn) {
        target.addEventListener(event, fn);
        this._.listeningTo.push({ target, event, fn });
    }

    /**
     *
     * @param {EventTarget} target
     */
    stopListeningTo(target) {
        const indexesToRemove = [];
        this._.listeningTo
            .filter(l => l.target === target)
            .forEach((listener, index) => {
                if (listener.target !== target) return;
                indexesToRemove.unshift(index);
                target.removeEventListener(listener.event, listener.fn);
            });

        for (const index of indexesToRemove) {
            this._.listeningTo.splice(index, 1);
        }
    }

    removeListeners() {
        for (const { target, event, fn } of this._.listeningTo) {
            target.removeEventListener(event, fn);
        }
        this._.listeningTo = [];
    }

    /**
     * Register a callback to be invoked any time the recordset is updated.
     *
     * Syntax sugar for long-form `listenTo()` method.
     * @param {Function} fn
     */
    onChange(fn) {
        this.listenTo(this, RecordsetEvent.Changed, fn);

        return this;
    }

    lastRecordIndex() {
        return this._.totalCount;
    }

    setColumnValue(field, value) {
        this._.records
            .filter(record => !record.fieldTypeForField(field).isDisabled(record))
            .forEach(record => record.setField(field, value));

        this.dispatchEvent(new CustomEvent(RecordsetEvent.Changed)); // deprecated
        this.dispatchEvent(new CustomEvent(RecordsetEvent.PageChanged));
        this.dispatchEvent(new CustomEvent(RecordsetEvent.Updated, { detail: { field } }));
    }

    allRecordsMatch(field, value) {
        return this._.sortedFilteredRecords.every(record => record.getField(field) === value);
    }

    noRecordsMatch(field, value) {
        return this._.sortedFilteredRecords.every(record => record.getField(field) !== value);
    }

    partialRecordsMatch(field, value) {
        return !(this.allRecordsMatch(field, value) || this.noRecordsMatch(field, value));
    }

    recordsMatching(field, value) {
        return this._.sortedFilteredRecords.filter(record => record.getField(field) === value);
    }

    countRecordsMatching(field, value) {
        return this.recordsMatching(field, value).length;
    }

    invalidRecordCount() {
        return this._.records.filter(record => !(record.isValid() && record.hasRequiredValues()))
            .length;
    }

    filteredRecordCount() {
        return this._.sortedFilteredRecords.length;
    }

    /**
     * @returns { FieldType }
     */
    getFieldType(field) {
        return this._.fieldTypes[field] ?? new FieldType();
    }

    getData() {
        return this._.sortedFilteredRecords.map(r => r.values);
    }

    setData(data) {
        this._.records.forEach(record => this.stopListeningTo(record));
        this._.records = data.map(values => this.createRecord(values));
        this._.totalCount = data.length;
        this._.isFetchNeeded = false;
        this.requestUpdate();
    }

    /**
     * Gets a record by index. This is mostly used for testing
     *
     * @param {number} index Record index
     * @returns {FdlRecord} Returns a single record.
     */
    getRecordAtIndex(index) {
        if (!this.allRecords || this.allRecords.length < 1)
            throw new Error('No records found in recordset');
        return this.allRecords[index];
    }

    /**
     *  Checks if a field type exists on a recordset
     *
     *  @param {String} field String that represents a field on a recordset
     *  @returns {Boolean} Returns if the field type exists on the recordset */
    hasField(field) {
        return this._.fieldTypes[field] !== undefined;
    }
}
