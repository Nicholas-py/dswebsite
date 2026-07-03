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
var ImageStorage_exports = {};
__export(ImageStorage_exports, {
  CELL_SIZE_DEFAULT: () => CELL_SIZE_DEFAULT,
  ImageStorage: () => ImageStorage
});
module.exports = __toCommonJS(ImageStorage_exports);
var import_ImageRenderer = require("./ImageRenderer");
var import_Types = require("./Types");
/**
 * Copyright (c) 2020 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const CELL_SIZE_DEFAULT = {
  width: 7,
  height: 14
};
class ExtendedAttrsImage {
  constructor(ext = 0, urlId = 0, imageId = -1, tileId = -1) {
    this.imageId = imageId;
    this.tileId = tileId;
    this._ext = 0;
    this._urlId = 0;
    this._ext = ext;
    this._urlId = urlId;
  }
  get ext() {
    if (this._urlId) {
      return this._ext & ~import_Types.ExtFlags.UNDERLINE_STYLE | this.underlineStyle << 26;
    }
    return this._ext;
  }
  set ext(value) {
    this._ext = value;
  }
  get underlineStyle() {
    if (this._urlId) {
      return import_Types.UnderlineStyle.DASHED;
    }
    return (this._ext & import_Types.ExtFlags.UNDERLINE_STYLE) >> 26;
  }
  set underlineStyle(value) {
    this._ext &= ~import_Types.ExtFlags.UNDERLINE_STYLE;
    this._ext |= value << 26 & import_Types.ExtFlags.UNDERLINE_STYLE;
  }
  get underlineColor() {
    return this._ext & (import_Types.Attributes.CM_MASK | import_Types.Attributes.RGB_MASK);
  }
  set underlineColor(value) {
    this._ext &= ~(import_Types.Attributes.CM_MASK | import_Types.Attributes.RGB_MASK);
    this._ext |= value & (import_Types.Attributes.CM_MASK | import_Types.Attributes.RGB_MASK);
  }
  get underlineVariantOffset() {
    const val = (this._ext & import_Types.ExtFlags.VARIANT_OFFSET) >> 29;
    if (val < 0) {
      return val ^ 4294967288;
    }
    return val;
  }
  set underlineVariantOffset(value) {
    this._ext &= ~import_Types.ExtFlags.VARIANT_OFFSET;
    this._ext |= value << 29 & import_Types.ExtFlags.VARIANT_OFFSET;
  }
  get urlId() {
    return this._urlId;
  }
  set urlId(value) {
    this._urlId = value;
  }
  clone() {
    return new ExtendedAttrsImage(this._ext, this._urlId, this.imageId, this.tileId);
  }
  isEmpty() {
    return this.underlineStyle === import_Types.UnderlineStyle.NONE && this._urlId === 0 && this.imageId === -1;
  }
}
const EMPTY_ATTRS = new ExtendedAttrsImage();
class ImageStorage {
  constructor(_terminal, _renderer, _opts) {
    this._terminal = _terminal;
    this._renderer = _renderer;
    this._opts = _opts;
    // storage
    this._images = /* @__PURE__ */ new Map();
    // last used id
    this._lastId = 0;
    // last evicted id
    this._lowestId = 0;
    // whether a full clear happened before
    this._fullyCleared = false;
    // whether render should do a full clear
    this._needsFullClear = false;
    // hard limit of stored pixels (fallback limit of 10 MB)
    this._pixelLimit = 25e5;
    try {
      this.setLimit(this._opts.storageLimit);
    } catch (e) {
      console.error(e.message);
      console.warn(`storageLimit is set to ${this.getLimit()} MB`);
    }
    this._viewportMetrics = {
      cols: this._terminal.cols,
      rows: this._terminal.rows
    };
  }
  dispose() {
    this.reset();
  }
  reset() {
    for (const spec of this._images.values()) {
      spec.marker?.dispose();
    }
    this._images.clear();
    this._renderer.clearAll();
  }
  getLimit() {
    return this._pixelLimit * 4 / 1e6;
  }
  setLimit(value) {
    if (value < 0.5 || value > 1e3) {
      throw RangeError("invalid storageLimit, should be at least 0.5 MB and not exceed 1G");
    }
    this._pixelLimit = value / 4 * 1e6 >>> 0;
    this._evictOldest(0);
  }
  getUsage() {
    return this._getStoredPixels() * 4 / 1e6;
  }
  _getStoredPixels() {
    let storedPixels = 0;
    for (const spec of this._images.values()) {
      if (spec.orig) {
        storedPixels += spec.orig.width * spec.orig.height;
        if (spec.actual && spec.actual !== spec.orig) {
          storedPixels += spec.actual.width * spec.actual.height;
        }
      }
    }
    return storedPixels;
  }
  _delImg(id) {
    const spec = this._images.get(id);
    this._images.delete(id);
    if (spec && window.ImageBitmap && spec.orig instanceof ImageBitmap) {
      spec.orig.close();
    }
  }
  /**
   * Wipe canvas and images on alternate buffer.
   */
  wipeAlternate() {
    const zero = [];
    for (const [id, spec] of this._images.entries()) {
      if (spec.bufferType === "alternate") {
        spec.marker?.dispose();
        zero.push(id);
      }
    }
    for (const id of zero) {
      this._delImg(id);
    }
    this._needsFullClear = true;
    this._fullyCleared = false;
  }
  /**
   * Only advance text cursor.
   * This is an edge case from empty sixels carrying only a height but no pixels.
   * Partially fixes https://github.com/jerch/xterm-addon-image/issues/37.
   */
  advanceCursor(height) {
    if (this._opts.sixelScrolling) {
      let cellSize = this._renderer.cellSize;
      if (cellSize.width === -1 || cellSize.height === -1) {
        cellSize = CELL_SIZE_DEFAULT;
      }
      const rows = Math.ceil(height / cellSize.height);
      for (let i = 1; i < rows; ++i) {
        this._terminal._core._inputHandler.lineFeed();
      }
    }
  }
  /**
   * Method to add an image to the storage.
   */
  addImage(img) {
    this._evictOldest(img.width * img.height);
    let cellSize = this._renderer.cellSize;
    if (cellSize.width === -1 || cellSize.height === -1) {
      cellSize = CELL_SIZE_DEFAULT;
    }
    const cols = Math.ceil(img.width / cellSize.width);
    const rows = Math.ceil(img.height / cellSize.height);
    const imageId = ++this._lastId;
    const buffer = this._terminal._core.buffer;
    const termCols = this._terminal.cols;
    const termRows = this._terminal.rows;
    const originX = buffer.x;
    const originY = buffer.y;
    let offset = originX;
    let tileCount = 0;
    if (!this._opts.sixelScrolling) {
      buffer.x = 0;
      buffer.y = 0;
      offset = 0;
    }
    this._terminal._core._inputHandler._dirtyRowTracker.markDirty(buffer.y);
    for (let row = 0; row < rows; ++row) {
      const line = buffer.lines.get(buffer.y + buffer.ybase);
      for (let col = 0; col < cols; ++col) {
        if (offset + col >= termCols) break;
        this._writeToCell(line, offset + col, imageId, row * cols + col);
        tileCount++;
      }
      if (this._opts.sixelScrolling) {
        if (row < rows - 1) this._terminal._core._inputHandler.lineFeed();
      } else {
        if (++buffer.y >= termRows) break;
      }
      buffer.x = offset;
    }
    this._terminal._core._inputHandler._dirtyRowTracker.markDirty(buffer.y);
    if (this._opts.sixelScrolling) {
      buffer.x = offset;
    } else {
      buffer.x = originX;
      buffer.y = originY;
    }
    const zero = [];
    for (const [id, spec] of this._images.entries()) {
      if (spec.tileCount < 1) {
        spec.marker?.dispose();
        zero.push(id);
      }
    }
    for (const id of zero) {
      this._delImg(id);
    }
    const endMarker = this._terminal.registerMarker(0);
    endMarker?.onDispose(() => {
      const spec = this._images.get(imageId);
      if (spec) {
        this._delImg(imageId);
      }
    });
    if (this._terminal.buffer.active.type === "alternate") {
      this._evictOnAlternate();
    }
    const imgSpec = {
      orig: img,
      origCellSize: cellSize,
      actual: img,
      actualCellSize: { ...cellSize },
      // clone needed, since later modified
      marker: endMarker || void 0,
      tileCount,
      bufferType: this._terminal.buffer.active.type
    };
    this._images.set(imageId, imgSpec);
  }
  /**
   * Render method. Collects buffer information and triggers
   * canvas updates.
   */
  // TODO: Should we move this to the ImageRenderer?
  render(range) {
    if (!this._renderer.canvas && this._images.size) {
      this._renderer.insertLayerToDom();
      if (!this._renderer.canvas) {
        return;
      }
    }
    this._renderer.rescaleCanvas();
    if (!this._images.size) {
      if (!this._fullyCleared) {
        this._renderer.clearAll();
        this._fullyCleared = true;
        this._needsFullClear = false;
      }
      if (this._renderer.canvas) {
        this._renderer.removeLayerFromDom();
      }
      return;
    }
    if (this._needsFullClear) {
      this._renderer.clearAll();
      this._fullyCleared = true;
      this._needsFullClear = false;
    }
    const { start, end } = range;
    const buffer = this._terminal._core.buffer;
    const cols = this._terminal._core.cols;
    this._renderer.clearLines(start, end);
    for (let row = start; row <= end; ++row) {
      const line = buffer.lines.get(row + buffer.ydisp);
      if (!line) return;
      for (let col = 0; col < cols; ++col) {
        if (line.getBg(col) & import_Types.BgFlags.HAS_EXTENDED) {
          let e = line._extendedAttrs[col] || EMPTY_ATTRS;
          const imageId = e.imageId;
          if (imageId === void 0 || imageId === -1) {
            continue;
          }
          const imgSpec = this._images.get(imageId);
          if (e.tileId !== -1) {
            const startTile = e.tileId;
            const startCol = col;
            let count = 1;
            while (++col < cols && line.getBg(col) & import_Types.BgFlags.HAS_EXTENDED && (e = line._extendedAttrs[col] || EMPTY_ATTRS) && e.imageId === imageId && e.tileId === startTile + count) {
              count++;
            }
            col--;
            if (imgSpec) {
              if (imgSpec.actual) {
                this._renderer.draw(imgSpec, startTile, startCol, row, count);
              }
            } else if (this._opts.showPlaceholder) {
              this._renderer.drawPlaceholder(startCol, row, count);
            }
            this._fullyCleared = false;
          }
        }
      }
    }
  }
  viewportResize(metrics) {
    if (!this._images.size) {
      this._viewportMetrics = metrics;
      return;
    }
    if (this._viewportMetrics.cols >= metrics.cols) {
      this._viewportMetrics = metrics;
      return;
    }
    const buffer = this._terminal._core.buffer;
    const rows = buffer.lines.length;
    const oldCol = this._viewportMetrics.cols - 1;
    for (let row = 0; row < rows; ++row) {
      const line = buffer.lines.get(row);
      if (line.getBg(oldCol) & import_Types.BgFlags.HAS_EXTENDED) {
        const e = line._extendedAttrs[oldCol] || EMPTY_ATTRS;
        const imageId = e.imageId;
        if (imageId === void 0 || imageId === -1) {
          continue;
        }
        const imgSpec = this._images.get(imageId);
        if (!imgSpec) {
          continue;
        }
        const tilesPerRow = Math.ceil((imgSpec.actual?.width || 0) / imgSpec.actualCellSize.width);
        if (e.tileId % tilesPerRow + 1 >= tilesPerRow) {
          continue;
        }
        let hasData = false;
        for (let rightCol = oldCol + 1; rightCol > metrics.cols; ++rightCol) {
          if (line._data[rightCol * import_Types.Cell.SIZE + import_Types.Cell.CONTENT] & import_Types.Content.HAS_CONTENT_MASK) {
            hasData = true;
            break;
          }
        }
        if (hasData) {
          continue;
        }
        const end = Math.min(metrics.cols, tilesPerRow - e.tileId % tilesPerRow + oldCol);
        let lastTile = e.tileId;
        for (let expandCol = oldCol + 1; expandCol < end; ++expandCol) {
          this._writeToCell(line, expandCol, imageId, ++lastTile);
          imgSpec.tileCount++;
        }
      }
    }
    this._viewportMetrics = metrics;
  }
  /**
   * Retrieve original canvas at buffer position.
   */
  getImageAtBufferCell(x, y) {
    const buffer = this._terminal._core.buffer;
    const line = buffer.lines.get(y);
    if (line && line.getBg(x) & import_Types.BgFlags.HAS_EXTENDED) {
      const e = line._extendedAttrs[x] || EMPTY_ATTRS;
      if (e.imageId && e.imageId !== -1) {
        const orig = this._images.get(e.imageId)?.orig;
        if (window.ImageBitmap && orig instanceof ImageBitmap) {
          const canvas = import_ImageRenderer.ImageRenderer.createCanvas(window.document, orig.width, orig.height);
          canvas.getContext("2d")?.drawImage(orig, 0, 0, orig.width, orig.height);
          return canvas;
        }
        return orig;
      }
    }
  }
  /**
   * Extract active single tile at buffer position.
   */
  extractTileAtBufferCell(x, y) {
    const buffer = this._terminal._core.buffer;
    const line = buffer.lines.get(y);
    if (line && line.getBg(x) & import_Types.BgFlags.HAS_EXTENDED) {
      const e = line._extendedAttrs[x] || EMPTY_ATTRS;
      if (e.imageId && e.imageId !== -1 && e.tileId !== -1) {
        const spec = this._images.get(e.imageId);
        if (spec) {
          return this._renderer.extractTile(spec, e.tileId);
        }
      }
    }
  }
  // TODO: Do we need some blob offloading tricks here to avoid early eviction?
  // also see https://stackoverflow.com/questions/28307789/is-there-any-limitation-on-javascript-max-blob-size
  _evictOldest(room) {
    const used = this._getStoredPixels();
    let current = used;
    while (this._pixelLimit < current + room && this._images.size) {
      const spec = this._images.get(++this._lowestId);
      if (spec && spec.orig) {
        current -= spec.orig.width * spec.orig.height;
        if (spec.actual && spec.orig !== spec.actual) {
          current -= spec.actual.width * spec.actual.height;
        }
        spec.marker?.dispose();
        this._delImg(this._lowestId);
      }
    }
    return used - current;
  }
  _writeToCell(line, x, imageId, tileId) {
    if (line._data[x * import_Types.Cell.SIZE + import_Types.Cell.BG] & import_Types.BgFlags.HAS_EXTENDED) {
      const old = line._extendedAttrs[x];
      if (old) {
        if (old.imageId !== void 0) {
          const oldSpec = this._images.get(old.imageId);
          if (oldSpec) {
            oldSpec.tileCount--;
          }
          old.imageId = imageId;
          old.tileId = tileId;
          return;
        }
        line._extendedAttrs[x] = new ExtendedAttrsImage(old.ext, old.urlId, imageId, tileId);
        return;
      }
    }
    line._data[x * import_Types.Cell.SIZE + import_Types.Cell.BG] |= import_Types.BgFlags.HAS_EXTENDED;
    line._extendedAttrs[x] = new ExtendedAttrsImage(0, 0, imageId, tileId);
  }
  _evictOnAlternate() {
    for (const spec of this._images.values()) {
      if (spec.bufferType === "alternate") {
        spec.tileCount = 0;
      }
    }
    const buffer = this._terminal._core.buffer;
    for (let y = 0; y < this._terminal.rows; ++y) {
      const line = buffer.lines.get(y);
      if (!line) {
        continue;
      }
      for (let x = 0; x < this._terminal.cols; ++x) {
        if (line._data[x * import_Types.Cell.SIZE + import_Types.Cell.BG] & import_Types.BgFlags.HAS_EXTENDED) {
          const imgId = line._extendedAttrs[x]?.imageId;
          if (imgId) {
            const spec = this._images.get(imgId);
            if (spec) {
              spec.tileCount++;
            }
          }
        }
      }
    }
    const zero = [];
    for (const [id, spec] of this._images.entries()) {
      if (spec.bufferType === "alternate" && !spec.tileCount) {
        spec.marker?.dispose();
        zero.push(id);
      }
    }
    for (const id of zero) {
      this._delImg(id);
    }
  }
}
//# sourceMappingURL=ImageStorage.js.map
