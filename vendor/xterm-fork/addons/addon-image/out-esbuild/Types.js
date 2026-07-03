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
  Attributes: () => import_Constants.Attributes,
  BgFlags: () => import_Constants.BgFlags,
  Cell: () => Cell,
  Content: () => import_Constants.Content,
  ExtFlags: () => import_Constants.ExtFlags,
  UnderlineStyle: () => import_Constants.UnderlineStyle
});
module.exports = __toCommonJS(Types_exports);
var import_Constants = require("common/buffer/Constants");
/**
 * Copyright (c) 2020 The xterm.js authors. All rights reserved.
 * @license MIT
 */
var Cell = /* @__PURE__ */ ((Cell2) => {
  Cell2[Cell2["CONTENT"] = 0] = "CONTENT";
  Cell2[Cell2["FG"] = 1] = "FG";
  Cell2[Cell2["BG"] = 2] = "BG";
  Cell2[Cell2["SIZE"] = 3] = "SIZE";
  return Cell2;
})(Cell || {});
//# sourceMappingURL=Types.js.map
