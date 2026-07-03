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
var RenderDebouncer_exports = {};
__export(RenderDebouncer_exports, {
  RenderDebouncer: () => RenderDebouncer
});
module.exports = __toCommonJS(RenderDebouncer_exports);
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class RenderDebouncer {
  constructor(_renderCallback, _coreBrowserService) {
    this._renderCallback = _renderCallback;
    this._coreBrowserService = _coreBrowserService;
    this._refreshCallbacks = [];
  }
  dispose() {
    if (this._animationFrame) {
      this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame);
      this._animationFrame = void 0;
    }
  }
  addRefreshCallback(callback) {
    this._refreshCallbacks.push(callback);
    if (!this._animationFrame) {
      this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._innerRefresh());
    }
    return this._animationFrame;
  }
  refresh(rowStart, rowEnd, rowCount) {
    this._rowCount = rowCount;
    rowStart = rowStart !== void 0 ? rowStart : 0;
    rowEnd = rowEnd !== void 0 ? rowEnd : this._rowCount - 1;
    this._rowStart = this._rowStart !== void 0 ? Math.min(this._rowStart, rowStart) : rowStart;
    this._rowEnd = this._rowEnd !== void 0 ? Math.max(this._rowEnd, rowEnd) : rowEnd;
    if (this._animationFrame) {
      return;
    }
    this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._innerRefresh());
  }
  _innerRefresh() {
    this._animationFrame = void 0;
    if (this._rowStart === void 0 || this._rowEnd === void 0 || this._rowCount === void 0) {
      this._runRefreshCallbacks();
      return;
    }
    const start = Math.max(this._rowStart, 0);
    const end = Math.min(this._rowEnd, this._rowCount - 1);
    this._rowStart = void 0;
    this._rowEnd = void 0;
    this._renderCallback(start, end);
    this._runRefreshCallbacks();
  }
  _runRefreshCallbacks() {
    for (const callback of this._refreshCallbacks) {
      callback(0);
    }
    this._refreshCallbacks = [];
  }
}
//# sourceMappingURL=RenderDebouncer.js.map
