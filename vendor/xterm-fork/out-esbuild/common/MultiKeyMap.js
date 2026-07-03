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
var MultiKeyMap_exports = {};
__export(MultiKeyMap_exports, {
  FourKeyMap: () => FourKeyMap,
  TwoKeyMap: () => TwoKeyMap
});
module.exports = __toCommonJS(MultiKeyMap_exports);
/**
 * Copyright (c) 2022 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class TwoKeyMap {
  constructor() {
    this._data = {};
  }
  set(first, second, value) {
    if (!this._data[first]) {
      this._data[first] = {};
    }
    this._data[first][second] = value;
  }
  get(first, second) {
    return this._data[first] ? this._data[first][second] : void 0;
  }
  clear() {
    this._data = {};
  }
}
class FourKeyMap {
  constructor() {
    this._data = new TwoKeyMap();
  }
  set(first, second, third, fourth, value) {
    if (!this._data.get(first, second)) {
      this._data.set(first, second, new TwoKeyMap());
    }
    this._data.get(first, second).set(third, fourth, value);
  }
  get(first, second, third, fourth) {
    return this._data.get(first, second)?.get(third, fourth);
  }
  clear() {
    this._data.clear();
  }
}
//# sourceMappingURL=MultiKeyMap.js.map
