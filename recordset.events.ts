import Record from './record';
import Recordset from './recordset';

/**
 * Enumeration of possible events raised by a `Recordset` instance.
 */
export enum RecordsetEvent {
    Loading = 'loading',
    Error = 'error',
    Updated = 'updated',
    /** @deprecated Use `Updated` instead. */
    Changed = 'change',
    CountsChanged = 'counts-changed',
    PageChanged = 'page-changed',
    RecordAdded = 'record-added',
}

interface RecordsetLoadPayload {
    loading: boolean;
}

interface RecordAddedPayload {
    record: Record;
    index: number;
}

type RecordsetEventMap = {
    [RecordsetEvent.Loading]: RecordsetLoadPayload;
    [RecordsetEvent.RecordAdded]: RecordAddedPayload;
    [RecordsetEvent.Error]: Error;
    [RecordsetEvent.Updated]: undefined;
    [RecordsetEvent.Changed]: undefined;
    [RecordsetEvent.CountsChanged]: undefined;
    [RecordsetEvent.PageChanged]: undefined;
};

/**
 * Mapping of `Recordset` event names to callback signatures used with `listenTo()`.
 */
export type RecordsetEventHandlerMap = {
    [K in RecordsetEvent]: (e: CustomEvent<RecordsetEventMap[K]>) => void;
};

export function dispatchRecordsetEvent<E extends RecordsetEvent>(
    recordset: Recordset,
    eventName: E,
    payload: RecordsetEventMap[E]
) {
    const event = new CustomEvent(eventName, {
        detail: payload,
    });

    recordset.dispatchEvent(event);
}
