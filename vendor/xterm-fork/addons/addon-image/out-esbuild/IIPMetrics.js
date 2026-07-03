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
var IIPMetrics_exports = {};
__export(IIPMetrics_exports, {
  UNSUPPORTED_TYPE: () => UNSUPPORTED_TYPE,
  imageType: () => imageType
});
module.exports = __toCommonJS(IIPMetrics_exports);
/**
 * Copyright (c) 2023 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const UNSUPPORTED_TYPE = {
  mime: "unsupported",
  width: 0,
  height: 0
};
function imageType(d) {
  if (d.length < 24) {
    return UNSUPPORTED_TYPE;
  }
  const d32 = new Uint32Array(d.buffer, d.byteOffset, 6);
  if (d32[0] === 1196314761 && d32[1] === 169478669 && d32[3] === 1380206665) {
    return {
      mime: "image/png",
      width: d[16] << 24 | d[17] << 16 | d[18] << 8 | d[19],
      height: d[20] << 24 | d[21] << 16 | d[22] << 8 | d[23]
    };
  }
  if (d[0] === 255 && d[1] === 216 && d[2] === 255) {
    const [width, height] = jpgSize(d);
    return { mime: "image/jpeg", width, height };
  }
  if (d32[0] === 944130375 && (d[4] === 55 || d[4] === 57) && d[5] === 97) {
    return {
      mime: "image/gif",
      width: d[7] << 8 | d[6],
      height: d[9] << 8 | d[8]
    };
  }
  return UNSUPPORTED_TYPE;
}
function jpgSize(d) {
  const len = d.length;
  let i = 4;
  let blockLength = d[i] << 8 | d[i + 1];
  while (true) {
    i += blockLength;
    if (i >= len) {
      return [0, 0];
    }
    if (d[i] !== 255) {
      return [0, 0];
    }
    if (d[i + 1] === 192 || d[i + 1] === 194) {
      if (i + 8 < len) {
        return [
          d[i + 7] << 8 | d[i + 8],
          d[i + 5] << 8 | d[i + 6]
        ];
      }
      return [0, 0];
    }
    i += 2;
    blockLength = d[i] << 8 | d[i + 1];
  }
}
//# sourceMappingURL=IIPMetrics.js.map
