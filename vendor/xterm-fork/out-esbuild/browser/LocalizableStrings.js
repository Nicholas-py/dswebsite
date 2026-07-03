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
var LocalizableStrings_exports = {};
__export(LocalizableStrings_exports, {
  promptLabel: () => promptLabel,
  tooMuchOutput: () => tooMuchOutput
});
module.exports = __toCommonJS(LocalizableStrings_exports);
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let promptLabelInternal = "Terminal input";
const promptLabel = {
  get: () => promptLabelInternal,
  set: (value) => promptLabelInternal = value
};
let tooMuchOutputInternal = "Too much output to announce, navigate to rows manually to read";
const tooMuchOutput = {
  get: () => tooMuchOutputInternal,
  set: (value) => tooMuchOutputInternal = value
};
//# sourceMappingURL=LocalizableStrings.js.map
