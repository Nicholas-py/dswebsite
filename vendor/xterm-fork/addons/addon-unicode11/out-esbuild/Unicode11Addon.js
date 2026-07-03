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
var Unicode11Addon_exports = {};
__export(Unicode11Addon_exports, {
  Unicode11Addon: () => Unicode11Addon
});
module.exports = __toCommonJS(Unicode11Addon_exports);
var import_UnicodeV11 = require("./UnicodeV11");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 *
 * UnicodeVersionProvider for V11.
 */
class Unicode11Addon {
  activate(terminal) {
    terminal.unicode.register(new import_UnicodeV11.UnicodeV11());
  }
  dispose() {
  }
}
//# sourceMappingURL=Unicode11Addon.js.map
