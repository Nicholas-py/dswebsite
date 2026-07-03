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
var WidthCache_test_exports = {};
__export(WidthCache_test_exports, {
  TestWidthCache: () => TestWidthCache
});
module.exports = __toCommonJS(WidthCache_test_exports);
var assert = __toESM(require("assert"));
var import_WidthCache = require("browser/renderer/dom/WidthCache");
/**
 * Copyright (c) 2023 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const jsdom = require("jsdom");
class TestWidthCache extends import_WidthCache.WidthCache {
  constructor() {
    super(...arguments);
    this.widths = {};
  }
  get flat() {
    return this._flat;
  }
  get holey() {
    return this._holey;
  }
  _measure(c, variant) {
    if (this.widths[c] !== void 0) {
      return this.widths[c][variant];
    }
    return 5;
  }
}
function castf32(v) {
  const buffer = new Float32Array(1);
  buffer[0] = v;
  return buffer[0];
}
describe("WidthCache", () => {
  let wc;
  beforeEach(() => {
    const dom = new jsdom.JSDOM("");
    wc = new TestWidthCache(dom.window.document, dom.window.document.createElement("div"));
    wc.setFont("monospace", 15, "normal", "bold");
  });
  describe("cache invalidation", () => {
    beforeEach(() => {
      wc.flat.fill(1.23);
      wc.holey?.set("a", 2.34);
    });
    it("can cache values", () => {
      assert.deepStrictEqual(wc.flat[0], castf32(1.23));
      assert.deepStrictEqual(wc.holey?.get("a"), 2.34);
      assert.deepStrictEqual(wc.holey?.size, 1);
    });
    it("clear resets cache entries", () => {
      wc.clear();
      assert.deepStrictEqual(wc.flat[0], castf32(import_WidthCache.WidthCacheSettings.FLAT_UNSET));
      assert.deepStrictEqual(wc.holey?.get("a"), void 0);
      assert.deepStrictEqual(wc.holey?.size, 0);
    });
    it("setFont with changed font name", () => {
      wc.setFont("Arial", 15, "normal", "bold");
      assert.deepStrictEqual(wc.flat[0], castf32(import_WidthCache.WidthCacheSettings.FLAT_UNSET));
      assert.deepStrictEqual(wc.holey?.get("a"), void 0);
      assert.deepStrictEqual(wc.holey?.size, 0);
    });
    it("setFont with changed font size", () => {
      wc.setFont("monospace", 14, "normal", "bold");
      assert.deepStrictEqual(wc.flat[0], castf32(import_WidthCache.WidthCacheSettings.FLAT_UNSET));
      assert.deepStrictEqual(wc.holey?.get("a"), void 0);
      assert.deepStrictEqual(wc.holey?.size, 0);
    });
    it("setFont with changed weight", () => {
      wc.setFont("monospace", 15, "100", "bold");
      assert.deepStrictEqual(wc.flat[0], castf32(import_WidthCache.WidthCacheSettings.FLAT_UNSET));
      assert.deepStrictEqual(wc.holey?.get("a"), void 0);
      assert.deepStrictEqual(wc.holey?.size, 0);
    });
    it("setFont with changed weightBold", () => {
      wc.setFont("monospace", 15, "normal", "900");
      assert.deepStrictEqual(wc.flat[0], castf32(import_WidthCache.WidthCacheSettings.FLAT_UNSET));
      assert.deepStrictEqual(wc.holey?.get("a"), void 0);
      assert.deepStrictEqual(wc.holey?.size, 0);
    });
    it("setFont with unchanged settings does not cache entries", () => {
      wc.setFont("monospace", 15, "normal", "bold");
      assert.deepStrictEqual(wc.flat[0], castf32(1.23));
      assert.deepStrictEqual(wc.holey?.get("a"), 2.34);
      assert.deepStrictEqual(wc.holey?.size, 1);
    });
  });
  describe("get", () => {
    it("store regular < WidthCacheSettings.FLAT_SIZE in flat", () => {
      for (let i = 0; i < import_WidthCache.WidthCacheSettings.FLAT_SIZE + 10; ++i) {
        const width = wc.get(String.fromCharCode(i), false, false);
        assert.deepStrictEqual(width, 5);
        if (i < import_WidthCache.WidthCacheSettings.FLAT_SIZE) {
          assert.deepStrictEqual(wc.flat[i], 5);
          assert.deepStrictEqual(wc.holey?.get(String.fromCharCode(i)), void 0);
        } else {
          assert.deepStrictEqual(wc.holey?.get(String.fromCharCode(i)), 5);
        }
      }
    });
    it("stores bold & italic in holey", () => {
      let width = wc.get("b", true, false);
      assert.deepStrictEqual(width, 5);
      assert.deepStrictEqual(wc.holey?.get("bB"), 5);
      width = wc.get("i", false, true);
      assert.deepStrictEqual(width, 5);
      assert.deepStrictEqual(wc.holey?.get("iI"), 5);
      width = wc.get("x", true, true);
      assert.deepStrictEqual(width, 5);
      assert.deepStrictEqual(wc.holey?.get("xBI"), 5);
    });
    it("can store any string", () => {
      let width = wc.get("foo", false, false);
      assert.deepStrictEqual(width, 5);
      assert.deepStrictEqual(wc.holey?.get("foo"), 5);
      width = wc.get("bar&baz", true, true);
      assert.deepStrictEqual(width, 5);
      assert.deepStrictEqual(wc.holey?.get("bar&bazBI"), 5);
    });
  });
});
//# sourceMappingURL=WidthCache.test.js.map
