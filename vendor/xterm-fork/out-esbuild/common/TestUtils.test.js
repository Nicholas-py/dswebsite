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
var TestUtils_test_exports = {};
__export(TestUtils_test_exports, {
  MockBufferService: () => MockBufferService,
  MockCharsetService: () => MockCharsetService,
  MockCoreMouseService: () => MockCoreMouseService,
  MockCoreService: () => MockCoreService,
  MockDecorationService: () => MockDecorationService,
  MockLogService: () => MockLogService,
  MockOptionsService: () => MockOptionsService,
  MockOscLinkService: () => MockOscLinkService,
  MockUnicodeService: () => MockUnicodeService
});
module.exports = __toCommonJS(TestUtils_test_exports);
var import_Services = require("common/services/Services");
var import_UnicodeService = require("common/services/UnicodeService");
var import_Clone = require("common/Clone");
var import_OptionsService = require("common/services/OptionsService");
var import_BufferSet = require("common/buffer/BufferSet");
var import_UnicodeV6 = require("common/input/UnicodeV6");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class MockBufferService {
  constructor(cols, rows, optionsService = new MockOptionsService()) {
    this.cols = cols;
    this.rows = rows;
    this.buffers = {};
    this.onResize = new import_event.Emitter().event;
    this.onScroll = new import_event.Emitter().event;
    this.isUserScrolling = false;
    this.buffers = new import_BufferSet.BufferSet(optionsService, this);
  }
  get buffer() {
    return this.buffers.active;
  }
  scrollPages(pageCount) {
    throw new Error("Method not implemented.");
  }
  scrollToTop() {
    throw new Error("Method not implemented.");
  }
  scrollToLine(line) {
    throw new Error("Method not implemented.");
  }
  scroll(eraseAttr, isWrapped) {
    throw new Error("Method not implemented.");
  }
  scrollToBottom() {
    throw new Error("Method not implemented.");
  }
  scrollLines(disp, suppressScrollEvent) {
    throw new Error("Method not implemented.");
  }
  resize(cols, rows) {
    this.cols = cols;
    this.rows = rows;
  }
  reset() {
  }
}
class MockCoreMouseService {
  constructor() {
    this.areMouseEventsActive = false;
    this.activeEncoding = "";
    this.activeProtocol = "";
    this.onProtocolChange = new import_event.Emitter().event;
  }
  addEncoding(name) {
  }
  addProtocol(name) {
  }
  reset() {
  }
  triggerMouseEvent(event) {
    return false;
  }
  explainEvents(events) {
    throw new Error("Method not implemented.");
  }
}
class MockCharsetService {
  constructor() {
    this.glevel = 0;
  }
  reset() {
  }
  setgLevel(g) {
  }
  setgCharset(g, charset) {
  }
}
class MockCoreService {
  constructor() {
    this.isCursorInitialized = true;
    this.isCursorHidden = false;
    this.isFocused = false;
    this.modes = {
      insertMode: false
    };
    this.decPrivateModes = {
      applicationCursorKeys: false,
      applicationKeypad: false,
      bracketedPasteMode: false,
      cursorBlink: void 0,
      cursorStyle: void 0,
      origin: false,
      reverseWraparound: false,
      sendFocus: false,
      wraparound: true
    };
    this.onData = new import_event.Emitter().event;
    this.onUserInput = new import_event.Emitter().event;
    this.onBinary = new import_event.Emitter().event;
    this.onRequestScrollToBottom = new import_event.Emitter().event;
  }
  reset() {
  }
  triggerDataEvent(data, wasUserInput) {
  }
  triggerBinaryEvent(data) {
  }
}
class MockLogService {
  constructor() {
    this.logLevel = import_Services.LogLevelEnum.DEBUG;
  }
  trace(message, ...optionalParams) {
  }
  debug(message, ...optionalParams) {
  }
  info(message, ...optionalParams) {
  }
  warn(message, ...optionalParams) {
  }
  error(message, ...optionalParams) {
  }
}
class MockOptionsService {
  constructor(testOptions) {
    this.rawOptions = (0, import_Clone.clone)(import_OptionsService.DEFAULT_OPTIONS);
    this.options = this.rawOptions;
    this.onOptionChange = new import_event.Emitter().event;
    if (testOptions) {
      for (const key of Object.keys(testOptions)) {
        this.rawOptions[key] = testOptions[key];
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  onSpecificOptionChange(key, listener) {
    return this.onOptionChange((eventKey) => {
      if (eventKey === key) {
        listener(this.rawOptions[key]);
      }
    });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  onMultipleOptionChange(keys, listener) {
    return this.onOptionChange((eventKey) => {
      if (keys.indexOf(eventKey) !== -1) {
        listener();
      }
    });
  }
  setOptions(options) {
    for (const key of Object.keys(options)) {
      this.options[key] = options[key];
    }
  }
}
class MockOscLinkService {
  registerLink(linkData) {
    return 1;
  }
  getLinkData(linkId) {
    return void 0;
  }
  addLineToLink(linkId, y) {
  }
}
class MockUnicodeService {
  constructor() {
    this._provider = new import_UnicodeV6.UnicodeV6();
    this.versions = [];
    this.activeVersion = "";
    this.onChange = new import_event.Emitter().event;
    this.wcwidth = (codepoint) => this._provider.wcwidth(codepoint);
  }
  register(provider) {
    throw new Error("Method not implemented.");
  }
  charProperties(codepoint, preceding) {
    let width = this.wcwidth(codepoint);
    let shouldJoin = width === 0 && preceding !== 0;
    if (shouldJoin) {
      const oldWidth = import_UnicodeService.UnicodeService.extractWidth(preceding);
      if (oldWidth === 0) {
        shouldJoin = false;
      } else if (oldWidth > width) {
        width = oldWidth;
      }
    }
    return import_UnicodeService.UnicodeService.createPropertyValue(0, width, shouldJoin);
  }
  getStringCellWidth(s) {
    throw new Error("Method not implemented.");
  }
}
class MockDecorationService {
  constructor() {
    this.onDecorationRegistered = new import_event.Emitter().event;
    this.onDecorationRemoved = new import_event.Emitter().event;
  }
  get decorations() {
    return [].values();
  }
  registerDecoration(decorationOptions) {
    return void 0;
  }
  reset() {
  }
  forEachDecorationAtCell(x, line, layer, callback) {
  }
  dispose() {
  }
}
//# sourceMappingURL=TestUtils.test.js.map
