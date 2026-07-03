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
var Clone_exports = {};
__export(Clone_exports, {
  clone: () => clone
});
module.exports = __toCommonJS(Clone_exports);
/**
 * Copyright (c) 2016 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function clone(val, depth = 5) {
  if (typeof val !== "object") {
    return val;
  }
  const clonedObject = Array.isArray(val) ? [] : {};
  for (const key in val) {
    clonedObject[key] = depth <= 1 ? val[key] : val[key] && clone(val[key], depth - 1);
  }
  return clonedObject;
}
//# sourceMappingURL=Clone.js.map
