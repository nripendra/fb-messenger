declare module Flux {
    interface IListener {
        removeListener(event: string, callback: Function): void;
    }

    class Store {
        emit(ev: string): any;
        listener: IListener
        getState(): any;
        onChange(callback: Function): void;
    }

    class Dispatcher {
        static dispatcher: Dispatcher;

        stores: { [key: string]: Store; };

        constructor(args: any);

        dispatch(key: string, ...payload: any[]): void;

        on(event: string, callback: Function): void;
    }
}

declare module "delorean" {
    export = Flux;
}
