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
var Terminal_exports = {};
__export(Terminal_exports, {
  Terminal: () => Terminal
});
module.exports = __toCommonJS(Terminal_exports);
var import_BufferLine = require("common/buffer/BufferLine");
var import_CoreTerminal = require("common/CoreTerminal");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2014 The xterm.js authors. All rights reserved.
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * @license MIT
 *
 * Originally forked from (with the author's permission):
 *   Fabrice Bellard's javascript vt100 for jslinux:
 *   http://bellard.org/jslinux/
 *   Copyright (c) 2011 Fabrice Bellard
 *   The original design remains. The terminal itself
 *   has been extended to include xterm CSI codes, among
 *   other features.
 *
 * Terminal Emulation References:
 *   http://vt100.net/
 *   http://invisible-island.net/xterm/ctlseqs/ctlseqs.txt
 *   http://invisible-island.net/xterm/ctlseqs/ctlseqs.html
 *   http://invisible-island.net/vttest/
 *   http://www.inwap.com/pdp10/ansicode.txt
 *   http://linux.die.net/man/4/console_codes
 *   http://linux.die.net/man/7/urxvt
 */
class Terminal extends import_CoreTerminal.CoreTerminal {
  constructor(options = {}) {
    super(options);
    this._onBell = this._register(new import_event.Emitter());
    this.onBell = this._onBell.event;
    this._onCursorMove = this._register(new import_event.Emitter());
    this.onCursorMove = this._onCursorMove.event;
    this._onTitleChange = this._register(new import_event.Emitter());
    this.onTitleChange = this._onTitleChange.event;
    this._onA11yCharEmitter = this._register(new import_event.Emitter());
    this.onA11yChar = this._onA11yCharEmitter.event;
    this._onA11yTabEmitter = this._register(new import_event.Emitter());
    this.onA11yTab = this._onA11yTabEmitter.event;
    this._setup();
    this._register(this._inputHandler.onRequestBell(() => this.bell()));
    this._register(this._inputHandler.onRequestReset(() => this.reset()));
    this._register(import_event.Event.forward(this._inputHandler.onCursorMove, this._onCursorMove));
    this._register(import_event.Event.forward(this._inputHandler.onTitleChange, this._onTitleChange));
    this._register(import_event.Event.forward(this._inputHandler.onA11yChar, this._onA11yCharEmitter));
    this._register(import_event.Event.forward(this._inputHandler.onA11yTab, this._onA11yTabEmitter));
  }
  /**
   * Convenience property to active buffer.
   */
  get buffer() {
    return this.buffers.active;
  }
  // TODO: Support paste here?
  get markers() {
    return this.buffer.markers;
  }
  addMarker(cursorYOffset) {
    if (this.buffer !== this.buffers.normal) {
      return;
    }
    return this.buffer.addMarker(this.buffer.ybase + this.buffer.y + cursorYOffset);
  }
  bell() {
    this._onBell.fire();
  }
  input(data, wasUserInput = true) {
    this.coreService.triggerDataEvent(data, wasUserInput);
  }
  /**
   * Resizes the terminal.
   *
   * @param x The number of columns to resize to.
   * @param y The number of rows to resize to.
   */
  resize(x, y) {
    if (x === this.cols && y === this.rows) {
      return;
    }
    super.resize(x, y);
  }
  /**
   * Clear the entire buffer, making the prompt line the new first line.
   */
  clear() {
    if (this.buffer.ybase === 0 && this.buffer.y === 0) {
      return;
    }
    this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y));
    this.buffer.lines.length = 1;
    this.buffer.ydisp = 0;
    this.buffer.ybase = 0;
    this.buffer.y = 0;
    for (let i = 1; i < this.rows; i++) {
      this.buffer.lines.push(this.buffer.getBlankLine(import_BufferLine.DEFAULT_ATTR_DATA));
    }
    this._onScroll.fire({ position: this.buffer.ydisp });
  }
  /**
   * Reset terminal.
   * Note: Calling this directly from JS is synchronous but does not clear
   * input buffers and does not reset the parser, thus the terminal will
   * continue to apply pending input data.
   * If you need in band reset (synchronous with input data) consider
   * using DECSTR (soft reset, CSI ! p) or RIS instead (hard reset, ESC c).
   */
  reset() {
    this.options.rows = this.rows;
    this.options.cols = this.cols;
    this._setup();
    super.reset();
  }
}
//# sourceMappingURL=Terminal.js.map
