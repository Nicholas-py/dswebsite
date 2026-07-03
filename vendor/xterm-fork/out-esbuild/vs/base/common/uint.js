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
var uint_exports = {};
__export(uint_exports, {
  Constants: () => Constants,
  toUint32: () => toUint32,
  toUint8: () => toUint8
});
module.exports = __toCommonJS(uint_exports);
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["MAX_SAFE_SMALL_INTEGER"] = 1073741824] = "MAX_SAFE_SMALL_INTEGER";
  Constants2[Constants2["MIN_SAFE_SMALL_INTEGER"] = -1073741824] = "MIN_SAFE_SMALL_INTEGER";
  Constants2[Constants2["MAX_UINT_8"] = 255] = "MAX_UINT_8";
  Constants2[Constants2["MAX_UINT_16"] = 65535] = "MAX_UINT_16";
  Constants2[Constants2["MAX_UINT_32"] = 4294967295] = "MAX_UINT_32";
  Constants2[Constants2["UNICODE_SUPPLEMENTARY_PLANE_BEGIN"] = 65536] = "UNICODE_SUPPLEMENTARY_PLANE_BEGIN";
  return Constants2;
})(Constants || {});
function toUint8(v) {
  if (v < 0) {
    return 0;
  }
  if (v > 255 /* MAX_UINT_8 */) {
    return 255 /* MAX_UINT_8 */;
  }
  return v | 0;
}
function toUint32(v) {
  if (v < 0) {
    return 0;
  }
  if (v > 4294967295 /* MAX_UINT_32 */) {
    return 4294967295 /* MAX_UINT_32 */;
  }
  return v | 0;
}
//# sourceMappingURL=uint.js.map
