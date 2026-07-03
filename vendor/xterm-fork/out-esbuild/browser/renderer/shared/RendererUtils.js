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
var RendererUtils_exports = {};
__export(RendererUtils_exports, {
  allowRescaling: () => allowRescaling,
  computeNextVariantOffset: () => computeNextVariantOffset,
  createRenderDimensions: () => createRenderDimensions,
  isEmoji: () => isEmoji,
  isPowerlineGlyph: () => isPowerlineGlyph,
  isRestrictedPowerlineGlyph: () => isRestrictedPowerlineGlyph,
  throwIfFalsy: () => throwIfFalsy,
  treatGlyphAsBackgroundColor: () => treatGlyphAsBackgroundColor
});
module.exports = __toCommonJS(RendererUtils_exports);
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function throwIfFalsy(value) {
  if (!value) {
    throw new Error("value must not be falsy");
  }
  return value;
}
function isPowerlineGlyph(codepoint) {
  return 57508 <= codepoint && codepoint <= 57558;
}
function isRestrictedPowerlineGlyph(codepoint) {
  return 57520 <= codepoint && codepoint <= 57527;
}
function isNerdFontGlyph(codepoint) {
  return 57344 <= codepoint && codepoint <= 63743;
}
function isBoxOrBlockGlyph(codepoint) {
  return 9472 <= codepoint && codepoint <= 9631;
}
function isEmoji(codepoint) {
  return codepoint >= 128512 && codepoint <= 128591 || // Emoticons
  codepoint >= 127744 && codepoint <= 128511 || // Misc Symbols and Pictographs
  codepoint >= 128640 && codepoint <= 128767 || // Transport and Map
  codepoint >= 9728 && codepoint <= 9983 || // Misc symbols
  codepoint >= 9984 && codepoint <= 10175 || // Dingbats
  codepoint >= 65024 && codepoint <= 65039 || // Variation Selectors
  codepoint >= 129280 && codepoint <= 129535 || // Supplemental Symbols and Pictographs
  codepoint >= 127462 && codepoint <= 127487;
}
function allowRescaling(codepoint, width, glyphSizeX, deviceCellWidth) {
  return (
    // Is single cell width
    width === 1 && // Glyph exceeds cell bounds, add 50% to avoid hurting readability by rescaling glyphs that
    // barely overlap
    glyphSizeX > Math.ceil(deviceCellWidth * 1.5) && // Never rescale ascii
    codepoint !== void 0 && codepoint > 255 && // Never rescale emoji
    !isEmoji(codepoint) && // Never rescale powerline or nerd fonts
    !isPowerlineGlyph(codepoint) && !isNerdFontGlyph(codepoint)
  );
}
function treatGlyphAsBackgroundColor(codepoint) {
  return isPowerlineGlyph(codepoint) || isBoxOrBlockGlyph(codepoint);
}
function createRenderDimensions() {
  return {
    css: {
      canvas: createDimension(),
      cell: createDimension()
    },
    device: {
      canvas: createDimension(),
      cell: createDimension(),
      char: {
        width: 0,
        height: 0,
        left: 0,
        top: 0
      }
    }
  };
}
function createDimension() {
  return {
    width: 0,
    height: 0
  };
}
function computeNextVariantOffset(cellWidth, lineWidth, currentOffset = 0) {
  return (cellWidth - (Math.round(lineWidth) * 2 - currentOffset)) % (Math.round(lineWidth) * 2);
}
//# sourceMappingURL=RendererUtils.js.map
