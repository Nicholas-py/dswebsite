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
var Platform_exports = {};
__export(Platform_exports, {
  getSafariVersion: () => getSafariVersion,
  isChromeOS: () => isChromeOS,
  isFirefox: () => isFirefox,
  isIpad: () => isIpad,
  isIphone: () => isIphone,
  isLegacyEdge: () => isLegacyEdge,
  isLinux: () => isLinux,
  isMac: () => isMac,
  isNode: () => isNode,
  isSafari: () => isSafari,
  isWindows: () => isWindows
});
module.exports = __toCommonJS(Platform_exports);
/**
 * Copyright (c) 2016 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const isNode = typeof process !== "undefined" && "title" in process ? true : false;
const userAgent = isNode ? "node" : navigator.userAgent;
const platform = isNode ? "node" : navigator.platform;
const isFirefox = userAgent.includes("Firefox");
const isLegacyEdge = userAgent.includes("Edge");
const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
function getSafariVersion() {
  if (!isSafari) {
    return 0;
  }
  const majorVersion = userAgent.match(/Version\/(\d+)/);
  if (majorVersion === null || majorVersion.length < 2) {
    return 0;
  }
  return parseInt(majorVersion[1]);
}
const isMac = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"].includes(platform);
const isIpad = platform === "iPad";
const isIphone = platform === "iPhone";
const isWindows = ["Windows", "Win16", "Win32", "WinCE"].includes(platform);
const isLinux = platform.indexOf("Linux") >= 0;
const isChromeOS = /\bCrOS\b/.test(userAgent);
//# sourceMappingURL=Platform.js.map
