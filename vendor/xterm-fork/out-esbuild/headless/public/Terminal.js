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
var import_BufferNamespaceApi = require("common/public/BufferNamespaceApi");
var import_ParserApi = require("common/public/ParserApi");
var import_UnicodeApi = require("common/public/UnicodeApi");
var import_Terminal = require("headless/Terminal");
var import_AddonManager = require("common/public/AddonManager");
var import_lifecycle = require("vs/base/common/lifecycle");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const CONSTRUCTOR_ONLY_OPTIONS = ["cols", "rows"];
class Terminal extends import_lifecycle.Disposable {
  constructor(options) {
    super();
    this._core = this._register(new import_Terminal.Terminal(options));
    this._addonManager = this._register(new import_AddonManager.AddonManager());
    this._publicOptions = { ...this._core.options };
    const getter = (propName) => {
      return this._core.options[propName];
    };
    const setter = (propName, value) => {
      this._checkReadonlyOptions(propName);
      this._core.options[propName] = value;
    };
    for (const propName in this._core.options) {
      Object.defineProperty(this._publicOptions, propName, {
        get: () => {
          return this._core.options[propName];
        },
        set: (value) => {
          this._checkReadonlyOptions(propName);
          this._core.options[propName] = value;
        }
      });
      const desc = {
        get: getter.bind(this, propName),
        set: setter.bind(this, propName)
      };
      Object.defineProperty(this._publicOptions, propName, desc);
    }
  }
  _checkReadonlyOptions(propName) {
    if (CONSTRUCTOR_ONLY_OPTIONS.includes(propName)) {
      throw new Error(`Option "${propName}" can only be set in the constructor`);
    }
  }
  _checkProposedApi() {
    if (!this._core.optionsService.options.allowProposedApi) {
      throw new Error("You must set the allowProposedApi option to true to use proposed API");
    }
  }
  get onBell() {
    return this._core.onBell;
  }
  get onBinary() {
    return this._core.onBinary;
  }
  get onCursorMove() {
    return this._core.onCursorMove;
  }
  get onData() {
    return this._core.onData;
  }
  get onLineFeed() {
    return this._core.onLineFeed;
  }
  get onResize() {
    return this._core.onResize;
  }
  get onScroll() {
    return this._core.onScroll;
  }
  get onTitleChange() {
    return this._core.onTitleChange;
  }
  get onWriteParsed() {
    return this._core.onWriteParsed;
  }
  get parser() {
    this._checkProposedApi();
    if (!this._parser) {
      this._parser = new import_ParserApi.ParserApi(this._core);
    }
    return this._parser;
  }
  get unicode() {
    this._checkProposedApi();
    return new import_UnicodeApi.UnicodeApi(this._core);
  }
  get rows() {
    return this._core.rows;
  }
  get cols() {
    return this._core.cols;
  }
  get buffer() {
    this._checkProposedApi();
    if (!this._buffer) {
      this._buffer = this._register(new import_BufferNamespaceApi.BufferNamespaceApi(this._core));
    }
    return this._buffer;
  }
  get markers() {
    this._checkProposedApi();
    return this._core.markers;
  }
  get modes() {
    const m = this._core.coreService.decPrivateModes;
    let mouseTrackingMode = "none";
    switch (this._core.coreMouseService.activeProtocol) {
      case "X10":
        mouseTrackingMode = "x10";
        break;
      case "VT200":
        mouseTrackingMode = "vt200";
        break;
      case "DRAG":
        mouseTrackingMode = "drag";
        break;
      case "ANY":
        mouseTrackingMode = "any";
        break;
    }
    return {
      applicationCursorKeysMode: m.applicationCursorKeys,
      applicationKeypadMode: m.applicationKeypad,
      bracketedPasteMode: m.bracketedPasteMode,
      insertMode: this._core.coreService.modes.insertMode,
      mouseTrackingMode,
      originMode: m.origin,
      reverseWraparoundMode: m.reverseWraparound,
      sendFocusMode: m.sendFocus,
      wraparoundMode: m.wraparound
    };
  }
  get options() {
    return this._publicOptions;
  }
  set options(options) {
    for (const propName in options) {
      this._publicOptions[propName] = options[propName];
    }
  }
  input(data, wasUserInput = true) {
    this._core.input(data, wasUserInput);
  }
  resize(columns, rows) {
    this._verifyIntegers(columns, rows);
    this._core.resize(columns, rows);
  }
  registerMarker(cursorYOffset = 0) {
    this._checkProposedApi();
    this._verifyIntegers(cursorYOffset);
    return this._core.addMarker(cursorYOffset);
  }
  addMarker(cursorYOffset) {
    return this.registerMarker(cursorYOffset);
  }
  dispose() {
    super.dispose();
  }
  scrollLines(amount) {
    this._verifyIntegers(amount);
    this._core.scrollLines(amount);
  }
  scrollPages(pageCount) {
    this._verifyIntegers(pageCount);
    this._core.scrollPages(pageCount);
  }
  scrollToTop() {
    this._core.scrollToTop();
  }
  scrollToBottom() {
    this._core.scrollToBottom();
  }
  scrollToLine(line) {
    this._verifyIntegers(line);
    this._core.scrollToLine(line);
  }
  clear() {
    this._core.clear();
  }
  write(data, callback) {
    this._core.write(data, callback);
  }
  writeln(data, callback) {
    this._core.write(data);
    this._core.write("\r\n", callback);
  }
  reset() {
    this._core.reset();
  }
  loadAddon(addon) {
    this._addonManager.loadAddon(this, addon);
  }
  _verifyIntegers(...values) {
    for (const value of values) {
      if (value === Infinity || isNaN(value) || value % 1 !== 0) {
        throw new Error("This API only accepts integers");
      }
    }
  }
}
//# sourceMappingURL=Terminal.js.map
