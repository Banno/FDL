/* eslint-disable lines-between-class-members */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Constructor, Callback } from '../types';
import { LitElement } from 'lit';
import Recordset from '../recordset.js'
import { RecordsetEvent, RecordsetEventHandlerMap } from '../recordset.events';


type ListenerCallback<T> = Callback<CustomEvent<T>>;

export interface Listener<T> {
    target: EventTarget;
    event: string;
    fn: ListenerCallback<T>;
}

// eslint-disable-next-line @treasury/filename-match-export
export function ListeningElementMixin<BaseClass extends Constructor<LitElement>>(
    Superclass: BaseClass
) {
    /**
     * Provides functionality for `LitElement` instances to listen to an `EventTarget`
     * in a way that automatically cleans up subscribers on element destruction.
     */
    class ListeningElement extends Superclass {
        private listeningTo: Listener<any>[] = [];

        protected listenTo<T>(target: EventTarget, event: string, fn: ListenerCallback<T>) {
            target.addEventListener(event, fn as EventListener);
            this.listeningTo.push({ target, event, fn });
        }

        protected listenToMulti<T>(
            target: EventTarget,
            eventNames: string[],
            fn: ListenerCallback<T>
        ) {
            eventNames.forEach(eventName => this.listenTo(target, eventName, fn));
        }

        /**
         * Syntax sugar method for getting strong typing on `Recordset` event names
         * and their corresponding payloads.
         */
        protected listenToRecordset<E extends RecordsetEvent>(
            target: Recordset<any>,
            event: E,
            fn: RecordsetEventHandlerMap[E]
        ) {
            this.listenTo(target, event, fn);
        }

        public disconnectedCallback() {
            for (const { target, event, fn } of this.listeningTo) {
                target.removeEventListener(event, fn as EventListener);
            }
            this.listeningTo = [];
            super.disconnectedCallback();
        }
    }

    return ListeningElement;
}
