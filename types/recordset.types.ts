import FieldType from '../field-type';

export interface RecordsetFilterDefinition {
    label: string;
    field: string;
    fieldType: FieldType;
    value: string;
    required?: boolean;
}

export interface RecordsetFetchArgs<T> {
    page: number;
    pageSize: number;
    parameters: T;
    sort: string[];
    startIndex: number;
    isFirstFetch: boolean;
}
