"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var CircularList_exports = {};
__export(CircularList_exports, {
  CircularList: () => CircularList
});
module.exports = __toCommonJS(CircularList_exports);
var import_lifecycle = require("vs/base/common/lifecycle");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2016 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class CircularList extends import_lifecycle.Disposable {
  constructor(_maxLength) {
    super();
    this._maxLength = _maxLength;
    this.onDeleteEmitter = this._register(new import_event.Emitter());
    this.onDelete = this.onDeleteEmitter.event;
    this.onInsertEmitter = this._register(new import_event.Emitter());
    this.onInsert = this.onInsertEmitter.event;
    this.onTrimEmitter = this._register(new import_event.Emitter());
    this.onTrim = this.onTrimEmitter.event;
    this._array = new Array(this._maxLength);
    this._startIndex = 0;
    this._length = 0;
  }
  get maxLength() {
    return this._maxLength;
  }
  set maxLength(newMaxLength) {
    if (this._maxLength === newMaxLength) {
      return;
    }
    const newArray = new Array(newMaxLength);
    for (let i = 0; i < Math.min(newMaxLength, this.length); i++) {
      newArray[i] = this._array[this._getCyclicIndex(i)];
    }
    this._array = newArray;
    this._maxLength = newMaxLength;
    this._startIndex = 0;
  }
  get length() {
    return this._length;
  }
  set length(newLength) {
    if (newLength > this._length) {
      for (let i = this._length; i < newLength; i++) {
        this._array[i] = void 0;
      }
    }
    this._length = newLength;
  }
  /**
   * Gets the value at an index.
   *
   * Note that for performance reasons there is no bounds checking here, the index reference is
   * circular so this should always return a value and never throw.
   * @param index The index of the value to get.
   * @returns The value corresponding to the index.
   */
  get(index) {
    return this._array[this._getCyclicIndex(index)];
  }
  /**
   * Sets the value at an index.
   *
   * Note that for performance reasons there is no bounds checking here, the index reference is
   * circular so this should always return a value and never throw.
   * @param index The index to set.
   * @param value The value to set.
   */
  set(index, value) {
    this._array[this._getCyclicIndex(index)] = value;
  }
  /**
   * Pushes a new value onto the list, wrapping around to the start of the array, overriding index 0
   * if the maximum length is reached.
   * @param value The value to push onto the list.
   */
  push(value) {
    this._array[this._getCyclicIndex(this._length)] = value;
    if (this._length === this._maxLength) {
      this._startIndex = ++this._startIndex % this._maxLength;
      this.onTrimEmitter.fire(1);
    } else {
      this._length++;
    }
  }
  /**
   * Advance ringbuffer index and return current element for recycling.
   * Note: The buffer must be full for this method to work.
   * @throws When the buffer is not full.
   */
  recycle() {
    if (this._length !== this._maxLength) {
      throw new Error("Can only recycle when the buffer is full");
    }
    this._startIndex = ++this._startIndex % this._maxLength;
    this.onTrimEmitter.fire(1);
    return this._array[this._getCyclicIndex(this._length - 1)];
  }
  /**
   * Ringbuffer is at max length.
   */
  get isFull() {
    return this._length === this._maxLength;
  }
  /**
   * Removes and returns the last value on the list.
   * @returns The popped value.
   */
  pop() {
    return this._array[this._getCyclicIndex(this._length-- - 1)];
  }
  /**
   * Deletes and/or inserts items at a particular index (in that order). Unlike
   * Array.prototype.splice, this operation does not return the deleted items as a new array in
   * order to save creating a new array. Note that this operation may shift all values in the list
   * in the worst case.
   * @param start The index to delete and/or insert.
   * @param deleteCount The number of elements to delete.
   * @param items The items to insert.
   */
  splice(start, deleteCount, ...items) {
    if (deleteCount) {
      for (let i = start; i < this._length - deleteCount; i++) {
        this._array[this._getCyclicIndex(i)] = this._array[this._getCyclicIndex(i + deleteCount)];
      }
      this._length -= deleteCount;
      this.onDeleteEmitter.fire({ index: start, amount: deleteCount });
    }
    for (let i = this._length - 1; i >= start; i--) {
      this._array[this._getCyclicIndex(i + items.length)] = this._array[this._getCyclicIndex(i)];
    }
    for (let i = 0; i < items.length; i++) {
      this._array[this._getCyclicIndex(start + i)] = items[i];
    }
    if (items.length) {
      this.onInsertEmitter.fire({ index: start, amount: items.length });
    }
    if (this._length + items.length > this._maxLength) {
      const countToTrim = this._length + items.length - this._maxLength;
      this._startIndex += countToTrim;
      this._length = this._maxLength;
      this.onTrimEmitter.fire(countToTrim);
    } else {
      this._length += items.length;
    }
  }
  /**
   * Trims a number of items from the start of the list.
   * @param count The number of items to remove.
   */
  trimStart(count) {
    if (count > this._length) {
      count = this._length;
    }
    this._startIndex += count;
    this._length -= count;
    this.onTrimEmitter.fire(count);
  }
  shiftElements(start, count, offset) {
    if (count <= 0) {
      return;
    }
    if (start < 0 || start >= this._length) {
      throw new Error("start argument out of range");
    }
    if (start + offset < 0) {
      throw new Error("Cannot shift elements in list beyond index 0");
    }
    if (offset > 0) {
      for (let i = count - 1; i >= 0; i--) {
        this.set(start + i + offset, this.get(start + i));
      }
      const expandListBy = start + count + offset - this._length;
      if (expandListBy > 0) {
        this._length += expandListBy;
        while (this._length > this._maxLength) {
          this._length--;
          this._startIndex++;
          this.onTrimEmitter.fire(1);
        }
      }
    } else {
      for (let i = 0; i < count; i++) {
        this.set(start + i + offset, this.get(start + i));
      }
    }
  }
  /**
   * Gets the cyclic index for the specified regular index. The cyclic index can then be used on the
   * backing array to get the element associated with the regular index.
   * @param index The regular index.
   * @returns The cyclic index.
   */
  _getCyclicIndex(index) {
    return (this._startIndex + index) % this._maxLength;
  }
}
//# sourceMappingURL=CircularList.js.map
