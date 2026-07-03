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
var AttributeData_exports = {};
__export(AttributeData_exports, {
  AttributeData: () => AttributeData,
  ExtendedAttrs: () => ExtendedAttrs
});
module.exports = __toCommonJS(AttributeData_exports);
var import_Constants = require("common/buffer/Constants");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class AttributeData {
  constructor() {
    // data
    this.fg = 0;
    this.bg = 0;
    this.extended = new ExtendedAttrs();
  }
  static toColorRGB(value) {
    return [
      value >>> import_Constants.Attributes.RED_SHIFT & 255,
      value >>> import_Constants.Attributes.GREEN_SHIFT & 255,
      value & 255
    ];
  }
  static fromColorRGB(value) {
    return (value[0] & 255) << import_Constants.Attributes.RED_SHIFT | (value[1] & 255) << import_Constants.Attributes.GREEN_SHIFT | value[2] & 255;
  }
  clone() {
    const newObj = new AttributeData();
    newObj.fg = this.fg;
    newObj.bg = this.bg;
    newObj.extended = this.extended.clone();
    return newObj;
  }
  // flags
  isInverse() {
    return this.fg & import_Constants.FgFlags.INVERSE;
  }
  isBold() {
    return this.fg & import_Constants.FgFlags.BOLD;
  }
  isUnderline() {
    if (this.hasExtendedAttrs() && this.extended.underlineStyle !== import_Constants.UnderlineStyle.NONE) {
      return 1;
    }
    return this.fg & import_Constants.FgFlags.UNDERLINE;
  }
  isBlink() {
    return this.fg & import_Constants.FgFlags.BLINK;
  }
  isInvisible() {
    return this.fg & import_Constants.FgFlags.INVISIBLE;
  }
  isItalic() {
    return this.bg & import_Constants.BgFlags.ITALIC;
  }
  isDim() {
    return this.bg & import_Constants.BgFlags.DIM;
  }
  isStrikethrough() {
    return this.fg & import_Constants.FgFlags.STRIKETHROUGH;
  }
  isProtected() {
    return this.bg & import_Constants.BgFlags.PROTECTED;
  }
  isOverline() {
    return this.bg & import_Constants.BgFlags.OVERLINE;
  }
  // color modes
  getFgColorMode() {
    return this.fg & import_Constants.Attributes.CM_MASK;
  }
  getBgColorMode() {
    return this.bg & import_Constants.Attributes.CM_MASK;
  }
  isFgRGB() {
    return (this.fg & import_Constants.Attributes.CM_MASK) === import_Constants.Attributes.CM_RGB;
  }
  isBgRGB() {
    return (this.bg & import_Constants.Attributes.CM_MASK) === import_Constants.Attributes.CM_RGB;
  }
  isFgPalette() {
    return (this.fg & import_Constants.Attributes.CM_MASK) === import_Constants.Attributes.CM_P16 || (this.fg & import_Constants.Attributes.CM_MASK) === import_Constants.Attributes.CM_P256;
  }
  isBgPalette() {
    return (this.bg & import_Constants.Attributes.CM_MASK) === import_Constants.Attributes.CM_P16 || (this.bg & import_Constants.Attributes.CM_MASK) === import_Constants.Attributes.CM_P256;
  }
  isFgDefault() {
    return (this.fg & import_Constants.Attributes.CM_MASK) === 0;
  }
  isBgDefault() {
    return (this.bg & import_Constants.Attributes.CM_MASK) === 0;
  }
  isAttributeDefault() {
    return this.fg === 0 && this.bg === 0;
  }
  // colors
  getFgColor() {
    switch (this.fg & import_Constants.Attributes.CM_MASK) {
      case import_Constants.Attributes.CM_P16:
      case import_Constants.Attributes.CM_P256:
        return this.fg & import_Constants.Attributes.PCOLOR_MASK;
      case import_Constants.Attributes.CM_RGB:
        return this.fg & import_Constants.Attributes.RGB_MASK;
      default:
        return -1;
    }
  }
  getBgColor() {
    switch (this.bg & import_Constants.Attributes.CM_MASK) {
      case import_Constants.Attributes.CM_P16:
      case import_Constants.Attributes.CM_P256:
        return this.bg & import_Constants.Attributes.PCOLOR_MASK;
      case import_Constants.Attributes.CM_RGB:
        return this.bg & import_Constants.Attributes.RGB_MASK;
      default:
        return -1;
    }
  }
  // extended attrs
  hasExtendedAttrs() {
    return this.bg & import_Constants.BgFlags.HAS_EXTENDED;
  }
  updateExtended() {
    if (this.extended.isEmpty()) {
      this.bg &= ~import_Constants.BgFlags.HAS_EXTENDED;
    } else {
      this.bg |= import_Constants.BgFlags.HAS_EXTENDED;
    }
  }
  getUnderlineColor() {
    if (this.bg & import_Constants.BgFlags.HAS_EXTENDED && ~this.extended.underlineColor) {
      switch (this.extended.underlineColor & import_Constants.Attributes.CM_MASK) {
        case import_Constants.Attributes.CM_P16:
        case import_Constants.Attributes.CM_P256:
          return this.extended.underlineColor & import_Constants.Attributes.PCOLOR_MASK;
        case import_Constants.Attributes.CM_RGB:
          return this.extended.underlineColor & import_Constants.Attributes.RGB_MASK;
        default:
          return this.getFgColor();
      }
    }
    return this.getFgColor();
  }
  getUnderlineColorMode() {
    return this.bg & import_Constants.BgFlags.HAS_EXTENDED && ~this.extended.underlineColor ? this.extended.underlineColor & import_Constants.Attributes.CM_MASK : this.getFgColorMode();
  }
  isUnderlineColorRGB() {
    return this.bg & import_Constants.BgFlags.HAS_EXTENDED && ~this.extended.underlineColor ? (this.extended.underlineColor & import_Constants.Attributes.CM_MASK) === import_Constants.Attributes.CM_RGB : this.isFgRGB();
  }
  isUnderlineColorPalette() {
    return this.bg & import_Constants.BgFlags.HAS_EXTENDED && ~this.extended.underlineColor ? (this.extended.underlineColor & import_Constants.Attributes.CM_MASK) === import_Constants.Attributes.CM_P16 || (this.extended.underlineColor & import_Constants.Attributes.CM_MASK) === import_Constants.Attributes.CM_P256 : this.isFgPalette();
  }
  isUnderlineColorDefault() {
    return this.bg & import_Constants.BgFlags.HAS_EXTENDED && ~this.extended.underlineColor ? (this.extended.underlineColor & import_Constants.Attributes.CM_MASK) === 0 : this.isFgDefault();
  }
  getUnderlineStyle() {
    return this.fg & import_Constants.FgFlags.UNDERLINE ? this.bg & import_Constants.BgFlags.HAS_EXTENDED ? this.extended.underlineStyle : import_Constants.UnderlineStyle.SINGLE : import_Constants.UnderlineStyle.NONE;
  }
  getUnderlineVariantOffset() {
    return this.extended.underlineVariantOffset;
  }
}
class ExtendedAttrs {
  constructor(ext = 0, urlId = 0) {
    this._ext = 0;
    this._urlId = 0;
    this._ext = ext;
    this._urlId = urlId;
  }
  get ext() {
    if (this._urlId) {
      return this._ext & ~import_Constants.ExtFlags.UNDERLINE_STYLE | this.underlineStyle << 26;
    }
    return this._ext;
  }
  set ext(value) {
    this._ext = value;
  }
  get underlineStyle() {
    if (this._urlId) {
      return import_Constants.UnderlineStyle.DASHED;
    }
    return (this._ext & import_Constants.ExtFlags.UNDERLINE_STYLE) >> 26;
  }
  set underlineStyle(value) {
    this._ext &= ~import_Constants.ExtFlags.UNDERLINE_STYLE;
    this._ext |= value << 26 & import_Constants.ExtFlags.UNDERLINE_STYLE;
  }
  get underlineColor() {
    return this._ext & (import_Constants.Attributes.CM_MASK | import_Constants.Attributes.RGB_MASK);
  }
  set underlineColor(value) {
    this._ext &= ~(import_Constants.Attributes.CM_MASK | import_Constants.Attributes.RGB_MASK);
    this._ext |= value & (import_Constants.Attributes.CM_MASK | import_Constants.Attributes.RGB_MASK);
  }
  get urlId() {
    return this._urlId;
  }
  set urlId(value) {
    this._urlId = value;
  }
  get underlineVariantOffset() {
    const val = (this._ext & import_Constants.ExtFlags.VARIANT_OFFSET) >> 29;
    if (val < 0) {
      return val ^ 4294967288;
    }
    return val;
  }
  set underlineVariantOffset(value) {
    this._ext &= ~import_Constants.ExtFlags.VARIANT_OFFSET;
    this._ext |= value << 29 & import_Constants.ExtFlags.VARIANT_OFFSET;
  }
  clone() {
    return new ExtendedAttrs(this._ext, this._urlId);
  }
  /**
   * Convenient method to indicate whether the object holds no additional information,
   * that needs to be persistant in the buffer.
   */
  isEmpty() {
    return this.underlineStyle === import_Constants.UnderlineStyle.NONE && this._urlId === 0;
  }
}
//# sourceMappingURL=AttributeData.js.map
