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
var CoreMouseService_exports = {};
__export(CoreMouseService_exports, {
  CoreMouseService: () => CoreMouseService
});
module.exports = __toCommonJS(CoreMouseService_exports);
var import_Services = require("common/services/Services");
var import_Types = require("common/Types");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const DEFAULT_PROTOCOLS = {
  /**
   * NONE
   * Events: none
   * Modifiers: none
   */
  NONE: {
    events: import_Types.CoreMouseEventType.NONE,
    restrict: () => false
  },
  /**
   * X10
   * Events: mousedown
   * Modifiers: none
   */
  X10: {
    events: import_Types.CoreMouseEventType.DOWN,
    restrict: (e) => {
      if (e.button === import_Types.CoreMouseButton.WHEEL || e.action !== import_Types.CoreMouseAction.DOWN) {
        return false;
      }
      e.ctrl = false;
      e.alt = false;
      e.shift = false;
      return true;
    }
  },
  /**
   * VT200
   * Events: mousedown / mouseup / wheel
   * Modifiers: all
   */
  VT200: {
    events: import_Types.CoreMouseEventType.DOWN | import_Types.CoreMouseEventType.UP | import_Types.CoreMouseEventType.WHEEL,
    restrict: (e) => {
      if (e.action === import_Types.CoreMouseAction.MOVE) {
        return false;
      }
      return true;
    }
  },
  /**
   * DRAG
   * Events: mousedown / mouseup / wheel / mousedrag
   * Modifiers: all
   */
  DRAG: {
    events: import_Types.CoreMouseEventType.DOWN | import_Types.CoreMouseEventType.UP | import_Types.CoreMouseEventType.WHEEL | import_Types.CoreMouseEventType.DRAG,
    restrict: (e) => {
      if (e.action === import_Types.CoreMouseAction.MOVE && e.button === import_Types.CoreMouseButton.NONE) {
        return false;
      }
      return true;
    }
  },
  /**
   * ANY
   * Events: all mouse related events
   * Modifiers: all
   */
  ANY: {
    events: import_Types.CoreMouseEventType.DOWN | import_Types.CoreMouseEventType.UP | import_Types.CoreMouseEventType.WHEEL | import_Types.CoreMouseEventType.DRAG | import_Types.CoreMouseEventType.MOVE,
    restrict: (e) => true
  }
};
var Modifiers = /* @__PURE__ */ ((Modifiers2) => {
  Modifiers2[Modifiers2["SHIFT"] = 4] = "SHIFT";
  Modifiers2[Modifiers2["ALT"] = 8] = "ALT";
  Modifiers2[Modifiers2["CTRL"] = 16] = "CTRL";
  return Modifiers2;
})(Modifiers || {});
function eventCode(e, isSGR) {
  let code = (e.ctrl ? 16 /* CTRL */ : 0) | (e.shift ? 4 /* SHIFT */ : 0) | (e.alt ? 8 /* ALT */ : 0);
  if (e.button === import_Types.CoreMouseButton.WHEEL) {
    code |= 64;
    code |= e.action;
  } else {
    code |= e.button & 3;
    if (e.button & 4) {
      code |= 64;
    }
    if (e.button & 8) {
      code |= 128;
    }
    if (e.action === import_Types.CoreMouseAction.MOVE) {
      code |= import_Types.CoreMouseAction.MOVE;
    } else if (e.action === import_Types.CoreMouseAction.UP && !isSGR) {
      code |= import_Types.CoreMouseButton.NONE;
    }
  }
  return code;
}
const S = String.fromCharCode;
const DEFAULT_ENCODINGS = {
  /**
   * DEFAULT - CSI M Pb Px Py
   * Single byte encoding for coords and event code.
   * Can encode values up to 223 (1-based).
   */
  DEFAULT: (e) => {
    const params = [eventCode(e, false) + 32, e.col + 32, e.row + 32];
    if (params[0] > 255 || params[1] > 255 || params[2] > 255) {
      return "";
    }
    return `\x1B[M${S(params[0])}${S(params[1])}${S(params[2])}`;
  },
  /**
   * SGR - CSI < Pb ; Px ; Py M|m
   * No encoding limitation.
   * Can report button on release and works with a well formed sequence.
   */
  SGR: (e) => {
    const final = e.action === import_Types.CoreMouseAction.UP && e.button !== import_Types.CoreMouseButton.WHEEL ? "m" : "M";
    return `\x1B[<${eventCode(e, true)};${e.col};${e.row}${final}`;
  },
  SGR_PIXELS: (e) => {
    const final = e.action === import_Types.CoreMouseAction.UP && e.button !== import_Types.CoreMouseButton.WHEEL ? "m" : "M";
    return `\x1B[<${eventCode(e, true)};${e.x};${e.y}${final}`;
  }
};
let CoreMouseService = class extends import_lifecycle.Disposable {
  constructor(_bufferService, _coreService) {
    super();
    this._bufferService = _bufferService;
    this._coreService = _coreService;
    this._protocols = {};
    this._encodings = {};
    this._activeProtocol = "";
    this._activeEncoding = "";
    this._lastEvent = null;
    this._onProtocolChange = this._register(new import_event.Emitter());
    this.onProtocolChange = this._onProtocolChange.event;
    for (const name of Object.keys(DEFAULT_PROTOCOLS)) this.addProtocol(name, DEFAULT_PROTOCOLS[name]);
    for (const name of Object.keys(DEFAULT_ENCODINGS)) this.addEncoding(name, DEFAULT_ENCODINGS[name]);
    this.reset();
  }
  addProtocol(name, protocol) {
    this._protocols[name] = protocol;
  }
  addEncoding(name, encoding) {
    this._encodings[name] = encoding;
  }
  get activeProtocol() {
    return this._activeProtocol;
  }
  get areMouseEventsActive() {
    return this._protocols[this._activeProtocol].events !== 0;
  }
  set activeProtocol(name) {
    if (!this._protocols[name]) {
      throw new Error(`unknown protocol "${name}"`);
    }
    this._activeProtocol = name;
    this._onProtocolChange.fire(this._protocols[name].events);
  }
  get activeEncoding() {
    return this._activeEncoding;
  }
  set activeEncoding(name) {
    if (!this._encodings[name]) {
      throw new Error(`unknown encoding "${name}"`);
    }
    this._activeEncoding = name;
  }
  reset() {
    this.activeProtocol = "NONE";
    this.activeEncoding = "DEFAULT";
    this._lastEvent = null;
  }
  /**
   * Triggers a mouse event to be sent.
   *
   * Returns true if the event passed all protocol restrictions and a report
   * was sent, otherwise false. The return value may be used to decide whether
   * the default event action in the bowser component should be omitted.
   *
   * Note: The method will change values of the given event object
   * to fullfill protocol and encoding restrictions.
   */
  triggerMouseEvent(e) {
    if (e.col < 0 || e.col >= this._bufferService.cols || e.row < 0 || e.row >= this._bufferService.rows) {
      return false;
    }
    if (e.button === import_Types.CoreMouseButton.WHEEL && e.action === import_Types.CoreMouseAction.MOVE) {
      return false;
    }
    if (e.button === import_Types.CoreMouseButton.NONE && e.action !== import_Types.CoreMouseAction.MOVE) {
      return false;
    }
    if (e.button !== import_Types.CoreMouseButton.WHEEL && (e.action === import_Types.CoreMouseAction.LEFT || e.action === import_Types.CoreMouseAction.RIGHT)) {
      return false;
    }
    e.col++;
    e.row++;
    if (e.action === import_Types.CoreMouseAction.MOVE && this._lastEvent && this._equalEvents(this._lastEvent, e, this._activeEncoding === "SGR_PIXELS")) {
      return false;
    }
    if (!this._protocols[this._activeProtocol].restrict(e)) {
      return false;
    }
    const report = this._encodings[this._activeEncoding](e);
    if (report) {
      if (this._activeEncoding === "DEFAULT") {
        this._coreService.triggerBinaryEvent(report);
      } else {
        this._coreService.triggerDataEvent(report, true);
      }
    }
    this._lastEvent = e;
    return true;
  }
  explainEvents(events) {
    return {
      down: !!(events & import_Types.CoreMouseEventType.DOWN),
      up: !!(events & import_Types.CoreMouseEventType.UP),
      drag: !!(events & import_Types.CoreMouseEventType.DRAG),
      move: !!(events & import_Types.CoreMouseEventType.MOVE),
      wheel: !!(events & import_Types.CoreMouseEventType.WHEEL)
    };
  }
  _equalEvents(e1, e2, pixels) {
    if (pixels) {
      if (e1.x !== e2.x) return false;
      if (e1.y !== e2.y) return false;
    } else {
      if (e1.col !== e2.col) return false;
      if (e1.row !== e2.row) return false;
    }
    if (e1.button !== e2.button) return false;
    if (e1.action !== e2.action) return false;
    if (e1.ctrl !== e2.ctrl) return false;
    if (e1.alt !== e2.alt) return false;
    if (e1.shift !== e2.shift) return false;
    return true;
  }
};
CoreMouseService = __decorateClass([
  __decorateParam(0, import_Services.IBufferService),
  __decorateParam(1, import_Services.ICoreService)
], CoreMouseService);
//# sourceMappingURL=CoreMouseService.js.map
