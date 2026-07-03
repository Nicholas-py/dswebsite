export declare function getOrSet<K, V>(map: Map<K, V>, key: K, value: V): V;
export declare function mapToString<K, V>(map: Map<K, V>): string;
export declare function setToString<K>(set: Set<K>): string;
export declare const enum Touch {
    None = 0,
    AsOld = 1,
    AsNew = 2
}
export declare class CounterSet<T> {
    private map;
    add(value: T): CounterSet<T>;
    delete(value: T): boolean;
    has(value: T): boolean;
}
/**
 * A map that allows access both by keys and values.
 * **NOTE**: values need to be unique.
 */
export declare class BidirectionalMap<K, V> {
    private readonly _m1;
    private readonly _m2;
    constructor(entries?: readonly (readonly [K, V])[]);
    clear(): void;
    set(key: K, value: V): void;
    get(key: K): V | undefined;
    getKey(value: V): K | undefined;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, key: K, map: BidirectionalMap<K, V>) => void, thisArg?: any): void;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
}
export declare class SetMap<K, V> {
    private map;
    add(key: K, value: V): void;
    delete(key: K, value: V): void;
    forEach(key: K, fn: (value: V) => void): void;
    get(key: K): ReadonlySet<V>;
}
export declare function mapsStrictEqualIgnoreOrder(a: Map<unknown, unknown>, b: Map<unknown, unknown>): boolean;
//# sourceMappingURL=map.d.ts.map