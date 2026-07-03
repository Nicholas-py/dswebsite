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
var SelectionModel_exports = {};
__export(SelectionModel_exports, {
  SelectionModel: () => SelectionModel
});
module.exports = __toCommonJS(SelectionModel_exports);
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class SelectionModel {
  constructor(_bufferService) {
    this._bufferService = _bufferService;
    /**
     * Whether select all is currently active.
     */
    this.isSelectAllActive = false;
    /**
     * The minimal length of the selection from the start position. When double
     * clicking on a word, the word will be selected which makes the selection
     * start at the start of the word and makes this variable the length.
     */
    this.selectionStartLength = 0;
  }
  /**
   * Clears the current selection.
   */
  clearSelection() {
    this.selectionStart = void 0;
    this.selectionEnd = void 0;
    this.isSelectAllActive = false;
    this.selectionStartLength = 0;
  }
  /**
   * The final selection start, taking into consideration select all.
   */
  get finalSelectionStart() {
    if (this.isSelectAllActive) {
      return [0, 0];
    }
    if (!this.selectionEnd || !this.selectionStart) {
      return this.selectionStart;
    }
    return this.areSelectionValuesReversed() ? this.selectionEnd : this.selectionStart;
  }
  /**
   * The final selection end, taking into consideration select all, double click
   * word selection and triple click line selection.
   */
  get finalSelectionEnd() {
    if (this.isSelectAllActive) {
      return [this._bufferService.cols, this._bufferService.buffer.ybase + this._bufferService.rows - 1];
    }
    if (!this.selectionStart) {
      return void 0;
    }
    if (!this.selectionEnd || this.areSelectionValuesReversed()) {
      const startPlusLength = this.selectionStart[0] + this.selectionStartLength;
      if (startPlusLength > this._bufferService.cols) {
        if (startPlusLength % this._bufferService.cols === 0) {
          return [this._bufferService.cols, this.selectionStart[1] + Math.floor(startPlusLength / this._bufferService.cols) - 1];
        }
        return [startPlusLength % this._bufferService.cols, this.selectionStart[1] + Math.floor(startPlusLength / this._bufferService.cols)];
      }
      return [startPlusLength, this.selectionStart[1]];
    }
    if (this.selectionStartLength) {
      if (this.selectionEnd[1] === this.selectionStart[1]) {
        const startPlusLength = this.selectionStart[0] + this.selectionStartLength;
        if (startPlusLength > this._bufferService.cols) {
          return [startPlusLength % this._bufferService.cols, this.selectionStart[1] + Math.floor(startPlusLength / this._bufferService.cols)];
        }
        return [Math.max(startPlusLength, this.selectionEnd[0]), this.selectionEnd[1]];
      }
    }
    return this.selectionEnd;
  }
  /**
   * Returns whether the selection start and end are reversed.
   */
  areSelectionValuesReversed() {
    const start = this.selectionStart;
    const end = this.selectionEnd;
    if (!start || !end) {
      return false;
    }
    return start[1] > end[1] || start[1] === end[1] && start[0] > end[0];
  }
  /**
   * Handle the buffer being trimmed, adjust the selection position.
   * @param amount The amount the buffer is being trimmed.
   * @returns Whether a refresh is necessary.
   */
  handleTrim(amount) {
    if (this.selectionStart) {
      this.selectionStart[1] -= amount;
    }
    if (this.selectionEnd) {
      this.selectionEnd[1] -= amount;
    }
    if (this.selectionEnd && this.selectionEnd[1] < 0) {
      this.clearSelection();
      return true;
    }
    if (this.selectionStart && this.selectionStart[1] < 0) {
      this.selectionStart[1] = 0;
    }
    return false;
  }
}
//# sourceMappingURL=SelectionModel.js.map
