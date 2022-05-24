/**
 * Represents a function that can be called with between zero and many arguments.
 */
export type VariadicFunction<T = void> = (...args: any[]) => T;

/**
 * Represents a function which receives no input whose effect is isolated from callers;
 * a "fire and forget" invocation.
 */
export type Action = () => void;

/**
 * Represents a function which receives a single argument and performs an action on/with it
 * without returning a result.
 */
export type Callback<T> = (arg: T) => void;
