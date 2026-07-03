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
var RenderService_exports = {};
__export(RenderService_exports, {
  RenderService: () => RenderService
});
module.exports = __toCommonJS(RenderService_exports);
var import_RenderDebouncer = require("browser/RenderDebouncer");
var import_Services = require("browser/services/Services");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_TaskQueue = require("common/TaskQueue");
var import_Services2 = require("common/services/Services");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let RenderService = class extends import_lifecycle.Disposable {
  constructor(_rowCount, screenElement, optionsService, _charSizeService, decorationService, bufferService, coreBrowserService, themeService) {
    super();
    this._rowCount = _rowCount;
    this._charSizeService = _charSizeService;
    this._renderer = this._register(new import_lifecycle.MutableDisposable());
    this._pausedResizeTask = new import_TaskQueue.DebouncedIdleTask();
    this._observerDisposable = this._register(new import_lifecycle.MutableDisposable());
    this._isPaused = false;
    this._needsFullRefresh = false;
    this._isNextRenderRedrawOnly = true;
    this._needsSelectionRefresh = false;
    this._canvasWidth = 0;
    this._canvasHeight = 0;
    this._selectionState = {
      start: void 0,
      end: void 0,
      columnSelectMode: false
    };
    this._onDimensionsChange = this._register(new import_event.Emitter());
    this.onDimensionsChange = this._onDimensionsChange.event;
    this._onRenderedViewportChange = this._register(new import_event.Emitter());
    this.onRenderedViewportChange = this._onRenderedViewportChange.event;
    this._onRender = this._register(new import_event.Emitter());
    this.onRender = this._onRender.event;
    this._onRefreshRequest = this._register(new import_event.Emitter());
    this.onRefreshRequest = this._onRefreshRequest.event;
    this._renderDebouncer = new import_RenderDebouncer.RenderDebouncer((start, end) => this._renderRows(start, end), coreBrowserService);
    this._register(this._renderDebouncer);
    this._register(coreBrowserService.onDprChange(() => this.handleDevicePixelRatioChange()));
    this._register(bufferService.onResize(() => this._fullRefresh()));
    this._register(bufferService.buffers.onBufferActivate(() => this._renderer.value?.clear()));
    this._register(optionsService.onOptionChange(() => this._handleOptionsChanged()));
    this._register(this._charSizeService.onCharSizeChange(() => this.handleCharSizeChanged()));
    this._register(decorationService.onDecorationRegistered(() => this._fullRefresh()));
    this._register(decorationService.onDecorationRemoved(() => this._fullRefresh()));
    this._register(optionsService.onMultipleOptionChange([
      "customGlyphs",
      "drawBoldTextInBrightColors",
      "letterSpacing",
      "lineHeight",
      "fontFamily",
      "fontSize",
      "fontWeight",
      "fontWeightBold",
      "minimumContrastRatio",
      "rescaleOverlappingGlyphs"
    ], () => {
      this.clear();
      this.handleResize(bufferService.cols, bufferService.rows);
      this._fullRefresh();
    }));
    this._register(optionsService.onMultipleOptionChange([
      "cursorBlink",
      "cursorStyle"
    ], () => this.refreshRows(bufferService.buffer.y, bufferService.buffer.y, true)));
    this._register(themeService.onChangeColors(() => this._fullRefresh()));
    this._registerIntersectionObserver(coreBrowserService.window, screenElement);
    this._register(coreBrowserService.onWindowChange((w) => this._registerIntersectionObserver(w, screenElement)));
  }
  get dimensions() {
    return this._renderer.value.dimensions;
  }
  _registerIntersectionObserver(w, screenElement) {
    if ("IntersectionObserver" in w) {
      const observer = new w.IntersectionObserver((e) => this._handleIntersectionChange(e[e.length - 1]), { threshold: 0 });
      observer.observe(screenElement);
      this._observerDisposable.value = (0, import_lifecycle.toDisposable)(() => observer.disconnect());
    }
  }
  _handleIntersectionChange(entry) {
    this._isPaused = entry.isIntersecting === void 0 ? entry.intersectionRatio === 0 : !entry.isIntersecting;
    if (!this._isPaused && !this._charSizeService.hasValidSize) {
      this._charSizeService.measure();
    }
    if (!this._isPaused && this._needsFullRefresh) {
      this._pausedResizeTask.flush();
      this.refreshRows(0, this._rowCount - 1);
      this._needsFullRefresh = false;
    }
  }
  refreshRows(start, end, isRedrawOnly = false) {
    if (this._isPaused) {
      this._needsFullRefresh = true;
      return;
    }
    if (!isRedrawOnly) {
      this._isNextRenderRedrawOnly = false;
    }
    this._renderDebouncer.refresh(start, end, this._rowCount);
  }
  _renderRows(start, end) {
    if (!this._renderer.value) {
      return;
    }
    start = Math.min(start, this._rowCount - 1);
    end = Math.min(end, this._rowCount - 1);
    this._renderer.value.renderRows(start, end);
    if (this._needsSelectionRefresh) {
      this._renderer.value.handleSelectionChanged(this._selectionState.start, this._selectionState.end, this._selectionState.columnSelectMode);
      this._needsSelectionRefresh = false;
    }
    if (!this._isNextRenderRedrawOnly) {
      this._onRenderedViewportChange.fire({ start, end });
    }
    this._onRender.fire({ start, end });
    this._isNextRenderRedrawOnly = true;
  }
  resize(cols, rows) {
    this._rowCount = rows;
    this._fireOnCanvasResize();
  }
  _handleOptionsChanged() {
    if (!this._renderer.value) {
      return;
    }
    this.refreshRows(0, this._rowCount - 1);
    this._fireOnCanvasResize();
  }
  _fireOnCanvasResize() {
    if (!this._renderer.value) {
      return;
    }
    if (this._renderer.value.dimensions.css.canvas.width === this._canvasWidth && this._renderer.value.dimensions.css.canvas.height === this._canvasHeight) {
      return;
    }
    this._onDimensionsChange.fire(this._renderer.value.dimensions);
  }
  hasRenderer() {
    return !!this._renderer.value;
  }
  setRenderer(renderer) {
    this._renderer.value = renderer;
    if (this._renderer.value) {
      this._renderer.value.onRequestRedraw((e) => this.refreshRows(e.start, e.end, true));
      this._needsSelectionRefresh = true;
      this._fullRefresh();
    }
  }
  addRefreshCallback(callback) {
    return this._renderDebouncer.addRefreshCallback(callback);
  }
  _fullRefresh() {
    if (this._isPaused) {
      this._needsFullRefresh = true;
    } else {
      this.refreshRows(0, this._rowCount - 1);
    }
  }
  clearTextureAtlas() {
    if (!this._renderer.value) {
      return;
    }
    this._renderer.value.clearTextureAtlas?.();
    this._fullRefresh();
  }
  handleDevicePixelRatioChange() {
    this._charSizeService.measure();
    if (!this._renderer.value) {
      return;
    }
    this._renderer.value.handleDevicePixelRatioChange();
    this.refreshRows(0, this._rowCount - 1);
  }
  handleResize(cols, rows) {
    if (!this._renderer.value) {
      return;
    }
    if (this._isPaused) {
      this._pausedResizeTask.set(() => this._renderer.value?.handleResize(cols, rows));
    } else {
      this._renderer.value.handleResize(cols, rows);
    }
    this._fullRefresh();
  }
  // TODO: Is this useful when we have onResize?
  handleCharSizeChanged() {
    this._renderer.value?.handleCharSizeChanged();
  }
  handleBlur() {
    this._renderer.value?.handleBlur();
  }
  handleFocus() {
    this._renderer.value?.handleFocus();
  }
  handleSelectionChanged(start, end, columnSelectMode) {
    this._selectionState.start = start;
    this._selectionState.end = end;
    this._selectionState.columnSelectMode = columnSelectMode;
    this._renderer.value?.handleSelectionChanged(start, end, columnSelectMode);
  }
  handleCursorMove() {
    this._renderer.value?.handleCursorMove();
  }
  clear() {
    this._renderer.value?.clear();
  }
};
RenderService = __decorateClass([
  __decorateParam(2, import_Services2.IOptionsService),
  __decorateParam(3, import_Services.ICharSizeService),
  __decorateParam(4, import_Services2.IDecorationService),
  __decorateParam(5, import_Services2.IBufferService),
  __decorateParam(6, import_Services.ICoreBrowserService),
  __decorateParam(7, import_Services.IThemeService)
], RenderService);
//# sourceMappingURL=RenderService.js.map
