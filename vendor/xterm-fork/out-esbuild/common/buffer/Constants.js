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
var Constants_exports = {};
__export(Constants_exports, {
  Attributes: () => Attributes,
  BgFlags: () => BgFlags,
  CHAR_DATA_ATTR_INDEX: () => CHAR_DATA_ATTR_INDEX,
  CHAR_DATA_CHAR_INDEX: () => CHAR_DATA_CHAR_INDEX,
  CHAR_DATA_CODE_INDEX: () => CHAR_DATA_CODE_INDEX,
  CHAR_DATA_WIDTH_INDEX: () => CHAR_DATA_WIDTH_INDEX,
  Content: () => Content,
  DEFAULT_ATTR: () => DEFAULT_ATTR,
  DEFAULT_COLOR: () => DEFAULT_COLOR,
  DEFAULT_EXT: () => DEFAULT_EXT,
  ExtFlags: () => ExtFlags,
  FgFlags: () => FgFlags,
  NULL_CELL_CHAR: () => NULL_CELL_CHAR,
  NULL_CELL_CODE: () => NULL_CELL_CODE,
  NULL_CELL_WIDTH: () => NULL_CELL_WIDTH,
  UnderlineStyle: () => UnderlineStyle,
  WHITESPACE_CELL_CHAR: () => WHITESPACE_CELL_CHAR,
  WHITESPACE_CELL_CODE: () => WHITESPACE_CELL_CODE,
  WHITESPACE_CELL_WIDTH: () => WHITESPACE_CELL_WIDTH
});
module.exports = __toCommonJS(Constants_exports);
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const DEFAULT_COLOR = 0;
const DEFAULT_ATTR = 0 << 18 | DEFAULT_COLOR << 9 | 256 << 0;
const DEFAULT_EXT = 0;
const CHAR_DATA_ATTR_INDEX = 0;
const CHAR_DATA_CHAR_INDEX = 1;
const CHAR_DATA_WIDTH_INDEX = 2;
const CHAR_DATA_CODE_INDEX = 3;
const NULL_CELL_CHAR = "";
const NULL_CELL_WIDTH = 1;
const NULL_CELL_CODE = 0;
const WHITESPACE_CELL_CHAR = " ";
const WHITESPACE_CELL_WIDTH = 1;
const WHITESPACE_CELL_CODE = 32;
var Content = /* @__PURE__ */ ((Content2) => {
  Content2[Content2["CODEPOINT_MASK"] = 2097151] = "CODEPOINT_MASK";
  Content2[Content2["IS_COMBINED_MASK"] = 2097152] = "IS_COMBINED_MASK";
  Content2[Content2["HAS_CONTENT_MASK"] = 4194303] = "HAS_CONTENT_MASK";
  Content2[Content2["WIDTH_MASK"] = 12582912] = "WIDTH_MASK";
  Content2[Content2["WIDTH_SHIFT"] = 22] = "WIDTH_SHIFT";
  return Content2;
})(Content || {});
var Attributes = /* @__PURE__ */ ((Attributes2) => {
  Attributes2[Attributes2["BLUE_MASK"] = 255] = "BLUE_MASK";
  Attributes2[Attributes2["BLUE_SHIFT"] = 0] = "BLUE_SHIFT";
  Attributes2[Attributes2["PCOLOR_MASK"] = 255] = "PCOLOR_MASK";
  Attributes2[Attributes2["PCOLOR_SHIFT"] = 0] = "PCOLOR_SHIFT";
  Attributes2[Attributes2["GREEN_MASK"] = 65280] = "GREEN_MASK";
  Attributes2[Attributes2["GREEN_SHIFT"] = 8] = "GREEN_SHIFT";
  Attributes2[Attributes2["RED_MASK"] = 16711680] = "RED_MASK";
  Attributes2[Attributes2["RED_SHIFT"] = 16] = "RED_SHIFT";
  Attributes2[Attributes2["CM_MASK"] = 50331648] = "CM_MASK";
  Attributes2[Attributes2["CM_DEFAULT"] = 0] = "CM_DEFAULT";
  Attributes2[Attributes2["CM_P16"] = 16777216] = "CM_P16";
  Attributes2[Attributes2["CM_P256"] = 33554432] = "CM_P256";
  Attributes2[Attributes2["CM_RGB"] = 50331648] = "CM_RGB";
  Attributes2[Attributes2["RGB_MASK"] = 16777215] = "RGB_MASK";
  return Attributes2;
})(Attributes || {});
var FgFlags = /* @__PURE__ */ ((FgFlags2) => {
  FgFlags2[FgFlags2["INVERSE"] = 67108864] = "INVERSE";
  FgFlags2[FgFlags2["BOLD"] = 134217728] = "BOLD";
  FgFlags2[FgFlags2["UNDERLINE"] = 268435456] = "UNDERLINE";
  FgFlags2[FgFlags2["BLINK"] = 536870912] = "BLINK";
  FgFlags2[FgFlags2["INVISIBLE"] = 1073741824] = "INVISIBLE";
  FgFlags2[FgFlags2["STRIKETHROUGH"] = 2147483648] = "STRIKETHROUGH";
  return FgFlags2;
})(FgFlags || {});
var BgFlags = /* @__PURE__ */ ((BgFlags2) => {
  BgFlags2[BgFlags2["ITALIC"] = 67108864] = "ITALIC";
  BgFlags2[BgFlags2["DIM"] = 134217728] = "DIM";
  BgFlags2[BgFlags2["HAS_EXTENDED"] = 268435456] = "HAS_EXTENDED";
  BgFlags2[BgFlags2["PROTECTED"] = 536870912] = "PROTECTED";
  BgFlags2[BgFlags2["OVERLINE"] = 1073741824] = "OVERLINE";
  return BgFlags2;
})(BgFlags || {});
var ExtFlags = /* @__PURE__ */ ((ExtFlags2) => {
  ExtFlags2[ExtFlags2["UNDERLINE_STYLE"] = 469762048] = "UNDERLINE_STYLE";
  ExtFlags2[ExtFlags2["VARIANT_OFFSET"] = 3758096384] = "VARIANT_OFFSET";
  return ExtFlags2;
})(ExtFlags || {});
var UnderlineStyle = /* @__PURE__ */ ((UnderlineStyle2) => {
  UnderlineStyle2[UnderlineStyle2["NONE"] = 0] = "NONE";
  UnderlineStyle2[UnderlineStyle2["SINGLE"] = 1] = "SINGLE";
  UnderlineStyle2[UnderlineStyle2["DOUBLE"] = 2] = "DOUBLE";
  UnderlineStyle2[UnderlineStyle2["CURLY"] = 3] = "CURLY";
  UnderlineStyle2[UnderlineStyle2["DOTTED"] = 4] = "DOTTED";
  UnderlineStyle2[UnderlineStyle2["DASHED"] = 5] = "DASHED";
  return UnderlineStyle2;
})(UnderlineStyle || {});
//# sourceMappingURL=Constants.js.map
