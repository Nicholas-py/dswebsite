import { ICircularList } from 'common/Types';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
export interface IInsertEvent {
    index: number;
    amount: number;
}
export interface IDeleteEvent {
    index: number;
    amount: number;
}
export declare class CircularList<T> extends Disposable implements ICircularList<T> {
    private _maxLength;
    protected _array: (T | undefined)[];
    private _startIndex;
    private _length;
    readonly onDeleteEmitter: Emitter<IDeleteEvent>;
    readonly onDelete: import("vs/base/common/event").Event<IDeleteEvent>;
    readonly onInsertEmitter: Emitter<IInsertEvent>;
    readonly onInsert: import("vs/base/common/event").Event<IInsertEvent>;
    readonly onTrimEmitter: Emitter<number>;
    readonly onTrim: import("vs/base/common/event").Event<number>;
    constructor(_maxLength: number);
    get maxLength(): number;
    set maxLength(newMaxLength: number);
    get length(): number;
    set length(newLength: number);
    get(index: number): T | undefined;
    set(index: number, value: T | undefined): void;
    push(value: T): void;
    recycle(): T;
    get isFull(): boolean;
    pop(): T | undefined;
    splice(start: number, deleteCount: number, ...items: T[]): void;
    trimStart(count: number): void;
    shiftElements(start: number, count: number, offset: number): void;
    private _getCyclicIndex;
}
//# sourceMappingURL=CircularList.d.ts.map