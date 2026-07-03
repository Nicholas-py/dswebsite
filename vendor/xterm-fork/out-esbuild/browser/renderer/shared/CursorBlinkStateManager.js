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
var CursorBlinkStateManager_exports = {};
__export(CursorBlinkStateManager_exports, {
  CursorBlinkStateManager: () => CursorBlinkStateManager
});
module.exports = __toCommonJS(CursorBlinkStateManager_exports);
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const BLINK_INTERVAL = 600;
class CursorBlinkStateManager {
  constructor(_renderCallback, _coreBrowserService) {
    this._renderCallback = _renderCallback;
    this._coreBrowserService = _coreBrowserService;
    this.isCursorVisible = true;
    if (this._coreBrowserService.isFocused) {
      this._restartInterval();
    }
  }
  get isPaused() {
    return !(this._blinkStartTimeout || this._blinkInterval);
  }
  dispose() {
    if (this._blinkInterval) {
      this._coreBrowserService.window.clearInterval(this._blinkInterval);
      this._blinkInterval = void 0;
    }
    if (this._blinkStartTimeout) {
      this._coreBrowserService.window.clearTimeout(this._blinkStartTimeout);
      this._blinkStartTimeout = void 0;
    }
    if (this._animationFrame) {
      this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame);
      this._animationFrame = void 0;
    }
  }
  restartBlinkAnimation() {
    if (this.isPaused) {
      return;
    }
    this._animationTimeRestarted = Date.now();
    this.isCursorVisible = true;
    if (!this._animationFrame) {
      this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
        this._renderCallback();
        this._animationFrame = void 0;
      });
    }
  }
  _restartInterval(timeToStart = BLINK_INTERVAL) {
    if (this._blinkInterval) {
      this._coreBrowserService.window.clearInterval(this._blinkInterval);
      this._blinkInterval = void 0;
    }
    this._blinkStartTimeout = this._coreBrowserService.window.setTimeout(() => {
      if (this._animationTimeRestarted) {
        const time = BLINK_INTERVAL - (Date.now() - this._animationTimeRestarted);
        this._animationTimeRestarted = void 0;
        if (time > 0) {
          this._restartInterval(time);
          return;
        }
      }
      this.isCursorVisible = false;
      this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
        this._renderCallback();
        this._animationFrame = void 0;
      });
      this._blinkInterval = this._coreBrowserService.window.setInterval(() => {
        if (this._animationTimeRestarted) {
          const time = BLINK_INTERVAL - (Date.now() - this._animationTimeRestarted);
          this._animationTimeRestarted = void 0;
          this._restartInterval(time);
          return;
        }
        this.isCursorVisible = !this.isCursorVisible;
        this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
          this._renderCallback();
          this._animationFrame = void 0;
        });
      }, BLINK_INTERVAL);
    }, timeToStart);
  }
  pause() {
    this.isCursorVisible = true;
    if (this._blinkInterval) {
      this._coreBrowserService.window.clearInterval(this._blinkInterval);
      this._blinkInterval = void 0;
    }
    if (this._blinkStartTimeout) {
      this._coreBrowserService.window.clearTimeout(this._blinkStartTimeout);
      this._blinkStartTimeout = void 0;
    }
    if (this._animationFrame) {
      this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame);
      this._animationFrame = void 0;
    }
  }
  resume() {
    this.pause();
    this._animationTimeRestarted = void 0;
    this._restartInterval();
    this.restartBlinkAnimation();
  }
}
//# sourceMappingURL=CursorBlinkStateManager.js.map
