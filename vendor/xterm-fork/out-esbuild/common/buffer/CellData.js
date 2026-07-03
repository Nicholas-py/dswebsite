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
var CellData_exports = {};
__export(CellData_exports, {
  CellData: () => CellData
});
module.exports = __toCommonJS(CellData_exports);
var import_TextDecoder = require("common/input/TextDecoder");
var import_Constants = require("common/buffer/Constants");
var import_AttributeData = require("common/buffer/AttributeData");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class CellData extends import_AttributeData.AttributeData {
  constructor() {
    super(...arguments);
    /** Primitives from terminal buffer. */
    this.content = 0;
    this.fg = 0;
    this.bg = 0;
    this.extended = new import_AttributeData.ExtendedAttrs();
    this.combinedData = "";
  }
  /** Helper to create CellData from CharData. */
  static fromCharData(value) {
    const obj = new CellData();
    obj.setFromCharData(value);
    return obj;
  }
  /** Whether cell contains a combined string. */
  isCombined() {
    return this.content & import_Constants.Content.IS_COMBINED_MASK;
  }
  /** Width of the cell. */
  getWidth() {
    return this.content >> import_Constants.Content.WIDTH_SHIFT;
  }
  /** JS string of the content. */
  getChars() {
    if (this.content & import_Constants.Content.IS_COMBINED_MASK) {
      return this.combinedData;
    }
    if (this.content & import_Constants.Content.CODEPOINT_MASK) {
      return (0, import_TextDecoder.stringFromCodePoint)(this.content & import_Constants.Content.CODEPOINT_MASK);
    }
    return "";
  }
  /**
   * Codepoint of cell
   * Note this returns the UTF32 codepoint of single chars,
   * if content is a combined string it returns the codepoint
   * of the last char in string to be in line with code in CharData.
   */
  getCode() {
    return this.isCombined() ? this.combinedData.charCodeAt(this.combinedData.length - 1) : this.content & import_Constants.Content.CODEPOINT_MASK;
  }
  /** Set data from CharData */
  setFromCharData(value) {
    this.fg = value[import_Constants.CHAR_DATA_ATTR_INDEX];
    this.bg = 0;
    let combined = false;
    if (value[import_Constants.CHAR_DATA_CHAR_INDEX].length > 2) {
      combined = true;
    } else if (value[import_Constants.CHAR_DATA_CHAR_INDEX].length === 2) {
      const code = value[import_Constants.CHAR_DATA_CHAR_INDEX].charCodeAt(0);
      if (55296 <= code && code <= 56319) {
        const second = value[import_Constants.CHAR_DATA_CHAR_INDEX].charCodeAt(1);
        if (56320 <= second && second <= 57343) {
          this.content = (code - 55296) * 1024 + second - 56320 + 65536 | value[import_Constants.CHAR_DATA_WIDTH_INDEX] << import_Constants.Content.WIDTH_SHIFT;
        } else {
          combined = true;
        }
      } else {
        combined = true;
      }
    } else {
      this.content = value[import_Constants.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | value[import_Constants.CHAR_DATA_WIDTH_INDEX] << import_Constants.Content.WIDTH_SHIFT;
    }
    if (combined) {
      this.combinedData = value[import_Constants.CHAR_DATA_CHAR_INDEX];
      this.content = import_Constants.Content.IS_COMBINED_MASK | value[import_Constants.CHAR_DATA_WIDTH_INDEX] << import_Constants.Content.WIDTH_SHIFT;
    }
  }
  /** Get data as CharData. */
  getAsCharData() {
    return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
  }
}
//# sourceMappingURL=CellData.js.map
