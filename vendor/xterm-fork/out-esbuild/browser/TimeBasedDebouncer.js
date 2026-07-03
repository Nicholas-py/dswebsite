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
var TimeBasedDebouncer_exports = {};
__export(TimeBasedDebouncer_exports, {
  TimeBasedDebouncer: () => TimeBasedDebouncer
});
module.exports = __toCommonJS(TimeBasedDebouncer_exports);
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const RENDER_DEBOUNCE_THRESHOLD_MS = 1e3;
class TimeBasedDebouncer {
  constructor(_renderCallback, _debounceThresholdMS = RENDER_DEBOUNCE_THRESHOLD_MS) {
    this._renderCallback = _renderCallback;
    this._debounceThresholdMS = _debounceThresholdMS;
    // The last moment that the Terminal was refreshed at
    this._lastRefreshMs = 0;
    // Whether a trailing refresh should be triggered due to a refresh request that was throttled
    this._additionalRefreshRequested = false;
  }
  dispose() {
    if (this._refreshTimeoutID) {
      clearTimeout(this._refreshTimeoutID);
    }
  }
  refresh(rowStart, rowEnd, rowCount) {
    this._rowCount = rowCount;
    rowStart = rowStart !== void 0 ? rowStart : 0;
    rowEnd = rowEnd !== void 0 ? rowEnd : this._rowCount - 1;
    this._rowStart = this._rowStart !== void 0 ? Math.min(this._rowStart, rowStart) : rowStart;
    this._rowEnd = this._rowEnd !== void 0 ? Math.max(this._rowEnd, rowEnd) : rowEnd;
    const refreshRequestTime = Date.now();
    if (refreshRequestTime - this._lastRefreshMs >= this._debounceThresholdMS) {
      this._lastRefreshMs = refreshRequestTime;
      this._innerRefresh();
    } else if (!this._additionalRefreshRequested) {
      const elapsed = refreshRequestTime - this._lastRefreshMs;
      const waitPeriodBeforeTrailingRefresh = this._debounceThresholdMS - elapsed;
      this._additionalRefreshRequested = true;
      this._refreshTimeoutID = window.setTimeout(() => {
        this._lastRefreshMs = Date.now();
        this._innerRefresh();
        this._additionalRefreshRequested = false;
        this._refreshTimeoutID = void 0;
      }, waitPeriodBeforeTrailingRefresh);
    }
  }
  _innerRefresh() {
    if (this._rowStart === void 0 || this._rowEnd === void 0 || this._rowCount === void 0) {
      return;
    }
    const start = Math.max(this._rowStart, 0);
    const end = Math.min(this._rowEnd, this._rowCount - 1);
    this._rowStart = void 0;
    this._rowEnd = void 0;
    this._renderCallback(start, end);
  }
}
//# sourceMappingURL=TimeBasedDebouncer.js.map
