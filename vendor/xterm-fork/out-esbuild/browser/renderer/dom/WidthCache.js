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
var WidthCache_exports = {};
__export(WidthCache_exports, {
  WidthCache: () => WidthCache,
  WidthCacheSettings: () => WidthCacheSettings
});
module.exports = __toCommonJS(WidthCache_exports);
/**
 * Copyright (c) 2023 The xterm.js authors. All rights reserved.
 * @license MIT
 */
var WidthCacheSettings = /* @__PURE__ */ ((WidthCacheSettings2) => {
  WidthCacheSettings2[WidthCacheSettings2["FLAT_UNSET"] = -9999] = "FLAT_UNSET";
  WidthCacheSettings2[WidthCacheSettings2["FLAT_SIZE"] = 256] = "FLAT_SIZE";
  WidthCacheSettings2[WidthCacheSettings2["REPEAT"] = 32] = "REPEAT";
  return WidthCacheSettings2;
})(WidthCacheSettings || {});
var FontVariant = /* @__PURE__ */ ((FontVariant2) => {
  FontVariant2[FontVariant2["REGULAR"] = 0] = "REGULAR";
  FontVariant2[FontVariant2["BOLD"] = 1] = "BOLD";
  FontVariant2[FontVariant2["ITALIC"] = 2] = "ITALIC";
  FontVariant2[FontVariant2["BOLD_ITALIC"] = 3] = "BOLD_ITALIC";
  return FontVariant2;
})(FontVariant || {});
class WidthCache {
  constructor(_document, _helperContainer) {
    // flat cache for regular variant up to CacheSettings.FLAT_SIZE
    // NOTE: ~4x faster access than holey (serving >>80% of terminal content)
    //       It has a small memory footprint (only 1MB for full BMP caching),
    //       still the sweet spot is not reached before touching 32k different codepoints,
    //       thus we store the remaining <<20% of terminal data in a holey structure.
    this._flat = new Float32Array(256 /* FLAT_SIZE */);
    this._font = "";
    this._fontSize = 0;
    this._weight = "normal";
    this._weightBold = "bold";
    this._measureElements = [];
    this._container = _document.createElement("div");
    this._container.classList.add("xterm-width-cache-measure-container");
    this._container.setAttribute("aria-hidden", "true");
    this._container.style.whiteSpace = "pre";
    this._container.style.fontKerning = "none";
    const regular = _document.createElement("span");
    regular.classList.add("xterm-char-measure-element");
    const bold = _document.createElement("span");
    bold.classList.add("xterm-char-measure-element");
    bold.style.fontWeight = "bold";
    const italic = _document.createElement("span");
    italic.classList.add("xterm-char-measure-element");
    italic.style.fontStyle = "italic";
    const boldItalic = _document.createElement("span");
    boldItalic.classList.add("xterm-char-measure-element");
    boldItalic.style.fontWeight = "bold";
    boldItalic.style.fontStyle = "italic";
    this._measureElements = [regular, bold, italic, boldItalic];
    this._container.appendChild(regular);
    this._container.appendChild(bold);
    this._container.appendChild(italic);
    this._container.appendChild(boldItalic);
    _helperContainer.appendChild(this._container);
    this.clear();
  }
  dispose() {
    this._container.remove();
    this._measureElements.length = 0;
    this._holey = void 0;
  }
  /**
   * Clear the width cache.
   */
  clear() {
    this._flat.fill(-9999 /* FLAT_UNSET */);
    this._holey = /* @__PURE__ */ new Map();
  }
  /**
   * Set the font for measuring.
   * Must be called for any changes on font settings.
   * Also clears the cache.
   */
  setFont(font, fontSize, weight, weightBold) {
    if (font === this._font && fontSize === this._fontSize && weight === this._weight && weightBold === this._weightBold) {
      return;
    }
    this._font = font;
    this._fontSize = fontSize;
    this._weight = weight;
    this._weightBold = weightBold;
    this._container.style.fontFamily = this._font;
    this._container.style.fontSize = `${this._fontSize}px`;
    this._measureElements[0 /* REGULAR */].style.fontWeight = `${weight}`;
    this._measureElements[1 /* BOLD */].style.fontWeight = `${weightBold}`;
    this._measureElements[2 /* ITALIC */].style.fontWeight = `${weight}`;
    this._measureElements[3 /* BOLD_ITALIC */].style.fontWeight = `${weightBold}`;
    this.clear();
  }
  /**
   * Get the render width for cell content `c` with current font settings.
   * `variant` denotes the font variant to be used.
   */
  get(c, bold, italic) {
    let cp = 0;
    if (!bold && !italic && c.length === 1 && (cp = c.charCodeAt(0)) < 256 /* FLAT_SIZE */) {
      if (this._flat[cp] !== -9999 /* FLAT_UNSET */) {
        return this._flat[cp];
      }
      const width2 = this._measure(c, 0);
      if (width2 > 0) {
        this._flat[cp] = width2;
      }
      return width2;
    }
    let key = c;
    if (bold) key += "B";
    if (italic) key += "I";
    let width = this._holey.get(key);
    if (width === void 0) {
      let variant = 0;
      if (bold) variant |= 1 /* BOLD */;
      if (italic) variant |= 2 /* ITALIC */;
      width = this._measure(c, variant);
      if (width > 0) {
        this._holey.set(key, width);
      }
    }
    return width;
  }
  _measure(c, variant) {
    const el = this._measureElements[variant];
    el.textContent = c.repeat(32 /* REPEAT */);
    return el.offsetWidth / 32 /* REPEAT */;
  }
}
//# sourceMappingURL=WidthCache.js.map
