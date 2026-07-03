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
var BufferSet_exports = {};
__export(BufferSet_exports, {
  BufferSet: () => BufferSet
});
module.exports = __toCommonJS(BufferSet_exports);
var import_lifecycle = require("vs/base/common/lifecycle");
var import_Buffer = require("common/buffer/Buffer");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class BufferSet extends import_lifecycle.Disposable {
  /**
   * Create a new BufferSet for the given terminal.
   */
  constructor(_optionsService, _bufferService) {
    super();
    this._optionsService = _optionsService;
    this._bufferService = _bufferService;
    this._onBufferActivate = this._register(new import_event.Emitter());
    this.onBufferActivate = this._onBufferActivate.event;
    this.reset();
    this._register(this._optionsService.onSpecificOptionChange("scrollback", () => this.resize(this._bufferService.cols, this._bufferService.rows)));
    this._register(this._optionsService.onSpecificOptionChange("tabStopWidth", () => this.setupTabStops()));
  }
  reset() {
    this._normal = new import_Buffer.Buffer(true, this._optionsService, this._bufferService);
    this._normal.fillViewportRows();
    this._alt = new import_Buffer.Buffer(false, this._optionsService, this._bufferService);
    this._activeBuffer = this._normal;
    this._onBufferActivate.fire({
      activeBuffer: this._normal,
      inactiveBuffer: this._alt
    });
    this.setupTabStops();
  }
  /**
   * Returns the alt Buffer of the BufferSet
   */
  get alt() {
    return this._alt;
  }
  /**
   * Returns the currently active Buffer of the BufferSet
   */
  get active() {
    return this._activeBuffer;
  }
  /**
   * Returns the normal Buffer of the BufferSet
   */
  get normal() {
    return this._normal;
  }
  /**
   * Sets the normal Buffer of the BufferSet as its currently active Buffer
   */
  activateNormalBuffer() {
    if (this._activeBuffer === this._normal) {
      return;
    }
    this._normal.x = this._alt.x;
    this._normal.y = this._alt.y;
    this._alt.clearAllMarkers();
    this._alt.clear();
    this._activeBuffer = this._normal;
    this._onBufferActivate.fire({
      activeBuffer: this._normal,
      inactiveBuffer: this._alt
    });
  }
  /**
   * Sets the alt Buffer of the BufferSet as its currently active Buffer
   */
  activateAltBuffer(fillAttr) {
    if (this._activeBuffer === this._alt) {
      return;
    }
    this._alt.fillViewportRows(fillAttr);
    this._alt.x = this._normal.x;
    this._alt.y = this._normal.y;
    this._activeBuffer = this._alt;
    this._onBufferActivate.fire({
      activeBuffer: this._alt,
      inactiveBuffer: this._normal
    });
  }
  /**
   * Resizes both normal and alt buffers, adjusting their data accordingly.
   * @param newCols The new number of columns.
   * @param newRows The new number of rows.
   */
  resize(newCols, newRows) {
    this._normal.resize(newCols, newRows);
    this._alt.resize(newCols, newRows);
    this.setupTabStops(newCols);
  }
  /**
   * Setup the tab stops.
   * @param i The index to start setting up tab stops from.
   */
  setupTabStops(i) {
    this._normal.setupTabStops(i);
    this._alt.setupTabStops(i);
  }
}
//# sourceMappingURL=BufferSet.js.map
