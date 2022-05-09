/**
 * Comparison function in the style used by sorting algorithms.
 * 
 * @returns Returns `0` if values are equivalent,
 * `-1` if `a` is less than `b`,
 * and `1` `a` is greater than `b`.
 */
 export type ComparePredicate<T> = (a:T, b:T) => -1 | 0 | 1;