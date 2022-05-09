
import { createUniqueId } from '../functions';

interface Observer<T> {
    onNext: (value:T) => void;
    onError:(e:Error) => void;
    onComplete:() => void;
}

interface SubscriptionHandle {
    unsubscribe:() => void;
}

/**
 * Represents a stream of values that can be observed over time.
 */
export class Observable<T> {
    private readonly observers = new Map<string, Observer<T>['onNext']>();
    private readonly errorObservers = new Map<string, Observer<T>['onError']>();
    private readonly completionObservers = new Map<string, Observer<T>['onComplete']>();

    private lastValue?:T;
    private completed = false;

    public observe(observer:Observer<T>):SubscriptionHandle{
        this.guardCompletion();

        const {onNext, onError, onComplete} = observer;
        const subs = [
            this.subscribe(onNext),
            this.listenForError(onError),
            this.listenForCompletion(onComplete)
        ];

        return {
            unsubscribe: () => subs.forEach(s => s.unsubscribe())
        };
    }

    public subscribe(callback:Observer<T>['onNext'], emitLastValue = false):SubscriptionHandle{
        this.guardCompletion();

        const id = createUniqueId();
        this.observers.set(id, callback);
        
        if(emitLastValue && this.lastValue){
            callback(this.lastValue);
        }

        return {
            unsubscribe: () => {
                this.observers.delete(id);
            }
        };
    }

    public listenForError(callback:Observer<T>['onError']):SubscriptionHandle{
        this.guardCompletion();

        const id = createUniqueId();
        this.errorObservers.set(id, callback);

        return {
            unsubscribe: () => {
                this.errorObservers.delete(id);
            }
        };
    }

    public listenForCompletion(callback:Observer<T>['onComplete']):SubscriptionHandle{
        this.guardCompletion();

        const id = createUniqueId();
        this.completionObservers.set(id, callback);

        return {
            unsubscribe: () => {
                this.completionObservers.delete(id);
            }
        };
    }

    public emit(value:T){
        this.guardCompletion();

        this.lastValue = value;
        this.observers.forEach(callback => callback(value));
    }

    public complete(){
        this.guardCompletion();
        this.completionObservers.forEach(callback => callback());
        this.observers.clear();
        this.completionObservers.clear();
        this.errorObservers.clear();
        this.completed = true;
    }

    /**
     * Creates a a `Promise` representation of the `Observable`.
     * 
     * Since `Promise` semantics are such that they can only
     * complete once, this will only be fulfilled with
     * last emission from the source `Observable`.
     * 
     * @returns A `Promise` fulfilled with the most recent value of the source observable.
     */
    public toPromise(emitLast = true) {
        const self = this;
        const subs:SubscriptionHandle[] = [];

        return new Promise<T>((resolve, reject) => {
            const subscribeCallback = (value:T) => {
                subs.forEach(s => s.unsubscribe());
                resolve(value);
            };

            subs.push(
                self.subscribe(subscribeCallback, true),
                self.listenForError(error => reject(error))
            );
        });
    }

    private guardCompletion(){
        if(this.completed){
            throw new Error('Cannot operate on a completed Observable.');
        }
    }
}

