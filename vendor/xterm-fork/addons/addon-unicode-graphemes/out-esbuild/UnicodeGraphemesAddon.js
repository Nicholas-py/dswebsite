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
var UnicodeGraphemesAddon_exports = {};
__export(UnicodeGraphemesAddon_exports, {
  UnicodeGraphemesAddon: () => UnicodeGraphemesAddon
});
module.exports = __toCommonJS(UnicodeGraphemesAddon_exports);
var import_UnicodeGraphemeProvider = require("./UnicodeGraphemeProvider");
/**
 * Copyright (c) 2023 The xterm.js authors. All rights reserved.
 * @license MIT
 *
 * UnicodeVersionProvider for V15 with grapeme cluster handleing.
 */
class UnicodeGraphemesAddon {
  constructor() {
    this._oldVersion = "";
  }
  activate(terminal) {
    if (!this._provider15) {
      this._provider15 = new import_UnicodeGraphemeProvider.UnicodeGraphemeProvider(false);
    }
    if (!this._provider15Graphemes) {
      this._provider15Graphemes = new import_UnicodeGraphemeProvider.UnicodeGraphemeProvider(true);
    }
    const unicode = terminal.unicode;
    this._unicode = unicode;
    unicode.register(this._provider15);
    unicode.register(this._provider15Graphemes);
    this._oldVersion = unicode.activeVersion;
    unicode.activeVersion = "15-graphemes";
  }
  dispose() {
    if (this._unicode) {
      this._unicode.activeVersion = this._oldVersion;
    }
  }
}
//# sourceMappingURL=UnicodeGraphemesAddon.js.map
