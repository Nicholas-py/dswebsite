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
var SixelHandler_exports = {};
__export(SixelHandler_exports, {
  SixelHandler: () => SixelHandler
});
module.exports = __toCommonJS(SixelHandler_exports);
var import_Colors = require("sixel/lib/Colors");
var import_ImageRenderer = require("./ImageRenderer");
var import_Decoder = require("sixel/lib/Decoder");
/**
 * Copyright (c) 2020, 2023 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const MEM_PERMA_LIMIT = 4194304;
const DEFAULT_PALETTE = import_Colors.PALETTE_ANSI_256;
DEFAULT_PALETTE.set(import_Colors.PALETTE_VT340_COLOR);
class SixelHandler {
  constructor(_opts, _storage, _coreTerminal) {
    this._opts = _opts;
    this._storage = _storage;
    this._coreTerminal = _coreTerminal;
    this._size = 0;
    this._aborted = false;
    (0, import_Decoder.DecoderAsync)({
      memoryLimit: this._opts.pixelLimit * 4,
      palette: DEFAULT_PALETTE,
      paletteLimit: this._opts.sixelPaletteLimit
    }).then((d) => this._dec = d);
  }
  reset() {
    if (this._dec) {
      this._dec.release();
      this._dec._palette.fill(0);
      this._dec.init(0, DEFAULT_PALETTE, this._opts.sixelPaletteLimit);
    }
  }
  hook(params) {
    this._size = 0;
    this._aborted = false;
    if (this._dec) {
      const fillColor = params.params[1] === 1 ? 0 : extractActiveBg(
        this._coreTerminal._core._inputHandler._curAttrData,
        this._coreTerminal._core._themeService?.colors
      );
      this._dec.init(fillColor, null, this._opts.sixelPaletteLimit);
    }
  }
  put(data, start, end) {
    if (this._aborted || !this._dec) {
      return;
    }
    this._size += end - start;
    if (this._size > this._opts.sixelSizeLimit) {
      console.warn(`SIXEL: too much data, aborting`);
      this._aborted = true;
      this._dec.release();
      return;
    }
    try {
      this._dec.decode(data, start, end);
    } catch (e) {
      console.warn(`SIXEL: error while decoding image - ${e}`);
      this._aborted = true;
      this._dec.release();
    }
  }
  unhook(success) {
    if (this._aborted || !success || !this._dec) {
      return true;
    }
    const width = this._dec.width;
    const height = this._dec.height;
    if (!width || !height) {
      if (height) {
        this._storage.advanceCursor(height);
      }
      return true;
    }
    const canvas = import_ImageRenderer.ImageRenderer.createCanvas(void 0, width, height);
    canvas.getContext("2d")?.putImageData(new ImageData(this._dec.data8, width, height), 0, 0);
    if (this._dec.memoryUsage > MEM_PERMA_LIMIT) {
      this._dec.release();
    }
    this._storage.addImage(canvas);
    return true;
  }
}
function extractActiveBg(attr, colors) {
  let bg = 0;
  if (!colors) {
    return bg;
  }
  if (attr.isInverse()) {
    if (attr.isFgDefault()) {
      bg = convertLe(colors.foreground.rgba);
    } else if (attr.isFgRGB()) {
      const t = attr.constructor.toColorRGB(attr.getFgColor());
      bg = (0, import_Colors.toRGBA8888)(...t);
    } else {
      bg = convertLe(colors.ansi[attr.getFgColor()].rgba);
    }
  } else {
    if (attr.isBgDefault()) {
      bg = convertLe(colors.background.rgba);
    } else if (attr.isBgRGB()) {
      const t = attr.constructor.toColorRGB(attr.getBgColor());
      bg = (0, import_Colors.toRGBA8888)(...t);
    } else {
      bg = convertLe(colors.ansi[attr.getBgColor()].rgba);
    }
  }
  return bg;
}
function convertLe(color) {
  if (import_Colors.BIG_ENDIAN) return color;
  return (color & 255) << 24 | (color >>> 8 & 255) << 16 | (color >>> 16 & 255) << 8 | color >>> 24 & 255;
}
//# sourceMappingURL=SixelHandler.js.map
