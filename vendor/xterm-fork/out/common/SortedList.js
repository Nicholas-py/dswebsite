"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortedList = void 0;
const TaskQueue_1 = require("common/TaskQueue");
let i = 0;
class SortedList {
    constructor(_getKey) {
        this._getKey = _getKey;
        this._array = [];
        this._insertedValues = [];
        this._flushInsertedTask = new TaskQueue_1.IdleTaskQueue();
        this._isFlushingInserted = false;
        this._deletedIndices = [];
        this._flushDeletedTask = new TaskQueue_1.IdleTaskQueue();
        this._isFlushingDeleted = false;
    }
    clear() {
        this._array.length = 0;
        this._insertedValues.length = 0;
        this._flushInsertedTask.clear();
        this._isFlushingInserted = false;
        this._deletedIndices.length = 0;
        this._flushDeletedTask.clear();
        this._isFlushingDeleted = false;
    }
    insert(value) {
        this._flushCleanupDeleted();
        if (this._insertedValues.length === 0) {
            this._flushInsertedTask.enqueue(() => this._flushInserted());
        }
        this._insertedValues.push(value);
    }
    _flushInserted() {
        const sortedAddedValues = this._insertedValues.sort((a, b) => this._getKey(a) - this._getKey(b));
        let sortedAddedValuesIndex = 0;
        let arrayIndex = 0;
        const newArray = new Array(this._array.length + this._insertedValues.length);
        for (let newArrayIndex = 0; newArrayIndex < newArray.length; newArrayIndex++) {
            if (arrayIndex >= this._array.length || this._getKey(sortedAddedValues[sortedAddedValuesIndex]) <= this._getKey(this._array[arrayIndex])) {
                newArray[newArrayIndex] = sortedAddedValues[sortedAddedValuesIndex];
                sortedAddedValuesIndex++;
            }
            else {
                newArray[newArrayIndex] = this._array[arrayIndex++];
            }
        }
        this._array = newArray;
        this._insertedValues.length = 0;
    }
    _flushCleanupInserted() {
        if (!this._isFlushingInserted && this._insertedValues.length > 0) {
            this._flushInsertedTask.flush();
        }
    }
    delete(value) {
        this._flushCleanupInserted();
        if (this._array.length === 0) {
            return false;
        }
        const key = this._getKey(value);
        if (key === undefined) {
            return false;
        }
        i = this._search(key);
        if (i === -1) {
            return false;
        }
        if (this._getKey(this._array[i]) !== key) {
            return false;
        }
        do {
            if (this._array[i] === value) {
                if (this._deletedIndices.length === 0) {
                    this._flushDeletedTask.enqueue(() => this._flushDeleted());
                }
                this._deletedIndices.push(i);
                return true;
            }
        } while (++i < this._array.length && this._getKey(this._array[i]) === key);
        return false;
    }
    _flushDeleted() {
        this._isFlushingDeleted = true;
        const sortedDeletedIndices = this._deletedIndices.sort((a, b) => a - b);
        let sortedDeletedIndicesIndex = 0;
        const newArray = new Array(this._array.length - sortedDeletedIndices.length);
        let newArrayIndex = 0;
        for (let i = 0; i < this._array.length; i++) {
            if (sortedDeletedIndices[sortedDeletedIndicesIndex] === i) {
                sortedDeletedIndicesIndex++;
            }
            else {
                newArray[newArrayIndex++] = this._array[i];
            }
        }
        this._array = newArray;
        this._deletedIndices.length = 0;
        this._isFlushingDeleted = false;
    }
    _flushCleanupDeleted() {
        if (!this._isFlushingDeleted && this._deletedIndices.length > 0) {
            this._flushDeletedTask.flush();
        }
    }
    *getKeyIterator(key) {
        this._flushCleanupInserted();
        this._flushCleanupDeleted();
        if (this._array.length === 0) {
            return;
        }
        i = this._search(key);
        if (i < 0 || i >= this._array.length) {
            return;
        }
        if (this._getKey(this._array[i]) !== key) {
            return;
        }
        do {
            yield this._array[i];
        } while (++i < this._array.length && this._getKey(this._array[i]) === key);
    }
    forEachByKey(key, callback) {
        this._flushCleanupInserted();
        this._flushCleanupDeleted();
        if (this._array.length === 0) {
            return;
        }
        i = this._search(key);
        if (i < 0 || i >= this._array.length) {
            return;
        }
        if (this._getKey(this._array[i]) !== key) {
            return;
        }
        do {
            callback(this._array[i]);
        } while (++i < this._array.length && this._getKey(this._array[i]) === key);
    }
    values() {
        this._flushCleanupInserted();
        this._flushCleanupDeleted();
        return [...this._array].values();
    }
    _search(key) {
        let min = 0;
        let max = this._array.length - 1;
        while (max >= min) {
            let mid = (min + max) >> 1;
            const midKey = this._getKey(this._array[mid]);
            if (midKey > key) {
                max = mid - 1;
            }
            else if (midKey < key) {
                min = mid + 1;
            }
            else {
                while (mid > 0 && this._getKey(this._array[mid - 1]) === key) {
                    mid--;
                }
                return mid;
            }
        }
        return min;
    }
}
exports.SortedList = SortedList;
//# sourceMappingURL=SortedList.js.map