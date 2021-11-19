import Record from './record.js';
import FieldType from './field-type.js';
import comparatorFromColumns from './utilities/comparator-from-columns.js';

export default class Recordset extends EventTarget {
    constructor(fieldTypes = {}, fetch) {
        super();
        this.debounceInterval = 0;
        this._ = {};
        this._.extraRowCount = 0;
        this._.fetch = fetch instanceof Function ? fetch : () => fetch;
        this._.fieldTypes = fieldTypes;
        this._.filter = () => true;
        this._.isLoading = false;
        this._.isFetchNeeded = true;
        this._.currentUpdatePromise = null;
        this._.listeningTo = [];
        this._.pageIndex = 0;
        this._.pageSize = 10;
        this._.parameters = {};
        this._.records = [];
        this._.sortColumns = [];
        this._.sortedFilteredRecords = [];
        this._.totalCount = 0;

        const rs = this;
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
            onChange: fn => rs.listenTo(rs, 'page-changed', fn),
            get visibleRecords() {
                return this.currentPage;
            },
        };
    }

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
        this.requestSoftUpdate();
    }

    get isLoading() {
        return this._.isLoading;
    }

    get pageIndex() {
        return this._.pageIndex;
    }

    set pageIndex(n) {
        this._.pageIndex = n;
        this.requestSoftUpdate();
    }

    get pageSize() {
        return this._.pageSize;
    }

    set pageSize(n) {
        this.pageNumber = 1;
        this._.pageSize = n;
        this.requestSoftUpdate();
    }

    get pageNumber() {
        return this._.pageIndex + 1;
    }

    set pageNumber(n) {
        this._.pageIndex = n - 1;
        this.requestSoftUpdate();
    }

    get sortColumns() {
        return this._.sortColumns;
    }

    set sortColumns(s) {
        this.pageNumber = 1;
        this._.sortColumns = s;
        this.requestSoftUpdate();
    }

    get parameters() {
        return this._.parameters;
    }

    set parameters(p) {
        this.pageNumber = 1;
        this._.parameters = p;
        this.requestHardUpdate();
    }

    get totalCount() {
        return this._.totalCount;
    }

    get filteredCount() {
        if (this.isServerSide) return this._.totalCount;
        return this._.sortedFilteredRecords.length;
    }

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

    isValid() {
        return this.invalidRecordCount() === 0;
    }

    async update() {
        this._.isLoading = true;
        if (this._.isFetchNeeded) {
            this._.isFetchNeeded = false;
            try {
                this.dispatchEvent(new CustomEvent('loading', { detail: { loading: true } }));
                const result = await this._.fetch({
                    parameters: this.parameters,
                    startIndex: this.pageIndex * this.pageSize,
                    pageSize: this.pageSize,
                    page: this.pageNumber,
                    sort: this.sortColumns,
                });
                const [data, totalCount, summary] =
                    'data' in result
                        ? [result.data, result.totalCount, result.summary]
                        : [result, result.length];
                this._.summary = summary;
                this._.totalCount = totalCount;
                this._.records.forEach(record => this.stopListeningTo(record));
                this._.records = data.map(values => this.createRecord(values));
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                this._.isLoading = false;
                this.dispatchEvent(
                    new CustomEvent('error', { bubbles: true, composed: true, detail: { error } })
                );
            } finally {
                this.dispatchEvent(new CustomEvent('loading', { detail: { loading: false } }));
            }
        }

        this._.sortedFilteredRecords = this._.records
            .filter(this._.filter)
            .sort((a, b) =>
                comparatorFromColumns(this._.sortColumns, this._.fieldTypes)(a.values, b.values)
            );
        this._.extraRowCount = 0;

        this._.isLoading = false;

        this.dispatchEvent(new CustomEvent('change')); // deprecated
        this.dispatchEvent(new CustomEvent('page-changed'));
        this.dispatchEvent(new CustomEvent('counts-changed'));
    }

    async requestHardUpdate() {
        this._.isFetchNeeded = true;
        await this.requestUpdate();
    }

    async requestSoftUpdate() {
        // TODO: add check here to determine if a fetch has already been made
        this._.isFetchNeeded = this._.isFetchNeeded || this.isServerSide;
        await this.requestUpdate();
    }

    async requestUpdate() {
        if (this._.updateRequested) {
            const updatePromise = this._.currentUpdatePromise;
            if (updatePromise) await updatePromise;
            return;
        }
        this._.updateRequested = true;
        this._.currentUpdatePromise = this.debouncedUpdate();
        await this._.currentUpdatePromise;
        this._.updateRequested = false;
        this._.currentUpdatePromise = null;
    }

    async debouncedUpdate() {
        await new Promise(resolve => setTimeout(resolve, this.debounceInterval));
        await this.update();
    }

    async sort(column) {
        const otherColumns = this.sortColumns.filter(s => s.field !== column.field);
        this.sortColumns = column.sort === 'UNSORTED' ? otherColumns : [column, ...otherColumns];
    }

    setInitialPageSize(n) {
        this._.pageSize = n;
    }

    reset() {
        this._.records.forEach(record => record.reset());
        // TODO: add reset support to revert added/removed rows
    }

    notify() {
        // keeping for testing purposes
    }

    createRecord(values) {
        const record = new Record(this._.fieldTypes, values);
        this.listenTo(record, 'change', ({ detail }) => {
            this.dispatchEvent(new CustomEvent('updated', { detail: { record, ...detail } }));
            this.dispatchEvent(new CustomEvent('counts-changed'));
        });
        return record;
    }

    appendRecord() {
        const values = Object.keys(this._.fieldTypes).reduce((acc, curr) => {
            acc[curr] = this._.fieldTypes[curr].defaultValue
                ? this._.fieldTypes[curr].defaultValue()
                : '';
            return acc;
        }, {});

        const rec = this.createRecord(values);
        this.insertRecord(rec, this._.sortedFilteredRecords.length);
    }

    isLastRecord(record) {
        return this.allRecords.indexOf(record) === this.filteredCount - 1;
    }

    addRecord() {
        // addRecord is deprecated; appendRecord is a clearer name
        this.appendRecord();
    }

    cloneRecord(record, rowIndex, fields) {
        const clonedRecord = record.clone(fields);
        this.insertRecord(clonedRecord, rowIndex);
        return clonedRecord;
    }

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
        this.dispatchEvent(new CustomEvent('change')); // deprecated
        this.dispatchEvent(new CustomEvent('page-changed'));
        this.dispatchEvent(new CustomEvent('counts-changed'));
    }

    insertRecord(record, index) {
        this._.records.splice(index + 1, 0, record);
        this._.sortedFilteredRecords.splice(index + 1, 0, record);
        this._.totalCount++;
        this._.extraRowCount++;
        this.dispatchEvent(new CustomEvent('change')); // deprecated
        this.dispatchEvent(new CustomEvent('page-changed'));
        this.dispatchEvent(new CustomEvent('counts-changed'));
    }

    listenTo(target, event, fn) {
        target.addEventListener(event, fn);
        this._.listeningTo.push({ target, event, fn });
    }

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
        for (const { target, event, fn } of this.listeningTo) {
            target.removeEventListener(event, fn);
        }
        this._.listeningTo = [];
    }

    lastRecordIndex() {
        return this._.totalCount;
    }

    setColumnValue(field, value) {
        this._.records
            .filter(record => !record.fieldTypeForField(field).isDisabled(record))
            .forEach(record => record.setField(field, value));

        this.dispatchEvent(new CustomEvent('change')); // deprecated
        this.dispatchEvent(new CustomEvent('page-changed'));
    }

    allRecordsMatch(field, value) {
        return this._.sortedFilteredRecords.every(record => record.getField(field) === value);
    }

    noRecordsMatch(field, value) {
        return this._.sortedFilteredRecords.every(record => record.getField(field) !== value);
    }

    partialRecordsMatch(field, value) {
        if (this.allRecordsMatch(field, value)) return false;
        if (this.noRecordsMatch(field, value)) return false;
        return true;
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
}
