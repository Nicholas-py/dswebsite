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
var ImageAddon_exports = {};
__export(ImageAddon_exports, {
  ImageAddon: () => ImageAddon
});
module.exports = __toCommonJS(ImageAddon_exports);
var import_IIPHandler = require("./IIPHandler");
var import_ImageRenderer = require("./ImageRenderer");
var import_ImageStorage = require("./ImageStorage");
var import_SixelHandler = require("./SixelHandler");
/**
 * Copyright (c) 2020 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const DEFAULT_OPTIONS = {
  enableSizeReports: true,
  pixelLimit: 16777216,
  // limit to 4096 * 4096 pixels
  sixelSupport: true,
  sixelScrolling: true,
  sixelPaletteLimit: 256,
  sixelSizeLimit: 25e6,
  storageLimit: 128,
  showPlaceholder: true,
  iipSupport: true,
  iipSizeLimit: 2e7
};
const MAX_SIXEL_PALETTE_SIZE = 4096;
var GaItem = /* @__PURE__ */ ((GaItem2) => {
  GaItem2[GaItem2["COLORS"] = 1] = "COLORS";
  GaItem2[GaItem2["SIXEL_GEO"] = 2] = "SIXEL_GEO";
  GaItem2[GaItem2["REGIS_GEO"] = 3] = "REGIS_GEO";
  return GaItem2;
})(GaItem || {});
var GaAction = /* @__PURE__ */ ((GaAction2) => {
  GaAction2[GaAction2["READ"] = 1] = "READ";
  GaAction2[GaAction2["SET_DEFAULT"] = 2] = "SET_DEFAULT";
  GaAction2[GaAction2["SET"] = 3] = "SET";
  GaAction2[GaAction2["READ_MAX"] = 4] = "READ_MAX";
  return GaAction2;
})(GaAction || {});
var GaStatus = /* @__PURE__ */ ((GaStatus2) => {
  GaStatus2[GaStatus2["SUCCESS"] = 0] = "SUCCESS";
  GaStatus2[GaStatus2["ITEM_ERROR"] = 1] = "ITEM_ERROR";
  GaStatus2[GaStatus2["ACTION_ERROR"] = 2] = "ACTION_ERROR";
  GaStatus2[GaStatus2["FAILURE"] = 3] = "FAILURE";
  return GaStatus2;
})(GaStatus || {});
class ImageAddon {
  constructor(opts) {
    this._disposables = [];
    this._handlers = /* @__PURE__ */ new Map();
    this._opts = Object.assign({}, DEFAULT_OPTIONS, opts);
    this._defaultOpts = Object.assign({}, DEFAULT_OPTIONS, opts);
  }
  dispose() {
    for (const obj of this._disposables) {
      obj.dispose();
    }
    this._disposables.length = 0;
    this._handlers.clear();
  }
  _disposeLater(...args) {
    for (const obj of args) {
      this._disposables.push(obj);
    }
  }
  activate(terminal) {
    this._terminal = terminal;
    this._renderer = new import_ImageRenderer.ImageRenderer(terminal);
    this._storage = new import_ImageStorage.ImageStorage(terminal, this._renderer, this._opts);
    if (this._opts.enableSizeReports) {
      const windowOps = terminal.options.windowOptions || {};
      windowOps.getWinSizePixels = true;
      windowOps.getCellSizePixels = true;
      windowOps.getWinSizeChars = true;
      terminal.options.windowOptions = windowOps;
    }
    this._disposeLater(
      this._renderer,
      this._storage,
      // DECSET/DECRST/DA1/XTSMGRAPHICS handlers
      terminal.parser.registerCsiHandler({ prefix: "?", final: "h" }, (params) => this._decset(params)),
      terminal.parser.registerCsiHandler({ prefix: "?", final: "l" }, (params) => this._decrst(params)),
      terminal.parser.registerCsiHandler({ final: "c" }, (params) => this._da1(params)),
      terminal.parser.registerCsiHandler({ prefix: "?", final: "S" }, (params) => this._xtermGraphicsAttributes(params)),
      // render hook
      terminal.onRender((range) => this._storage?.render(range)),
      /**
       * reset handlers covered:
       * - DECSTR
       * - RIS
       * - Terminal.reset()
       */
      terminal.parser.registerCsiHandler({ intermediates: "!", final: "p" }, () => this.reset()),
      terminal.parser.registerEscHandler({ final: "c" }, () => this.reset()),
      terminal._core._inputHandler.onRequestReset(() => this.reset()),
      // wipe canvas and delete alternate images on buffer switch
      terminal.buffer.onBufferChange(() => this._storage?.wipeAlternate()),
      // extend images to the right on resize
      terminal.onResize((metrics) => this._storage?.viewportResize(metrics))
    );
    if (this._opts.sixelSupport) {
      const sixelHandler = new import_SixelHandler.SixelHandler(this._opts, this._storage, terminal);
      this._handlers.set("sixel", sixelHandler);
      this._disposeLater(
        terminal._core._inputHandler._parser.registerDcsHandler({ final: "q" }, sixelHandler)
      );
    }
    if (this._opts.iipSupport) {
      const iipHandler = new import_IIPHandler.IIPHandler(this._opts, this._renderer, this._storage, terminal);
      this._handlers.set("iip", iipHandler);
      this._disposeLater(
        terminal._core._inputHandler._parser.registerOscHandler(1337, iipHandler)
      );
    }
  }
  // Note: storageLimit is skipped here to not intoduce a surprising side effect.
  reset() {
    this._opts.sixelScrolling = this._defaultOpts.sixelScrolling;
    this._opts.sixelPaletteLimit = this._defaultOpts.sixelPaletteLimit;
    this._storage?.reset();
    for (const handler of this._handlers.values()) {
      handler.reset();
    }
    return false;
  }
  get storageLimit() {
    return this._storage?.getLimit() || -1;
  }
  set storageLimit(limit) {
    this._storage?.setLimit(limit);
    this._opts.storageLimit = limit;
  }
  get storageUsage() {
    if (this._storage) {
      return this._storage.getUsage();
    }
    return -1;
  }
  get showPlaceholder() {
    return this._opts.showPlaceholder;
  }
  set showPlaceholder(value) {
    this._opts.showPlaceholder = value;
    this._renderer?.showPlaceholder(value);
  }
  getImageAtBufferCell(x, y) {
    return this._storage?.getImageAtBufferCell(x, y);
  }
  extractTileAtBufferCell(x, y) {
    return this._storage?.extractTileAtBufferCell(x, y);
  }
  _report(s) {
    this._terminal?._core.coreService.triggerDataEvent(s);
  }
  _decset(params) {
    for (let i = 0; i < params.length; ++i) {
      switch (params[i]) {
        case 80:
          this._opts.sixelScrolling = false;
          break;
      }
    }
    return false;
  }
  _decrst(params) {
    for (let i = 0; i < params.length; ++i) {
      switch (params[i]) {
        case 80:
          this._opts.sixelScrolling = true;
          break;
      }
    }
    return false;
  }
  // overload DA to return something more appropriate
  _da1(params) {
    if (params[0]) {
      return true;
    }
    if (this._opts.sixelSupport) {
      this._report(`\x1B[?62;4;9;22c`);
      return true;
    }
    return false;
  }
  /**
   * Implementation of xterm's graphics attribute sequence.
   *
   * Supported features:
   * - read/change palette limits (max 4096 by sixel lib)
   * - read SIXEL canvas geometry (reports current window canvas or
   *   squared pixelLimit if canvas > pixel limit)
   *
   * Everything else is deactivated.
   */
  _xtermGraphicsAttributes(params) {
    if (params.length < 2) {
      return true;
    }
    if (params[0] === 1 /* COLORS */) {
      switch (params[1]) {
        case 1 /* READ */:
          this._report(`\x1B[?${params[0]};${0 /* SUCCESS */};${this._opts.sixelPaletteLimit}S`);
          return true;
        case 2 /* SET_DEFAULT */:
          this._opts.sixelPaletteLimit = this._defaultOpts.sixelPaletteLimit;
          this._report(`\x1B[?${params[0]};${0 /* SUCCESS */};${this._opts.sixelPaletteLimit}S`);
          for (const handler of this._handlers.values()) {
            handler.reset();
          }
          return true;
        case 3 /* SET */:
          if (params.length > 2 && !(params[2] instanceof Array) && params[2] <= MAX_SIXEL_PALETTE_SIZE) {
            this._opts.sixelPaletteLimit = params[2];
            this._report(`\x1B[?${params[0]};${0 /* SUCCESS */};${this._opts.sixelPaletteLimit}S`);
          } else {
            this._report(`\x1B[?${params[0]};${2 /* ACTION_ERROR */}S`);
          }
          return true;
        case 4 /* READ_MAX */:
          this._report(`\x1B[?${params[0]};${0 /* SUCCESS */};${MAX_SIXEL_PALETTE_SIZE}S`);
          return true;
        default:
          this._report(`\x1B[?${params[0]};${2 /* ACTION_ERROR */}S`);
          return true;
      }
    }
    if (params[0] === 2 /* SIXEL_GEO */) {
      switch (params[1]) {
        // we only implement read and read_max here
        case 1 /* READ */:
          let width = this._renderer?.dimensions?.css.canvas.width;
          let height = this._renderer?.dimensions?.css.canvas.height;
          if (!width || !height) {
            const cellSize = import_ImageStorage.CELL_SIZE_DEFAULT;
            width = (this._terminal?.cols || 80) * cellSize.width;
            height = (this._terminal?.rows || 24) * cellSize.height;
          }
          if (width * height < this._opts.pixelLimit) {
            this._report(`\x1B[?${params[0]};${0 /* SUCCESS */};${width.toFixed(0)};${height.toFixed(0)}S`);
          } else {
            const x2 = Math.floor(Math.sqrt(this._opts.pixelLimit));
            this._report(`\x1B[?${params[0]};${0 /* SUCCESS */};${x2};${x2}S`);
          }
          return true;
        case 4 /* READ_MAX */:
          const x = Math.floor(Math.sqrt(this._opts.pixelLimit));
          this._report(`\x1B[?${params[0]};${0 /* SUCCESS */};${x};${x}S`);
          return true;
        default:
          this._report(`\x1B[?${params[0]};${2 /* ACTION_ERROR */}S`);
          return true;
      }
    }
    this._report(`\x1B[?${params[0]};${1 /* ITEM_ERROR */}S`);
    return true;
  }
}
//# sourceMappingURL=ImageAddon.js.map
