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
  ColorRequestType: () => ColorRequestType,
  CoreMouseAction: () => CoreMouseAction,
  CoreMouseButton: () => CoreMouseButton,
  CoreMouseEventType: () => CoreMouseEventType,
  KeyboardResultType: () => KeyboardResultType,
  SpecialColorIndex: () => SpecialColorIndex
});
module.exports = __toCommonJS(Types_exports);
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
var KeyboardResultType = /* @__PURE__ */ ((KeyboardResultType2) => {
  KeyboardResultType2[KeyboardResultType2["SEND_KEY"] = 0] = "SEND_KEY";
  KeyboardResultType2[KeyboardResultType2["SELECT_ALL"] = 1] = "SELECT_ALL";
  KeyboardResultType2[KeyboardResultType2["PAGE_UP"] = 2] = "PAGE_UP";
  KeyboardResultType2[KeyboardResultType2["PAGE_DOWN"] = 3] = "PAGE_DOWN";
  return KeyboardResultType2;
})(KeyboardResultType || {});
var CoreMouseButton = /* @__PURE__ */ ((CoreMouseButton2) => {
  CoreMouseButton2[CoreMouseButton2["LEFT"] = 0] = "LEFT";
  CoreMouseButton2[CoreMouseButton2["MIDDLE"] = 1] = "MIDDLE";
  CoreMouseButton2[CoreMouseButton2["RIGHT"] = 2] = "RIGHT";
  CoreMouseButton2[CoreMouseButton2["NONE"] = 3] = "NONE";
  CoreMouseButton2[CoreMouseButton2["WHEEL"] = 4] = "WHEEL";
  CoreMouseButton2[CoreMouseButton2["AUX1"] = 8] = "AUX1";
  CoreMouseButton2[CoreMouseButton2["AUX2"] = 9] = "AUX2";
  CoreMouseButton2[CoreMouseButton2["AUX3"] = 10] = "AUX3";
  CoreMouseButton2[CoreMouseButton2["AUX4"] = 11] = "AUX4";
  CoreMouseButton2[CoreMouseButton2["AUX5"] = 12] = "AUX5";
  CoreMouseButton2[CoreMouseButton2["AUX6"] = 13] = "AUX6";
  CoreMouseButton2[CoreMouseButton2["AUX7"] = 14] = "AUX7";
  CoreMouseButton2[CoreMouseButton2["AUX8"] = 15] = "AUX8";
  return CoreMouseButton2;
})(CoreMouseButton || {});
var CoreMouseAction = /* @__PURE__ */ ((CoreMouseAction2) => {
  CoreMouseAction2[CoreMouseAction2["UP"] = 0] = "UP";
  CoreMouseAction2[CoreMouseAction2["DOWN"] = 1] = "DOWN";
  CoreMouseAction2[CoreMouseAction2["LEFT"] = 2] = "LEFT";
  CoreMouseAction2[CoreMouseAction2["RIGHT"] = 3] = "RIGHT";
  CoreMouseAction2[CoreMouseAction2["MOVE"] = 32] = "MOVE";
  return CoreMouseAction2;
})(CoreMouseAction || {});
var CoreMouseEventType = /* @__PURE__ */ ((CoreMouseEventType2) => {
  CoreMouseEventType2[CoreMouseEventType2["NONE"] = 0] = "NONE";
  CoreMouseEventType2[CoreMouseEventType2["DOWN"] = 1] = "DOWN";
  CoreMouseEventType2[CoreMouseEventType2["UP"] = 2] = "UP";
  CoreMouseEventType2[CoreMouseEventType2["DRAG"] = 4] = "DRAG";
  CoreMouseEventType2[CoreMouseEventType2["MOVE"] = 8] = "MOVE";
  CoreMouseEventType2[CoreMouseEventType2["WHEEL"] = 16] = "WHEEL";
  return CoreMouseEventType2;
})(CoreMouseEventType || {});
var ColorRequestType = /* @__PURE__ */ ((ColorRequestType2) => {
  ColorRequestType2[ColorRequestType2["REPORT"] = 0] = "REPORT";
  ColorRequestType2[ColorRequestType2["SET"] = 1] = "SET";
  ColorRequestType2[ColorRequestType2["RESTORE"] = 2] = "RESTORE";
  return ColorRequestType2;
})(ColorRequestType || {});
var SpecialColorIndex = /* @__PURE__ */ ((SpecialColorIndex2) => {
  SpecialColorIndex2[SpecialColorIndex2["FOREGROUND"] = 256] = "FOREGROUND";
  SpecialColorIndex2[SpecialColorIndex2["BACKGROUND"] = 257] = "BACKGROUND";
  SpecialColorIndex2[SpecialColorIndex2["CURSOR"] = 258] = "CURSOR";
  return SpecialColorIndex2;
})(SpecialColorIndex || {});
//# sourceMappingURL=Types.js.map
