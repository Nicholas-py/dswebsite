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
var ColorContrastCache_exports = {};
__export(ColorContrastCache_exports, {
  ColorContrastCache: () => ColorContrastCache
});
module.exports = __toCommonJS(ColorContrastCache_exports);
var import_MultiKeyMap = require("common/MultiKeyMap");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class ColorContrastCache {
  constructor() {
    this._color = new import_MultiKeyMap.TwoKeyMap();
    this._css = new import_MultiKeyMap.TwoKeyMap();
  }
  setCss(bg, fg, value) {
    this._css.set(bg, fg, value);
  }
  getCss(bg, fg) {
    return this._css.get(bg, fg);
  }
  setColor(bg, fg, value) {
    this._color.set(bg, fg, value);
  }
  getColor(bg, fg) {
    return this._color.get(bg, fg);
  }
  clear() {
    this._color.clear();
    this._css.clear();
  }
}
//# sourceMappingURL=ColorContrastCache.js.map
