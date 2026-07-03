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
var BufferLineApiView_exports = {};
__export(BufferLineApiView_exports, {
  BufferLineApiView: () => BufferLineApiView
});
module.exports = __toCommonJS(BufferLineApiView_exports);
var import_CellData = require("common/buffer/CellData");
/**
 * Copyright (c) 2021 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class BufferLineApiView {
  constructor(_line) {
    this._line = _line;
  }
  get isWrapped() {
    return this._line.isWrapped;
  }
  get length() {
    return this._line.length;
  }
  getCell(x, cell) {
    if (x < 0 || x >= this._line.length) {
      return void 0;
    }
    if (cell) {
      this._line.loadCell(x, cell);
      return cell;
    }
    return this._line.loadCell(x, new import_CellData.CellData());
  }
  translateToString(trimRight, startColumn, endColumn) {
    return this._line.translateToString(trimRight, startColumn, endColumn);
  }
}
//# sourceMappingURL=BufferLineApiView.js.map
