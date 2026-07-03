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
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
var InputHandler_exports = {};
__export(InputHandler_exports, {
  InputHandler: () => InputHandler,
  WindowsOptionsReportType: () => WindowsOptionsReportType,
  isValidColorIndex: () => isValidColorIndex
});
module.exports = __toCommonJS(InputHandler_exports);
var import_Types = require("common/Types");
var import_EscapeSequences = require("common/data/EscapeSequences");
var import_Charsets = require("common/data/Charsets");
var import_EscapeSequenceParser = require("common/parser/EscapeSequenceParser");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_TextDecoder = require("common/input/TextDecoder");
var import_BufferLine = require("common/buffer/BufferLine");
var import_Constants = require("common/buffer/Constants");
var import_CellData = require("common/buffer/CellData");
var import_AttributeData = require("common/buffer/AttributeData");
var import_Services = require("common/services/Services");
var import_UnicodeService = require("common/services/UnicodeService");
var import_OscParser = require("common/parser/OscParser");
var import_DcsParser = require("common/parser/DcsParser");
var import_XParseColor = require("common/input/XParseColor");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2014 The xterm.js authors. All rights reserved.
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * @license MIT
 */
const GLEVEL = { "(": 0, ")": 1, "*": 2, "+": 3, "-": 1, ".": 2 };
const MAX_PARSEBUFFER_LENGTH = 131072;
const STACK_LIMIT = 10;
function paramToWindowOption(n, opts) {
  if (n > 24) {
    return opts.setWinLines || false;
  }
  switch (n) {
    case 1:
      return !!opts.restoreWin;
    case 2:
      return !!opts.minimizeWin;
    case 3:
      return !!opts.setWinPosition;
    case 4:
      return !!opts.setWinSizePixels;
    case 5:
      return !!opts.raiseWin;
    case 6:
      return !!opts.lowerWin;
    case 7:
      return !!opts.refreshWin;
    case 8:
      return !!opts.setWinSizeChars;
    case 9:
      return !!opts.maximizeWin;
    case 10:
      return !!opts.fullscreenWin;
    case 11:
      return !!opts.getWinState;
    case 13:
      return !!opts.getWinPosition;
    case 14:
      return !!opts.getWinSizePixels;
    case 15:
      return !!opts.getScreenSizePixels;
    case 16:
      return !!opts.getCellSizePixels;
    case 18:
      return !!opts.getWinSizeChars;
    case 19:
      return !!opts.getScreenSizeChars;
    case 20:
      return !!opts.getIconTitle;
    case 21:
      return !!opts.getWinTitle;
    case 22:
      return !!opts.pushTitle;
    case 23:
      return !!opts.popTitle;
    case 24:
      return !!opts.setWinLines;
  }
  return false;
}
var WindowsOptionsReportType = /* @__PURE__ */ ((WindowsOptionsReportType2) => {
  WindowsOptionsReportType2[WindowsOptionsReportType2["GET_WIN_SIZE_PIXELS"] = 0] = "GET_WIN_SIZE_PIXELS";
  WindowsOptionsReportType2[WindowsOptionsReportType2["GET_CELL_SIZE_PIXELS"] = 1] = "GET_CELL_SIZE_PIXELS";
  return WindowsOptionsReportType2;
})(WindowsOptionsReportType || {});
const SLOW_ASYNC_LIMIT = 5e3;
let $temp = 0;
class InputHandler extends import_lifecycle.Disposable {
  constructor(_bufferService, _charsetService, _coreService, _logService, _optionsService, _oscLinkService, _coreMouseService, _unicodeService, _parser = new import_EscapeSequenceParser.EscapeSequenceParser()) {
    super();
    this._bufferService = _bufferService;
    this._charsetService = _charsetService;
    this._coreService = _coreService;
    this._logService = _logService;
    this._optionsService = _optionsService;
    this._oscLinkService = _oscLinkService;
    this._coreMouseService = _coreMouseService;
    this._unicodeService = _unicodeService;
    this._parser = _parser;
    this._parseBuffer = new Uint32Array(4096);
    this._stringDecoder = new import_TextDecoder.StringToUtf32();
    this._utf8Decoder = new import_TextDecoder.Utf8ToUtf32();
    this._windowTitle = "";
    this._iconName = "";
    this._windowTitleStack = [];
    this._iconNameStack = [];
    this._curAttrData = import_BufferLine.DEFAULT_ATTR_DATA.clone();
    this._eraseAttrDataInternal = import_BufferLine.DEFAULT_ATTR_DATA.clone();
    this._onRequestBell = this._register(new import_event.Emitter());
    this.onRequestBell = this._onRequestBell.event;
    this._onRequestRefreshRows = this._register(new import_event.Emitter());
    this.onRequestRefreshRows = this._onRequestRefreshRows.event;
    this._onRequestReset = this._register(new import_event.Emitter());
    this.onRequestReset = this._onRequestReset.event;
    this._onRequestSendFocus = this._register(new import_event.Emitter());
    this.onRequestSendFocus = this._onRequestSendFocus.event;
    this._onRequestSyncScrollBar = this._register(new import_event.Emitter());
    this.onRequestSyncScrollBar = this._onRequestSyncScrollBar.event;
    this._onRequestWindowsOptionsReport = this._register(new import_event.Emitter());
    this.onRequestWindowsOptionsReport = this._onRequestWindowsOptionsReport.event;
    this._onA11yChar = this._register(new import_event.Emitter());
    this.onA11yChar = this._onA11yChar.event;
    this._onA11yTab = this._register(new import_event.Emitter());
    this.onA11yTab = this._onA11yTab.event;
    this._onCursorMove = this._register(new import_event.Emitter());
    this.onCursorMove = this._onCursorMove.event;
    this._onLineFeed = this._register(new import_event.Emitter());
    this.onLineFeed = this._onLineFeed.event;
    this._onScroll = this._register(new import_event.Emitter());
    this.onScroll = this._onScroll.event;
    this._onTitleChange = this._register(new import_event.Emitter());
    this.onTitleChange = this._onTitleChange.event;
    this._onColor = this._register(new import_event.Emitter());
    this.onColor = this._onColor.event;
    this._parseStack = {
      paused: false,
      cursorStartX: 0,
      cursorStartY: 0,
      decodedLength: 0,
      position: 0
    };
    // special colors - OSC 10 | 11 | 12
    this._specialColors = [import_Types.SpecialColorIndex.FOREGROUND, import_Types.SpecialColorIndex.BACKGROUND, import_Types.SpecialColorIndex.CURSOR];
    this._register(this._parser);
    this._dirtyRowTracker = new DirtyRowTracker(this._bufferService);
    this._activeBuffer = this._bufferService.buffer;
    this._register(this._bufferService.buffers.onBufferActivate((e) => this._activeBuffer = e.activeBuffer));
    this._parser.setCsiHandlerFallback((ident, params) => {
      this._logService.debug("Unknown CSI code: ", { identifier: this._parser.identToString(ident), params: params.toArray() });
    });
    this._parser.setEscHandlerFallback((ident) => {
      this._logService.debug("Unknown ESC code: ", { identifier: this._parser.identToString(ident) });
    });
    this._parser.setExecuteHandlerFallback((code) => {
      this._logService.debug("Unknown EXECUTE code: ", { code });
    });
    this._parser.setOscHandlerFallback((identifier, action, data) => {
      this._logService.debug("Unknown OSC code: ", { identifier, action, data });
    });
    this._parser.setDcsHandlerFallback((ident, action, payload) => {
      if (action === "HOOK") {
        payload = payload.toArray();
      }
      this._logService.debug("Unknown DCS code: ", { identifier: this._parser.identToString(ident), action, payload });
    });
    this._parser.setPrintHandler((data, start, end) => this.print(data, start, end));
    this._parser.registerCsiHandler({ final: "@" }, (params) => this.insertChars(params));
    this._parser.registerCsiHandler({ intermediates: " ", final: "@" }, (params) => this.scrollLeft(params));
    this._parser.registerCsiHandler({ final: "A" }, (params) => this.cursorUp(params));
    this._parser.registerCsiHandler({ intermediates: " ", final: "A" }, (params) => this.scrollRight(params));
    this._parser.registerCsiHandler({ final: "B" }, (params) => this.cursorDown(params));
    this._parser.registerCsiHandler({ final: "C" }, (params) => this.cursorForward(params));
    this._parser.registerCsiHandler({ final: "D" }, (params) => this.cursorBackward(params));
    this._parser.registerCsiHandler({ final: "E" }, (params) => this.cursorNextLine(params));
    this._parser.registerCsiHandler({ final: "F" }, (params) => this.cursorPrecedingLine(params));
    this._parser.registerCsiHandler({ final: "G" }, (params) => this.cursorCharAbsolute(params));
    this._parser.registerCsiHandler({ final: "H" }, (params) => this.cursorPosition(params));
    this._parser.registerCsiHandler({ final: "I" }, (params) => this.cursorForwardTab(params));
    this._parser.registerCsiHandler({ final: "J" }, (params) => this.eraseInDisplay(params, false));
    this._parser.registerCsiHandler({ prefix: "?", final: "J" }, (params) => this.eraseInDisplay(params, true));
    this._parser.registerCsiHandler({ final: "K" }, (params) => this.eraseInLine(params, false));
    this._parser.registerCsiHandler({ prefix: "?", final: "K" }, (params) => this.eraseInLine(params, true));
    this._parser.registerCsiHandler({ final: "L" }, (params) => this.insertLines(params));
    this._parser.registerCsiHandler({ final: "M" }, (params) => this.deleteLines(params));
    this._parser.registerCsiHandler({ final: "P" }, (params) => this.deleteChars(params));
    this._parser.registerCsiHandler({ final: "S" }, (params) => this.scrollUp(params));
    this._parser.registerCsiHandler({ final: "T" }, (params) => this.scrollDown(params));
    this._parser.registerCsiHandler({ final: "X" }, (params) => this.eraseChars(params));
    this._parser.registerCsiHandler({ final: "Z" }, (params) => this.cursorBackwardTab(params));
    this._parser.registerCsiHandler({ final: "`" }, (params) => this.charPosAbsolute(params));
    this._parser.registerCsiHandler({ final: "a" }, (params) => this.hPositionRelative(params));
    this._parser.registerCsiHandler({ final: "b" }, (params) => this.repeatPrecedingCharacter(params));
    this._parser.registerCsiHandler({ final: "c" }, (params) => this.sendDeviceAttributesPrimary(params));
    this._parser.registerCsiHandler({ prefix: ">", final: "c" }, (params) => this.sendDeviceAttributesSecondary(params));
    this._parser.registerCsiHandler({ final: "d" }, (params) => this.linePosAbsolute(params));
    this._parser.registerCsiHandler({ final: "e" }, (params) => this.vPositionRelative(params));
    this._parser.registerCsiHandler({ final: "f" }, (params) => this.hVPosition(params));
    this._parser.registerCsiHandler({ final: "g" }, (params) => this.tabClear(params));
    this._parser.registerCsiHandler({ final: "h" }, (params) => this.setMode(params));
    this._parser.registerCsiHandler({ prefix: "?", final: "h" }, (params) => this.setModePrivate(params));
    this._parser.registerCsiHandler({ final: "l" }, (params) => this.resetMode(params));
    this._parser.registerCsiHandler({ prefix: "?", final: "l" }, (params) => this.resetModePrivate(params));
    this._parser.registerCsiHandler({ final: "m" }, (params) => this.charAttributes(params));
    this._parser.registerCsiHandler({ final: "n" }, (params) => this.deviceStatus(params));
    this._parser.registerCsiHandler({ prefix: "?", final: "n" }, (params) => this.deviceStatusPrivate(params));
    this._parser.registerCsiHandler({ intermediates: "!", final: "p" }, (params) => this.softReset(params));
    this._parser.registerCsiHandler({ intermediates: " ", final: "q" }, (params) => this.setCursorStyle(params));
    this._parser.registerCsiHandler({ final: "r" }, (params) => this.setScrollRegion(params));
    this._parser.registerCsiHandler({ final: "s" }, (params) => this.saveCursor(params));
    this._parser.registerCsiHandler({ final: "t" }, (params) => this.windowOptions(params));
    this._parser.registerCsiHandler({ final: "u" }, (params) => this.restoreCursor(params));
    this._parser.registerCsiHandler({ intermediates: "'", final: "}" }, (params) => this.insertColumns(params));
    this._parser.registerCsiHandler({ intermediates: "'", final: "~" }, (params) => this.deleteColumns(params));
    this._parser.registerCsiHandler({ intermediates: '"', final: "q" }, (params) => this.selectProtected(params));
    this._parser.registerCsiHandler({ intermediates: "$", final: "p" }, (params) => this.requestMode(params, true));
    this._parser.registerCsiHandler({ prefix: "?", intermediates: "$", final: "p" }, (params) => this.requestMode(params, false));
    this._parser.setExecuteHandler(import_EscapeSequences.C0.BEL, () => this.bell());
    this._parser.setExecuteHandler(import_EscapeSequences.C0.LF, () => this.lineFeed());
    this._parser.setExecuteHandler(import_EscapeSequences.C0.VT, () => this.lineFeed());
    this._parser.setExecuteHandler(import_EscapeSequences.C0.FF, () => this.lineFeed());
    this._parser.setExecuteHandler(import_EscapeSequences.C0.CR, () => this.carriageReturn());
    this._parser.setExecuteHandler(import_EscapeSequences.C0.BS, () => this.backspace());
    this._parser.setExecuteHandler(import_EscapeSequences.C0.HT, () => this.tab());
    this._parser.setExecuteHandler(import_EscapeSequences.C0.SO, () => this.shiftOut());
    this._parser.setExecuteHandler(import_EscapeSequences.C0.SI, () => this.shiftIn());
    this._parser.setExecuteHandler(import_EscapeSequences.C1.IND, () => this.index());
    this._parser.setExecuteHandler(import_EscapeSequences.C1.NEL, () => this.nextLine());
    this._parser.setExecuteHandler(import_EscapeSequences.C1.HTS, () => this.tabSet());
    this._parser.registerOscHandler(0, new import_OscParser.OscHandler((data) => {
      this.setTitle(data);
      this.setIconName(data);
      return true;
    }));
    this._parser.registerOscHandler(1, new import_OscParser.OscHandler((data) => this.setIconName(data)));
    this._parser.registerOscHandler(2, new import_OscParser.OscHandler((data) => this.setTitle(data)));
    this._parser.registerOscHandler(4, new import_OscParser.OscHandler((data) => this.setOrReportIndexedColor(data)));
    this._parser.registerOscHandler(8, new import_OscParser.OscHandler((data) => this.setHyperlink(data)));
    this._parser.registerOscHandler(10, new import_OscParser.OscHandler((data) => this.setOrReportFgColor(data)));
    this._parser.registerOscHandler(11, new import_OscParser.OscHandler((data) => this.setOrReportBgColor(data)));
    this._parser.registerOscHandler(12, new import_OscParser.OscHandler((data) => this.setOrReportCursorColor(data)));
    this._parser.registerOscHandler(104, new import_OscParser.OscHandler((data) => this.restoreIndexedColor(data)));
    this._parser.registerOscHandler(110, new import_OscParser.OscHandler((data) => this.restoreFgColor(data)));
    this._parser.registerOscHandler(111, new import_OscParser.OscHandler((data) => this.restoreBgColor(data)));
    this._parser.registerOscHandler(112, new import_OscParser.OscHandler((data) => this.restoreCursorColor(data)));
    this._parser.registerEscHandler({ final: "7" }, () => this.saveCursor());
    this._parser.registerEscHandler({ final: "8" }, () => this.restoreCursor());
    this._parser.registerEscHandler({ final: "D" }, () => this.index());
    this._parser.registerEscHandler({ final: "E" }, () => this.nextLine());
    this._parser.registerEscHandler({ final: "H" }, () => this.tabSet());
    this._parser.registerEscHandler({ final: "M" }, () => this.reverseIndex());
    this._parser.registerEscHandler({ final: "=" }, () => this.keypadApplicationMode());
    this._parser.registerEscHandler({ final: ">" }, () => this.keypadNumericMode());
    this._parser.registerEscHandler({ final: "c" }, () => this.fullReset());
    this._parser.registerEscHandler({ final: "n" }, () => this.setgLevel(2));
    this._parser.registerEscHandler({ final: "o" }, () => this.setgLevel(3));
    this._parser.registerEscHandler({ final: "|" }, () => this.setgLevel(3));
    this._parser.registerEscHandler({ final: "}" }, () => this.setgLevel(2));
    this._parser.registerEscHandler({ final: "~" }, () => this.setgLevel(1));
    this._parser.registerEscHandler({ intermediates: "%", final: "@" }, () => this.selectDefaultCharset());
    this._parser.registerEscHandler({ intermediates: "%", final: "G" }, () => this.selectDefaultCharset());
    for (const flag in import_Charsets.CHARSETS) {
      this._parser.registerEscHandler({ intermediates: "(", final: flag }, () => this.selectCharset("(" + flag));
      this._parser.registerEscHandler({ intermediates: ")", final: flag }, () => this.selectCharset(")" + flag));
      this._parser.registerEscHandler({ intermediates: "*", final: flag }, () => this.selectCharset("*" + flag));
      this._parser.registerEscHandler({ intermediates: "+", final: flag }, () => this.selectCharset("+" + flag));
      this._parser.registerEscHandler({ intermediates: "-", final: flag }, () => this.selectCharset("-" + flag));
      this._parser.registerEscHandler({ intermediates: ".", final: flag }, () => this.selectCharset("." + flag));
      this._parser.registerEscHandler({ intermediates: "/", final: flag }, () => this.selectCharset("/" + flag));
    }
    this._parser.registerEscHandler({ intermediates: "#", final: "8" }, () => this.screenAlignmentPattern());
    this._parser.setErrorHandler((state) => {
      this._logService.error("Parsing error: ", state);
      return state;
    });
    this._parser.registerDcsHandler({ intermediates: "$", final: "q" }, new import_DcsParser.DcsHandler((data, params) => this.requestStatusString(data, params)));
  }
  getAttrData() {
    return this._curAttrData;
  }
  /**
   * Async parse support.
   */
  _preserveStack(cursorStartX, cursorStartY, decodedLength, position) {
    this._parseStack.paused = true;
    this._parseStack.cursorStartX = cursorStartX;
    this._parseStack.cursorStartY = cursorStartY;
    this._parseStack.decodedLength = decodedLength;
    this._parseStack.position = position;
  }
  _logSlowResolvingAsync(p) {
    if (this._logService.logLevel <= import_Services.LogLevelEnum.WARN) {
      Promise.race([p, new Promise((res, rej) => setTimeout(() => rej("#SLOW_TIMEOUT"), SLOW_ASYNC_LIMIT))]).catch((err) => {
        if (err !== "#SLOW_TIMEOUT") {
          throw err;
        }
        console.warn(`async parser handler taking longer than ${SLOW_ASYNC_LIMIT} ms`);
      });
    }
  }
  _getCurrentLinkId() {
    return this._curAttrData.extended.urlId;
  }
  /**
   * Parse call with async handler support.
   *
   * Whether the stack state got preserved for the next call, is indicated by the return value:
   * - undefined (void):
   *   all handlers were sync, no stack save, continue normally with next chunk
   * - Promise\<boolean\>:
   *   execution stopped at async handler, stack saved, continue with same chunk and the promise
   *   resolve value as `promiseResult` until the method returns `undefined`
   *
   * Note: This method should only be called by `Terminal.write` to ensure correct execution order
   * and proper continuation of async parser handlers.
   */
  parse(data, promiseResult) {
    let result;
    let cursorStartX = this._activeBuffer.x;
    let cursorStartY = this._activeBuffer.y;
    let start = 0;
    const wasPaused = this._parseStack.paused;
    if (wasPaused) {
      if (result = this._parser.parse(this._parseBuffer, this._parseStack.decodedLength, promiseResult)) {
        this._logSlowResolvingAsync(result);
        return result;
      }
      cursorStartX = this._parseStack.cursorStartX;
      cursorStartY = this._parseStack.cursorStartY;
      this._parseStack.paused = false;
      if (data.length > MAX_PARSEBUFFER_LENGTH) {
        start = this._parseStack.position + MAX_PARSEBUFFER_LENGTH;
      }
    }
    if (this._logService.logLevel <= import_Services.LogLevelEnum.DEBUG) {
      this._logService.debug(
        `parsing data${typeof data === "string" ? ` "${data}"` : ` "${Array.prototype.map.call(data, (e) => String.fromCharCode(e)).join("")}"`}`,
        typeof data === "string" ? data.split("").map((e) => e.charCodeAt(0)) : data
      );
    }
    if (this._parseBuffer.length < data.length) {
      if (this._parseBuffer.length < MAX_PARSEBUFFER_LENGTH) {
        this._parseBuffer = new Uint32Array(Math.min(data.length, MAX_PARSEBUFFER_LENGTH));
      }
    }
    if (!wasPaused) {
      this._dirtyRowTracker.clearRange();
    }
    if (data.length > MAX_PARSEBUFFER_LENGTH) {
      for (let i = start; i < data.length; i += MAX_PARSEBUFFER_LENGTH) {
        const end = i + MAX_PARSEBUFFER_LENGTH < data.length ? i + MAX_PARSEBUFFER_LENGTH : data.length;
        const len = typeof data === "string" ? this._stringDecoder.decode(data.substring(i, end), this._parseBuffer) : this._utf8Decoder.decode(data.subarray(i, end), this._parseBuffer);
        if (result = this._parser.parse(this._parseBuffer, len)) {
          this._preserveStack(cursorStartX, cursorStartY, len, i);
          this._logSlowResolvingAsync(result);
          return result;
        }
      }
    } else {
      if (!wasPaused) {
        const len = typeof data === "string" ? this._stringDecoder.decode(data, this._parseBuffer) : this._utf8Decoder.decode(data, this._parseBuffer);
        if (result = this._parser.parse(this._parseBuffer, len)) {
          this._preserveStack(cursorStartX, cursorStartY, len, 0);
          this._logSlowResolvingAsync(result);
          return result;
        }
      }
    }
    if (this._activeBuffer.x !== cursorStartX || this._activeBuffer.y !== cursorStartY) {
      this._onCursorMove.fire();
    }
    const viewportEnd = this._dirtyRowTracker.end + (this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
    const viewportStart = this._dirtyRowTracker.start + (this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
    if (viewportStart < this._bufferService.rows) {
      this._onRequestRefreshRows.fire({
        start: Math.min(viewportStart, this._bufferService.rows - 1),
        end: Math.min(viewportEnd, this._bufferService.rows - 1)
      });
    }
  }
  print(data, start, end) {
    let code;
    let chWidth;
    const charset = this._charsetService.charset;
    const screenReaderMode = this._optionsService.rawOptions.screenReaderMode;
    const cols = this._bufferService.cols;
    const wraparoundMode = this._coreService.decPrivateModes.wraparound;
    const insertMode = this._coreService.modes.insertMode;
    const curAttr = this._curAttrData;
    let bufferRow = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
    this._dirtyRowTracker.markDirty(this._activeBuffer.y);
    if (this._activeBuffer.x && end - start > 0 && bufferRow.getWidth(this._activeBuffer.x - 1) === 2) {
      bufferRow.setCellFromCodepoint(this._activeBuffer.x - 1, 0, 1, curAttr);
    }
    let precedingJoinState = this._parser.precedingJoinState;
    for (let pos = start; pos < end; ++pos) {
      code = data[pos];
      if (code < 127 && charset) {
        const ch = charset[String.fromCharCode(code)];
        if (ch) {
          code = ch.charCodeAt(0);
        }
      }
      const currentInfo = this._unicodeService.charProperties(code, precedingJoinState);
      chWidth = import_UnicodeService.UnicodeService.extractWidth(currentInfo);
      const shouldJoin = import_UnicodeService.UnicodeService.extractShouldJoin(currentInfo);
      const oldWidth = shouldJoin ? import_UnicodeService.UnicodeService.extractWidth(precedingJoinState) : 0;
      precedingJoinState = currentInfo;
      if (screenReaderMode) {
        this._onA11yChar.fire((0, import_TextDecoder.stringFromCodePoint)(code));
      }
      if (this._getCurrentLinkId()) {
        this._oscLinkService.addLineToLink(this._getCurrentLinkId(), this._activeBuffer.ybase + this._activeBuffer.y);
      }
      if (this._activeBuffer.x + chWidth - oldWidth > cols) {
        if (wraparoundMode) {
          const oldRow = bufferRow;
          let oldCol = this._activeBuffer.x - oldWidth;
          this._activeBuffer.x = oldWidth;
          this._activeBuffer.y++;
          if (this._activeBuffer.y === this._activeBuffer.scrollBottom + 1) {
            this._activeBuffer.y--;
            this._bufferService.scroll(this._eraseAttrData(), true);
          } else {
            if (this._activeBuffer.y >= this._bufferService.rows) {
              this._activeBuffer.y = this._bufferService.rows - 1;
            }
            this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = true;
          }
          bufferRow = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
          if (oldWidth > 0 && bufferRow instanceof import_BufferLine.BufferLine) {
            bufferRow.copyCellsFrom(
              oldRow,
              oldCol,
              0,
              oldWidth,
              false
            );
          }
          while (oldCol < cols) {
            oldRow.setCellFromCodepoint(oldCol++, 0, 1, curAttr);
          }
        } else {
          this._activeBuffer.x = cols - 1;
          if (chWidth === 2) {
            continue;
          }
        }
      }
      if (shouldJoin && this._activeBuffer.x) {
        const offset = bufferRow.getWidth(this._activeBuffer.x - 1) ? 1 : 2;
        bufferRow.addCodepointToCell(
          this._activeBuffer.x - offset,
          code,
          chWidth
        );
        for (let delta = chWidth - oldWidth; --delta >= 0; ) {
          bufferRow.setCellFromCodepoint(this._activeBuffer.x++, 0, 0, curAttr);
        }
        continue;
      }
      if (insertMode) {
        bufferRow.insertCells(this._activeBuffer.x, chWidth - oldWidth, this._activeBuffer.getNullCell(curAttr));
        if (bufferRow.getWidth(cols - 1) === 2) {
          bufferRow.setCellFromCodepoint(cols - 1, import_Constants.NULL_CELL_CODE, import_Constants.NULL_CELL_WIDTH, curAttr);
        }
      }
      bufferRow.setCellFromCodepoint(this._activeBuffer.x++, code, chWidth, curAttr);
      if (chWidth > 0) {
        while (--chWidth) {
          bufferRow.setCellFromCodepoint(this._activeBuffer.x++, 0, 0, curAttr);
        }
      }
    }
    this._parser.precedingJoinState = precedingJoinState;
    if (this._activeBuffer.x < cols && end - start > 0 && bufferRow.getWidth(this._activeBuffer.x) === 0 && !bufferRow.hasContent(this._activeBuffer.x)) {
      bufferRow.setCellFromCodepoint(this._activeBuffer.x, 0, 1, curAttr);
    }
    this._dirtyRowTracker.markDirty(this._activeBuffer.y);
  }
  /**
   * Forward registerCsiHandler from parser.
   */
  registerCsiHandler(id, callback) {
    if (id.final === "t" && !id.prefix && !id.intermediates) {
      return this._parser.registerCsiHandler(id, (params) => {
        if (!paramToWindowOption(params.params[0], this._optionsService.rawOptions.windowOptions)) {
          return true;
        }
        return callback(params);
      });
    }
    return this._parser.registerCsiHandler(id, callback);
  }
  /**
   * Forward registerDcsHandler from parser.
   */
  registerDcsHandler(id, callback) {
    return this._parser.registerDcsHandler(id, new import_DcsParser.DcsHandler(callback));
  }
  /**
   * Forward registerEscHandler from parser.
   */
  registerEscHandler(id, callback) {
    return this._parser.registerEscHandler(id, callback);
  }
  /**
   * Forward registerOscHandler from parser.
   */
  registerOscHandler(ident, callback) {
    return this._parser.registerOscHandler(ident, new import_OscParser.OscHandler(callback));
  }
  /**
   * BEL
   * Bell (Ctrl-G).
   *
   * @vt: #Y   C0    BEL   "Bell"  "\a, \x07"  "Ring the bell."
   * The behavior of the bell is further customizable with `ITerminalOptions.bellStyle`
   * and `ITerminalOptions.bellSound`.
   */
  bell() {
    this._onRequestBell.fire();
    return true;
  }
  /**
   * LF
   * Line Feed or New Line (NL).  (LF  is Ctrl-J).
   *
   * @vt: #Y   C0    LF   "Line Feed"            "\n, \x0A"  "Move the cursor one row down, scrolling if needed."
   * Scrolling is restricted to scroll margins and will only happen on the bottom line.
   *
   * @vt: #Y   C0    VT   "Vertical Tabulation"  "\v, \x0B"  "Treated as LF."
   * @vt: #Y   C0    FF   "Form Feed"            "\f, \x0C"  "Treated as LF."
   */
  lineFeed() {
    this._dirtyRowTracker.markDirty(this._activeBuffer.y);
    if (this._optionsService.rawOptions.convertEol) {
      this._activeBuffer.x = 0;
    }
    this._activeBuffer.y++;
    if (this._activeBuffer.y === this._activeBuffer.scrollBottom + 1) {
      this._activeBuffer.y--;
      this._bufferService.scroll(this._eraseAttrData());
    } else if (this._activeBuffer.y >= this._bufferService.rows) {
      this._activeBuffer.y = this._bufferService.rows - 1;
    } else {
      this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = false;
    }
    if (this._activeBuffer.x >= this._bufferService.cols) {
      this._activeBuffer.x--;
    }
    this._dirtyRowTracker.markDirty(this._activeBuffer.y);
    this._onLineFeed.fire();
    return true;
  }
  /**
   * CR
   * Carriage Return (Ctrl-M).
   *
   * @vt: #Y   C0    CR   "Carriage Return"  "\r, \x0D"  "Move the cursor to the beginning of the row."
   */
  carriageReturn() {
    this._activeBuffer.x = 0;
    return true;
  }
  /**
   * BS
   * Backspace (Ctrl-H).
   *
   * @vt: #Y   C0    BS   "Backspace"  "\b, \x08"  "Move the cursor one position to the left."
   * By default it is not possible to move the cursor past the leftmost position.
   * If `reverse wrap-around` (`CSI ? 45 h`) is set, a previous soft line wrap (DECAWM)
   * can be undone with BS within the scroll margins. In that case the cursor will wrap back
   * to the end of the previous row. Note that it is not possible to peek back into the scrollbuffer
   * with the cursor, thus at the home position (top-leftmost cell) this has no effect.
   */
  backspace() {
    if (!this._coreService.decPrivateModes.reverseWraparound) {
      this._restrictCursor();
      if (this._activeBuffer.x > 0) {
        this._activeBuffer.x--;
      }
      return true;
    }
    this._restrictCursor(this._bufferService.cols);
    if (this._activeBuffer.x > 0) {
      this._activeBuffer.x--;
    } else {
      if (this._activeBuffer.x === 0 && this._activeBuffer.y > this._activeBuffer.scrollTop && this._activeBuffer.y <= this._activeBuffer.scrollBottom && this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y)?.isWrapped) {
        this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = false;
        this._activeBuffer.y--;
        this._activeBuffer.x = this._bufferService.cols - 1;
        const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
        if (line.hasWidth(this._activeBuffer.x) && !line.hasContent(this._activeBuffer.x)) {
          this._activeBuffer.x--;
        }
      }
    }
    this._restrictCursor();
    return true;
  }
  /**
   * TAB
   * Horizontal Tab (HT) (Ctrl-I).
   *
   * @vt: #Y   C0    HT   "Horizontal Tabulation"  "\t, \x09"  "Move the cursor to the next character tab stop."
   */
  tab() {
    if (this._activeBuffer.x >= this._bufferService.cols) {
      return true;
    }
    const originalX = this._activeBuffer.x;
    this._activeBuffer.x = this._activeBuffer.nextStop();
    if (this._optionsService.rawOptions.screenReaderMode) {
      this._onA11yTab.fire(this._activeBuffer.x - originalX);
    }
    return true;
  }
  /**
   * SO
   * Shift Out (Ctrl-N) -> Switch to Alternate Character Set.  This invokes the
   * G1 character set.
   *
   * @vt: #P[Only limited ISO-2022 charset support.]  C0    SO   "Shift Out"  "\x0E"  "Switch to an alternative character set."
   */
  shiftOut() {
    this._charsetService.setgLevel(1);
    return true;
  }
  /**
   * SI
   * Shift In (Ctrl-O) -> Switch to Standard Character Set.  This invokes the G0
   * character set (the default).
   *
   * @vt: #Y   C0    SI   "Shift In"   "\x0F"  "Return to regular character set after Shift Out."
   */
  shiftIn() {
    this._charsetService.setgLevel(0);
    return true;
  }
  /**
   * Restrict cursor to viewport size / scroll margin (origin mode).
   */
  _restrictCursor(maxCol = this._bufferService.cols - 1) {
    this._activeBuffer.x = Math.min(maxCol, Math.max(0, this._activeBuffer.x));
    this._activeBuffer.y = this._coreService.decPrivateModes.origin ? Math.min(this._activeBuffer.scrollBottom, Math.max(this._activeBuffer.scrollTop, this._activeBuffer.y)) : Math.min(this._bufferService.rows - 1, Math.max(0, this._activeBuffer.y));
    this._dirtyRowTracker.markDirty(this._activeBuffer.y);
  }
  /**
   * Set absolute cursor position.
   */
  _setCursor(x, y) {
    this._dirtyRowTracker.markDirty(this._activeBuffer.y);
    if (this._coreService.decPrivateModes.origin) {
      this._activeBuffer.x = x;
      this._activeBuffer.y = this._activeBuffer.scrollTop + y;
    } else {
      this._activeBuffer.x = x;
      this._activeBuffer.y = y;
    }
    this._restrictCursor();
    this._dirtyRowTracker.markDirty(this._activeBuffer.y);
  }
  /**
   * Set relative cursor position.
   */
  _moveCursor(x, y) {
    this._restrictCursor();
    this._setCursor(this._activeBuffer.x + x, this._activeBuffer.y + y);
  }
  /**
   * CSI Ps A
   * Cursor Up Ps Times (default = 1) (CUU).
   *
   * @vt: #Y CSI CUU   "Cursor Up"   "CSI Ps A"  "Move cursor `Ps` times up (default=1)."
   * If the cursor would pass the top scroll margin, it will stop there.
   */
  cursorUp(params) {
    const diffToTop = this._activeBuffer.y - this._activeBuffer.scrollTop;
    if (diffToTop >= 0) {
      this._moveCursor(0, -Math.min(diffToTop, params.params[0] || 1));
    } else {
      this._moveCursor(0, -(params.params[0] || 1));
    }
    return true;
  }
  /**
   * CSI Ps B
   * Cursor Down Ps Times (default = 1) (CUD).
   *
   * @vt: #Y CSI CUD   "Cursor Down"   "CSI Ps B"  "Move cursor `Ps` times down (default=1)."
   * If the cursor would pass the bottom scroll margin, it will stop there.
   */
  cursorDown(params) {
    const diffToBottom = this._activeBuffer.scrollBottom - this._activeBuffer.y;
    if (diffToBottom >= 0) {
      this._moveCursor(0, Math.min(diffToBottom, params.params[0] || 1));
    } else {
      this._moveCursor(0, params.params[0] || 1);
    }
    return true;
  }
  /**
   * CSI Ps C
   * Cursor Forward Ps Times (default = 1) (CUF).
   *
   * @vt: #Y CSI CUF   "Cursor Forward"    "CSI Ps C"  "Move cursor `Ps` times forward (default=1)."
   */
  cursorForward(params) {
    this._moveCursor(params.params[0] || 1, 0);
    return true;
  }
  /**
   * CSI Ps D
   * Cursor Backward Ps Times (default = 1) (CUB).
   *
   * @vt: #Y CSI CUB   "Cursor Backward"   "CSI Ps D"  "Move cursor `Ps` times backward (default=1)."
   */
  cursorBackward(params) {
    this._moveCursor(-(params.params[0] || 1), 0);
    return true;
  }
  /**
   * CSI Ps E
   * Cursor Next Line Ps Times (default = 1) (CNL).
   * Other than cursorDown (CUD) also set the cursor to first column.
   *
   * @vt: #Y CSI CNL   "Cursor Next Line"  "CSI Ps E"  "Move cursor `Ps` times down (default=1) and to the first column."
   * Same as CUD, additionally places the cursor at the first column.
   */
  cursorNextLine(params) {
    this.cursorDown(params);
    this._activeBuffer.x = 0;
    return true;
  }
  /**
   * CSI Ps F
   * Cursor Previous Line Ps Times (default = 1) (CPL).
   * Other than cursorUp (CUU) also set the cursor to first column.
   *
   * @vt: #Y CSI CPL   "Cursor Backward"   "CSI Ps F"  "Move cursor `Ps` times up (default=1) and to the first column."
   * Same as CUU, additionally places the cursor at the first column.
   */
  cursorPrecedingLine(params) {
    this.cursorUp(params);
    this._activeBuffer.x = 0;
    return true;
  }
  /**
   * CSI Ps G
   * Cursor Character Absolute  [column] (default = [row,1]) (CHA).
   *
   * @vt: #Y CSI CHA   "Cursor Horizontal Absolute" "CSI Ps G" "Move cursor to `Ps`-th column of the active row (default=1)."
   */
  cursorCharAbsolute(params) {
    this._setCursor((params.params[0] || 1) - 1, this._activeBuffer.y);
    return true;
  }
  /**
   * CSI Ps ; Ps H
   * Cursor Position [row;column] (default = [1,1]) (CUP).
   *
   * @vt: #Y CSI CUP   "Cursor Position"   "CSI Ps ; Ps H"  "Set cursor to position [`Ps`, `Ps`] (default = [1, 1])."
   * If ORIGIN mode is set, places the cursor to the absolute position within the scroll margins.
   * If ORIGIN mode is not set, places the cursor to the absolute position within the viewport.
   * Note that the coordinates are 1-based, thus the top left position starts at `1 ; 1`.
   */
  cursorPosition(params) {
    this._setCursor(
      // col
      params.length >= 2 ? (params.params[1] || 1) - 1 : 0,
      // row
      (params.params[0] || 1) - 1
    );
    return true;
  }
  /**
   * CSI Pm `  Character Position Absolute
   *   [column] (default = [row,1]) (HPA).
   * Currently same functionality as CHA.
   *
   * @vt: #Y CSI HPA   "Horizontal Position Absolute"  "CSI Ps ` " "Same as CHA."
   */
  charPosAbsolute(params) {
    this._setCursor((params.params[0] || 1) - 1, this._activeBuffer.y);
    return true;
  }
  /**
   * CSI Pm a  Character Position Relative
   *   [columns] (default = [row,col+1]) (HPR)
   *
   * @vt: #Y CSI HPR   "Horizontal Position Relative"  "CSI Ps a"  "Same as CUF."
   */
  hPositionRelative(params) {
    this._moveCursor(params.params[0] || 1, 0);
    return true;
  }
  /**
   * CSI Pm d  Vertical Position Absolute (VPA)
   *   [row] (default = [1,column])
   *
   * @vt: #Y CSI VPA   "Vertical Position Absolute"    "CSI Ps d"  "Move cursor to `Ps`-th row (default=1)."
   */
  linePosAbsolute(params) {
    this._setCursor(this._activeBuffer.x, (params.params[0] || 1) - 1);
    return true;
  }
  /**
   * CSI Pm e  Vertical Position Relative (VPR)
   *   [rows] (default = [row+1,column])
   * reuse CSI Ps B ?
   *
   * @vt: #Y CSI VPR   "Vertical Position Relative"    "CSI Ps e"  "Move cursor `Ps` times down (default=1)."
   */
  vPositionRelative(params) {
    this._moveCursor(0, params.params[0] || 1);
    return true;
  }
  /**
   * CSI Ps ; Ps f
   *   Horizontal and Vertical Position [row;column] (default =
   *   [1,1]) (HVP).
   *   Same as CUP.
   *
   * @vt: #Y CSI HVP   "Horizontal and Vertical Position" "CSI Ps ; Ps f"  "Same as CUP."
   */
  hVPosition(params) {
    this.cursorPosition(params);
    return true;
  }
  /**
   * CSI Ps g  Tab Clear (TBC).
   *     Ps = 0  -> Clear Current Column (default).
   *     Ps = 3  -> Clear All.
   * Potentially:
   *   Ps = 2  -> Clear Stops on Line.
   *   http://vt100.net/annarbor/aaa-ug/section6.html
   *
   * @vt: #Y CSI TBC   "Tab Clear" "CSI Ps g"  "Clear tab stops at current position (0) or all (3) (default=0)."
   * Clearing tabstops off the active row (Ps = 2, VT100) is currently not supported.
   */
  tabClear(params) {
    const param = params.params[0];
    if (param === 0) {
      delete this._activeBuffer.tabs[this._activeBuffer.x];
    } else if (param === 3) {
      this._activeBuffer.tabs = {};
    }
    return true;
  }
  /**
   * CSI Ps I
   *   Cursor Forward Tabulation Ps tab stops (default = 1) (CHT).
   *
   * @vt: #Y CSI CHT   "Cursor Horizontal Tabulation" "CSI Ps I" "Move cursor `Ps` times tabs forward (default=1)."
   */
  cursorForwardTab(params) {
    if (this._activeBuffer.x >= this._bufferService.cols) {
      return true;
    }
    let param = params.params[0] || 1;
    while (param--) {
      this._activeBuffer.x = this._activeBuffer.nextStop();
    }
    return true;
  }
  /**
   * CSI Ps Z  Cursor Backward Tabulation Ps tab stops (default = 1) (CBT).
   *
   * @vt: #Y CSI CBT   "Cursor Backward Tabulation"  "CSI Ps Z"  "Move cursor `Ps` tabs backward (default=1)."
   */
  cursorBackwardTab(params) {
    if (this._activeBuffer.x >= this._bufferService.cols) {
      return true;
    }
    let param = params.params[0] || 1;
    while (param--) {
      this._activeBuffer.x = this._activeBuffer.prevStop();
    }
    return true;
  }
  /**
   * CSI Ps " q  Select Character Protection Attribute (DECSCA).
   *
   * @vt: #Y CSI DECSCA   "Select Character Protection Attribute"  "CSI Ps " q"  "Whether DECSED and DECSEL can erase (0=default, 2) or not (1)."
   */
  selectProtected(params) {
    const p = params.params[0];
    if (p === 1) this._curAttrData.bg |= import_Constants.BgFlags.PROTECTED;
    if (p === 2 || p === 0) this._curAttrData.bg &= ~import_Constants.BgFlags.PROTECTED;
    return true;
  }
  /**
   * Helper method to erase cells in a terminal row.
   * The cell gets replaced with the eraseChar of the terminal.
   * @param y The row index relative to the viewport.
   * @param start The start x index of the range to be erased.
   * @param end The end x index of the range to be erased (exclusive).
   * @param clearWrap clear the isWrapped flag
   * @param respectProtect Whether to respect the protection attribute (DECSCA).
   */
  _eraseInBufferLine(y, start, end, clearWrap = false, respectProtect = false) {
    const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + y);
    line.replaceCells(
      start,
      end,
      this._activeBuffer.getNullCell(this._eraseAttrData()),
      respectProtect
    );
    if (clearWrap) {
      line.isWrapped = false;
    }
  }
  /**
   * Helper method to reset cells in a terminal row. The cell gets replaced with the eraseChar of
   * the terminal and the isWrapped property is set to false.
   * @param y row index
   */
  _resetBufferLine(y, respectProtect = false) {
    const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + y);
    if (line) {
      line.fill(this._activeBuffer.getNullCell(this._eraseAttrData()), respectProtect);
      this._bufferService.buffer.clearMarkers(this._activeBuffer.ybase + y);
      line.isWrapped = false;
    }
  }
  /**
   * CSI Ps J  Erase in Display (ED).
   *     Ps = 0  -> Erase Below (default).
   *     Ps = 1  -> Erase Above.
   *     Ps = 2  -> Erase All.
   *     Ps = 3  -> Erase Saved Lines (xterm).
   * CSI ? Ps J
   *   Erase in Display (DECSED).
   *     Ps = 0  -> Selective Erase Below (default).
   *     Ps = 1  -> Selective Erase Above.
   *     Ps = 2  -> Selective Erase All.
   *
   * @vt: #Y CSI ED  "Erase In Display"  "CSI Ps J"  "Erase various parts of the viewport."
   * Supported param values:
   *
   * | Ps | Effect                                                       |
   * | -- | ------------------------------------------------------------ |
   * | 0  | Erase from the cursor through the end of the viewport.       |
   * | 1  | Erase from the beginning of the viewport through the cursor. |
   * | 2  | Erase complete viewport.                                     |
   * | 3  | Erase scrollback.                                            |
   *
   * @vt: #Y CSI DECSED   "Selective Erase In Display"  "CSI ? Ps J"  "Same as ED with respecting protection flag."
   */
  eraseInDisplay(params, respectProtect = false) {
    this._restrictCursor(this._bufferService.cols);
    let j;
    switch (params.params[0]) {
      case 0:
        j = this._activeBuffer.y;
        this._dirtyRowTracker.markDirty(j);
        this._eraseInBufferLine(j++, this._activeBuffer.x, this._bufferService.cols, this._activeBuffer.x === 0, respectProtect);
        for (; j < this._bufferService.rows; j++) {
          this._resetBufferLine(j, respectProtect);
        }
        this._dirtyRowTracker.markDirty(j);
        break;
      case 1:
        j = this._activeBuffer.y;
        this._dirtyRowTracker.markDirty(j);
        this._eraseInBufferLine(j, 0, this._activeBuffer.x + 1, true, respectProtect);
        if (this._activeBuffer.x + 1 >= this._bufferService.cols) {
          this._activeBuffer.lines.get(j + 1).isWrapped = false;
        }
        while (j--) {
          this._resetBufferLine(j, respectProtect);
        }
        this._dirtyRowTracker.markDirty(0);
        break;
      case 2:
        j = this._bufferService.rows;
        this._dirtyRowTracker.markDirty(j - 1);
        while (j--) {
          this._resetBufferLine(j, respectProtect);
        }
        this._dirtyRowTracker.markDirty(0);
        break;
      case 3:
        const scrollBackSize = this._activeBuffer.lines.length - this._bufferService.rows;
        if (scrollBackSize > 0) {
          this._activeBuffer.lines.trimStart(scrollBackSize);
          this._activeBuffer.ybase = Math.max(this._activeBuffer.ybase - scrollBackSize, 0);
          this._activeBuffer.ydisp = Math.max(this._activeBuffer.ydisp - scrollBackSize, 0);
          this._onScroll.fire(0);
        }
        break;
    }
    return true;
  }
  /**
   * CSI Ps K  Erase in Line (EL).
   *     Ps = 0  -> Erase to Right (default).
   *     Ps = 1  -> Erase to Left.
   *     Ps = 2  -> Erase All.
   * CSI ? Ps K
   *   Erase in Line (DECSEL).
   *     Ps = 0  -> Selective Erase to Right (default).
   *     Ps = 1  -> Selective Erase to Left.
   *     Ps = 2  -> Selective Erase All.
   *
   * @vt: #Y CSI EL    "Erase In Line"  "CSI Ps K"  "Erase various parts of the active row."
   * Supported param values:
   *
   * | Ps | Effect                                                   |
   * | -- | -------------------------------------------------------- |
   * | 0  | Erase from the cursor through the end of the row.        |
   * | 1  | Erase from the beginning of the line through the cursor. |
   * | 2  | Erase complete line.                                     |
   *
   * @vt: #Y CSI DECSEL   "Selective Erase In Line"  "CSI ? Ps K"  "Same as EL with respecting protecting flag."
   */
  eraseInLine(params, respectProtect = false) {
    this._restrictCursor(this._bufferService.cols);
    switch (params.params[0]) {
      case 0:
        this._eraseInBufferLine(this._activeBuffer.y, this._activeBuffer.x, this._bufferService.cols, this._activeBuffer.x === 0, respectProtect);
        break;
      case 1:
        this._eraseInBufferLine(this._activeBuffer.y, 0, this._activeBuffer.x + 1, false, respectProtect);
        break;
      case 2:
        this._eraseInBufferLine(this._activeBuffer.y, 0, this._bufferService.cols, true, respectProtect);
        break;
    }
    this._dirtyRowTracker.markDirty(this._activeBuffer.y);
    return true;
  }
  /**
   * CSI Ps L
   * Insert Ps Line(s) (default = 1) (IL).
   *
   * @vt: #Y CSI IL  "Insert Line"   "CSI Ps L"  "Insert `Ps` blank lines at active row (default=1)."
   * For every inserted line at the scroll top one line at the scroll bottom gets removed.
   * The cursor is set to the first column.
   * IL has no effect if the cursor is outside the scroll margins.
   */
  insertLines(params) {
    this._restrictCursor();
    let param = params.params[0] || 1;
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) {
      return true;
    }
    const row = this._activeBuffer.ybase + this._activeBuffer.y;
    const scrollBottomRowsOffset = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom;
    const scrollBottomAbsolute = this._bufferService.rows - 1 + this._activeBuffer.ybase - scrollBottomRowsOffset + 1;
    while (param--) {
      this._activeBuffer.lines.splice(scrollBottomAbsolute - 1, 1);
      this._activeBuffer.lines.splice(row, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
    }
    this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom);
    this._activeBuffer.x = 0;
    return true;
  }
  /**
   * CSI Ps M
   * Delete Ps Line(s) (default = 1) (DL).
   *
   * @vt: #Y CSI DL  "Delete Line"   "CSI Ps M"  "Delete `Ps` lines at active row (default=1)."
   * For every deleted line at the scroll top one blank line at the scroll bottom gets appended.
   * The cursor is set to the first column.
   * DL has no effect if the cursor is outside the scroll margins.
   */
  deleteLines(params) {
    this._restrictCursor();
    let param = params.params[0] || 1;
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) {
      return true;
    }
    const row = this._activeBuffer.ybase + this._activeBuffer.y;
    let j;
    j = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom;
    j = this._bufferService.rows - 1 + this._activeBuffer.ybase - j;
    while (param--) {
      this._activeBuffer.lines.splice(row, 1);
      this._activeBuffer.lines.splice(j, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
    }
    this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom);
    this._activeBuffer.x = 0;
    return true;
  }
  /**
   * CSI Ps @
   * Insert Ps (Blank) Character(s) (default = 1) (ICH).
   *
   * @vt: #Y CSI ICH  "Insert Characters"   "CSI Ps @"  "Insert `Ps` (blank) characters (default = 1)."
   * The ICH sequence inserts `Ps` blank characters. The cursor remains at the beginning of the
   * blank characters. Text between the cursor and right margin moves to the right. Characters moved
   * past the right margin are lost.
   *
   *
   * FIXME: check against xterm - should not work outside of scroll margins (see VT520 manual)
   */
  insertChars(params) {
    this._restrictCursor();
    const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
    if (line) {
      line.insertCells(
        this._activeBuffer.x,
        params.params[0] || 1,
        this._activeBuffer.getNullCell(this._eraseAttrData())
      );
      this._dirtyRowTracker.markDirty(this._activeBuffer.y);
    }
    return true;
  }
  /**
   * CSI Ps P
   * Delete Ps Character(s) (default = 1) (DCH).
   *
   * @vt: #Y CSI DCH   "Delete Character"  "CSI Ps P"  "Delete `Ps` characters (default=1)."
   * As characters are deleted, the remaining characters between the cursor and right margin move to
   * the left. Character attributes move with the characters. The terminal adds blank characters at
   * the right margin.
   *
   *
   * FIXME: check against xterm - should not work outside of scroll margins (see VT520 manual)
   */
  deleteChars(params) {
    this._restrictCursor();
    const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
    if (line) {
      line.deleteCells(
        this._activeBuffer.x,
        params.params[0] || 1,
        this._activeBuffer.getNullCell(this._eraseAttrData())
      );
      this._dirtyRowTracker.markDirty(this._activeBuffer.y);
    }
    return true;
  }
  /**
   * CSI Ps S  Scroll up Ps lines (default = 1) (SU).
   *
   * @vt: #Y CSI SU  "Scroll Up"   "CSI Ps S"  "Scroll `Ps` lines up (default=1)."
   *
   *
   * FIXME: scrolled out lines at top = 1 should add to scrollback (xterm)
   */
  scrollUp(params) {
    let param = params.params[0] || 1;
    while (param--) {
      this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 1);
      this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
    }
    this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
    return true;
  }
  /**
   * CSI Ps T  Scroll down Ps lines (default = 1) (SD).
   *
   * @vt: #Y CSI SD  "Scroll Down"   "CSI Ps T"  "Scroll `Ps` lines down (default=1)."
   */
  scrollDown(params) {
    let param = params.params[0] || 1;
    while (param--) {
      this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 1);
      this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 0, this._activeBuffer.getBlankLine(import_BufferLine.DEFAULT_ATTR_DATA));
    }
    this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
    return true;
  }
  /**
   * CSI Ps SP @  Scroll left Ps columns (default = 1) (SL) ECMA-48
   *
   * Notation: (Pn)
   * Representation: CSI Pn 02/00 04/00
   * Parameter default value: Pn = 1
   * SL causes the data in the presentation component to be moved by n character positions
   * if the line orientation is horizontal, or by n line positions if the line orientation
   * is vertical, such that the data appear to move to the left; where n equals the value of Pn.
   * The active presentation position is not affected by this control function.
   *
   * Supported:
   *   - always left shift (no line orientation setting respected)
   *
   * @vt: #Y CSI SL  "Scroll Left" "CSI Ps SP @" "Scroll viewport `Ps` times to the left."
   * SL moves the content of all lines within the scroll margins `Ps` times to the left.
   * SL has no effect outside of the scroll margins.
   */
  scrollLeft(params) {
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) {
      return true;
    }
    const param = params.params[0] || 1;
    for (let y = this._activeBuffer.scrollTop; y <= this._activeBuffer.scrollBottom; ++y) {
      const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + y);
      line.deleteCells(0, param, this._activeBuffer.getNullCell(this._eraseAttrData()));
      line.isWrapped = false;
    }
    this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
    return true;
  }
  /**
   * CSI Ps SP A  Scroll right Ps columns (default = 1) (SR) ECMA-48
   *
   * Notation: (Pn)
   * Representation: CSI Pn 02/00 04/01
   * Parameter default value: Pn = 1
   * SR causes the data in the presentation component to be moved by n character positions
   * if the line orientation is horizontal, or by n line positions if the line orientation
   * is vertical, such that the data appear to move to the right; where n equals the value of Pn.
   * The active presentation position is not affected by this control function.
   *
   * Supported:
   *   - always right shift (no line orientation setting respected)
   *
   * @vt: #Y CSI SR  "Scroll Right"  "CSI Ps SP A"   "Scroll viewport `Ps` times to the right."
   * SL moves the content of all lines within the scroll margins `Ps` times to the right.
   * Content at the right margin is lost.
   * SL has no effect outside of the scroll margins.
   */
  scrollRight(params) {
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) {
      return true;
    }
    const param = params.params[0] || 1;
    for (let y = this._activeBuffer.scrollTop; y <= this._activeBuffer.scrollBottom; ++y) {
      const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + y);
      line.insertCells(0, param, this._activeBuffer.getNullCell(this._eraseAttrData()));
      line.isWrapped = false;
    }
    this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
    return true;
  }
  /**
   * CSI Pm ' }
   * Insert Ps Column(s) (default = 1) (DECIC), VT420 and up.
   *
   * @vt: #Y CSI DECIC "Insert Columns"  "CSI Ps ' }"  "Insert `Ps` columns at cursor position."
   * DECIC inserts `Ps` times blank columns at the cursor position for all lines with the scroll
   * margins, moving content to the right. Content at the right margin is lost. DECIC has no effect
   * outside the scrolling margins.
   */
  insertColumns(params) {
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) {
      return true;
    }
    const param = params.params[0] || 1;
    for (let y = this._activeBuffer.scrollTop; y <= this._activeBuffer.scrollBottom; ++y) {
      const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + y);
      line.insertCells(this._activeBuffer.x, param, this._activeBuffer.getNullCell(this._eraseAttrData()));
      line.isWrapped = false;
    }
    this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
    return true;
  }
  /**
   * CSI Pm ' ~
   * Delete Ps Column(s) (default = 1) (DECDC), VT420 and up.
   *
   * @vt: #Y CSI DECDC "Delete Columns"  "CSI Ps ' ~"  "Delete `Ps` columns at cursor position."
   * DECDC deletes `Ps` times columns at the cursor position for all lines with the scroll margins,
   * moving content to the left. Blank columns are added at the right margin.
   * DECDC has no effect outside the scrolling margins.
   */
  deleteColumns(params) {
    if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) {
      return true;
    }
    const param = params.params[0] || 1;
    for (let y = this._activeBuffer.scrollTop; y <= this._activeBuffer.scrollBottom; ++y) {
      const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + y);
      line.deleteCells(this._activeBuffer.x, param, this._activeBuffer.getNullCell(this._eraseAttrData()));
      line.isWrapped = false;
    }
    this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
    return true;
  }
  /**
   * CSI Ps X
   * Erase Ps Character(s) (default = 1) (ECH).
   *
   * @vt: #Y CSI ECH   "Erase Character"   "CSI Ps X"  "Erase `Ps` characters from current cursor position to the right (default=1)."
   * ED erases `Ps` characters from current cursor position to the right.
   * ED works inside or outside the scrolling margins.
   */
  eraseChars(params) {
    this._restrictCursor();
    const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
    if (line) {
      line.replaceCells(
        this._activeBuffer.x,
        this._activeBuffer.x + (params.params[0] || 1),
        this._activeBuffer.getNullCell(this._eraseAttrData())
      );
      this._dirtyRowTracker.markDirty(this._activeBuffer.y);
    }
    return true;
  }
  /**
   * CSI Ps b  Repeat the preceding graphic character Ps times (REP).
   * From ECMA 48 (@see http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-048.pdf)
   *    Notation: (Pn)
   *    Representation: CSI Pn 06/02
   *    Parameter default value: Pn = 1
   *    REP is used to indicate that the preceding character in the data stream,
   *    if it is a graphic character (represented by one or more bit combinations) including SPACE,
   *    is to be repeated n times, where n equals the value of Pn.
   *    If the character preceding REP is a control function or part of a control function,
   *    the effect of REP is not defined by this Standard.
   *
   * We extend xterm's behavior to allow repeating entire grapheme clusters.
   * This isn't 100% xterm-compatible, but it seems saner and more useful.
   *    - text attrs are applied normally
   *    - wrap around is respected
   *    - any valid sequence resets the carried forward char
   *
   * Note: To get reset on a valid sequence working correctly without much runtime penalty, the
   * preceding codepoint is stored on the parser in `this.print` and reset during `parser.parse`.
   *
   * @vt: #Y CSI REP   "Repeat Preceding Character"    "CSI Ps b"  "Repeat preceding character `Ps` times (default=1)."
   * REP repeats the previous character `Ps` times advancing the cursor, also wrapping if DECAWM is
   * set. REP has no effect if the sequence does not follow a printable ASCII character
   * (NOOP for any other sequence in between or NON ASCII characters).
   */
  repeatPrecedingCharacter(params) {
    const joinState = this._parser.precedingJoinState;
    if (!joinState) {
      return true;
    }
    const length = params.params[0] || 1;
    const chWidth = import_UnicodeService.UnicodeService.extractWidth(joinState);
    const x = this._activeBuffer.x - chWidth;
    const bufferRow = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
    const text = bufferRow.getString(x);
    const data = new Uint32Array(text.length * length);
    let idata = 0;
    for (let itext = 0; itext < text.length; ) {
      const ch = text.codePointAt(itext) || 0;
      data[idata++] = ch;
      itext += ch > 65535 ? 2 : 1;
    }
    let tlength = idata;
    for (let i = 1; i < length; ++i) {
      data.copyWithin(tlength, 0, idata);
      tlength += idata;
    }
    this.print(data, 0, tlength);
    return true;
  }
  /**
   * CSI Ps c  Send Device Attributes (Primary DA).
   *     Ps = 0  or omitted -> request attributes from terminal.  The
   *     response depends on the decTerminalID resource setting.
   *     -> CSI ? 1 ; 2 c  (``VT100 with Advanced Video Option'')
   *     -> CSI ? 1 ; 0 c  (``VT101 with No Options'')
   *     -> CSI ? 6 c  (``VT102'')
   *     -> CSI ? 6 0 ; 1 ; 2 ; 6 ; 8 ; 9 ; 1 5 ; c  (``VT220'')
   *   The VT100-style response parameters do not mean anything by
   *   themselves.  VT220 parameters do, telling the host what fea-
   *   tures the terminal supports:
   *     Ps = 1  -> 132-columns.
   *     Ps = 2  -> Printer.
   *     Ps = 6  -> Selective erase.
   *     Ps = 8  -> User-defined keys.
   *     Ps = 9  -> National replacement character sets.
   *     Ps = 1 5  -> Technical characters.
   *     Ps = 2 2  -> ANSI color, e.g., VT525.
   *     Ps = 2 9  -> ANSI text locator (i.e., DEC Locator mode).
   *
   * @vt: #Y CSI DA1   "Primary Device Attributes"     "CSI c"  "Send primary device attributes."
   *
   *
   * TODO: fix and cleanup response
   */
  sendDeviceAttributesPrimary(params) {
    if (params.params[0] > 0) {
      return true;
    }
    if (this._is("xterm") || this._is("rxvt-unicode") || this._is("screen")) {
      this._coreService.triggerDataEvent(import_EscapeSequences.C0.ESC + "[?1;2c");
    } else if (this._is("linux")) {
      this._coreService.triggerDataEvent(import_EscapeSequences.C0.ESC + "[?6c");
    }
    return true;
  }
  /**
   * CSI > Ps c
   *   Send Device Attributes (Secondary DA).
   *     Ps = 0  or omitted -> request the terminal's identification
   *     code.  The response depends on the decTerminalID resource set-
   *     ting.  It should apply only to VT220 and up, but xterm extends
   *     this to VT100.
   *     -> CSI  > Pp ; Pv ; Pc c
   *   where Pp denotes the terminal type
   *     Pp = 0  -> ``VT100''.
   *     Pp = 1  -> ``VT220''.
   *   and Pv is the firmware version (for xterm, this was originally
   *   the XFree86 patch number, starting with 95).  In a DEC termi-
   *   nal, Pc indicates the ROM cartridge registration number and is
   *   always zero.
   * More information:
   *   xterm/charproc.c - line 2012, for more information.
   *   vim responds with ^[[?0c or ^[[?1c after the terminal's response (?)
   *
   * @vt: #Y CSI DA2   "Secondary Device Attributes"   "CSI > c" "Send primary device attributes."
   *
   *
   * TODO: fix and cleanup response
   */
  sendDeviceAttributesSecondary(params) {
    if (params.params[0] > 0) {
      return true;
    }
    if (this._is("xterm")) {
      this._coreService.triggerDataEvent(import_EscapeSequences.C0.ESC + "[>0;276;0c");
    } else if (this._is("rxvt-unicode")) {
      this._coreService.triggerDataEvent(import_EscapeSequences.C0.ESC + "[>85;95;0c");
    } else if (this._is("linux")) {
      this._coreService.triggerDataEvent(params.params[0] + "c");
    } else if (this._is("screen")) {
      this._coreService.triggerDataEvent(import_EscapeSequences.C0.ESC + "[>83;40003;0c");
    }
    return true;
  }
  /**
   * Evaluate if the current terminal is the given argument.
   * @param term The terminal name to evaluate
   */
  _is(term) {
    return (this._optionsService.rawOptions.termName + "").indexOf(term) === 0;
  }
  /**
   * CSI Pm h  Set Mode (SM).
   *     Ps = 2  -> Keyboard Action Mode (AM).
   *     Ps = 4  -> Insert Mode (IRM).
   *     Ps = 1 2  -> Send/receive (SRM).
   *     Ps = 2 0  -> Automatic Newline (LNM).
   *
   * @vt: #P[Only IRM is supported.]    CSI SM    "Set Mode"  "CSI Pm h"  "Set various terminal modes."
   * Supported param values by SM:
   *
   * | Param | Action                                 | Support |
   * | ----- | -------------------------------------- | ------- |
   * | 2     | Keyboard Action Mode (KAM). Always on. | #N      |
   * | 4     | Insert Mode (IRM).                     | #Y      |
   * | 12    | Send/receive (SRM). Always off.        | #N      |
   * | 20    | Automatic Newline (LNM).               | #Y      |
   */
  setMode(params) {
    for (let i = 0; i < params.length; i++) {
      switch (params.params[i]) {
        case 4:
          this._coreService.modes.insertMode = true;
          break;
        case 20:
          this._optionsService.options.convertEol = true;
          break;
      }
    }
    return true;
  }
  /**
   * CSI ? Pm h
   *   DEC Private Mode Set (DECSET).
   *     Ps = 1  -> Application Cursor Keys (DECCKM).
   *     Ps = 2  -> Designate USASCII for character sets G0-G3
   *     (DECANM), and set VT100 mode.
   *     Ps = 3  -> 132 Column Mode (DECCOLM).
   *     Ps = 4  -> Smooth (Slow) Scroll (DECSCLM).
   *     Ps = 5  -> Reverse Video (DECSCNM).
   *     Ps = 6  -> Origin Mode (DECOM).
   *     Ps = 7  -> Wraparound Mode (DECAWM).
   *     Ps = 8  -> Auto-repeat Keys (DECARM).
   *     Ps = 9  -> Send Mouse X & Y on button press.  See the sec-
   *     tion Mouse Tracking.
   *     Ps = 1 0  -> Show toolbar (rxvt).
   *     Ps = 1 2  -> Start Blinking Cursor (att610).
   *     Ps = 1 8  -> Print form feed (DECPFF).
   *     Ps = 1 9  -> Set print extent to full screen (DECPEX).
   *     Ps = 2 5  -> Show Cursor (DECTCEM).
   *     Ps = 3 0  -> Show scrollbar (rxvt).
   *     Ps = 3 5  -> Enable font-shifting functions (rxvt).
   *     Ps = 3 8  -> Enter Tektronix Mode (DECTEK).
   *     Ps = 4 0  -> Allow 80 -> 132 Mode.
   *     Ps = 4 1  -> more(1) fix (see curses resource).
   *     Ps = 4 2  -> Enable Nation Replacement Character sets (DECN-
   *     RCM).
   *     Ps = 4 4  -> Turn On Margin Bell.
   *     Ps = 4 5  -> Reverse-wraparound Mode.
   *     Ps = 4 6  -> Start Logging.  This is normally disabled by a
   *     compile-time option.
   *     Ps = 4 7  -> Use Alternate Screen Buffer.  (This may be dis-
   *     abled by the titeInhibit resource).
   *     Ps = 6 6  -> Application keypad (DECNKM).
   *     Ps = 6 7  -> Backarrow key sends backspace (DECBKM).
   *     Ps = 1 0 0 0  -> Send Mouse X & Y on button press and
   *     release.  See the section Mouse Tracking.
   *     Ps = 1 0 0 1  -> Use Hilite Mouse Tracking.
   *     Ps = 1 0 0 2  -> Use Cell Motion Mouse Tracking.
   *     Ps = 1 0 0 3  -> Use All Motion Mouse Tracking.
   *     Ps = 1 0 0 4  -> Send FocusIn/FocusOut events.
   *     Ps = 1 0 0 5  -> Enable Extended Mouse Mode.
   *     Ps = 1 0 1 0  -> Scroll to bottom on tty output (rxvt).
   *     Ps = 1 0 1 1  -> Scroll to bottom on key press (rxvt).
   *     Ps = 1 0 3 4  -> Interpret "meta" key, sets eighth bit.
   *     (enables the eightBitInput resource).
   *     Ps = 1 0 3 5  -> Enable special modifiers for Alt and Num-
   *     Lock keys.  (This enables the numLock resource).
   *     Ps = 1 0 3 6  -> Send ESC   when Meta modifies a key.  (This
   *     enables the metaSendsEscape resource).
   *     Ps = 1 0 3 7  -> Send DEL from the editing-keypad Delete
   *     key.
   *     Ps = 1 0 3 9  -> Send ESC  when Alt modifies a key.  (This
   *     enables the altSendsEscape resource).
   *     Ps = 1 0 4 0  -> Keep selection even if not highlighted.
   *     (This enables the keepSelection resource).
   *     Ps = 1 0 4 1  -> Use the CLIPBOARD selection.  (This enables
   *     the selectToClipboard resource).
   *     Ps = 1 0 4 2  -> Enable Urgency window manager hint when
   *     Control-G is received.  (This enables the bellIsUrgent
   *     resource).
   *     Ps = 1 0 4 3  -> Enable raising of the window when Control-G
   *     is received.  (enables the popOnBell resource).
   *     Ps = 1 0 4 7  -> Use Alternate Screen Buffer.  (This may be
   *     disabled by the titeInhibit resource).
   *     Ps = 1 0 4 8  -> Save cursor as in DECSC.  (This may be dis-
   *     abled by the titeInhibit resource).
   *     Ps = 1 0 4 9  -> Save cursor as in DECSC and use Alternate
   *     Screen Buffer, clearing it first.  (This may be disabled by
   *     the titeInhibit resource).  This combines the effects of the 1
   *     0 4 7  and 1 0 4 8  modes.  Use this with terminfo-based
   *     applications rather than the 4 7  mode.
   *     Ps = 1 0 5 0  -> Set terminfo/termcap function-key mode.
   *     Ps = 1 0 5 1  -> Set Sun function-key mode.
   *     Ps = 1 0 5 2  -> Set HP function-key mode.
   *     Ps = 1 0 5 3  -> Set SCO function-key mode.
   *     Ps = 1 0 6 0  -> Set legacy keyboard emulation (X11R6).
   *     Ps = 1 0 6 1  -> Set VT220 keyboard emulation.
   *     Ps = 2 0 0 4  -> Set bracketed paste mode.
   * Modes:
   *   http: *vt100.net/docs/vt220-rm/chapter4.html
   *
   * @vt: #P[See below for supported modes.]    CSI DECSET  "DEC Private Set Mode" "CSI ? Pm h"  "Set various terminal attributes."
   * Supported param values by DECSET:
   *
   * | param | Action                                                  | Support |
   * | ----- | ------------------------------------------------------- | --------|
   * | 1     | Application Cursor Keys (DECCKM).                       | #Y      |
   * | 2     | Designate US-ASCII for character sets G0-G3 (DECANM).   | #Y      |
   * | 3     | 132 Column Mode (DECCOLM).                              | #Y      |
   * | 6     | Origin Mode (DECOM).                                    | #Y      |
   * | 7     | Auto-wrap Mode (DECAWM).                                | #Y      |
   * | 8     | Auto-repeat Keys (DECARM). Always on.                   | #N      |
   * | 9     | X10 xterm mouse protocol.                               | #Y      |
   * | 12    | Start Blinking Cursor.                                  | #Y      |
   * | 25    | Show Cursor (DECTCEM).                                  | #Y      |
   * | 45    | Reverse wrap-around.                                    | #Y      |
   * | 47    | Use Alternate Screen Buffer.                            | #Y      |
   * | 66    | Application keypad (DECNKM).                            | #Y      |
   * | 1000  | X11 xterm mouse protocol.                               | #Y      |
   * | 1002  | Use Cell Motion Mouse Tracking.                         | #Y      |
   * | 1003  | Use All Motion Mouse Tracking.                          | #Y      |
   * | 1004  | Send FocusIn/FocusOut events                            | #Y      |
   * | 1005  | Enable UTF-8 Mouse Mode.                                | #N      |
   * | 1006  | Enable SGR Mouse Mode.                                  | #Y      |
   * | 1015  | Enable urxvt Mouse Mode.                                | #N      |
   * | 1016  | Enable SGR-Pixels Mouse Mode.                           | #Y      |
   * | 1047  | Use Alternate Screen Buffer.                            | #Y      |
   * | 1048  | Save cursor as in DECSC.                                | #Y      |
   * | 1049  | Save cursor and switch to alternate buffer clearing it. | #P[Does not clear the alternate buffer.] |
   * | 2004  | Set bracketed paste mode.                               | #Y      |
   *
   *
   * FIXME: implement DECSCNM, 1049 should clear altbuffer
   */
  setModePrivate(params) {
    for (let i = 0; i < params.length; i++) {
      switch (params.params[i]) {
        case 1:
          this._coreService.decPrivateModes.applicationCursorKeys = true;
          break;
        case 2:
          this._charsetService.setgCharset(0, import_Charsets.DEFAULT_CHARSET);
          this._charsetService.setgCharset(1, import_Charsets.DEFAULT_CHARSET);
          this._charsetService.setgCharset(2, import_Charsets.DEFAULT_CHARSET);
          this._charsetService.setgCharset(3, import_Charsets.DEFAULT_CHARSET);
          break;
        case 3:
          if (this._optionsService.rawOptions.windowOptions.setWinLines) {
            this._bufferService.resize(132, this._bufferService.rows);
            this._onRequestReset.fire();
          }
          break;
        case 6:
          this._coreService.decPrivateModes.origin = true;
          this._setCursor(0, 0);
          break;
        case 7:
          this._coreService.decPrivateModes.wraparound = true;
          break;
        case 12:
          this._optionsService.options.cursorBlink = true;
          break;
        case 45:
          this._coreService.decPrivateModes.reverseWraparound = true;
          break;
        case 66:
          this._logService.debug("Serial port requested application keypad.");
          this._coreService.decPrivateModes.applicationKeypad = true;
          this._onRequestSyncScrollBar.fire();
          break;
        case 9:
          this._coreMouseService.activeProtocol = "X10";
          break;
        case 1e3:
          this._coreMouseService.activeProtocol = "VT200";
          break;
        case 1002:
          this._coreMouseService.activeProtocol = "DRAG";
          break;
        case 1003:
          this._coreMouseService.activeProtocol = "ANY";
          break;
        case 1004:
          this._coreService.decPrivateModes.sendFocus = true;
          this._onRequestSendFocus.fire();
          break;
        case 1005:
          this._logService.debug("DECSET 1005 not supported (see #2507)");
          break;
        case 1006:
          this._coreMouseService.activeEncoding = "SGR";
          break;
        case 1015:
          this._logService.debug("DECSET 1015 not supported (see #2507)");
          break;
        case 1016:
          this._coreMouseService.activeEncoding = "SGR_PIXELS";
          break;
        case 25:
          this._coreService.isCursorHidden = false;
          break;
        case 1048:
          this.saveCursor();
          break;
        case 1049:
          this.saveCursor();
        // FALL-THROUGH
        case 47:
        // alt screen buffer
        case 1047:
          this._bufferService.buffers.activateAltBuffer(this._eraseAttrData());
          this._coreService.isCursorInitialized = true;
          this._onRequestRefreshRows.fire(void 0);
          this._onRequestSyncScrollBar.fire();
          break;
        case 2004:
          this._coreService.decPrivateModes.bracketedPasteMode = true;
          break;
      }
    }
    return true;
  }
  /**
   * CSI Pm l  Reset Mode (RM).
   *     Ps = 2  -> Keyboard Action Mode (AM).
   *     Ps = 4  -> Replace Mode (IRM).
   *     Ps = 1 2  -> Send/receive (SRM).
   *     Ps = 2 0  -> Normal Linefeed (LNM).
   *
   * @vt: #P[Only IRM is supported.]    CSI RM    "Reset Mode"  "CSI Pm l"  "Set various terminal attributes."
   * Supported param values by RM:
   *
   * | Param | Action                                 | Support |
   * | ----- | -------------------------------------- | ------- |
   * | 2     | Keyboard Action Mode (KAM). Always on. | #N      |
   * | 4     | Replace Mode (IRM). (default)          | #Y      |
   * | 12    | Send/receive (SRM). Always off.        | #N      |
   * | 20    | Normal Linefeed (LNM).                 | #Y      |
   *
   *
   * FIXME: why is LNM commented out?
   */
  resetMode(params) {
    for (let i = 0; i < params.length; i++) {
      switch (params.params[i]) {
        case 4:
          this._coreService.modes.insertMode = false;
          break;
        case 20:
          this._optionsService.options.convertEol = false;
          break;
      }
    }
    return true;
  }
  /**
   * CSI ? Pm l
   *   DEC Private Mode Reset (DECRST).
   *     Ps = 1  -> Normal Cursor Keys (DECCKM).
   *     Ps = 2  -> Designate VT52 mode (DECANM).
   *     Ps = 3  -> 80 Column Mode (DECCOLM).
   *     Ps = 4  -> Jump (Fast) Scroll (DECSCLM).
   *     Ps = 5  -> Normal Video (DECSCNM).
   *     Ps = 6  -> Normal Cursor Mode (DECOM).
   *     Ps = 7  -> No Wraparound Mode (DECAWM).
   *     Ps = 8  -> No Auto-repeat Keys (DECARM).
   *     Ps = 9  -> Don't send Mouse X & Y on button press.
   *     Ps = 1 0  -> Hide toolbar (rxvt).
   *     Ps = 1 2  -> Stop Blinking Cursor (att610).
   *     Ps = 1 8  -> Don't print form feed (DECPFF).
   *     Ps = 1 9  -> Limit print to scrolling region (DECPEX).
   *     Ps = 2 5  -> Hide Cursor (DECTCEM).
   *     Ps = 3 0  -> Don't show scrollbar (rxvt).
   *     Ps = 3 5  -> Disable font-shifting functions (rxvt).
   *     Ps = 4 0  -> Disallow 80 -> 132 Mode.
   *     Ps = 4 1  -> No more(1) fix (see curses resource).
   *     Ps = 4 2  -> Disable Nation Replacement Character sets (DEC-
   *     NRCM).
   *     Ps = 4 4  -> Turn Off Margin Bell.
   *     Ps = 4 5  -> No Reverse-wraparound Mode.
   *     Ps = 4 6  -> Stop Logging.  (This is normally disabled by a
   *     compile-time option).
   *     Ps = 4 7  -> Use Normal Screen Buffer.
   *     Ps = 6 6  -> Numeric keypad (DECNKM).
   *     Ps = 6 7  -> Backarrow key sends delete (DECBKM).
   *     Ps = 1 0 0 0  -> Don't send Mouse X & Y on button press and
   *     release.  See the section Mouse Tracking.
   *     Ps = 1 0 0 1  -> Don't use Hilite Mouse Tracking.
   *     Ps = 1 0 0 2  -> Don't use Cell Motion Mouse Tracking.
   *     Ps = 1 0 0 3  -> Don't use All Motion Mouse Tracking.
   *     Ps = 1 0 0 4  -> Don't send FocusIn/FocusOut events.
   *     Ps = 1 0 0 5  -> Disable Extended Mouse Mode.
   *     Ps = 1 0 1 0  -> Don't scroll to bottom on tty output
   *     (rxvt).
   *     Ps = 1 0 1 1  -> Don't scroll to bottom on key press (rxvt).
   *     Ps = 1 0 3 4  -> Don't interpret "meta" key.  (This disables
   *     the eightBitInput resource).
   *     Ps = 1 0 3 5  -> Disable special modifiers for Alt and Num-
   *     Lock keys.  (This disables the numLock resource).
   *     Ps = 1 0 3 6  -> Don't send ESC  when Meta modifies a key.
   *     (This disables the metaSendsEscape resource).
   *     Ps = 1 0 3 7  -> Send VT220 Remove from the editing-keypad
   *     Delete key.
   *     Ps = 1 0 3 9  -> Don't send ESC  when Alt modifies a key.
   *     (This disables the altSendsEscape resource).
   *     Ps = 1 0 4 0  -> Do not keep selection when not highlighted.
   *     (This disables the keepSelection resource).
   *     Ps = 1 0 4 1  -> Use the PRIMARY selection.  (This disables
   *     the selectToClipboard resource).
   *     Ps = 1 0 4 2  -> Disable Urgency window manager hint when
   *     Control-G is received.  (This disables the bellIsUrgent
   *     resource).
   *     Ps = 1 0 4 3  -> Disable raising of the window when Control-
   *     G is received.  (This disables the popOnBell resource).
   *     Ps = 1 0 4 7  -> Use Normal Screen Buffer, clearing screen
   *     first if in the Alternate Screen.  (This may be disabled by
   *     the titeInhibit resource).
   *     Ps = 1 0 4 8  -> Restore cursor as in DECRC.  (This may be
   *     disabled by the titeInhibit resource).
   *     Ps = 1 0 4 9  -> Use Normal Screen Buffer and restore cursor
   *     as in DECRC.  (This may be disabled by the titeInhibit
   *     resource).  This combines the effects of the 1 0 4 7  and 1 0
   *     4 8  modes.  Use this with terminfo-based applications rather
   *     than the 4 7  mode.
   *     Ps = 1 0 5 0  -> Reset terminfo/termcap function-key mode.
   *     Ps = 1 0 5 1  -> Reset Sun function-key mode.
   *     Ps = 1 0 5 2  -> Reset HP function-key mode.
   *     Ps = 1 0 5 3  -> Reset SCO function-key mode.
   *     Ps = 1 0 6 0  -> Reset legacy keyboard emulation (X11R6).
   *     Ps = 1 0 6 1  -> Reset keyboard emulation to Sun/PC style.
   *     Ps = 2 0 0 4  -> Reset bracketed paste mode.
   *
   * @vt: #P[See below for supported modes.]    CSI DECRST  "DEC Private Reset Mode" "CSI ? Pm l"  "Reset various terminal attributes."
   * Supported param values by DECRST:
   *
   * | param | Action                                                  | Support |
   * | ----- | ------------------------------------------------------- | ------- |
   * | 1     | Normal Cursor Keys (DECCKM).                            | #Y      |
   * | 2     | Designate VT52 mode (DECANM).                           | #N      |
   * | 3     | 80 Column Mode (DECCOLM).                               | #B[Switches to old column width instead of 80.] |
   * | 6     | Normal Cursor Mode (DECOM).                             | #Y      |
   * | 7     | No Wraparound Mode (DECAWM).                            | #Y      |
   * | 8     | No Auto-repeat Keys (DECARM).                           | #N      |
   * | 9     | Don't send Mouse X & Y on button press.                 | #Y      |
   * | 12    | Stop Blinking Cursor.                                   | #Y      |
   * | 25    | Hide Cursor (DECTCEM).                                  | #Y      |
   * | 45    | No reverse wrap-around.                                 | #Y      |
   * | 47    | Use Normal Screen Buffer.                               | #Y      |
   * | 66    | Numeric keypad (DECNKM).                                | #Y      |
   * | 1000  | Don't send Mouse reports.                               | #Y      |
   * | 1002  | Don't use Cell Motion Mouse Tracking.                   | #Y      |
   * | 1003  | Don't use All Motion Mouse Tracking.                    | #Y      |
   * | 1004  | Don't send FocusIn/FocusOut events.                     | #Y      |
   * | 1005  | Disable UTF-8 Mouse Mode.                               | #N      |
   * | 1006  | Disable SGR Mouse Mode.                                 | #Y      |
   * | 1015  | Disable urxvt Mouse Mode.                               | #N      |
   * | 1016  | Disable SGR-Pixels Mouse Mode.                          | #Y      |
   * | 1047  | Use Normal Screen Buffer (clearing screen if in alt).   | #Y      |
   * | 1048  | Restore cursor as in DECRC.                             | #Y      |
   * | 1049  | Use Normal Screen Buffer and restore cursor.            | #Y      |
   * | 2004  | Reset bracketed paste mode.                             | #Y      |
   *
   *
   * FIXME: DECCOLM is currently broken (already fixed in window options PR)
   */
  resetModePrivate(params) {
    for (let i = 0; i < params.length; i++) {
      switch (params.params[i]) {
        case 1:
          this._coreService.decPrivateModes.applicationCursorKeys = false;
          break;
        case 3:
          if (this._optionsService.rawOptions.windowOptions.setWinLines) {
            this._bufferService.resize(80, this._bufferService.rows);
            this._onRequestReset.fire();
          }
          break;
        case 6:
          this._coreService.decPrivateModes.origin = false;
          this._setCursor(0, 0);
          break;
        case 7:
          this._coreService.decPrivateModes.wraparound = false;
          break;
        case 12:
          this._optionsService.options.cursorBlink = false;
          break;
        case 45:
          this._coreService.decPrivateModes.reverseWraparound = false;
          break;
        case 66:
          this._logService.debug("Switching back to normal keypad.");
          this._coreService.decPrivateModes.applicationKeypad = false;
          this._onRequestSyncScrollBar.fire();
          break;
        case 9:
        // X10 Mouse
        case 1e3:
        // vt200 mouse
        case 1002:
        // button event mouse
        case 1003:
          this._coreMouseService.activeProtocol = "NONE";
          break;
        case 1004:
          this._coreService.decPrivateModes.sendFocus = false;
          break;
        case 1005:
          this._logService.debug("DECRST 1005 not supported (see #2507)");
          break;
        case 1006:
          this._coreMouseService.activeEncoding = "DEFAULT";
          break;
        case 1015:
          this._logService.debug("DECRST 1015 not supported (see #2507)");
          break;
        case 1016:
          this._coreMouseService.activeEncoding = "DEFAULT";
          break;
        case 25:
          this._coreService.isCursorHidden = true;
          break;
        case 1048:
          this.restoreCursor();
          break;
        case 1049:
        // alt screen buffer cursor
        // FALL-THROUGH
        case 47:
        // normal screen buffer
        case 1047:
          this._bufferService.buffers.activateNormalBuffer();
          if (params.params[i] === 1049) {
            this.restoreCursor();
          }
          this._coreService.isCursorInitialized = true;
          this._onRequestRefreshRows.fire(void 0);
          this._onRequestSyncScrollBar.fire();
          break;
        case 2004:
          this._coreService.decPrivateModes.bracketedPasteMode = false;
          break;
      }
    }
    return true;
  }
  /**
   * CSI Ps $ p Request ANSI Mode (DECRQM).
   *
   * Reports CSI Ps; Pm $ y (DECRPM), where Ps is the mode number as in SM/RM,
   * and Pm is the mode value:
   *    0 - not recognized
   *    1 - set
   *    2 - reset
   *    3 - permanently set
   *    4 - permanently reset
   *
   * @vt: #Y  CSI   DECRQM  "Request Mode"  "CSI Ps $p"  "Request mode state."
   * Returns a report as `CSI Ps; Pm $ y` (DECRPM), where `Ps` is the mode number as in SM/RM
   * or DECSET/DECRST, and `Pm` is the mode value:
   * - 0: not recognized
   * - 1: set
   * - 2: reset
   * - 3: permanently set
   * - 4: permanently reset
   *
   * For modes not understood xterm.js always returns `notRecognized`. In general this means,
   * that a certain operation mode is not implemented and cannot be used.
   *
   * Modes changing the active terminal buffer (47, 1047, 1049) are not subqueried
   * and only report, whether the alternate buffer is set.
   *
   * Mouse encodings and mouse protocols are handled mutual exclusive,
   * thus only one of each of those can be set at a given time.
   *
   * There is a chance, that some mode reports are not fully in line with xterm.js' behavior,
   * e.g. if the default implementation already exposes a certain behavior. If you find
   * discrepancies in the mode reports, please file a bug.
   */
  requestMode(params, ansi) {
    let V;
    ((V2) => {
      V2[V2["NOT_RECOGNIZED"] = 0] = "NOT_RECOGNIZED";
      V2[V2["SET"] = 1] = "SET";
      V2[V2["RESET"] = 2] = "RESET";
      V2[V2["PERMANENTLY_SET"] = 3] = "PERMANENTLY_SET";
      V2[V2["PERMANENTLY_RESET"] = 4] = "PERMANENTLY_RESET";
    })(V || (V = {}));
    const dm = this._coreService.decPrivateModes;
    const { activeProtocol: mouseProtocol, activeEncoding: mouseEncoding } = this._coreMouseService;
    const cs = this._coreService;
    const { buffers, cols } = this._bufferService;
    const { active, alt } = buffers;
    const opts = this._optionsService.rawOptions;
    const f = (m, v) => {
      cs.triggerDataEvent(`${import_EscapeSequences.C0.ESC}[${ansi ? "" : "?"}${m};${v}$y`);
      return true;
    };
    const b2v = (value) => value ? 1 /* SET */ : 2 /* RESET */;
    const p = params.params[0];
    if (ansi) {
      if (p === 2) return f(p, 4 /* PERMANENTLY_RESET */);
      if (p === 4) return f(p, b2v(cs.modes.insertMode));
      if (p === 12) return f(p, 3 /* PERMANENTLY_SET */);
      if (p === 20) return f(p, b2v(opts.convertEol));
      return f(p, 0 /* NOT_RECOGNIZED */);
    }
    if (p === 1) return f(p, b2v(dm.applicationCursorKeys));
    if (p === 3) return f(p, opts.windowOptions.setWinLines ? cols === 80 ? 2 /* RESET */ : cols === 132 ? 1 /* SET */ : 0 /* NOT_RECOGNIZED */ : 0 /* NOT_RECOGNIZED */);
    if (p === 6) return f(p, b2v(dm.origin));
    if (p === 7) return f(p, b2v(dm.wraparound));
    if (p === 8) return f(p, 3 /* PERMANENTLY_SET */);
    if (p === 9) return f(p, b2v(mouseProtocol === "X10"));
    if (p === 12) return f(p, b2v(opts.cursorBlink));
    if (p === 25) return f(p, b2v(!cs.isCursorHidden));
    if (p === 45) return f(p, b2v(dm.reverseWraparound));
    if (p === 66) return f(p, b2v(dm.applicationKeypad));
    if (p === 67) return f(p, 4 /* PERMANENTLY_RESET */);
    if (p === 1e3) return f(p, b2v(mouseProtocol === "VT200"));
    if (p === 1002) return f(p, b2v(mouseProtocol === "DRAG"));
    if (p === 1003) return f(p, b2v(mouseProtocol === "ANY"));
    if (p === 1004) return f(p, b2v(dm.sendFocus));
    if (p === 1005) return f(p, 4 /* PERMANENTLY_RESET */);
    if (p === 1006) return f(p, b2v(mouseEncoding === "SGR"));
    if (p === 1015) return f(p, 4 /* PERMANENTLY_RESET */);
    if (p === 1016) return f(p, b2v(mouseEncoding === "SGR_PIXELS"));
    if (p === 1048) return f(p, 1 /* SET */);
    if (p === 47 || p === 1047 || p === 1049) return f(p, b2v(active === alt));
    if (p === 2004) return f(p, b2v(dm.bracketedPasteMode));
    return f(p, 0 /* NOT_RECOGNIZED */);
  }
  /**
   * Helper to write color information packed with color mode.
   */
  _updateAttrColor(color, mode, c1, c2, c3) {
    if (mode === 2) {
      color |= import_Constants.Attributes.CM_RGB;
      color &= ~import_Constants.Attributes.RGB_MASK;
      color |= import_AttributeData.AttributeData.fromColorRGB([c1, c2, c3]);
    } else if (mode === 5) {
      color &= ~(import_Constants.Attributes.CM_MASK | import_Constants.Attributes.PCOLOR_MASK);
      color |= import_Constants.Attributes.CM_P256 | c1 & 255;
    }
    return color;
  }
  /**
   * Helper to extract and apply color params/subparams.
   * Returns advance for params index.
   */
  _extractColor(params, pos, attr) {
    const accu = [0, 0, -1, 0, 0, 0];
    let cSpace = 0;
    let advance = 0;
    do {
      accu[advance + cSpace] = params.params[pos + advance];
      if (params.hasSubParams(pos + advance)) {
        const subparams = params.getSubParams(pos + advance);
        let i = 0;
        do {
          if (accu[1] === 5) {
            cSpace = 1;
          }
          accu[advance + i + 1 + cSpace] = subparams[i];
        } while (++i < subparams.length && i + advance + 1 + cSpace < accu.length);
        break;
      }
      if (accu[1] === 5 && advance + cSpace >= 2 || accu[1] === 2 && advance + cSpace >= 5) {
        break;
      }
      if (accu[1]) {
        cSpace = 1;
      }
    } while (++advance + pos < params.length && advance + cSpace < accu.length);
    for (let i = 2; i < accu.length; ++i) {
      if (accu[i] === -1) {
        accu[i] = 0;
      }
    }
    switch (accu[0]) {
      case 38:
        attr.fg = this._updateAttrColor(attr.fg, accu[1], accu[3], accu[4], accu[5]);
        break;
      case 48:
        attr.bg = this._updateAttrColor(attr.bg, accu[1], accu[3], accu[4], accu[5]);
        break;
      case 58:
        attr.extended = attr.extended.clone();
        attr.extended.underlineColor = this._updateAttrColor(attr.extended.underlineColor, accu[1], accu[3], accu[4], accu[5]);
    }
    return advance;
  }
  /**
   * SGR 4 subparams:
   *    4:0   -   equal to SGR 24 (turn off all underline)
   *    4:1   -   equal to SGR 4 (single underline)
   *    4:2   -   equal to SGR 21 (double underline)
   *    4:3   -   curly underline
   *    4:4   -   dotted underline
   *    4:5   -   dashed underline
   */
  _processUnderline(style, attr) {
    attr.extended = attr.extended.clone();
    if (!~style || style > 5) {
      style = 1;
    }
    attr.extended.underlineStyle = style;
    attr.fg |= import_Constants.FgFlags.UNDERLINE;
    if (style === 0) {
      attr.fg &= ~import_Constants.FgFlags.UNDERLINE;
    }
    attr.updateExtended();
  }
  _processSGR0(attr) {
    attr.fg = import_BufferLine.DEFAULT_ATTR_DATA.fg;
    attr.bg = import_BufferLine.DEFAULT_ATTR_DATA.bg;
    attr.extended = attr.extended.clone();
    attr.extended.underlineStyle = import_Constants.UnderlineStyle.NONE;
    attr.extended.underlineColor &= ~(import_Constants.Attributes.CM_MASK | import_Constants.Attributes.RGB_MASK);
    attr.updateExtended();
  }
  /**
   * CSI Pm m  Character Attributes (SGR).
   *
   * @vt: #P[See below for supported attributes.]    CSI SGR   "Select Graphic Rendition"  "CSI Pm m"  "Set/Reset various text attributes."
   * SGR selects one or more character attributes at the same time. Multiple params (up to 32)
   * are applied in order from left to right. The changed attributes are applied to all new
   * characters received. If you move characters in the viewport by scrolling or any other means,
   * then the attributes move with the characters.
   *
   * Supported param values by SGR:
   *
   * | Param     | Meaning                                                  | Support |
   * | --------- | -------------------------------------------------------- | ------- |
   * | 0         | Normal (default). Resets any other preceding SGR.        | #Y      |
   * | 1         | Bold. (also see `options.drawBoldTextInBrightColors`)    | #Y      |
   * | 2         | Faint, decreased intensity.                              | #Y      |
   * | 3         | Italic.                                                  | #Y      |
   * | 4         | Underlined (see below for style support).                | #Y      |
   * | 5         | Slowly blinking.                                         | #N      |
   * | 6         | Rapidly blinking.                                        | #N      |
   * | 7         | Inverse. Flips foreground and background color.          | #Y      |
   * | 8         | Invisible (hidden).                                      | #Y      |
   * | 9         | Crossed-out characters (strikethrough).                  | #Y      |
   * | 21        | Doubly underlined.                                       | #Y      |
   * | 22        | Normal (neither bold nor faint).                         | #Y      |
   * | 23        | No italic.                                               | #Y      |
   * | 24        | Not underlined.                                          | #Y      |
   * | 25        | Steady (not blinking).                                   | #Y      |
   * | 27        | Positive (not inverse).                                  | #Y      |
   * | 28        | Visible (not hidden).                                    | #Y      |
   * | 29        | Not Crossed-out (strikethrough).                         | #Y      |
   * | 30        | Foreground color: Black.                                 | #Y      |
   * | 31        | Foreground color: Red.                                   | #Y      |
   * | 32        | Foreground color: Green.                                 | #Y      |
   * | 33        | Foreground color: Yellow.                                | #Y      |
   * | 34        | Foreground color: Blue.                                  | #Y      |
   * | 35        | Foreground color: Magenta.                               | #Y      |
   * | 36        | Foreground color: Cyan.                                  | #Y      |
   * | 37        | Foreground color: White.                                 | #Y      |
   * | 38        | Foreground color: Extended color.                        | #P[Support for RGB and indexed colors, see below.] |
   * | 39        | Foreground color: Default (original).                    | #Y      |
   * | 40        | Background color: Black.                                 | #Y      |
   * | 41        | Background color: Red.                                   | #Y      |
   * | 42        | Background color: Green.                                 | #Y      |
   * | 43        | Background color: Yellow.                                | #Y      |
   * | 44        | Background color: Blue.                                  | #Y      |
   * | 45        | Background color: Magenta.                               | #Y      |
   * | 46        | Background color: Cyan.                                  | #Y      |
   * | 47        | Background color: White.                                 | #Y      |
   * | 48        | Background color: Extended color.                        | #P[Support for RGB and indexed colors, see below.] |
   * | 49        | Background color: Default (original).                    | #Y      |
   * | 53        | Overlined.                                               | #Y      |
   * | 55        | Not Overlined.                                           | #Y      |
   * | 58        | Underline color: Extended color.                         | #P[Support for RGB and indexed colors, see below.] |
   * | 90 - 97   | Bright foreground color (analogous to 30 - 37).          | #Y      |
   * | 100 - 107 | Bright background color (analogous to 40 - 47).          | #Y      |
   *
   * Underline supports subparams to denote the style in the form `4 : x`:
   *
   * | x      | Meaning                                                       | Support |
   * | ------ | ------------------------------------------------------------- | ------- |
   * | 0      | No underline. Same as `SGR 24 m`.                             | #Y      |
   * | 1      | Single underline. Same as `SGR 4 m`.                          | #Y      |
   * | 2      | Double underline.                                             | #Y      |
   * | 3      | Curly underline.                                              | #Y      |
   * | 4      | Dotted underline.                                             | #Y      |
   * | 5      | Dashed underline.                                             | #Y      |
   * | other  | Single underline. Same as `SGR 4 m`.                          | #Y      |
   *
   * Extended colors are supported for foreground (Ps=38), background (Ps=48) and underline (Ps=58)
   * as follows:
   *
   * | Ps + 1 | Meaning                                                       | Support |
   * | ------ | ------------------------------------------------------------- | ------- |
   * | 0      | Implementation defined.                                       | #N      |
   * | 1      | Transparent.                                                  | #N      |
   * | 2      | RGB color as `Ps ; 2 ; R ; G ; B` or `Ps : 2 : : R : G : B`.  | #Y      |
   * | 3      | CMY color.                                                    | #N      |
   * | 4      | CMYK color.                                                   | #N      |
   * | 5      | Indexed (256 colors) as `Ps ; 5 ; INDEX` or `Ps : 5 : INDEX`. | #Y      |
   *
   *
   * FIXME: blinking is implemented in attrs, but not working in renderers?
   * FIXME: remove dead branch for p=100
   */
  charAttributes(params) {
    if (params.length === 1 && params.params[0] === 0) {
      this._processSGR0(this._curAttrData);
      return true;
    }
    const l = params.length;
    let p;
    const attr = this._curAttrData;
    for (let i = 0; i < l; i++) {
      p = params.params[i];
      if (p >= 30 && p <= 37) {
        attr.fg &= ~(import_Constants.Attributes.CM_MASK | import_Constants.Attributes.PCOLOR_MASK);
        attr.fg |= import_Constants.Attributes.CM_P16 | p - 30;
      } else if (p >= 40 && p <= 47) {
        attr.bg &= ~(import_Constants.Attributes.CM_MASK | import_Constants.Attributes.PCOLOR_MASK);
        attr.bg |= import_Constants.Attributes.CM_P16 | p - 40;
      } else if (p >= 90 && p <= 97) {
        attr.fg &= ~(import_Constants.Attributes.CM_MASK | import_Constants.Attributes.PCOLOR_MASK);
        attr.fg |= import_Constants.Attributes.CM_P16 | p - 90 | 8;
      } else if (p >= 100 && p <= 107) {
        attr.bg &= ~(import_Constants.Attributes.CM_MASK | import_Constants.Attributes.PCOLOR_MASK);
        attr.bg |= import_Constants.Attributes.CM_P16 | p - 100 | 8;
      } else if (p === 0) {
        this._processSGR0(attr);
      } else if (p === 1) {
        attr.fg |= import_Constants.FgFlags.BOLD;
      } else if (p === 3) {
        attr.bg |= import_Constants.BgFlags.ITALIC;
      } else if (p === 4) {
        attr.fg |= import_Constants.FgFlags.UNDERLINE;
        this._processUnderline(params.hasSubParams(i) ? params.getSubParams(i)[0] : import_Constants.UnderlineStyle.SINGLE, attr);
      } else if (p === 5) {
        attr.fg |= import_Constants.FgFlags.BLINK;
      } else if (p === 7) {
        attr.fg |= import_Constants.FgFlags.INVERSE;
      } else if (p === 8) {
        attr.fg |= import_Constants.FgFlags.INVISIBLE;
      } else if (p === 9) {
        attr.fg |= import_Constants.FgFlags.STRIKETHROUGH;
      } else if (p === 2) {
        attr.bg |= import_Constants.BgFlags.DIM;
      } else if (p === 21) {
        this._processUnderline(import_Constants.UnderlineStyle.DOUBLE, attr);
      } else if (p === 22) {
        attr.fg &= ~import_Constants.FgFlags.BOLD;
        attr.bg &= ~import_Constants.BgFlags.DIM;
      } else if (p === 23) {
        attr.bg &= ~import_Constants.BgFlags.ITALIC;
      } else if (p === 24) {
        attr.fg &= ~import_Constants.FgFlags.UNDERLINE;
        this._processUnderline(import_Constants.UnderlineStyle.NONE, attr);
      } else if (p === 25) {
        attr.fg &= ~import_Constants.FgFlags.BLINK;
      } else if (p === 27) {
        attr.fg &= ~import_Constants.FgFlags.INVERSE;
      } else if (p === 28) {
        attr.fg &= ~import_Constants.FgFlags.INVISIBLE;
      } else if (p === 29) {
        attr.fg &= ~import_Constants.FgFlags.STRIKETHROUGH;
      } else if (p === 39) {
        attr.fg &= ~(import_Constants.Attributes.CM_MASK | import_Constants.Attributes.RGB_MASK);
        attr.fg |= import_BufferLine.DEFAULT_ATTR_DATA.fg & (import_Constants.Attributes.PCOLOR_MASK | import_Constants.Attributes.RGB_MASK);
      } else if (p === 49) {
        attr.bg &= ~(import_Constants.Attributes.CM_MASK | import_Constants.Attributes.RGB_MASK);
        attr.bg |= import_BufferLine.DEFAULT_ATTR_DATA.bg & (import_Constants.Attributes.PCOLOR_MASK | import_Constants.Attributes.RGB_MASK);
      } else if (p === 38 || p === 48 || p === 58) {
        i += this._extractColor(params, i, attr);
      } else if (p === 53) {
        attr.bg |= import_Constants.BgFlags.OVERLINE;
      } else if (p === 55) {
        attr.bg &= ~import_Constants.BgFlags.OVERLINE;
      } else if (p === 59) {
        attr.extended = attr.extended.clone();
        attr.extended.underlineColor = -1;
        attr.updateExtended();
      } else if (p === 100) {
        attr.fg &= ~(import_Constants.Attributes.CM_MASK | import_Constants.Attributes.RGB_MASK);
        attr.fg |= import_BufferLine.DEFAULT_ATTR_DATA.fg & (import_Constants.Attributes.PCOLOR_MASK | import_Constants.Attributes.RGB_MASK);
        attr.bg &= ~(import_Constants.Attributes.CM_MASK | import_Constants.Attributes.RGB_MASK);
        attr.bg |= import_BufferLine.DEFAULT_ATTR_DATA.bg & (import_Constants.Attributes.PCOLOR_MASK | import_Constants.Attributes.RGB_MASK);
      } else {
        this._logService.debug("Unknown SGR attribute: %d.", p);
      }
    }
    return true;
  }
  /**
   * CSI Ps n  Device Status Report (DSR).
   *     Ps = 5  -> Status Report.  Result (``OK'') is
   *   CSI 0 n
   *     Ps = 6  -> Report Cursor Position (CPR) [row;column].
   *   Result is
   *   CSI r ; c R
   * CSI ? Ps n
   *   Device Status Report (DSR, DEC-specific).
   *     Ps = 6  -> Report Cursor Position (CPR) [row;column] as CSI
   *     ? r ; c R (assumes page is zero).
   *     Ps = 1 5  -> Report Printer status as CSI ? 1 0  n  (ready).
   *     or CSI ? 1 1  n  (not ready).
   *     Ps = 2 5  -> Report UDK status as CSI ? 2 0  n  (unlocked)
   *     or CSI ? 2 1  n  (locked).
   *     Ps = 2 6  -> Report Keyboard status as
   *   CSI ? 2 7  ;  1  ;  0  ;  0  n  (North American).
   *   The last two parameters apply to VT400 & up, and denote key-
   *   board ready and LK01 respectively.
   *     Ps = 5 3  -> Report Locator status as
   *   CSI ? 5 3  n  Locator available, if compiled-in, or
   *   CSI ? 5 0  n  No Locator, if not.
   *
   * @vt: #Y CSI DSR   "Device Status Report"  "CSI Ps n"  "Request cursor position (CPR) with `Ps` = 6."
   */
  deviceStatus(params) {
    switch (params.params[0]) {
      case 5:
        this._coreService.triggerDataEvent(`${import_EscapeSequences.C0.ESC}[0n`);
        break;
      case 6:
        const y = this._activeBuffer.y + 1;
        const x = this._activeBuffer.x + 1;
        this._coreService.triggerDataEvent(`${import_EscapeSequences.C0.ESC}[${y};${x}R`);
        break;
    }
    return true;
  }
  // @vt: #P[Only CPR is supported.]  CSI DECDSR  "DEC Device Status Report"  "CSI ? Ps n"  "Only CPR is supported (same as DSR)."
  deviceStatusPrivate(params) {
    switch (params.params[0]) {
      case 6:
        const y = this._activeBuffer.y + 1;
        const x = this._activeBuffer.x + 1;
        this._coreService.triggerDataEvent(`${import_EscapeSequences.C0.ESC}[?${y};${x}R`);
        break;
      case 15:
        break;
      case 25:
        break;
      case 26:
        break;
      case 53:
        break;
    }
    return true;
  }
  /**
   * CSI ! p   Soft terminal reset (DECSTR).
   * http://vt100.net/docs/vt220-rm/table4-10.html
   *
   * @vt: #Y CSI DECSTR  "Soft Terminal Reset"   "CSI ! p"   "Reset several terminal attributes to initial state."
   * There are two terminal reset sequences - RIS and DECSTR. While RIS performs almost a full
   * terminal bootstrap, DECSTR only resets certain attributes. For most needs DECSTR should be
   * sufficient.
   *
   * The following terminal attributes are reset to default values:
   * - IRM is reset (dafault = false)
   * - scroll margins are reset (default = viewport size)
   * - erase attributes are reset to default
   * - charsets are reset
   * - DECSC data is reset to initial values
   * - DECOM is reset to absolute mode
   *
   *
   * FIXME: there are several more attributes missing (see VT520 manual)
   */
  softReset(params) {
    this._coreService.isCursorHidden = false;
    this._onRequestSyncScrollBar.fire();
    this._activeBuffer.scrollTop = 0;
    this._activeBuffer.scrollBottom = this._bufferService.rows - 1;
    this._curAttrData = import_BufferLine.DEFAULT_ATTR_DATA.clone();
    this._coreService.reset();
    this._charsetService.reset();
    this._activeBuffer.savedX = 0;
    this._activeBuffer.savedY = this._activeBuffer.ybase;
    this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg;
    this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg;
    this._activeBuffer.savedCharset = this._charsetService.charset;
    this._coreService.decPrivateModes.origin = false;
    return true;
  }
  /**
   * CSI Ps SP q  Set cursor style (DECSCUSR, VT520).
   *   Ps = 0  -> reset to option.
   *   Ps = 1  -> blinking block (default).
   *   Ps = 2  -> steady block.
   *   Ps = 3  -> blinking underline.
   *   Ps = 4  -> steady underline.
   *   Ps = 5  -> blinking bar (xterm).
   *   Ps = 6  -> steady bar (xterm).
   *
   * @vt: #Y CSI DECSCUSR  "Set Cursor Style"  "CSI Ps SP q"   "Set cursor style."
   * Supported cursor styles:
   *  - 0: reset to option
   *  - empty, 1: blinking block
   *  - 2: steady block
   *  - 3: blinking underline
   *  - 4: steady underline
   *  - 5: blinking bar
   *  - 6: steady bar
   */
  setCursorStyle(params) {
    const param = params.length === 0 ? 1 : params.params[0];
    if (param === 0) {
      this._coreService.decPrivateModes.cursorStyle = void 0;
      this._coreService.decPrivateModes.cursorBlink = void 0;
    } else {
      switch (param) {
        case 1:
        case 2:
          this._coreService.decPrivateModes.cursorStyle = "block";
          break;
        case 3:
        case 4:
          this._coreService.decPrivateModes.cursorStyle = "underline";
          break;
        case 5:
        case 6:
          this._coreService.decPrivateModes.cursorStyle = "bar";
          break;
      }
      const isBlinking = param % 2 === 1;
      this._coreService.decPrivateModes.cursorBlink = isBlinking;
    }
    return true;
  }
  /**
   * CSI Ps ; Ps r
   *   Set Scrolling Region [top;bottom] (default = full size of win-
   *   dow) (DECSTBM).
   *
   * @vt: #Y CSI DECSTBM "Set Top and Bottom Margin" "CSI Ps ; Ps r" "Set top and bottom margins of the viewport [top;bottom] (default = viewport size)."
   */
  setScrollRegion(params) {
    const top = params.params[0] || 1;
    let bottom;
    if (params.length < 2 || (bottom = params.params[1]) > this._bufferService.rows || bottom === 0) {
      bottom = this._bufferService.rows;
    }
    if (bottom > top) {
      this._activeBuffer.scrollTop = top - 1;
      this._activeBuffer.scrollBottom = bottom - 1;
      this._setCursor(0, 0);
    }
    return true;
  }
  /**
   * CSI Ps ; Ps ; Ps t - Various window manipulations and reports (xterm)
   *
   * Note: Only those listed below are supported. All others are left to integrators and
   * need special treatment based on the embedding environment.
   *
   *    Ps = 1 4                                                          supported
   *      Report xterm text area size in pixels.
   *      Result is CSI 4 ; height ; width t
   *    Ps = 14 ; 2                                                       not implemented
   *    Ps = 16                                                           supported
   *      Report xterm character cell size in pixels.
   *      Result is CSI 6 ; height ; width t
   *    Ps = 18                                                           supported
   *      Report the size of the text area in characters.
   *      Result is CSI 8 ; height ; width t
   *    Ps = 20                                                           supported
   *      Report xterm window's icon label.
   *      Result is OSC L label ST
   *    Ps = 21                                                           supported
   *      Report xterm window's title.
   *      Result is OSC l label ST
   *    Ps = 22 ; 0  -> Save xterm icon and window title on stack.        supported
   *    Ps = 22 ; 1  -> Save xterm icon title on stack.                   supported
   *    Ps = 22 ; 2  -> Save xterm window title on stack.                 supported
   *    Ps = 23 ; 0  -> Restore xterm icon and window title from stack.   supported
   *    Ps = 23 ; 1  -> Restore xterm icon title from stack.              supported
   *    Ps = 23 ; 2  -> Restore xterm window title from stack.            supported
   *    Ps >= 24                                                          not implemented
   */
  windowOptions(params) {
    if (!paramToWindowOption(params.params[0], this._optionsService.rawOptions.windowOptions)) {
      return true;
    }
    const second = params.length > 1 ? params.params[1] : 0;
    switch (params.params[0]) {
      case 14:
        if (second !== 2) {
          this._onRequestWindowsOptionsReport.fire(0 /* GET_WIN_SIZE_PIXELS */);
        }
        break;
      case 16:
        this._onRequestWindowsOptionsReport.fire(1 /* GET_CELL_SIZE_PIXELS */);
        break;
      case 18:
        if (this._bufferService) {
          this._coreService.triggerDataEvent(`${import_EscapeSequences.C0.ESC}[8;${this._bufferService.rows};${this._bufferService.cols}t`);
        }
        break;
      case 22:
        if (second === 0 || second === 2) {
          this._windowTitleStack.push(this._windowTitle);
          if (this._windowTitleStack.length > STACK_LIMIT) {
            this._windowTitleStack.shift();
          }
        }
        if (second === 0 || second === 1) {
          this._iconNameStack.push(this._iconName);
          if (this._iconNameStack.length > STACK_LIMIT) {
            this._iconNameStack.shift();
          }
        }
        break;
      case 23:
        if (second === 0 || second === 2) {
          if (this._windowTitleStack.length) {
            this.setTitle(this._windowTitleStack.pop());
          }
        }
        if (second === 0 || second === 1) {
          if (this._iconNameStack.length) {
            this.setIconName(this._iconNameStack.pop());
          }
        }
        break;
    }
    return true;
  }
  /**
   * CSI s
   * ESC 7
   *   Save cursor (ANSI.SYS).
   *
   * @vt: #P[TODO...]  CSI SCOSC   "Save Cursor"   "CSI s"   "Save cursor position, charmap and text attributes."
   * @vt: #Y ESC  SC   "Save Cursor"   "ESC 7"   "Save cursor position, charmap and text attributes."
   */
  saveCursor(params) {
    this._activeBuffer.savedX = this._activeBuffer.x;
    this._activeBuffer.savedY = this._activeBuffer.ybase + this._activeBuffer.y;
    this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg;
    this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg;
    this._activeBuffer.savedCharset = this._charsetService.charset;
    return true;
  }
  /**
   * CSI u
   * ESC 8
   *   Restore cursor (ANSI.SYS).
   *
   * @vt: #P[TODO...]  CSI SCORC "Restore Cursor"  "CSI u"   "Restore cursor position, charmap and text attributes."
   * @vt: #Y ESC  RC "Restore Cursor"  "ESC 8"   "Restore cursor position, charmap and text attributes."
   */
  restoreCursor(params) {
    this._activeBuffer.x = this._activeBuffer.savedX || 0;
    this._activeBuffer.y = Math.max(this._activeBuffer.savedY - this._activeBuffer.ybase, 0);
    this._curAttrData.fg = this._activeBuffer.savedCurAttrData.fg;
    this._curAttrData.bg = this._activeBuffer.savedCurAttrData.bg;
    this._charsetService.charset = this._savedCharset;
    if (this._activeBuffer.savedCharset) {
      this._charsetService.charset = this._activeBuffer.savedCharset;
    }
    this._restrictCursor();
    return true;
  }
  /**
   * OSC 2; <data> ST (set window title)
   *   Proxy to set window title.
   *
   * @vt: #P[Icon name is not exposed.]   OSC    0   "Set Windows Title and Icon Name"  "OSC 0 ; Pt BEL"  "Set window title and icon name."
   * Icon name is not supported. For Window Title see below.
   *
   * @vt: #Y     OSC    2   "Set Windows Title"  "OSC 2 ; Pt BEL"  "Set window title."
   * xterm.js does not manipulate the title directly, instead exposes changes via the event
   * `Terminal.onTitleChange`.
   */
  setTitle(data) {
    this._windowTitle = data;
    this._onTitleChange.fire(data);
    return true;
  }
  /**
   * OSC 1; <data> ST
   * Note: Icon name is not exposed.
   */
  setIconName(data) {
    this._iconName = data;
    return true;
  }
  /**
   * OSC 4; <num> ; <text> ST (set ANSI color <num> to <text>)
   *
   * @vt: #Y    OSC    4    "Set ANSI color"   "OSC 4 ; c ; spec BEL" "Change color number `c` to the color specified by `spec`."
   * `c` is the color index between 0 and 255. The color format of `spec` is derived from
   * `XParseColor` (see OSC 10 for supported formats). There may be multipe `c ; spec` pairs present
   * in the same instruction. If `spec` contains `?` the terminal returns a sequence with the
   * currently set color.
   */
  setOrReportIndexedColor(data) {
    const event = [];
    const slots = data.split(";");
    while (slots.length > 1) {
      const idx = slots.shift();
      const spec = slots.shift();
      if (/^\d+$/.exec(idx)) {
        const index = parseInt(idx);
        if (isValidColorIndex(index)) {
          if (spec === "?") {
            event.push({ type: import_Types.ColorRequestType.REPORT, index });
          } else {
            const color = (0, import_XParseColor.parseColor)(spec);
            if (color) {
              event.push({ type: import_Types.ColorRequestType.SET, index, color });
            }
          }
        }
      }
    }
    if (event.length) {
      this._onColor.fire(event);
    }
    return true;
  }
  /**
   * OSC 8 ; <params> ; <uri> ST - create hyperlink
   * OSC 8 ; ; ST - finish hyperlink
   *
   * Test case:
   *
   * ```sh
   * printf '\e]8;;http://example.com\e\\This is a link\e]8;;\e\\\n'
   * ```
   *
   * @vt: #Y    OSC    8    "Create hyperlink"   "OSC 8 ; params ; uri BEL" "Create a hyperlink to `uri` using `params`."
   * `uri` is a hyperlink starting with `http://`, `https://`, `ftp://`, `file://` or `mailto://`. `params` is an
   * optional list of key=value assignments, separated by the : character.
   * Example: `id=xyz123:foo=bar:baz=quux`.
   * Currently only the id key is defined. Cells that share the same ID and URI share hover
   * feedback. Use `OSC 8 ; ; BEL` to finish the current hyperlink.
   */
  setHyperlink(data) {
    const idx = data.indexOf(";");
    if (idx === -1) {
      return true;
    }
    const id = data.slice(0, idx).trim();
    const uri = data.slice(idx + 1);
    if (uri) {
      return this._createHyperlink(id, uri);
    }
    if (id.trim()) {
      return false;
    }
    return this._finishHyperlink();
  }
  _createHyperlink(params, uri) {
    if (this._getCurrentLinkId()) {
      this._finishHyperlink();
    }
    const parsedParams = params.split(":");
    let id;
    const idParamIndex = parsedParams.findIndex((e) => e.startsWith("id="));
    if (idParamIndex !== -1) {
      id = parsedParams[idParamIndex].slice(3) || void 0;
    }
    this._curAttrData.extended = this._curAttrData.extended.clone();
    this._curAttrData.extended.urlId = this._oscLinkService.registerLink({ id, uri });
    this._curAttrData.updateExtended();
    return true;
  }
  _finishHyperlink() {
    this._curAttrData.extended = this._curAttrData.extended.clone();
    this._curAttrData.extended.urlId = 0;
    this._curAttrData.updateExtended();
    return true;
  }
  /**
   * Apply colors requests for special colors in OSC 10 | 11 | 12.
   * Since these commands are stacking from multiple parameters,
   * we handle them in a loop with an entry offset to `_specialColors`.
   */
  _setOrReportSpecialColor(data, offset) {
    const slots = data.split(";");
    for (let i = 0; i < slots.length; ++i, ++offset) {
      if (offset >= this._specialColors.length) break;
      if (slots[i] === "?") {
        this._onColor.fire([{ type: import_Types.ColorRequestType.REPORT, index: this._specialColors[offset] }]);
      } else {
        const color = (0, import_XParseColor.parseColor)(slots[i]);
        if (color) {
          this._onColor.fire([{ type: import_Types.ColorRequestType.SET, index: this._specialColors[offset], color }]);
        }
      }
    }
    return true;
  }
  /**
   * OSC 10 ; <xcolor name>|<?> ST - set or query default foreground color
   *
   * @vt: #Y  OSC   10    "Set or query default foreground color"   "OSC 10 ; Pt BEL"  "Set or query default foreground color."
   * To set the color, the following color specification formats are supported:
   * - `rgb:<red>/<green>/<blue>` for  `<red>, <green>, <blue>` in `h | hh | hhh | hhhh`, where
   *   `h` is a single hexadecimal digit (case insignificant). The different widths scale
   *   from 4 bit (`h`) to 16 bit (`hhhh`) and get converted to 8 bit (`hh`).
   * - `#RGB` - 4 bits per channel, expanded to `#R0G0B0`
   * - `#RRGGBB` - 8 bits per channel
   * - `#RRRGGGBBB` - 12 bits per channel, truncated to `#RRGGBB`
   * - `#RRRRGGGGBBBB` - 16 bits per channel, truncated to `#RRGGBB`
   *
   * **Note:** X11 named colors are currently unsupported.
   *
   * If `Pt` contains `?` instead of a color specification, the terminal
   * returns a sequence with the current default foreground color
   * (use that sequence to restore the color after changes).
   *
   * **Note:** Other than xterm, xterm.js does not support OSC 12 - 19.
   * Therefore stacking multiple `Pt` separated by `;` only works for the first two entries.
   */
  setOrReportFgColor(data) {
    return this._setOrReportSpecialColor(data, 0);
  }
  /**
   * OSC 11 ; <xcolor name>|<?> ST - set or query default background color
   *
   * @vt: #Y  OSC   11    "Set or query default background color"   "OSC 11 ; Pt BEL"  "Same as OSC 10, but for default background."
   */
  setOrReportBgColor(data) {
    return this._setOrReportSpecialColor(data, 1);
  }
  /**
   * OSC 12 ; <xcolor name>|<?> ST - set or query default cursor color
   *
   * @vt: #Y  OSC   12    "Set or query default cursor color"   "OSC 12 ; Pt BEL"  "Same as OSC 10, but for default cursor color."
   */
  setOrReportCursorColor(data) {
    return this._setOrReportSpecialColor(data, 2);
  }
  /**
   * OSC 104 ; <num> ST - restore ANSI color <num>
   *
   * @vt: #Y  OSC   104    "Reset ANSI color"   "OSC 104 ; c BEL" "Reset color number `c` to themed color."
   * `c` is the color index between 0 and 255. This function restores the default color for `c` as
   * specified by the loaded theme. Any number of `c` parameters may be given.
   * If no parameters are given, the entire indexed color table will be reset.
   */
  restoreIndexedColor(data) {
    if (!data) {
      this._onColor.fire([{ type: import_Types.ColorRequestType.RESTORE }]);
      return true;
    }
    const event = [];
    const slots = data.split(";");
    for (let i = 0; i < slots.length; ++i) {
      if (/^\d+$/.exec(slots[i])) {
        const index = parseInt(slots[i]);
        if (isValidColorIndex(index)) {
          event.push({ type: import_Types.ColorRequestType.RESTORE, index });
        }
      }
    }
    if (event.length) {
      this._onColor.fire(event);
    }
    return true;
  }
  /**
   * OSC 110 ST - restore default foreground color
   *
   * @vt: #Y  OSC   110    "Restore default foreground color"   "OSC 110 BEL"  "Restore default foreground to themed color."
   */
  restoreFgColor(data) {
    this._onColor.fire([{ type: import_Types.ColorRequestType.RESTORE, index: import_Types.SpecialColorIndex.FOREGROUND }]);
    return true;
  }
  /**
   * OSC 111 ST - restore default background color
   *
   * @vt: #Y  OSC   111    "Restore default background color"   "OSC 111 BEL"  "Restore default background to themed color."
   */
  restoreBgColor(data) {
    this._onColor.fire([{ type: import_Types.ColorRequestType.RESTORE, index: import_Types.SpecialColorIndex.BACKGROUND }]);
    return true;
  }
  /**
   * OSC 112 ST - restore default cursor color
   *
   * @vt: #Y  OSC   112    "Restore default cursor color"   "OSC 112 BEL"  "Restore default cursor to themed color."
   */
  restoreCursorColor(data) {
    this._onColor.fire([{ type: import_Types.ColorRequestType.RESTORE, index: import_Types.SpecialColorIndex.CURSOR }]);
    return true;
  }
  /**
   * ESC E
   * C1.NEL
   *   DEC mnemonic: NEL (https://vt100.net/docs/vt510-rm/NEL)
   *   Moves cursor to first position on next line.
   *
   * @vt: #Y   C1    NEL   "Next Line"   "\x85"    "Move the cursor to the beginning of the next row."
   * @vt: #Y   ESC   NEL   "Next Line"   "ESC E"   "Move the cursor to the beginning of the next row."
   */
  nextLine() {
    this._activeBuffer.x = 0;
    this.index();
    return true;
  }
  /**
   * ESC =
   *   DEC mnemonic: DECKPAM (https://vt100.net/docs/vt510-rm/DECKPAM.html)
   *   Enables the numeric keypad to send application sequences to the host.
   */
  keypadApplicationMode() {
    this._logService.debug("Serial port requested application keypad.");
    this._coreService.decPrivateModes.applicationKeypad = true;
    this._onRequestSyncScrollBar.fire();
    return true;
  }
  /**
   * ESC >
   *   DEC mnemonic: DECKPNM (https://vt100.net/docs/vt510-rm/DECKPNM.html)
   *   Enables the keypad to send numeric characters to the host.
   */
  keypadNumericMode() {
    this._logService.debug("Switching back to normal keypad.");
    this._coreService.decPrivateModes.applicationKeypad = false;
    this._onRequestSyncScrollBar.fire();
    return true;
  }
  /**
   * ESC % @
   * ESC % G
   *   Select default character set. UTF-8 is not supported (string are unicode anyways)
   *   therefore ESC % G does the same.
   */
  selectDefaultCharset() {
    this._charsetService.setgLevel(0);
    this._charsetService.setgCharset(0, import_Charsets.DEFAULT_CHARSET);
    return true;
  }
  /**
   * ESC ( C
   *   Designate G0 Character Set, VT100, ISO 2022.
   * ESC ) C
   *   Designate G1 Character Set (ISO 2022, VT100).
   * ESC * C
   *   Designate G2 Character Set (ISO 2022, VT220).
   * ESC + C
   *   Designate G3 Character Set (ISO 2022, VT220).
   * ESC - C
   *   Designate G1 Character Set (VT300).
   * ESC . C
   *   Designate G2 Character Set (VT300).
   * ESC / C
   *   Designate G3 Character Set (VT300). C = A  -> ISO Latin-1 Supplemental. - Supported?
   */
  selectCharset(collectAndFlag) {
    if (collectAndFlag.length !== 2) {
      this.selectDefaultCharset();
      return true;
    }
    if (collectAndFlag[0] === "/") {
      return true;
    }
    this._charsetService.setgCharset(GLEVEL[collectAndFlag[0]], import_Charsets.CHARSETS[collectAndFlag[1]] || import_Charsets.DEFAULT_CHARSET);
    return true;
  }
  /**
   * ESC D
   * C1.IND
   *   DEC mnemonic: IND (https://vt100.net/docs/vt510-rm/IND.html)
   *   Moves the cursor down one line in the same column.
   *
   * @vt: #Y   C1    IND   "Index"   "\x84"    "Move the cursor one line down scrolling if needed."
   * @vt: #Y   ESC   IND   "Index"   "ESC D"   "Move the cursor one line down scrolling if needed."
   */
  index() {
    this._restrictCursor();
    this._activeBuffer.y++;
    if (this._activeBuffer.y === this._activeBuffer.scrollBottom + 1) {
      this._activeBuffer.y--;
      this._bufferService.scroll(this._eraseAttrData());
    } else if (this._activeBuffer.y >= this._bufferService.rows) {
      this._activeBuffer.y = this._bufferService.rows - 1;
    }
    this._restrictCursor();
    return true;
  }
  /**
   * ESC H
   * C1.HTS
   *   DEC mnemonic: HTS (https://vt100.net/docs/vt510-rm/HTS.html)
   *   Sets a horizontal tab stop at the column position indicated by
   *   the value of the active column when the terminal receives an HTS.
   *
   * @vt: #Y   C1    HTS   "Horizontal Tabulation Set" "\x88"    "Places a tab stop at the current cursor position."
   * @vt: #Y   ESC   HTS   "Horizontal Tabulation Set" "ESC H"   "Places a tab stop at the current cursor position."
   */
  tabSet() {
    this._activeBuffer.tabs[this._activeBuffer.x] = true;
    return true;
  }
  /**
   * ESC M
   * C1.RI
   *   DEC mnemonic: HTS
   *   Moves the cursor up one line in the same column. If the cursor is at the top margin,
   *   the page scrolls down.
   *
   * @vt: #Y ESC  IR "Reverse Index" "ESC M"  "Move the cursor one line up scrolling if needed."
   */
  reverseIndex() {
    this._restrictCursor();
    if (this._activeBuffer.y === this._activeBuffer.scrollTop) {
      const scrollRegionHeight = this._activeBuffer.scrollBottom - this._activeBuffer.scrollTop;
      this._activeBuffer.lines.shiftElements(this._activeBuffer.ybase + this._activeBuffer.y, scrollRegionHeight, 1);
      this._activeBuffer.lines.set(this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.getBlankLine(this._eraseAttrData()));
      this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
    } else {
      this._activeBuffer.y--;
      this._restrictCursor();
    }
    return true;
  }
  /**
   * ESC c
   *   DEC mnemonic: RIS (https://vt100.net/docs/vt510-rm/RIS.html)
   *   Reset to initial state.
   */
  fullReset() {
    this._parser.reset();
    this._onRequestReset.fire();
    return true;
  }
  reset() {
    this._curAttrData = import_BufferLine.DEFAULT_ATTR_DATA.clone();
    this._eraseAttrDataInternal = import_BufferLine.DEFAULT_ATTR_DATA.clone();
  }
  /**
   * back_color_erase feature for xterm.
   */
  _eraseAttrData() {
    this._eraseAttrDataInternal.bg &= ~(import_Constants.Attributes.CM_MASK | 16777215);
    this._eraseAttrDataInternal.bg |= this._curAttrData.bg & ~4227858432;
    return this._eraseAttrDataInternal;
  }
  /**
   * ESC n
   * ESC o
   * ESC |
   * ESC }
   * ESC ~
   *   DEC mnemonic: LS (https://vt100.net/docs/vt510-rm/LS.html)
   *   When you use a locking shift, the character set remains in GL or GR until
   *   you use another locking shift. (partly supported)
   */
  setgLevel(level) {
    this._charsetService.setgLevel(level);
    return true;
  }
  /**
   * ESC # 8
   *   DEC mnemonic: DECALN (https://vt100.net/docs/vt510-rm/DECALN.html)
   *   This control function fills the complete screen area with
   *   a test pattern (E) used for adjusting screen alignment.
   *
   * @vt: #Y   ESC   DECALN   "Screen Alignment Pattern"  "ESC # 8"  "Fill viewport with a test pattern (E)."
   */
  screenAlignmentPattern() {
    const cell = new import_CellData.CellData();
    cell.content = 1 << import_Constants.Content.WIDTH_SHIFT | "E".charCodeAt(0);
    cell.fg = this._curAttrData.fg;
    cell.bg = this._curAttrData.bg;
    this._setCursor(0, 0);
    for (let yOffset = 0; yOffset < this._bufferService.rows; ++yOffset) {
      const row = this._activeBuffer.ybase + this._activeBuffer.y + yOffset;
      const line = this._activeBuffer.lines.get(row);
      if (line) {
        line.fill(cell);
        line.isWrapped = false;
      }
    }
    this._dirtyRowTracker.markAllDirty();
    this._setCursor(0, 0);
    return true;
  }
  /**
   * DCS $ q Pt ST
   *   DECRQSS (https://vt100.net/docs/vt510-rm/DECRQSS.html)
   *   Request Status String (DECRQSS), VT420 and up.
   *   Response: DECRPSS (https://vt100.net/docs/vt510-rm/DECRPSS.html)
   *
   * @vt: #P[Limited support, see below.]  DCS   DECRQSS   "Request Selection or Setting"  "DCS $ q Pt ST"   "Request several terminal settings."
   * Response is in the form `ESC P 1 $ r Pt ST` for valid requests, where `Pt` contains the
   * corresponding CSI string, `ESC P 0 ST` for invalid requests.
   *
   * Supported requests and responses:
   *
   * | Type                             | Request           | Response (`Pt`)                                       |
   * | -------------------------------- | ----------------- | ----------------------------------------------------- |
   * | Graphic Rendition (SGR)          | `DCS $ q m ST`    | always reporting `0m` (currently broken)              |
   * | Top and Bottom Margins (DECSTBM) | `DCS $ q r ST`    | `Ps ; Ps r`                                           |
   * | Cursor Style (DECSCUSR)          | `DCS $ q SP q ST` | `Ps SP q`                                             |
   * | Protection Attribute (DECSCA)    | `DCS $ q " q ST`  | `Ps " q` (DECSCA 2 is reported as Ps = 0)             |
   * | Conformance Level (DECSCL)       | `DCS $ q " p ST`  | always reporting `61 ; 1 " p` (DECSCL is unsupported) |
   *
   *
   * TODO:
   * - fix SGR report
   * - either check which conformance is better suited or remove the report completely
   *   --> we are currently a mixture of all up to VT400 but dont follow anyone strictly
   */
  requestStatusString(data, params) {
    const f = (s) => {
      this._coreService.triggerDataEvent(`${import_EscapeSequences.C0.ESC}${s}${import_EscapeSequences.C0.ESC}\\`);
      return true;
    };
    const b = this._bufferService.buffer;
    const opts = this._optionsService.rawOptions;
    const STYLES = { "block": 2, "underline": 4, "bar": 6 };
    if (data === '"q') return f(`P1$r${this._curAttrData.isProtected() ? 1 : 0}"q`);
    if (data === '"p') return f(`P1$r61;1"p`);
    if (data === "r") return f(`P1$r${b.scrollTop + 1};${b.scrollBottom + 1}r`);
    if (data === "m") return f(`P1$r0m`);
    if (data === " q") return f(`P1$r${STYLES[opts.cursorStyle] - (opts.cursorBlink ? 1 : 0)} q`);
    return f(`P0$r`);
  }
  markRangeDirty(y1, y2) {
    this._dirtyRowTracker.markRangeDirty(y1, y2);
  }
}
let DirtyRowTracker = class {
  constructor(_bufferService) {
    this._bufferService = _bufferService;
    this.clearRange();
  }
  clearRange() {
    this.start = this._bufferService.buffer.y;
    this.end = this._bufferService.buffer.y;
  }
  markDirty(y) {
    if (y < this.start) {
      this.start = y;
    } else if (y > this.end) {
      this.end = y;
    }
  }
  markRangeDirty(y1, y2) {
    if (y1 > y2) {
      $temp = y1;
      y1 = y2;
      y2 = $temp;
    }
    if (y1 < this.start) {
      this.start = y1;
    }
    if (y2 > this.end) {
      this.end = y2;
    }
  }
  markAllDirty() {
    this.markRangeDirty(0, this._bufferService.rows - 1);
  }
};
DirtyRowTracker = __decorateClass([
  __decorateParam(0, import_Services.IBufferService)
], DirtyRowTracker);
function isValidColorIndex(value) {
  return 0 <= value && value < 256;
}
//# sourceMappingURL=InputHandler.js.map
