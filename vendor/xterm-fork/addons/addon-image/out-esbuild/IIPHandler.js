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
var IIPHandler_exports = {};
__export(IIPHandler_exports, {
  IIPHandler: () => IIPHandler
});
module.exports = __toCommonJS(IIPHandler_exports);
var import_ImageRenderer = require("./ImageRenderer");
var import_ImageStorage = require("./ImageStorage");
var import_Base64Decoder = __toESM(require("xterm-wasm-parts/lib/base64/Base64Decoder.wasm"));
var import_IIPHeaderParser = require("./IIPHeaderParser");
var import_IIPMetrics = require("./IIPMetrics");
/**
 * Copyright (c) 2023 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const KEEP_DATA = 4194304;
const DEFAULT_HEADER = {
  name: "Unnamed file",
  size: 0,
  width: "auto",
  height: "auto",
  preserveAspectRatio: 1,
  inline: 0
};
class IIPHandler {
  constructor(_opts, _renderer, _storage, _coreTerminal) {
    this._opts = _opts;
    this._renderer = _renderer;
    this._storage = _storage;
    this._coreTerminal = _coreTerminal;
    this._aborted = false;
    this._hp = new import_IIPHeaderParser.HeaderParser();
    this._header = DEFAULT_HEADER;
    this._dec = new import_Base64Decoder.default(KEEP_DATA);
    this._metrics = import_IIPMetrics.UNSUPPORTED_TYPE;
  }
  reset() {
  }
  start() {
    this._aborted = false;
    this._header = DEFAULT_HEADER;
    this._metrics = import_IIPMetrics.UNSUPPORTED_TYPE;
    this._hp.reset();
  }
  put(data, start, end) {
    if (this._aborted) return;
    if (this._hp.state === import_IIPHeaderParser.HeaderState.END) {
      if (this._dec.put(data, start, end)) {
        this._dec.release();
        this._aborted = true;
      }
    } else {
      const dataPos = this._hp.parse(data, start, end);
      if (dataPos === -1) {
        this._aborted = true;
        return;
      }
      if (dataPos > 0) {
        this._header = Object.assign({}, DEFAULT_HEADER, this._hp.fields);
        if (!this._header.inline || !this._header.size || this._header.size > this._opts.iipSizeLimit) {
          this._aborted = true;
          return;
        }
        this._dec.init(this._header.size);
        if (this._dec.put(data, dataPos, end)) {
          this._dec.release();
          this._aborted = true;
        }
      }
    }
  }
  end(success) {
    if (this._aborted) return true;
    let w = 0;
    let h = 0;
    let cond = true;
    if (cond = success) {
      if (cond = !this._dec.end()) {
        this._metrics = (0, import_IIPMetrics.imageType)(this._dec.data8);
        if (cond = this._metrics.mime !== "unsupported") {
          w = this._metrics.width;
          h = this._metrics.height;
          if (cond = w && h && w * h < this._opts.pixelLimit) {
            [w, h] = this._resize(w, h).map(Math.floor);
            cond = w && h && w * h < this._opts.pixelLimit;
          }
        }
      }
    }
    if (!cond) {
      this._dec.release();
      return true;
    }
    const blob = new Blob([this._dec.data8], { type: this._metrics.mime });
    this._dec.release();
    if (!window.createImageBitmap) {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      return new Promise((r) => {
        img.addEventListener("load", () => {
          URL.revokeObjectURL(url);
          const canvas = import_ImageRenderer.ImageRenderer.createCanvas(window.document, w, h);
          canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
          this._storage.addImage(canvas);
          r(true);
        });
        img.src = url;
        setTimeout(() => r(true), 1e3);
      });
    }
    return createImageBitmap(blob, { resizeWidth: w, resizeHeight: h }).then((bm) => {
      this._storage.addImage(bm);
      return true;
    });
  }
  _resize(w, h) {
    const cw = this._renderer.dimensions?.css.cell.width || import_ImageStorage.CELL_SIZE_DEFAULT.width;
    const ch = this._renderer.dimensions?.css.cell.height || import_ImageStorage.CELL_SIZE_DEFAULT.height;
    const width = this._renderer.dimensions?.css.canvas.width || cw * this._coreTerminal.cols;
    const height = this._renderer.dimensions?.css.canvas.height || ch * this._coreTerminal.rows;
    const rw = this._dim(this._header.width, width, cw);
    const rh = this._dim(this._header.height, height, ch);
    if (!rw && !rh) {
      const wf = width / w;
      const hf = (height - ch) / h;
      const f = Math.min(wf, hf);
      return f < 1 ? [w * f, h * f] : [w, h];
    }
    return !rw ? [w * rh / h, rh] : this._header.preserveAspectRatio || !rw || !rh ? [rw, h * rw / w] : [rw, rh];
  }
  _dim(s, total, cdim) {
    if (s === "auto") return 0;
    if (s.endsWith("%")) return parseInt(s.slice(0, -1)) * total / 100;
    if (s.endsWith("px")) return parseInt(s.slice(0, -2));
    return parseInt(s) * cdim;
  }
}
//# sourceMappingURL=IIPHandler.js.map
