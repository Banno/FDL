/**
 * Represents a value that is to be accessed in the future, upon invocation.
 */
type Deferred<T> = () => T;

/**
 * Represents a value that could be synchronous or asynchronous.
 */
export type SyncOrAsync<T> = T | Promise<T>;

/**
 * Represents a value that could be a reference or a function
 * that returns a reference.
 */
export type ValueOrDeferred<T> = T | Deferred<T>;

/**
 * Represents a value that can synchronous, asynchronous,
 * deferred, or deferred *and* asynchronous.
 */
export type SyncAsyncDeferred<T> = SyncOrAsync<T> | ValueOrDeferred<T> | Deferred<Promise<T>>;
