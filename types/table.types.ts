import FieldType from '../field-type';

/**
 * A collection of definitions describing how data at a particular
 * key from the source dataset should be validated or rendered in certain Omega components.
 */
export type FdlFieldDefinitions<T> = Partial<Record<keyof T, FieldType<any>>>;
