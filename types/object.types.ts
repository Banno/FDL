export interface Constructor<T = unknown> extends Function {
    new (...args: any[]): T;
}

/**
 * Represents built-in and/or primitive constructor types.
 */
export type PrimitiveConstructor = NumberConstructor |
    ArrayConstructor|
    DateConstructor|
    StringConstructor|
    ObjectConstructor;