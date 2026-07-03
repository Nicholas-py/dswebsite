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
var Types_exports = {};
__export(Types_exports, {
  ParserStackType: () => ParserStackType
});
module.exports = __toCommonJS(Types_exports);
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
var ParserStackType = /* @__PURE__ */ ((ParserStackType2) => {
  ParserStackType2[ParserStackType2["NONE"] = 0] = "NONE";
  ParserStackType2[ParserStackType2["FAIL"] = 1] = "FAIL";
  ParserStackType2[ParserStackType2["RESET"] = 2] = "RESET";
  ParserStackType2[ParserStackType2["CSI"] = 3] = "CSI";
  ParserStackType2[ParserStackType2["ESC"] = 4] = "ESC";
  ParserStackType2[ParserStackType2["OSC"] = 5] = "OSC";
  ParserStackType2[ParserStackType2["DCS"] = 6] = "DCS";
  return ParserStackType2;
})(ParserStackType || {});
//# sourceMappingURL=Types.js.map
