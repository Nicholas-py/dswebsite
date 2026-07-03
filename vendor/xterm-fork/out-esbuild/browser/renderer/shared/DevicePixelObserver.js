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
var DevicePixelObserver_exports = {};
__export(DevicePixelObserver_exports, {
  observeDevicePixelDimensions: () => observeDevicePixelDimensions
});
module.exports = __toCommonJS(DevicePixelObserver_exports);
var import_lifecycle = require("vs/base/common/lifecycle");
/**
 * Copyright (c) 2022 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function observeDevicePixelDimensions(element, parentWindow, callback) {
  let observer = new parentWindow.ResizeObserver((entries) => {
    const entry = entries.find((entry2) => entry2.target === element);
    if (!entry) {
      return;
    }
    if (!("devicePixelContentBoxSize" in entry)) {
      observer?.disconnect();
      observer = void 0;
      return;
    }
    const width = entry.devicePixelContentBoxSize[0].inlineSize;
    const height = entry.devicePixelContentBoxSize[0].blockSize;
    if (width > 0 && height > 0) {
      callback(width, height);
    }
  });
  try {
    observer.observe(element, { box: ["device-pixel-content-box"] });
  } catch {
    observer.disconnect();
    observer = void 0;
  }
  return (0, import_lifecycle.toDisposable)(() => observer?.disconnect());
}
//# sourceMappingURL=DevicePixelObserver.js.map
