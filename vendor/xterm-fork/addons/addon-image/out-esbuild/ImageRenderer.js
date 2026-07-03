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
var ImageRenderer_exports = {};
__export(ImageRenderer_exports, {
  ImageRenderer: () => ImageRenderer
});
module.exports = __toCommonJS(ImageRenderer_exports);
var import_Colors = require("sixel/lib/Colors");
var import_lifecycle = require("vs/base/common/lifecycle");
/**
 * Copyright (c) 2020 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const PLACEHOLDER_LENGTH = 4096;
const PLACEHOLDER_HEIGHT = 24;
class ImageRenderer extends import_lifecycle.Disposable {
  constructor(_terminal) {
    super();
    this._terminal = _terminal;
    this._optionsRefresh = this._register(new import_lifecycle.MutableDisposable());
    this._oldOpen = this._terminal._core.open;
    this._terminal._core.open = (parent) => {
      this._oldOpen?.call(this._terminal._core, parent);
      this._open();
    };
    if (this._terminal._core.screenElement) {
      this._open();
    }
    this._optionsRefresh.value = this._terminal._core.optionsService.onOptionChange((option) => {
      if (option === "fontSize") {
        this.rescaleCanvas();
        this._renderService?.refreshRows(0, this._terminal.rows);
      }
    });
    this._register((0, import_lifecycle.toDisposable)(() => {
      this.removeLayerFromDom();
      if (this._terminal._core && this._oldOpen) {
        this._terminal._core.open = this._oldOpen;
        this._oldOpen = void 0;
      }
      if (this._renderService && this._oldSetRenderer) {
        this._renderService.setRenderer = this._oldSetRenderer;
        this._oldSetRenderer = void 0;
      }
      this._renderService = void 0;
      this.canvas = void 0;
      this._ctx = void 0;
      this._placeholderBitmap?.close();
      this._placeholderBitmap = void 0;
      this._placeholder = void 0;
    }));
  }
  // drawing primitive - canvas
  static createCanvas(localDocument, width, height) {
    const canvas = (localDocument || document).createElement("canvas");
    canvas.width = width | 0;
    canvas.height = height | 0;
    return canvas;
  }
  // drawing primitive - ImageData with optional buffer
  static createImageData(ctx, width, height, buffer) {
    if (typeof ImageData !== "function") {
      const imgData = ctx.createImageData(width, height);
      if (buffer) {
        imgData.data.set(new Uint8ClampedArray(buffer, 0, width * height * 4));
      }
      return imgData;
    }
    return buffer ? new ImageData(new Uint8ClampedArray(buffer, 0, width * height * 4), width, height) : new ImageData(width, height);
  }
  // drawing primitive - ImageBitmap
  static createImageBitmap(img) {
    if (typeof createImageBitmap !== "function") {
      return Promise.resolve(void 0);
    }
    return createImageBitmap(img);
  }
  /**
   * Enable the placeholder.
   */
  showPlaceholder(value) {
    if (value) {
      if (!this._placeholder && this.cellSize.height !== -1) {
        this._createPlaceHolder(Math.max(this.cellSize.height + 1, PLACEHOLDER_HEIGHT));
      }
    } else {
      this._placeholderBitmap?.close();
      this._placeholderBitmap = void 0;
      this._placeholder = void 0;
    }
    this._renderService?.refreshRows(0, this._terminal.rows);
  }
  /**
   * Dimensions of the terminal.
   * Forwarded from internal render service.
   */
  get dimensions() {
    return this._renderService?.dimensions;
  }
  /**
   * Current cell size (float).
   */
  get cellSize() {
    return {
      width: this.dimensions?.css.cell.width || -1,
      height: this.dimensions?.css.cell.height || -1
    };
  }
  /**
   * Clear a region of the image layer canvas.
   */
  clearLines(start, end) {
    this._ctx?.clearRect(
      0,
      start * (this.dimensions?.css.cell.height || 0),
      this.dimensions?.css.canvas.width || 0,
      (++end - start) * (this.dimensions?.css.cell.height || 0)
    );
  }
  /**
   * Clear whole image canvas.
   */
  clearAll() {
    this._ctx?.clearRect(0, 0, this.canvas?.width || 0, this.canvas?.height || 0);
  }
  /**
   * Draw neighboring tiles on the image layer canvas.
   */
  draw(imgSpec, tileId, col, row, count = 1) {
    if (!this._ctx) {
      return;
    }
    const { width, height } = this.cellSize;
    if (width === -1 || height === -1) {
      return;
    }
    this._rescaleImage(imgSpec, width, height);
    const img = imgSpec.actual;
    const cols = Math.ceil(img.width / width);
    const sx = tileId % cols * width;
    const sy = Math.floor(tileId / cols) * height;
    const dx = col * width;
    const dy = row * height;
    const finalWidth = count * width + sx > img.width ? img.width - sx : count * width;
    const finalHeight = sy + height > img.height ? img.height - sy : height;
    this._ctx.drawImage(
      img,
      Math.floor(sx),
      Math.floor(sy),
      Math.ceil(finalWidth),
      Math.ceil(finalHeight),
      Math.floor(dx),
      Math.floor(dy),
      Math.ceil(finalWidth),
      Math.ceil(finalHeight)
    );
  }
  /**
   * Extract a single tile from an image.
   */
  extractTile(imgSpec, tileId) {
    const { width, height } = this.cellSize;
    if (width === -1 || height === -1) {
      return;
    }
    this._rescaleImage(imgSpec, width, height);
    const img = imgSpec.actual;
    const cols = Math.ceil(img.width / width);
    const sx = tileId % cols * width;
    const sy = Math.floor(tileId / cols) * height;
    const finalWidth = width + sx > img.width ? img.width - sx : width;
    const finalHeight = sy + height > img.height ? img.height - sy : height;
    const canvas = ImageRenderer.createCanvas(this.document, finalWidth, finalHeight);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(
        img,
        Math.floor(sx),
        Math.floor(sy),
        Math.floor(finalWidth),
        Math.floor(finalHeight),
        0,
        0,
        Math.floor(finalWidth),
        Math.floor(finalHeight)
      );
      return canvas;
    }
  }
  /**
   * Draw a line with placeholder on the image layer canvas.
   */
  drawPlaceholder(col, row, count = 1) {
    if (this._ctx) {
      const { width, height } = this.cellSize;
      if (width === -1 || height === -1) {
        return;
      }
      if (!this._placeholder) {
        this._createPlaceHolder(Math.max(height + 1, PLACEHOLDER_HEIGHT));
      } else if (height >= this._placeholder.height) {
        this._createPlaceHolder(height + 1);
      }
      if (!this._placeholder) return;
      this._ctx.drawImage(
        this._placeholderBitmap || this._placeholder,
        col * width,
        row * height % 2 ? 0 : 1,
        // needs %2 offset correction
        width * count,
        height,
        col * width,
        row * height,
        width * count,
        height
      );
    }
  }
  /**
   * Rescale image layer canvas if needed.
   * Checked once from `ImageStorage.render`.
   */
  rescaleCanvas() {
    if (!this.canvas) {
      return;
    }
    if (this.canvas.width !== this.dimensions.css.canvas.width || this.canvas.height !== this.dimensions.css.canvas.height) {
      this.canvas.width = this.dimensions.css.canvas.width || 0;
      this.canvas.height = this.dimensions.css.canvas.height || 0;
    }
  }
  /**
   * Rescale image in storage if needed.
   */
  _rescaleImage(spec, currentWidth, currentHeight) {
    if (currentWidth === spec.actualCellSize.width && currentHeight === spec.actualCellSize.height) {
      return;
    }
    const { width: originalWidth, height: originalHeight } = spec.origCellSize;
    if (currentWidth === originalWidth && currentHeight === originalHeight) {
      spec.actual = spec.orig;
      spec.actualCellSize.width = originalWidth;
      spec.actualCellSize.height = originalHeight;
      return;
    }
    const canvas = ImageRenderer.createCanvas(
      this.document,
      Math.ceil(spec.orig.width * currentWidth / originalWidth),
      Math.ceil(spec.orig.height * currentHeight / originalHeight)
    );
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(spec.orig, 0, 0, canvas.width, canvas.height);
      spec.actual = canvas;
      spec.actualCellSize.width = currentWidth;
      spec.actualCellSize.height = currentHeight;
    }
  }
  /**
   * Lazy init for the renderer.
   */
  _open() {
    this._renderService = this._terminal._core._renderService;
    this._oldSetRenderer = this._renderService.setRenderer.bind(this._renderService);
    this._renderService.setRenderer = (renderer) => {
      this.removeLayerFromDom();
      this._oldSetRenderer?.call(this._renderService, renderer);
    };
  }
  insertLayerToDom() {
    if (this.document && this._terminal._core.screenElement) {
      if (!this.canvas) {
        this.canvas = ImageRenderer.createCanvas(
          this.document,
          this.dimensions?.css.canvas.width || 0,
          this.dimensions?.css.canvas.height || 0
        );
        this.canvas.classList.add("xterm-image-layer");
        this._terminal._core.screenElement.appendChild(this.canvas);
        this._ctx = this.canvas.getContext("2d", { alpha: true, desynchronized: true });
        this.clearAll();
      }
    } else {
      console.warn("image addon: cannot insert output canvas to DOM, missing document or screenElement");
    }
  }
  removeLayerFromDom() {
    if (this.canvas) {
      this._ctx = void 0;
      this.canvas.remove();
      this.canvas = void 0;
    }
  }
  _createPlaceHolder(height = PLACEHOLDER_HEIGHT) {
    this._placeholderBitmap?.close();
    this._placeholderBitmap = void 0;
    const bWidth = 32;
    const blueprint = ImageRenderer.createCanvas(this.document, bWidth, height);
    const ctx = blueprint.getContext("2d", { alpha: false });
    if (!ctx) return;
    const imgData = ImageRenderer.createImageData(ctx, bWidth, height);
    const d32 = new Uint32Array(imgData.data.buffer);
    const black = (0, import_Colors.toRGBA8888)(0, 0, 0);
    const white = (0, import_Colors.toRGBA8888)(255, 255, 255);
    d32.fill(black);
    for (let y = 0; y < height; ++y) {
      const shift = y % 2;
      const offset = y * bWidth;
      for (let x = 0; x < bWidth; x += 2) {
        d32[offset + x + shift] = white;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const width = screen.width + bWidth - 1 & ~(bWidth - 1) || PLACEHOLDER_LENGTH;
    this._placeholder = ImageRenderer.createCanvas(this.document, width, height);
    const ctx2 = this._placeholder.getContext("2d", { alpha: false });
    if (!ctx2) {
      this._placeholder = void 0;
      return;
    }
    for (let i = 0; i < width; i += bWidth) {
      ctx2.drawImage(blueprint, i, 0);
    }
    ImageRenderer.createImageBitmap(this._placeholder).then((bitmap) => this._placeholderBitmap = bitmap);
  }
  get document() {
    return this._terminal._core._coreBrowserService?.window.document;
  }
}
//# sourceMappingURL=ImageRenderer.js.map
