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
  DIM_OPACITY: () => DIM_OPACITY,
  INVERTED_DEFAULT_COLOR: () => INVERTED_DEFAULT_COLOR,
  TEXT_BASELINE: () => TEXT_BASELINE
});
module.exports = __toCommonJS(Constants_exports);
var import_Platform = require("common/Platform");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const INVERTED_DEFAULT_COLOR = 257;
const DIM_OPACITY = 0.5;
const TEXT_BASELINE = import_Platform.isFirefox || import_Platform.isLegacyEdge ? "bottom" : "ideographic";
//# sourceMappingURL=Constants.js.map
