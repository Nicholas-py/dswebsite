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
var Viewport_exports = {};
__export(Viewport_exports, {
  Viewport: () => Viewport
});
module.exports = __toCommonJS(Viewport_exports);
var import_Services = require("browser/services/Services");
var import_Constants = require("browser/shared/Constants");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_Services2 = require("common/services/Services");
var import_Types = require("common/Types");
var import_dom = require("vs/base/browser/dom");
var import_scrollableElement = require("vs/base/browser/ui/scrollbar/scrollableElement");
var import_event = require("vs/base/common/event");
var import_scrollable = require("vs/base/common/scrollable");
/**
 * Copyright (c) 2024 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let Viewport = class extends import_lifecycle.Disposable {
  constructor(element, screenElement, _bufferService, coreBrowserService, coreMouseService, themeService, _optionsService, _renderService) {
    super();
    this._bufferService = _bufferService;
    this._optionsService = _optionsService;
    this._renderService = _renderService;
    this._onRequestScrollLines = this._register(new import_event.Emitter());
    this.onRequestScrollLines = this._onRequestScrollLines.event;
    this._isSyncing = false;
    this._isHandlingScroll = false;
    this._suppressOnScrollHandler = false;
    const scrollable = this._register(new import_scrollable.Scrollable({
      forceIntegerValues: false,
      smoothScrollDuration: this._optionsService.rawOptions.smoothScrollDuration,
      // This is used over `IRenderService.addRefreshCallback` since it can be canceled
      scheduleAtNextAnimationFrame: (cb) => (0, import_dom.scheduleAtNextAnimationFrame)(coreBrowserService.window, cb)
    }));
    this._register(this._optionsService.onSpecificOptionChange("smoothScrollDuration", () => {
      scrollable.setSmoothScrollDuration(this._optionsService.rawOptions.smoothScrollDuration);
    }));
    this._scrollableElement = this._register(new import_scrollableElement.SmoothScrollableElement(screenElement, {
      vertical: import_scrollable.ScrollbarVisibility.Auto,
      horizontal: import_scrollable.ScrollbarVisibility.Hidden,
      useShadows: false,
      mouseWheelSmoothScroll: true,
      ...this._getChangeOptions()
    }, scrollable));
    this._register(this._optionsService.onMultipleOptionChange([
      "scrollSensitivity",
      "fastScrollSensitivity",
      "overviewRuler"
    ], () => this._scrollableElement.updateOptions(this._getChangeOptions())));
    this._register(coreMouseService.onProtocolChange((type) => {
      this._scrollableElement.updateOptions({
        handleMouseWheel: !(type & import_Types.CoreMouseEventType.WHEEL)
      });
    }));
    this._scrollableElement.setScrollDimensions({ height: 0, scrollHeight: 0 });
    this._register(import_event.Event.runAndSubscribe(themeService.onChangeColors, () => {
      this._scrollableElement.getDomNode().style.backgroundColor = themeService.colors.background.css;
    }));
    element.appendChild(this._scrollableElement.getDomNode());
    this._register((0, import_lifecycle.toDisposable)(() => this._scrollableElement.getDomNode().remove()));
    this._styleElement = coreBrowserService.mainDocument.createElement("style");
    screenElement.appendChild(this._styleElement);
    this._register((0, import_lifecycle.toDisposable)(() => this._styleElement.remove()));
    this._register(import_event.Event.runAndSubscribe(themeService.onChangeColors, () => {
      this._styleElement.textContent = [
        `.xterm .xterm-scrollable-element > .scrollbar > .slider {`,
        `  background: ${themeService.colors.scrollbarSliderBackground.css};`,
        `}`,
        `.xterm .xterm-scrollable-element > .scrollbar > .slider:hover {`,
        `  background: ${themeService.colors.scrollbarSliderHoverBackground.css};`,
        `}`,
        `.xterm .xterm-scrollable-element > .scrollbar > .slider.active {`,
        `  background: ${themeService.colors.scrollbarSliderActiveBackground.css};`,
        `}`
      ].join("\n");
    }));
    this._register(this._bufferService.onResize(() => this._queueSync()));
    this._register(this._bufferService.buffers.onBufferActivate(() => this._queueSync()));
    this._register(this._bufferService.onScroll(() => this._sync()));
    this._register(this._scrollableElement.onScroll((e) => this._handleScroll(e)));
  }
  scrollLines(disp) {
    const pos = this._scrollableElement.getScrollPosition();
    this._scrollableElement.setScrollPosition({
      reuseAnimation: true,
      scrollTop: pos.scrollTop + disp * this._renderService.dimensions.css.cell.height
    });
  }
  scrollToLine(line, disableSmoothScroll) {
    if (disableSmoothScroll) {
      this._latestYDisp = line;
    }
    this._scrollableElement.setScrollPosition({
      reuseAnimation: !disableSmoothScroll,
      scrollTop: line * this._renderService.dimensions.css.cell.height
    });
  }
  _getChangeOptions() {
    return {
      mouseWheelScrollSensitivity: this._optionsService.rawOptions.scrollSensitivity,
      fastScrollSensitivity: this._optionsService.rawOptions.fastScrollSensitivity,
      verticalScrollbarSize: this._optionsService.rawOptions.overviewRuler?.width || import_Constants.ViewportConstants.DEFAULT_SCROLL_BAR_WIDTH
    };
  }
  _queueSync(ydisp) {
    if (ydisp !== void 0) {
      this._latestYDisp = ydisp;
    }
    if (this._queuedAnimationFrame !== void 0) {
      return;
    }
    this._queuedAnimationFrame = this._renderService.addRefreshCallback(() => {
      this._queuedAnimationFrame = void 0;
      this._sync(this._latestYDisp);
    });
  }
  _sync(ydisp = this._bufferService.buffer.ydisp) {
    if (!this._renderService || this._isSyncing) {
      return;
    }
    this._isSyncing = true;
    this._suppressOnScrollHandler = true;
    this._scrollableElement.setScrollDimensions({
      height: this._renderService.dimensions.css.canvas.height,
      scrollHeight: this._renderService.dimensions.css.cell.height * this._bufferService.buffer.lines.length
    });
    this._suppressOnScrollHandler = false;
    if (ydisp !== this._latestYDisp) {
      this._scrollableElement.setScrollPosition({
        scrollTop: ydisp * this._renderService.dimensions.css.cell.height
      });
    }
    this._isSyncing = false;
  }
  _handleScroll(e) {
    if (!this._renderService) {
      return;
    }
    if (this._isHandlingScroll || this._suppressOnScrollHandler) {
      return;
    }
    this._isHandlingScroll = true;
    const newRow = Math.round(e.scrollTop / this._renderService.dimensions.css.cell.height);
    const diff = newRow - this._bufferService.buffer.ydisp;
    if (diff !== 0) {
      this._latestYDisp = newRow;
      this._onRequestScrollLines.fire(diff);
    }
    this._isHandlingScroll = false;
  }
};
Viewport = __decorateClass([
  __decorateParam(2, import_Services2.IBufferService),
  __decorateParam(3, import_Services.ICoreBrowserService),
  __decorateParam(4, import_Services2.ICoreMouseService),
  __decorateParam(5, import_Services.IThemeService),
  __decorateParam(6, import_Services2.IOptionsService),
  __decorateParam(7, import_Services.IRenderService)
], Viewport);
//# sourceMappingURL=Viewport.js.map
