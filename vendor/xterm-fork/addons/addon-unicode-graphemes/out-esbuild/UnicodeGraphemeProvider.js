"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var UnicodeGraphemeProvider_exports = {};
__export(UnicodeGraphemeProvider_exports, {
  UnicodeGraphemeProvider: () => UnicodeGraphemeProvider
});
module.exports = __toCommonJS(UnicodeGraphemeProvider_exports);
var import_UnicodeService = require("common/services/UnicodeService");
var UC = __toESM(require("./third-party/UnicodeProperties"));
/**
 * Copyright (c) 2023 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class UnicodeGraphemeProvider {
  constructor(handleGraphemes = true) {
    this.ambiguousCharsAreWide = false;
    this.version = handleGraphemes ? "15-graphemes" : "15";
    this.handleGraphemes = handleGraphemes;
  }
  static {
    this._plainNarrowProperties = import_UnicodeService.UnicodeService.createPropertyValue(UC.GRAPHEME_BREAK_Other, 1, false);
  }
  charProperties(codepoint, preceding) {
    if (codepoint >= 32 && codepoint < 127 && preceding >> 3 === 0) {
      return UnicodeGraphemeProvider._plainNarrowProperties;
    }
    let charInfo = UC.getInfo(codepoint);
    let w = UC.infoToWidthInfo(charInfo);
    let shouldJoin = false;
    if (w >= 2) {
      w = w === 3 || this.ambiguousCharsAreWide || codepoint === 65039 ? 2 : 1;
    } else {
      w = 1;
    }
    if (preceding !== 0) {
      const oldWidth = import_UnicodeService.UnicodeService.extractWidth(preceding);
      if (this.handleGraphemes) {
        charInfo = UC.shouldJoin(import_UnicodeService.UnicodeService.extractCharKind(preceding), charInfo);
      } else {
        charInfo = w === 0 ? 1 : 0;
      }
      shouldJoin = charInfo > 0;
      if (shouldJoin) {
        if (oldWidth > w) {
          w = oldWidth;
        } else if (charInfo === 32) {
          w = 2;
        }
      }
    }
    return import_UnicodeService.UnicodeService.createPropertyValue(charInfo, w, shouldJoin);
  }
  wcwidth(codepoint) {
    const charInfo = UC.getInfo(codepoint);
    const w = UC.infoToWidthInfo(charInfo);
    const kind = (charInfo & UC.GRAPHEME_BREAK_MASK) >> UC.GRAPHEME_BREAK_SHIFT;
    if (kind === UC.GRAPHEME_BREAK_Extend || kind === UC.GRAPHEME_BREAK_Prepend) {
      return 0;
    }
    if (w >= 2 && (w === 3 || this.ambiguousCharsAreWide)) {
      return 2;
    }
    return 1;
  }
}
//# sourceMappingURL=UnicodeGraphemeProvider.js.map
