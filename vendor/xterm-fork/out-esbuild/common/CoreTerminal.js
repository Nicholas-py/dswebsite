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
var CoreTerminal_exports = {};
__export(CoreTerminal_exports, {
  CoreTerminal: () => CoreTerminal
});
module.exports = __toCommonJS(CoreTerminal_exports);
var import_Services = require("common/services/Services");
var import_InstantiationService = require("common/services/InstantiationService");
var import_LogService = require("common/services/LogService");
var import_BufferService = require("common/services/BufferService");
var import_OptionsService = require("common/services/OptionsService");
var import_CoreService = require("common/services/CoreService");
var import_CoreMouseService = require("common/services/CoreMouseService");
var import_UnicodeService = require("common/services/UnicodeService");
var import_CharsetService = require("common/services/CharsetService");
var import_WindowsMode = require("common/WindowsMode");
var import_InputHandler = require("common/InputHandler");
var import_WriteBuffer = require("common/input/WriteBuffer");
var import_OscLinkService = require("common/services/OscLinkService");
var import_event = require("vs/base/common/event");
var import_lifecycle = require("vs/base/common/lifecycle");
/**
 * Copyright (c) 2014-2020 The xterm.js authors. All rights reserved.
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
let hasWriteSyncWarnHappened = false;
class CoreTerminal extends import_lifecycle.Disposable {
  constructor(options) {
    super();
    this._windowsWrappingHeuristics = this._register(new import_lifecycle.MutableDisposable());
    this._onBinary = this._register(new import_event.Emitter());
    this.onBinary = this._onBinary.event;
    this._onData = this._register(new import_event.Emitter());
    this.onData = this._onData.event;
    this._onLineFeed = this._register(new import_event.Emitter());
    this.onLineFeed = this._onLineFeed.event;
    this._onResize = this._register(new import_event.Emitter());
    this.onResize = this._onResize.event;
    this._onWriteParsed = this._register(new import_event.Emitter());
    this.onWriteParsed = this._onWriteParsed.event;
    this._onScroll = this._register(new import_event.Emitter());
    this._instantiationService = new import_InstantiationService.InstantiationService();
    this.optionsService = this._register(new import_OptionsService.OptionsService(options));
    this._instantiationService.setService(import_Services.IOptionsService, this.optionsService);
    this._bufferService = this._register(this._instantiationService.createInstance(import_BufferService.BufferService));
    this._instantiationService.setService(import_Services.IBufferService, this._bufferService);
    this._logService = this._register(this._instantiationService.createInstance(import_LogService.LogService));
    this._instantiationService.setService(import_Services.ILogService, this._logService);
    this.coreService = this._register(this._instantiationService.createInstance(import_CoreService.CoreService));
    this._instantiationService.setService(import_Services.ICoreService, this.coreService);
    this.coreMouseService = this._register(this._instantiationService.createInstance(import_CoreMouseService.CoreMouseService));
    this._instantiationService.setService(import_Services.ICoreMouseService, this.coreMouseService);
    this.unicodeService = this._register(this._instantiationService.createInstance(import_UnicodeService.UnicodeService));
    this._instantiationService.setService(import_Services.IUnicodeService, this.unicodeService);
    this._charsetService = this._instantiationService.createInstance(import_CharsetService.CharsetService);
    this._instantiationService.setService(import_Services.ICharsetService, this._charsetService);
    this._oscLinkService = this._instantiationService.createInstance(import_OscLinkService.OscLinkService);
    this._instantiationService.setService(import_Services.IOscLinkService, this._oscLinkService);
    this._inputHandler = this._register(new import_InputHandler.InputHandler(this._bufferService, this._charsetService, this.coreService, this._logService, this.optionsService, this._oscLinkService, this.coreMouseService, this.unicodeService));
    this._register(import_event.Event.forward(this._inputHandler.onLineFeed, this._onLineFeed));
    this._register(this._inputHandler);
    this._register(import_event.Event.forward(this._bufferService.onResize, this._onResize));
    this._register(import_event.Event.forward(this.coreService.onData, this._onData));
    this._register(import_event.Event.forward(this.coreService.onBinary, this._onBinary));
    this._register(this.coreService.onRequestScrollToBottom(() => this.scrollToBottom(true)));
    this._register(this.coreService.onUserInput(() => this._writeBuffer.handleUserInput()));
    this._register(this.optionsService.onMultipleOptionChange(["windowsMode", "windowsPty"], () => this._handleWindowsPtyOptionChange()));
    this._register(this._bufferService.onScroll(() => {
      this._onScroll.fire({ position: this._bufferService.buffer.ydisp });
      this._inputHandler.markRangeDirty(this._bufferService.buffer.scrollTop, this._bufferService.buffer.scrollBottom);
    }));
    this._writeBuffer = this._register(new import_WriteBuffer.WriteBuffer((data, promiseResult) => this._inputHandler.parse(data, promiseResult)));
    this._register(import_event.Event.forward(this._writeBuffer.onWriteParsed, this._onWriteParsed));
  }
  get onScroll() {
    if (!this._onScrollApi) {
      this._onScrollApi = this._register(new import_event.Emitter());
      this._onScroll.event((ev) => {
        this._onScrollApi?.fire(ev.position);
      });
    }
    return this._onScrollApi.event;
  }
  get cols() {
    return this._bufferService.cols;
  }
  get rows() {
    return this._bufferService.rows;
  }
  get buffers() {
    return this._bufferService.buffers;
  }
  get options() {
    return this.optionsService.options;
  }
  set options(options) {
    for (const key in options) {
      this.optionsService.options[key] = options[key];
    }
  }
  write(data, callback) {
    this._writeBuffer.write(data, callback);
  }
  /**
   * Write data to terminal synchonously.
   *
   * This method is unreliable with async parser handlers, thus should not
   * be used anymore. If you need blocking semantics on data input consider
   * `write` with a callback instead.
   *
   * @deprecated Unreliable, will be removed soon.
   */
  writeSync(data, maxSubsequentCalls) {
    if (this._logService.logLevel <= import_Services.LogLevelEnum.WARN && !hasWriteSyncWarnHappened) {
      this._logService.warn("writeSync is unreliable and will be removed soon.");
      hasWriteSyncWarnHappened = true;
    }
    this._writeBuffer.writeSync(data, maxSubsequentCalls);
  }
  input(data, wasUserInput = true) {
    this.coreService.triggerDataEvent(data, wasUserInput);
  }
  resize(x, y) {
    if (isNaN(x) || isNaN(y)) {
      return;
    }
    x = Math.max(x, import_BufferService.MINIMUM_COLS);
    y = Math.max(y, import_BufferService.MINIMUM_ROWS);
    this._bufferService.resize(x, y);
  }
  /**
   * Scroll the terminal down 1 row, creating a blank line.
   * @param eraseAttr The attribute data to use the for blank line.
   * @param isWrapped Whether the new line is wrapped from the previous line.
   */
  scroll(eraseAttr, isWrapped = false) {
    this._bufferService.scroll(eraseAttr, isWrapped);
  }
  /**
   * Scroll the display of the terminal
   * @param disp The number of lines to scroll down (negative scroll up).
   * @param suppressScrollEvent Don't emit the scroll event as scrollLines. This is used to avoid
   * unwanted events being handled by the viewport when the event was triggered from the viewport
   * originally.
   */
  scrollLines(disp, suppressScrollEvent) {
    this._bufferService.scrollLines(disp, suppressScrollEvent);
  }
  scrollPages(pageCount) {
    this.scrollLines(pageCount * (this.rows - 1));
  }
  scrollToTop() {
    this.scrollLines(-this._bufferService.buffer.ydisp);
  }
  scrollToBottom(disableSmoothScroll) {
    this.scrollLines(this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
  }
  scrollToLine(line) {
    const scrollAmount = line - this._bufferService.buffer.ydisp;
    if (scrollAmount !== 0) {
      this.scrollLines(scrollAmount);
    }
  }
  /** Add handler for ESC escape sequence. See xterm.d.ts for details. */
  registerEscHandler(id, callback) {
    return this._inputHandler.registerEscHandler(id, callback);
  }
  /** Add handler for DCS escape sequence. See xterm.d.ts for details. */
  registerDcsHandler(id, callback) {
    return this._inputHandler.registerDcsHandler(id, callback);
  }
  /** Add handler for CSI escape sequence. See xterm.d.ts for details. */
  registerCsiHandler(id, callback) {
    return this._inputHandler.registerCsiHandler(id, callback);
  }
  /** Add handler for OSC escape sequence. See xterm.d.ts for details. */
  registerOscHandler(ident, callback) {
    return this._inputHandler.registerOscHandler(ident, callback);
  }
  _setup() {
    this._handleWindowsPtyOptionChange();
  }
  reset() {
    this._inputHandler.reset();
    this._bufferService.reset();
    this._charsetService.reset();
    this.coreService.reset();
    this.coreMouseService.reset();
  }
  _handleWindowsPtyOptionChange() {
    let value = false;
    const windowsPty = this.optionsService.rawOptions.windowsPty;
    if (windowsPty && windowsPty.buildNumber !== void 0 && windowsPty.buildNumber !== void 0) {
      value = !!(windowsPty.backend === "conpty" && windowsPty.buildNumber < 21376);
    } else if (this.optionsService.rawOptions.windowsMode) {
      value = true;
    }
    if (value) {
      this._enableWindowsWrappingHeuristics();
    } else {
      this._windowsWrappingHeuristics.clear();
    }
  }
  _enableWindowsWrappingHeuristics() {
    if (!this._windowsWrappingHeuristics.value) {
      const disposables = [];
      disposables.push(this.onLineFeed(import_WindowsMode.updateWindowsModeWrappedState.bind(null, this._bufferService)));
      disposables.push(this.registerCsiHandler({ final: "H" }, () => {
        (0, import_WindowsMode.updateWindowsModeWrappedState)(this._bufferService);
        return false;
      }));
      this._windowsWrappingHeuristics.value = (0, import_lifecycle.toDisposable)(() => {
        for (const d of disposables) {
          d.dispose();
        }
      });
    }
  }
}
//# sourceMappingURL=CoreTerminal.js.map
