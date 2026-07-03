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
var CoreBrowserService_exports = {};
__export(CoreBrowserService_exports, {
  CoreBrowserService: () => CoreBrowserService
});
module.exports = __toCommonJS(CoreBrowserService_exports);
var import_event = require("vs/base/common/event");
var import_dom = require("vs/base/browser/dom");
var import_lifecycle = require("vs/base/common/lifecycle");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class CoreBrowserService extends import_lifecycle.Disposable {
  constructor(_textarea, _window, mainDocument) {
    super();
    this._textarea = _textarea;
    this._window = _window;
    this.mainDocument = mainDocument;
    this._isFocused = false;
    this._cachedIsFocused = void 0;
    this._screenDprMonitor = this._register(new ScreenDprMonitor(this._window));
    this._onDprChange = this._register(new import_event.Emitter());
    this.onDprChange = this._onDprChange.event;
    this._onWindowChange = this._register(new import_event.Emitter());
    this.onWindowChange = this._onWindowChange.event;
    this._register(this.onWindowChange((w) => this._screenDprMonitor.setWindow(w)));
    this._register(import_event.Event.forward(this._screenDprMonitor.onDprChange, this._onDprChange));
    this._register((0, import_dom.addDisposableListener)(this._textarea, "focus", () => this._isFocused = true));
    this._register((0, import_dom.addDisposableListener)(this._textarea, "blur", () => this._isFocused = false));
  }
  get window() {
    return this._window;
  }
  set window(value) {
    if (this._window !== value) {
      this._window = value;
      this._onWindowChange.fire(this._window);
    }
  }
  get dpr() {
    return this.window.devicePixelRatio;
  }
  get isFocused() {
    if (this._cachedIsFocused === void 0) {
      this._cachedIsFocused = this._isFocused && this._textarea.ownerDocument.hasFocus();
      queueMicrotask(() => this._cachedIsFocused = void 0);
    }
    return this._cachedIsFocused;
  }
}
class ScreenDprMonitor extends import_lifecycle.Disposable {
  constructor(_parentWindow) {
    super();
    this._parentWindow = _parentWindow;
    this._windowResizeListener = this._register(new import_lifecycle.MutableDisposable());
    this._onDprChange = this._register(new import_event.Emitter());
    this.onDprChange = this._onDprChange.event;
    this._outerListener = () => this._setDprAndFireIfDiffers();
    this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio;
    this._updateDpr();
    this._setWindowResizeListener();
    this._register((0, import_lifecycle.toDisposable)(() => this.clearListener()));
  }
  setWindow(parentWindow) {
    this._parentWindow = parentWindow;
    this._setWindowResizeListener();
    this._setDprAndFireIfDiffers();
  }
  _setWindowResizeListener() {
    this._windowResizeListener.value = (0, import_dom.addDisposableListener)(this._parentWindow, "resize", () => this._setDprAndFireIfDiffers());
  }
  _setDprAndFireIfDiffers() {
    if (this._parentWindow.devicePixelRatio !== this._currentDevicePixelRatio) {
      this._onDprChange.fire(this._parentWindow.devicePixelRatio);
    }
    this._updateDpr();
  }
  _updateDpr() {
    if (!this._outerListener) {
      return;
    }
    this._resolutionMediaMatchList?.removeListener(this._outerListener);
    this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio;
    this._resolutionMediaMatchList = this._parentWindow.matchMedia(`screen and (resolution: ${this._parentWindow.devicePixelRatio}dppx)`);
    this._resolutionMediaMatchList.addListener(this._outerListener);
  }
  clearListener() {
    if (!this._resolutionMediaMatchList || !this._outerListener) {
      return;
    }
    this._resolutionMediaMatchList.removeListener(this._outerListener);
    this._resolutionMediaMatchList = void 0;
    this._outerListener = void 0;
  }
}
//# sourceMappingURL=CoreBrowserService.js.map
