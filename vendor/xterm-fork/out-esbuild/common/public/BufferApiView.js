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
var BufferApiView_exports = {};
__export(BufferApiView_exports, {
  BufferApiView: () => BufferApiView
});
module.exports = __toCommonJS(BufferApiView_exports);
var import_BufferLineApiView = require("common/public/BufferLineApiView");
var import_CellData = require("common/buffer/CellData");
/**
 * Copyright (c) 2021 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class BufferApiView {
  constructor(_buffer, type) {
    this._buffer = _buffer;
    this.type = type;
  }
  init(buffer) {
    this._buffer = buffer;
    return this;
  }
  get cursorY() {
    return this._buffer.y;
  }
  get cursorX() {
    return this._buffer.x;
  }
  get viewportY() {
    return this._buffer.ydisp;
  }
  get baseY() {
    return this._buffer.ybase;
  }
  get length() {
    return this._buffer.lines.length;
  }
  getLine(y) {
    const line = this._buffer.lines.get(y);
    if (!line) {
      return void 0;
    }
    return new import_BufferLineApiView.BufferLineApiView(line);
  }
  getNullCell() {
    return new import_CellData.CellData();
  }
}
//# sourceMappingURL=BufferApiView.js.map
