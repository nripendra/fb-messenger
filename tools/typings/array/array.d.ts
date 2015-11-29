declare module "arrayExtension" {
    export interface Array<T> {
        find(predicate: Function) : T;
    }
}