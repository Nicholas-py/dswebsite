export declare class SortedList<T> {
    private readonly _getKey;
    private _array;
    private readonly _insertedValues;
    private readonly _flushInsertedTask;
    private _isFlushingInserted;
    private readonly _deletedIndices;
    private readonly _flushDeletedTask;
    private _isFlushingDeleted;
    constructor(_getKey: (value: T) => number);
    clear(): void;
    insert(value: T): void;
    private _flushInserted;
    private _flushCleanupInserted;
    delete(value: T): boolean;
    private _flushDeleted;
    private _flushCleanupDeleted;
    getKeyIterator(key: number): IterableIterator<T>;
    forEachByKey(key: number, callback: (value: T) => void): void;
    values(): IterableIterator<T>;
    private _search;
}
//# sourceMappingURL=SortedList.d.ts.map