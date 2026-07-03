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
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
var BufferService_exports = {};
__export(BufferService_exports, {
  BufferService: () => BufferService,
  MINIMUM_COLS: () => MINIMUM_COLS,
  MINIMUM_ROWS: () => MINIMUM_ROWS
});
module.exports = __toCommonJS(BufferService_exports);
var import_lifecycle = require("vs/base/common/lifecycle");
var import_BufferSet = require("common/buffer/BufferSet");
var import_Services = require("common/services/Services");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const MINIMUM_COLS = 2;
const MINIMUM_ROWS = 1;
let BufferService = class extends import_lifecycle.Disposable {
  constructor(optionsService) {
    super();
    /** Whether the user is scrolling (locks the scroll position) */
    this.isUserScrolling = false;
    this._onResize = this._register(new import_event.Emitter());
    this.onResize = this._onResize.event;
    this._onScroll = this._register(new import_event.Emitter());
    this.onScroll = this._onScroll.event;
    this.cols = Math.max(optionsService.rawOptions.cols || 0, MINIMUM_COLS);
    this.rows = Math.max(optionsService.rawOptions.rows || 0, MINIMUM_ROWS);
    this.buffers = this._register(new import_BufferSet.BufferSet(optionsService, this));
  }
  get buffer() {
    return this.buffers.active;
  }
  resize(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.buffers.resize(cols, rows);
    this._onResize.fire({ cols, rows });
  }
  reset() {
    this.buffers.reset();
    this.isUserScrolling = false;
  }
  /**
   * Scroll the terminal down 1 row, creating a blank line.
   * @param eraseAttr The attribute data to use the for blank line.
   * @param isWrapped Whether the new line is wrapped from the previous line.
   */
  scroll(eraseAttr, isWrapped = false) {
    const buffer = this.buffer;
    let newLine;
    newLine = this._cachedBlankLine;
    if (!newLine || newLine.length !== this.cols || newLine.getFg(0) !== eraseAttr.fg || newLine.getBg(0) !== eraseAttr.bg) {
      newLine = buffer.getBlankLine(eraseAttr, isWrapped);
      this._cachedBlankLine = newLine;
    }
    newLine.isWrapped = isWrapped;
    const topRow = buffer.ybase + buffer.scrollTop;
    const bottomRow = buffer.ybase + buffer.scrollBottom;
    if (buffer.scrollTop === 0) {
      const willBufferBeTrimmed = buffer.lines.isFull;
      if (bottomRow === buffer.lines.length - 1) {
        if (willBufferBeTrimmed) {
          buffer.lines.recycle().copyFrom(newLine);
        } else {
          buffer.lines.push(newLine.clone());
        }
      } else {
        buffer.lines.splice(bottomRow + 1, 0, newLine.clone());
      }
      if (!willBufferBeTrimmed) {
        buffer.ybase++;
        if (!this.isUserScrolling) {
          buffer.ydisp++;
        }
      } else {
        if (this.isUserScrolling) {
          buffer.ydisp = Math.max(buffer.ydisp - 1, 0);
        }
      }
    } else {
      const scrollRegionHeight = bottomRow - topRow + 1;
      buffer.lines.shiftElements(topRow + 1, scrollRegionHeight - 1, -1);
      buffer.lines.set(bottomRow, newLine.clone());
    }
    if (!this.isUserScrolling) {
      buffer.ydisp = buffer.ybase;
    }
    this._onScroll.fire(buffer.ydisp);
  }
  /**
   * Scroll the display of the terminal
   * @param disp The number of lines to scroll down (negative scroll up).
   * @param suppressScrollEvent Don't emit the scroll event as scrollLines. This is used
   * to avoid unwanted events being handled by the viewport when the event was triggered from the
   * viewport originally.
   */
  scrollLines(disp, suppressScrollEvent) {
    const buffer = this.buffer;
    if (disp < 0) {
      if (buffer.ydisp === 0) {
        return;
      }
      this.isUserScrolling = true;
    } else if (disp + buffer.ydisp >= buffer.ybase) {
      this.isUserScrolling = false;
    }
    const oldYdisp = buffer.ydisp;
    buffer.ydisp = Math.max(Math.min(buffer.ydisp + disp, buffer.ybase), 0);
    if (oldYdisp === buffer.ydisp) {
      return;
    }
    if (!suppressScrollEvent) {
      this._onScroll.fire(buffer.ydisp);
    }
  }
};
BufferService = __decorateClass([
  __decorateParam(0, import_Services.IOptionsService)
], BufferService);
//# sourceMappingURL=BufferService.js.map
