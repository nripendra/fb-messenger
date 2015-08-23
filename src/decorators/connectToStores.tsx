import * as React from 'react';
import {Dispatcher, Store} from 'delorean';

if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(target: any) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}

export default function connectToStore(watchedStores?: Array<string>): Function {
    return function(ComposedComponent: any): any {
        return class ConnectedComponent extends React.Component<any, any> {
            stores: { [key: string]: Store; }; //dictionary of string and Store
            storesDidChange: boolean;
            watchStores: Array<string>;//array of name of stores to watch.
            __watchStores: { [key: string]: Store; };//dictionary of string and Store (subset of this.stores)
            __changeHandlers: { [key: string]: Function; };
            __dispatcher: Dispatcher;

            constructor() {
                super();
                this.__dispatcher = Dispatcher.dispatcher;
                this.state = this.getStoreStates();
                this.watchStores = watchedStores;
            }

            getStoreStates(): any {
                var state = { stores: {} }, store: any;
                /* Set `state.stores` for all present stores with a `setState` method defined. */
                for (var storeName in this.__watchStores) {
                    if (Object.prototype.hasOwnProperty.call(this.stores, storeName)) {
                        state.stores[storeName] = this.__watchStores[storeName].getState();
                    }
                }
                return state;
            }

            // After the component mounted, listen changes of the related stores
            componentDidMount() {

                var self = this, store: Store, storeName: string;

                // If `storesDidChange` method presents, it'll be called after all the stores
                // were changed.
                if (this.props.storesDidChange) {
                    this.__dispatcher.on('change:all', function() {
                        self.props.storesDidChange();
                    });
                }

                // Since `dispatcher.stores` is harder to write, there's a shortcut for it.
                // You can use `this.stores` from the React component.
                this.stores = this.__dispatcher.stores;
                this.__watchStores = {};

                if (typeof this.watchStores != "undefined" && this.watchStores != null) {
                    for (var i = 0; i < this.watchStores.length; i++) {
                        storeName = this.watchStores[i];
                        this.__watchStores[storeName] = this.stores[storeName];
                    }
                } else {
                    this.__watchStores = this.stores;
                    if (console != null && Object.keys != null && Object.keys(this.stores).length > 4) {
                        console.warn('Your component is watching changes on all stores, you may want to define a "watchStores" property in order to only watch stores relevant to this component.');
                    }
                }

                /* `__changeHandler` is a **listener generator** to pass to the `onChange` function. */
                function __changeHandler(store: any, storeName: string) {
                    return function() {
                        var state: any, args: Array<any>;
                        /* If the component is mounted, change state. */
                        //if (self.isMounted()) {
                        self.setState(self.getStoreStates());
                        //}
                        // When something changes it calls the components `storeDidChanged` method if exists.
                        if (self.props.storeDidChange) {
                            args = [storeName].concat(Array.prototype.slice.call(arguments, 0));
                            self.props.storeDidChange.apply(self, args);
                        }
                    };
                }

                // Remember the change handlers so they can be removed later
                this.__changeHandlers = {};

                /* Generate and bind the change handlers to the stores. */
                for (storeName in this.__watchStores) {
                    if (Object.prototype.hasOwnProperty.call(this.stores, storeName)) {
                        store = self.stores[storeName];
                        self.__changeHandlers[storeName] = __changeHandler(store, storeName);
                        // store.onChange((function(store: any, storename: string) {
                        //     return () => {
                        //         self.__changeHandlers[storeName]();
                        //     };
                        // } (store, storeName)));
                        store.onChange(self.__changeHandlers[storeName]);
                    }
                }
            }

            // When a component unmounted, it should stop listening.
            componentWillUnmount() {
                for (var storeName in this.__changeHandlers) {
                    if (Object.prototype.hasOwnProperty.call(this.stores, storeName)) {
                        var store = this.stores[storeName];
                        store.listener.removeListener('change', this.__changeHandlers[storeName]);
                    }
                }
            }

            render() {
                var props = Object.assign({}, this.props, this.state);
                return (<ComposedComponent {...props} />);
            }
        }
    }
}
