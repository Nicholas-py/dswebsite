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
var canIUse_exports = {};
__export(canIUse_exports, {
  BrowserFeatures: () => BrowserFeatures,
  KeyboardSupport: () => KeyboardSupport
});
module.exports = __toCommonJS(canIUse_exports);
var browser = __toESM(require("vs/base/browser/browser"));
var import_window = require("vs/base/browser/window");
var platform = __toESM(require("vs/base/common/platform"));
var KeyboardSupport = /* @__PURE__ */ ((KeyboardSupport2) => {
  KeyboardSupport2[KeyboardSupport2["Always"] = 0] = "Always";
  KeyboardSupport2[KeyboardSupport2["FullScreen"] = 1] = "FullScreen";
  KeyboardSupport2[KeyboardSupport2["None"] = 2] = "None";
  return KeyboardSupport2;
})(KeyboardSupport || {});
const safeNavigator = typeof navigator === "object" ? navigator : {};
const BrowserFeatures = {
  clipboard: {
    writeText: platform.isNative || document.queryCommandSupported && document.queryCommandSupported("copy") || !!(safeNavigator && safeNavigator.clipboard && safeNavigator.clipboard.writeText),
    readText: platform.isNative || !!(safeNavigator && safeNavigator.clipboard && safeNavigator.clipboard.readText)
  },
  keyboard: (() => {
    if (platform.isNative || browser.isStandalone()) {
      return 0 /* Always */;
    }
    if (safeNavigator.keyboard || browser.isSafari) {
      return 1 /* FullScreen */;
    }
    return 2 /* None */;
  })(),
  // 'ontouchstart' in window always evaluates to true with typescript's modern typings. This causes `window` to be
  // `never` later in `window.navigator`. That's why we need the explicit `window as Window` cast
  touch: "ontouchstart" in import_window.mainWindow || safeNavigator.maxTouchPoints > 0,
  pointerEvents: import_window.mainWindow.PointerEvent && ("ontouchstart" in import_window.mainWindow || navigator.maxTouchPoints > 0)
};
//# sourceMappingURL=canIUse.js.map
