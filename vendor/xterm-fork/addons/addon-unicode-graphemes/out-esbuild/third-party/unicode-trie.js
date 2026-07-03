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
var unicode_trie_exports = {};
__export(unicode_trie_exports, {
  default: () => unicode_trie_default
});
module.exports = __toCommonJS(unicode_trie_exports);
var import_tiny_inflate = __toESM(require("./tiny-inflate"));
const SHIFT_1 = 6 + 5;
const SHIFT_2 = 5;
const SHIFT_1_2 = SHIFT_1 - SHIFT_2;
const OMITTED_BMP_INDEX_1_LENGTH = 65536 >> SHIFT_1;
const INDEX_2_BLOCK_LENGTH = 1 << SHIFT_1_2;
const INDEX_2_MASK = INDEX_2_BLOCK_LENGTH - 1;
const INDEX_SHIFT = 2;
const DATA_BLOCK_LENGTH = 1 << SHIFT_2;
const DATA_MASK = DATA_BLOCK_LENGTH - 1;
const LSCP_INDEX_2_OFFSET = 65536 >> SHIFT_2;
const LSCP_INDEX_2_LENGTH = 1024 >> SHIFT_2;
const INDEX_2_BMP_LENGTH = LSCP_INDEX_2_OFFSET + LSCP_INDEX_2_LENGTH;
const UTF8_2B_INDEX_2_OFFSET = INDEX_2_BMP_LENGTH;
const UTF8_2B_INDEX_2_LENGTH = 2048 >> 6;
const INDEX_1_OFFSET = UTF8_2B_INDEX_2_OFFSET + UTF8_2B_INDEX_2_LENGTH;
const DATA_GRANULARITY = 1 << INDEX_SHIFT;
const isBigEndian = new Uint8Array(new Uint32Array([305419896]).buffer)[0] === 18;
class UnicodeTrie {
  constructor(data) {
    const view = new DataView(data.buffer);
    this.highStart = view.getUint32(0, true);
    this.errorValue = view.getUint32(4, true);
    let uncompressedLength = view.getUint32(8, true);
    data = data.subarray(12);
    data = (0, import_tiny_inflate.default)(data, new Uint8Array(uncompressedLength));
    data = (0, import_tiny_inflate.default)(data, new Uint8Array(uncompressedLength));
    if (isBigEndian) {
      const len = data.length;
      for (let i = 0; i < len; i += 4) {
        let x = data[i];
        data[i] = data[i + 3];
        data[i + 3] = x;
        let y = data[i + 1];
        data[i + 1] = data[i + 2];
        data[i + 2] = y;
      }
    }
    this.data = new Uint32Array(data.buffer);
  }
  get(codePoint) {
    let index;
    if (codePoint < 0 || codePoint > 1114111) {
      return this.errorValue;
    }
    if (codePoint < 55296 || codePoint > 56319 && codePoint <= 65535) {
      index = (this.data[codePoint >> SHIFT_2] << INDEX_SHIFT) + (codePoint & DATA_MASK);
      return this.data[index];
    }
    if (codePoint <= 65535) {
      index = (this.data[LSCP_INDEX_2_OFFSET + (codePoint - 55296 >> SHIFT_2)] << INDEX_SHIFT) + (codePoint & DATA_MASK);
      return this.data[index];
    }
    if (codePoint < this.highStart) {
      index = this.data[INDEX_1_OFFSET - OMITTED_BMP_INDEX_1_LENGTH + (codePoint >> SHIFT_1)];
      index = this.data[index + (codePoint >> SHIFT_2 & INDEX_2_MASK)];
      index = (index << INDEX_SHIFT) + (codePoint & DATA_MASK);
      return this.data[index];
    }
    return this.data[this.data.length - DATA_GRANULARITY];
  }
}
var unicode_trie_default = UnicodeTrie;
//# sourceMappingURL=unicode-trie.js.map
