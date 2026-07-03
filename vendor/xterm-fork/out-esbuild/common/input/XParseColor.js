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
var XParseColor_exports = {};
__export(XParseColor_exports, {
  parseColor: () => parseColor,
  toRgbString: () => toRgbString
});
module.exports = __toCommonJS(XParseColor_exports);
/**
 * Copyright (c) 2021 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const RGB_REX = /^([\da-f])\/([\da-f])\/([\da-f])$|^([\da-f]{2})\/([\da-f]{2})\/([\da-f]{2})$|^([\da-f]{3})\/([\da-f]{3})\/([\da-f]{3})$|^([\da-f]{4})\/([\da-f]{4})\/([\da-f]{4})$/;
const HASH_REX = /^[\da-f]+$/;
function parseColor(data) {
  if (!data) return;
  let low = data.toLowerCase();
  if (low.indexOf("rgb:") === 0) {
    low = low.slice(4);
    const m = RGB_REX.exec(low);
    if (m) {
      const base = m[1] ? 15 : m[4] ? 255 : m[7] ? 4095 : 65535;
      return [
        Math.round(parseInt(m[1] || m[4] || m[7] || m[10], 16) / base * 255),
        Math.round(parseInt(m[2] || m[5] || m[8] || m[11], 16) / base * 255),
        Math.round(parseInt(m[3] || m[6] || m[9] || m[12], 16) / base * 255)
      ];
    }
  } else if (low.indexOf("#") === 0) {
    low = low.slice(1);
    if (HASH_REX.exec(low) && [3, 6, 9, 12].includes(low.length)) {
      const adv = low.length / 3;
      const result = [0, 0, 0];
      for (let i = 0; i < 3; ++i) {
        const c = parseInt(low.slice(adv * i, adv * i + adv), 16);
        result[i] = adv === 1 ? c << 4 : adv === 2 ? c : adv === 3 ? c >> 4 : c >> 8;
      }
      return result;
    }
  }
}
function pad(n, bits) {
  const s = n.toString(16);
  const s2 = s.length < 2 ? "0" + s : s;
  switch (bits) {
    case 4:
      return s[0];
    case 8:
      return s2;
    case 12:
      return (s2 + s2).slice(0, 3);
    default:
      return s2 + s2;
  }
}
function toRgbString(color, bits = 16) {
  const [r, g, b] = color;
  return `rgb:${pad(r, bits)}/${pad(g, bits)}/${pad(b, bits)}`;
}
//# sourceMappingURL=XParseColor.js.map
