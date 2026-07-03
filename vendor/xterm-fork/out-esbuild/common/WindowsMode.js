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
var WindowsMode_exports = {};
__export(WindowsMode_exports, {
  updateWindowsModeWrappedState: () => updateWindowsModeWrappedState
});
module.exports = __toCommonJS(WindowsMode_exports);
var import_Constants = require("common/buffer/Constants");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function updateWindowsModeWrappedState(bufferService) {
  const line = bufferService.buffer.lines.get(bufferService.buffer.ybase + bufferService.buffer.y - 1);
  const lastChar = line?.get(bufferService.cols - 1);
  const nextLine = bufferService.buffer.lines.get(bufferService.buffer.ybase + bufferService.buffer.y);
  if (nextLine && lastChar) {
    nextLine.isWrapped = lastChar[import_Constants.CHAR_DATA_CODE_INDEX] !== import_Constants.NULL_CELL_CODE && lastChar[import_Constants.CHAR_DATA_CODE_INDEX] !== import_Constants.WHITESPACE_CELL_CODE;
  }
}
//# sourceMappingURL=WindowsMode.js.map
