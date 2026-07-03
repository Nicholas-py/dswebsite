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
var globalPointerMoveMonitor_exports = {};
__export(globalPointerMoveMonitor_exports, {
  GlobalPointerMoveMonitor: () => GlobalPointerMoveMonitor
});
module.exports = __toCommonJS(globalPointerMoveMonitor_exports);
var dom = __toESM(require("vs/base/browser/dom"));
var import_lifecycle = require("vs/base/common/lifecycle");
class GlobalPointerMoveMonitor {
  constructor() {
    this._hooks = new import_lifecycle.DisposableStore();
    this._pointerMoveCallback = null;
    this._onStopCallback = null;
  }
  dispose() {
    this.stopMonitoring(false);
    this._hooks.dispose();
  }
  stopMonitoring(invokeStopCallback, browserEvent) {
    if (!this.isMonitoring()) {
      return;
    }
    this._hooks.clear();
    this._pointerMoveCallback = null;
    const onStopCallback = this._onStopCallback;
    this._onStopCallback = null;
    if (invokeStopCallback && onStopCallback) {
      onStopCallback(browserEvent);
    }
  }
  isMonitoring() {
    return !!this._pointerMoveCallback;
  }
  startMonitoring(initialElement, pointerId, initialButtons, pointerMoveCallback, onStopCallback) {
    if (this.isMonitoring()) {
      this.stopMonitoring(false);
    }
    this._pointerMoveCallback = pointerMoveCallback;
    this._onStopCallback = onStopCallback;
    let eventSource = initialElement;
    try {
      initialElement.setPointerCapture(pointerId);
      this._hooks.add((0, import_lifecycle.toDisposable)(() => {
        try {
          initialElement.releasePointerCapture(pointerId);
        } catch (err) {
        }
      }));
    } catch (err) {
      eventSource = dom.getWindow(initialElement);
    }
    this._hooks.add(dom.addDisposableListener(
      eventSource,
      dom.EventType.POINTER_MOVE,
      (e) => {
        if (e.buttons !== initialButtons) {
          this.stopMonitoring(true);
          return;
        }
        e.preventDefault();
        this._pointerMoveCallback(e);
      }
    ));
    this._hooks.add(dom.addDisposableListener(
      eventSource,
      dom.EventType.POINTER_UP,
      (e) => this.stopMonitoring(true)
    ));
  }
}
//# sourceMappingURL=globalPointerMoveMonitor.js.map
