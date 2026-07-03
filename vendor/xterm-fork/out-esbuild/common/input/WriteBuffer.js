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
var WriteBuffer_exports = {};
__export(WriteBuffer_exports, {
  WriteBuffer: () => WriteBuffer
});
module.exports = __toCommonJS(WriteBuffer_exports);
var import_lifecycle = require("vs/base/common/lifecycle");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const DISCARD_WATERMARK = 5e7;
const WRITE_TIMEOUT_MS = 12;
const WRITE_BUFFER_LENGTH_THRESHOLD = 50;
class WriteBuffer extends import_lifecycle.Disposable {
  constructor(_action) {
    super();
    this._action = _action;
    this._writeBuffer = [];
    this._callbacks = [];
    this._pendingData = 0;
    this._bufferOffset = 0;
    this._isSyncWriting = false;
    this._syncCalls = 0;
    this._didUserInput = false;
    this._onWriteParsed = this._register(new import_event.Emitter());
    this.onWriteParsed = this._onWriteParsed.event;
  }
  handleUserInput() {
    this._didUserInput = true;
  }
  /**
   * @deprecated Unreliable, to be removed soon.
   */
  writeSync(data, maxSubsequentCalls) {
    if (maxSubsequentCalls !== void 0 && this._syncCalls > maxSubsequentCalls) {
      this._syncCalls = 0;
      return;
    }
    this._pendingData += data.length;
    this._writeBuffer.push(data);
    this._callbacks.push(void 0);
    this._syncCalls++;
    if (this._isSyncWriting) {
      return;
    }
    this._isSyncWriting = true;
    let chunk;
    while (chunk = this._writeBuffer.shift()) {
      this._action(chunk);
      const cb = this._callbacks.shift();
      if (cb) cb();
    }
    this._pendingData = 0;
    this._bufferOffset = 2147483647;
    this._isSyncWriting = false;
    this._syncCalls = 0;
  }
  write(data, callback) {
    if (this._pendingData > DISCARD_WATERMARK) {
      throw new Error("write data discarded, use flow control to avoid losing data");
    }
    if (!this._writeBuffer.length) {
      this._bufferOffset = 0;
      if (this._didUserInput) {
        this._didUserInput = false;
        this._pendingData += data.length;
        this._writeBuffer.push(data);
        this._callbacks.push(callback);
        this._innerWrite();
        return;
      }
      setTimeout(() => this._innerWrite());
    }
    this._pendingData += data.length;
    this._writeBuffer.push(data);
    this._callbacks.push(callback);
  }
  /**
   * Inner write call, that enters the sliced chunk processing by timing.
   *
   * `lastTime` indicates, when the last _innerWrite call had started.
   * It is used to aggregate async handler execution under a timeout constraint
   * effectively lowering the redrawing needs, schematically:
   *
   *   macroTask _innerWrite:
   *     if (Date.now() - (lastTime | 0) < WRITE_TIMEOUT_MS):
   *        schedule microTask _innerWrite(lastTime)
   *     else:
   *        schedule macroTask _innerWrite(0)
   *
   *   overall execution order on task queues:
   *
   *   macrotasks:  [...]  -->  _innerWrite(0)  -->  [...]  -->  screenUpdate  -->  [...]
   *         m  t:                    |
   *         i  a:                  [...]
   *         c  s:                    |
   *         r  k:              while < timeout:
   *         o  s:                _innerWrite(timeout)
   *
   * `promiseResult` depicts the promise resolve value of an async handler.
   * This value gets carried forward through all saved stack states of the
   * paused parser for proper continuation.
   *
   * Note, for pure sync code `lastTime` and `promiseResult` have no meaning.
   */
  _innerWrite(lastTime = 0, promiseResult = true) {
    const startTime = lastTime || Date.now();
    while (this._writeBuffer.length > this._bufferOffset) {
      const data = this._writeBuffer[this._bufferOffset];
      const result = this._action(data, promiseResult);
      if (result) {
        const continuation = (r) => Date.now() - startTime >= WRITE_TIMEOUT_MS ? setTimeout(() => this._innerWrite(0, r)) : this._innerWrite(startTime, r);
        result.catch((err) => {
          queueMicrotask(() => {
            throw err;
          });
          return Promise.resolve(false);
        }).then(continuation);
        return;
      }
      const cb = this._callbacks[this._bufferOffset];
      if (cb) cb();
      this._bufferOffset++;
      this._pendingData -= data.length;
      if (Date.now() - startTime >= WRITE_TIMEOUT_MS) {
        break;
      }
    }
    if (this._writeBuffer.length > this._bufferOffset) {
      if (this._bufferOffset > WRITE_BUFFER_LENGTH_THRESHOLD) {
        this._writeBuffer = this._writeBuffer.slice(this._bufferOffset);
        this._callbacks = this._callbacks.slice(this._bufferOffset);
        this._bufferOffset = 0;
      }
      setTimeout(() => this._innerWrite());
    } else {
      this._writeBuffer.length = 0;
      this._callbacks.length = 0;
      this._pendingData = 0;
      this._bufferOffset = 0;
    }
    this._onWriteParsed.fire();
  }
}
//# sourceMappingURL=WriteBuffer.js.map
