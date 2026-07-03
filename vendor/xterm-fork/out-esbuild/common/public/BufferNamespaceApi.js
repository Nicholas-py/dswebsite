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
var BufferNamespaceApi_exports = {};
__export(BufferNamespaceApi_exports, {
  BufferNamespaceApi: () => BufferNamespaceApi
});
module.exports = __toCommonJS(BufferNamespaceApi_exports);
var import_BufferApiView = require("common/public/BufferApiView");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2021 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class BufferNamespaceApi extends import_lifecycle.Disposable {
  constructor(_core) {
    super();
    this._core = _core;
    this._onBufferChange = this._register(new import_event.Emitter());
    this.onBufferChange = this._onBufferChange.event;
    this._normal = new import_BufferApiView.BufferApiView(this._core.buffers.normal, "normal");
    this._alternate = new import_BufferApiView.BufferApiView(this._core.buffers.alt, "alternate");
    this._core.buffers.onBufferActivate(() => this._onBufferChange.fire(this.active));
  }
  get active() {
    if (this._core.buffers.active === this._core.buffers.normal) {
      return this.normal;
    }
    if (this._core.buffers.active === this._core.buffers.alt) {
      return this.alternate;
    }
    throw new Error("Active buffer is neither normal nor alternate");
  }
  get normal() {
    return this._normal.init(this._core.buffers.normal);
  }
  get alternate() {
    return this._alternate.init(this._core.buffers.alt);
  }
}
//# sourceMappingURL=BufferNamespaceApi.js.map
