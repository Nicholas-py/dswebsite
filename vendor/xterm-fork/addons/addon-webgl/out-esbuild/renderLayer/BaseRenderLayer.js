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
var BaseRenderLayer_exports = {};
__export(BaseRenderLayer_exports, {
  BaseRenderLayer: () => BaseRenderLayer
});
module.exports = __toCommonJS(BaseRenderLayer_exports);
var import_CharAtlasCache = require("browser/renderer/shared/CharAtlasCache");
var import_Constants = require("browser/renderer/shared/Constants");
var import_RendererUtils = require("browser/renderer/shared/RendererUtils");
var import_lifecycle = require("vs/base/common/lifecycle");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class BaseRenderLayer extends import_lifecycle.Disposable {
  constructor(terminal, _container, id, zIndex, _alpha, _coreBrowserService, _optionsService, _themeService) {
    super();
    this._container = _container;
    this._alpha = _alpha;
    this._coreBrowserService = _coreBrowserService;
    this._optionsService = _optionsService;
    this._themeService = _themeService;
    this._deviceCharWidth = 0;
    this._deviceCharHeight = 0;
    this._deviceCellWidth = 0;
    this._deviceCellHeight = 0;
    this._deviceCharLeft = 0;
    this._deviceCharTop = 0;
    this._canvas = this._coreBrowserService.mainDocument.createElement("canvas");
    this._canvas.classList.add(`xterm-${id}-layer`);
    this._canvas.style.zIndex = zIndex.toString();
    this._initCanvas();
    this._container.appendChild(this._canvas);
    this._register(this._themeService.onChangeColors((e) => {
      this._refreshCharAtlas(terminal, e);
      this.reset(terminal);
    }));
    this._register((0, import_lifecycle.toDisposable)(() => {
      this._canvas.remove();
    }));
  }
  _initCanvas() {
    this._ctx = (0, import_RendererUtils.throwIfFalsy)(this._canvas.getContext("2d", { alpha: this._alpha }));
    if (!this._alpha) {
      this._clearAll();
    }
  }
  handleBlur(terminal) {
  }
  handleFocus(terminal) {
  }
  handleCursorMove(terminal) {
  }
  handleGridChanged(terminal, startRow, endRow) {
  }
  handleSelectionChanged(terminal, start, end, columnSelectMode = false) {
  }
  _setTransparency(terminal, alpha) {
    if (alpha === this._alpha) {
      return;
    }
    const oldCanvas = this._canvas;
    this._alpha = alpha;
    this._canvas = this._canvas.cloneNode();
    this._initCanvas();
    this._container.replaceChild(this._canvas, oldCanvas);
    this._refreshCharAtlas(terminal, this._themeService.colors);
    this.handleGridChanged(terminal, 0, terminal.rows - 1);
  }
  /**
   * Refreshes the char atlas, aquiring a new one if necessary.
   * @param terminal The terminal.
   * @param colorSet The color set to use for the char atlas.
   */
  _refreshCharAtlas(terminal, colorSet) {
    if (this._deviceCharWidth <= 0 && this._deviceCharHeight <= 0) {
      return;
    }
    this._charAtlas = (0, import_CharAtlasCache.acquireTextureAtlas)(terminal, this._optionsService.rawOptions, colorSet, this._deviceCellWidth, this._deviceCellHeight, this._deviceCharWidth, this._deviceCharHeight, this._coreBrowserService.dpr);
    this._charAtlas.warmUp();
  }
  resize(terminal, dim) {
    this._deviceCellWidth = dim.device.cell.width;
    this._deviceCellHeight = dim.device.cell.height;
    this._deviceCharWidth = dim.device.char.width;
    this._deviceCharHeight = dim.device.char.height;
    this._deviceCharLeft = dim.device.char.left;
    this._deviceCharTop = dim.device.char.top;
    this._canvas.width = dim.device.canvas.width;
    this._canvas.height = dim.device.canvas.height;
    this._canvas.style.width = `${dim.css.canvas.width}px`;
    this._canvas.style.height = `${dim.css.canvas.height}px`;
    if (!this._alpha) {
      this._clearAll();
    }
    this._refreshCharAtlas(terminal, this._themeService.colors);
  }
  /**
   * Fills a 1px line (2px on HDPI) at the bottom of the cell. This uses the
   * existing fillStyle on the context.
   * @param x The column to fill.
   * @param y The row to fill.
   */
  _fillBottomLineAtCells(x, y, width = 1) {
    this._ctx.fillRect(
      x * this._deviceCellWidth,
      (y + 1) * this._deviceCellHeight - this._coreBrowserService.dpr - 1,
      width * this._deviceCellWidth,
      this._coreBrowserService.dpr
    );
  }
  /**
   * Clears the entire canvas.
   */
  _clearAll() {
    if (this._alpha) {
      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    } else {
      this._ctx.fillStyle = this._themeService.colors.background.css;
      this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }
  }
  /**
   * Clears 1+ cells completely.
   * @param x The column to start at.
   * @param y The row to start at.
   * @param width The number of columns to clear.
   * @param height The number of rows to clear.
   */
  _clearCells(x, y, width, height) {
    if (this._alpha) {
      this._ctx.clearRect(
        x * this._deviceCellWidth,
        y * this._deviceCellHeight,
        width * this._deviceCellWidth,
        height * this._deviceCellHeight
      );
    } else {
      this._ctx.fillStyle = this._themeService.colors.background.css;
      this._ctx.fillRect(
        x * this._deviceCellWidth,
        y * this._deviceCellHeight,
        width * this._deviceCellWidth,
        height * this._deviceCellHeight
      );
    }
  }
  /**
   * Draws a truecolor character at the cell. The character will be clipped to
   * ensure that it fits with the cell, including the cell to the right if it's
   * a wide character. This uses the existing fillStyle on the context.
   * @param terminal The terminal.
   * @param cell The cell data for the character to draw.
   * @param x The column to draw at.
   * @param y The row to draw at.
   */
  _fillCharTrueColor(terminal, cell, x, y) {
    this._ctx.font = this._getFont(terminal, false, false);
    this._ctx.textBaseline = import_Constants.TEXT_BASELINE;
    this._clipCell(x, y, cell.getWidth());
    this._ctx.fillText(
      cell.getChars(),
      x * this._deviceCellWidth + this._deviceCharLeft,
      y * this._deviceCellHeight + this._deviceCharTop + this._deviceCharHeight
    );
  }
  /**
   * Clips a cell to ensure no pixels will be drawn outside of it.
   * @param x The column to clip.
   * @param y The row to clip.
   * @param width The number of columns to clip.
   */
  _clipCell(x, y, width) {
    this._ctx.beginPath();
    this._ctx.rect(
      x * this._deviceCellWidth,
      y * this._deviceCellHeight,
      width * this._deviceCellWidth,
      this._deviceCellHeight
    );
    this._ctx.clip();
  }
  /**
   * Gets the current font.
   * @param terminal The terminal.
   * @param isBold If we should use the bold fontWeight.
   */
  _getFont(terminal, isBold, isItalic) {
    const fontWeight = isBold ? terminal.options.fontWeightBold : terminal.options.fontWeight;
    const fontStyle = isItalic ? "italic" : "";
    return `${fontStyle} ${fontWeight} ${terminal.options.fontSize * this._coreBrowserService.dpr}px ${terminal.options.fontFamily}`;
  }
}
//# sourceMappingURL=BaseRenderLayer.js.map
