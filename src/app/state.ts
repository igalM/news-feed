import { BehaviorSubject, Observable } from 'rxjs';

export class Store<T> {
    private readonly state$: BehaviorSubject<T>;

    constructor(initialState: T) {
        this.state$ = new BehaviorSubject(initialState);
    }

    protected get state(): T {
        return this.state$.getValue();
    }

    protected getState(): Observable<T> {
        return this.state$;
    }

    protected setState(newState: Partial<T>): void {
        return this.state$.next({
            ...this.state,
            ...newState
        });
    }



}