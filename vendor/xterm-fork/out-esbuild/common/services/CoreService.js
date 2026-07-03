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
var CoreService_exports = {};
__export(CoreService_exports, {
  CoreService: () => CoreService
});
module.exports = __toCommonJS(CoreService_exports);
var import_Clone = require("common/Clone");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_Services = require("common/services/Services");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const DEFAULT_MODES = Object.freeze({
  insertMode: false
});
const DEFAULT_DEC_PRIVATE_MODES = Object.freeze({
  applicationCursorKeys: false,
  applicationKeypad: false,
  bracketedPasteMode: false,
  cursorBlink: void 0,
  cursorStyle: void 0,
  origin: false,
  reverseWraparound: false,
  sendFocus: false,
  wraparound: true
  // defaults: xterm - true, vt100 - false
});
let CoreService = class extends import_lifecycle.Disposable {
  constructor(_bufferService, _logService, _optionsService) {
    super();
    this._bufferService = _bufferService;
    this._logService = _logService;
    this._optionsService = _optionsService;
    this.isCursorInitialized = false;
    this.isCursorHidden = false;
    this._onData = this._register(new import_event.Emitter());
    this.onData = this._onData.event;
    this._onUserInput = this._register(new import_event.Emitter());
    this.onUserInput = this._onUserInput.event;
    this._onBinary = this._register(new import_event.Emitter());
    this.onBinary = this._onBinary.event;
    this._onRequestScrollToBottom = this._register(new import_event.Emitter());
    this.onRequestScrollToBottom = this._onRequestScrollToBottom.event;
    this.modes = (0, import_Clone.clone)(DEFAULT_MODES);
    this.decPrivateModes = (0, import_Clone.clone)(DEFAULT_DEC_PRIVATE_MODES);
  }
  reset() {
    this.modes = (0, import_Clone.clone)(DEFAULT_MODES);
    this.decPrivateModes = (0, import_Clone.clone)(DEFAULT_DEC_PRIVATE_MODES);
  }
  triggerDataEvent(data, wasUserInput = false) {
    if (this._optionsService.rawOptions.disableStdin) {
      return;
    }
    const buffer = this._bufferService.buffer;
    if (wasUserInput && this._optionsService.rawOptions.scrollOnUserInput && buffer.ybase !== buffer.ydisp) {
      this._onRequestScrollToBottom.fire();
    }
    if (wasUserInput) {
      this._onUserInput.fire();
    }
    this._logService.debug(`sending data "${data}"`, () => data.split("").map((e) => e.charCodeAt(0)));
    this._onData.fire(data);
  }
  triggerBinaryEvent(data) {
    if (this._optionsService.rawOptions.disableStdin) {
      return;
    }
    this._logService.debug(`sending binary "${data}"`, () => data.split("").map((e) => e.charCodeAt(0)));
    this._onBinary.fire(data);
  }
};
CoreService = __decorateClass([
  __decorateParam(0, import_Services.IBufferService),
  __decorateParam(1, import_Services.ILogService),
  __decorateParam(2, import_Services.IOptionsService)
], CoreService);
//# sourceMappingURL=CoreService.js.map
