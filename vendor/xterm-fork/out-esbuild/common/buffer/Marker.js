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
var Marker_exports = {};
__export(Marker_exports, {
  Marker: () => Marker
});
module.exports = __toCommonJS(Marker_exports);
var import_event = require("vs/base/common/event");
var import_lifecycle = require("vs/base/common/lifecycle");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class Marker {
  constructor(line) {
    this.line = line;
    this.isDisposed = false;
    this._disposables = [];
    this._id = Marker._nextId++;
    this._onDispose = this.register(new import_event.Emitter());
    this.onDispose = this._onDispose.event;
  }
  static {
    this._nextId = 1;
  }
  get id() {
    return this._id;
  }
  dispose() {
    if (this.isDisposed) {
      return;
    }
    this.isDisposed = true;
    this.line = -1;
    this._onDispose.fire();
    (0, import_lifecycle.dispose)(this._disposables);
    this._disposables.length = 0;
  }
  register(disposable) {
    this._disposables.push(disposable);
    return disposable;
  }
}
//# sourceMappingURL=Marker.js.map
