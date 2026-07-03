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
var CharAtlasUtils_exports = {};
__export(CharAtlasUtils_exports, {
  configEquals: () => configEquals,
  generateConfig: () => generateConfig,
  is256Color: () => is256Color
});
module.exports = __toCommonJS(CharAtlasUtils_exports);
var import_Constants = require("common/buffer/Constants");
var import_Color = require("common/Color");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function generateConfig(deviceCellWidth, deviceCellHeight, deviceCharWidth, deviceCharHeight, options, colors, devicePixelRatio) {
  const clonedColors = {
    foreground: colors.foreground,
    background: colors.background,
    cursor: import_Color.NULL_COLOR,
    cursorAccent: import_Color.NULL_COLOR,
    selectionForeground: import_Color.NULL_COLOR,
    selectionBackgroundTransparent: import_Color.NULL_COLOR,
    selectionBackgroundOpaque: import_Color.NULL_COLOR,
    selectionInactiveBackgroundTransparent: import_Color.NULL_COLOR,
    selectionInactiveBackgroundOpaque: import_Color.NULL_COLOR,
    overviewRulerBorder: import_Color.NULL_COLOR,
    scrollbarSliderBackground: import_Color.NULL_COLOR,
    scrollbarSliderHoverBackground: import_Color.NULL_COLOR,
    scrollbarSliderActiveBackground: import_Color.NULL_COLOR,
    // For the static char atlas, we only use the first 16 colors, but we need all 256 for the
    // dynamic character atlas.
    ansi: colors.ansi.slice(),
    contrastCache: colors.contrastCache,
    halfContrastCache: colors.halfContrastCache
  };
  return {
    customGlyphs: options.customGlyphs,
    devicePixelRatio,
    letterSpacing: options.letterSpacing,
    lineHeight: options.lineHeight,
    deviceCellWidth,
    deviceCellHeight,
    deviceCharWidth,
    deviceCharHeight,
    fontFamily: options.fontFamily,
    fontSize: options.fontSize,
    fontWeight: options.fontWeight,
    fontWeightBold: options.fontWeightBold,
    allowTransparency: options.allowTransparency,
    drawBoldTextInBrightColors: options.drawBoldTextInBrightColors,
    minimumContrastRatio: options.minimumContrastRatio,
    colors: clonedColors
  };
}
function configEquals(a, b) {
  for (let i = 0; i < a.colors.ansi.length; i++) {
    if (a.colors.ansi[i].rgba !== b.colors.ansi[i].rgba) {
      return false;
    }
  }
  return a.devicePixelRatio === b.devicePixelRatio && a.customGlyphs === b.customGlyphs && a.lineHeight === b.lineHeight && a.letterSpacing === b.letterSpacing && a.fontFamily === b.fontFamily && a.fontSize === b.fontSize && a.fontWeight === b.fontWeight && a.fontWeightBold === b.fontWeightBold && a.allowTransparency === b.allowTransparency && a.deviceCharWidth === b.deviceCharWidth && a.deviceCharHeight === b.deviceCharHeight && a.drawBoldTextInBrightColors === b.drawBoldTextInBrightColors && a.minimumContrastRatio === b.minimumContrastRatio && a.colors.foreground.rgba === b.colors.foreground.rgba && a.colors.background.rgba === b.colors.background.rgba;
}
function is256Color(colorCode) {
  return (colorCode & import_Constants.Attributes.CM_MASK) === import_Constants.Attributes.CM_P16 || (colorCode & import_Constants.Attributes.CM_MASK) === import_Constants.Attributes.CM_P256;
}
//# sourceMappingURL=CharAtlasUtils.js.map
