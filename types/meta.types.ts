/**
 * Like `Partial<T>`. but recursively makes nested fields optional.
 *
 * See: https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype
 */
export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

/**
 * The inverse of `NonNullable<T>`.
 *
 * See: https://www.typescriptlang.org/docs/handbook/utility-types.html#nonnullabletype
 */
export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

/**
 * Like `Nullable<T>`, but applied recursively to the entire object graph.
 */
export type DeepNullable<T> = {
    [P in keyof T]: DeepNullable<T[P]> | null;
};
