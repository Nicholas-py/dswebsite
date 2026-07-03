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
var CharsetService_exports = {};
__export(CharsetService_exports, {
  CharsetService: () => CharsetService
});
module.exports = __toCommonJS(CharsetService_exports);
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class CharsetService {
  constructor() {
    this.glevel = 0;
    this._charsets = [];
  }
  reset() {
    this.charset = void 0;
    this._charsets = [];
    this.glevel = 0;
  }
  setgLevel(g) {
    this.glevel = g;
    this.charset = this._charsets[g];
  }
  setgCharset(g, charset) {
    this._charsets[g] = charset;
    if (this.glevel === g) {
      this.charset = charset;
    }
  }
}
//# sourceMappingURL=CharsetService.js.map
