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
var TypedArray_exports = {};
__export(TypedArray_exports, {
  slice: () => slice,
  sliceFallback: () => sliceFallback
});
module.exports = __toCommonJS(TypedArray_exports);
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function slice(array, start, end) {
  if (array.slice) {
    return array.slice(start, end);
  }
  return sliceFallback(array, start, end);
}
function sliceFallback(array, start = 0, end = array.length) {
  if (start < 0) {
    start = (array.length + start) % array.length;
  }
  if (end >= array.length) {
    end = array.length;
  } else {
    end = (array.length + end) % array.length;
  }
  start = Math.min(start, end);
  const result = new array.constructor(end - start);
  for (let i = 0; i < end - start; ++i) {
    result[i] = array[i + start];
  }
  return result;
}
//# sourceMappingURL=TypedArray.js.map
