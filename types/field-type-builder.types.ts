import { ComparePredicate } from '@treasury/utils/types';

interface DataListViewModel {
    text: string;
    value: string;
}

interface AllFieldTypeBuilderOptions<T, R> {
    data: unknown[] | Promise<DataListViewModel[]>;
    fetch: (source: R) => Promise<DataListViewModel[]>;
    text: string | ((source: T) => string);
    /**
     * Defaults to `"value"`: a string corresponding to the key containing value (e.g. "id"),
     * or a function that takes the source object and returns the value (e.g., `user => user.id`)
     */
    value: string | ((source: T) => string);
    sort: ComparePredicate<T>;
    compareFunction: ComparePredicate<T>;
    filter: (value: string) => boolean;
    hideSelectAll: boolean;
    noCache: boolean;
    /**
     * An array of field names that--when changed--can cause the options to be updated. Only applies when `fetch()` is used.
     * Used for performance tuning to prevent Omega from looking up new options when nothing significant
     * changed to cache (memoize) the results and avoid look up for the same input twice.
     */
    fields: (keyof R)[];
}

export type FieldTypeBuilderOptions<T = string, R = unknown> = Partial<
    AllFieldTypeBuilderOptions<T, R>
>;
