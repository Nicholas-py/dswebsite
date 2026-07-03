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
var BufferDecorationRenderer_exports = {};
__export(BufferDecorationRenderer_exports, {
  BufferDecorationRenderer: () => BufferDecorationRenderer
});
module.exports = __toCommonJS(BufferDecorationRenderer_exports);
var import_Services = require("browser/services/Services");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_Services2 = require("common/services/Services");
let BufferDecorationRenderer = class extends import_lifecycle.Disposable {
  constructor(_screenElement, _bufferService, _coreBrowserService, _decorationService, _renderService) {
    super();
    this._screenElement = _screenElement;
    this._bufferService = _bufferService;
    this._coreBrowserService = _coreBrowserService;
    this._decorationService = _decorationService;
    this._renderService = _renderService;
    this._decorationElements = /* @__PURE__ */ new Map();
    this._altBufferIsActive = false;
    this._dimensionsChanged = false;
    this._container = document.createElement("div");
    this._container.classList.add("xterm-decoration-container");
    this._screenElement.appendChild(this._container);
    this._register(this._renderService.onRenderedViewportChange(() => this._doRefreshDecorations()));
    this._register(this._renderService.onDimensionsChange(() => {
      this._dimensionsChanged = true;
      this._queueRefresh();
    }));
    this._register(this._coreBrowserService.onDprChange(() => this._queueRefresh()));
    this._register(this._bufferService.buffers.onBufferActivate(() => {
      this._altBufferIsActive = this._bufferService.buffer === this._bufferService.buffers.alt;
    }));
    this._register(this._decorationService.onDecorationRegistered(() => this._queueRefresh()));
    this._register(this._decorationService.onDecorationRemoved((decoration) => this._removeDecoration(decoration)));
    this._register((0, import_lifecycle.toDisposable)(() => {
      this._container.remove();
      this._decorationElements.clear();
    }));
  }
  _queueRefresh() {
    if (this._animationFrame !== void 0) {
      return;
    }
    this._animationFrame = this._renderService.addRefreshCallback(() => {
      this._doRefreshDecorations();
      this._animationFrame = void 0;
    });
  }
  _doRefreshDecorations() {
    for (const decoration of this._decorationService.decorations) {
      this._renderDecoration(decoration);
    }
    this._dimensionsChanged = false;
  }
  _renderDecoration(decoration) {
    this._refreshStyle(decoration);
    if (this._dimensionsChanged) {
      this._refreshXPosition(decoration);
    }
  }
  _createElement(decoration) {
    const element = this._coreBrowserService.mainDocument.createElement("div");
    element.classList.add("xterm-decoration");
    element.classList.toggle("xterm-decoration-top-layer", decoration?.options?.layer === "top");
    element.style.width = `${Math.round((decoration.options.width || 1) * this._renderService.dimensions.css.cell.width)}px`;
    element.style.height = `${(decoration.options.height || 1) * this._renderService.dimensions.css.cell.height}px`;
    element.style.top = `${(decoration.marker.line - this._bufferService.buffers.active.ydisp) * this._renderService.dimensions.css.cell.height}px`;
    element.style.lineHeight = `${this._renderService.dimensions.css.cell.height}px`;
    const x = decoration.options.x ?? 0;
    if (x && x > this._bufferService.cols) {
      element.style.display = "none";
    }
    this._refreshXPosition(decoration, element);
    return element;
  }
  _refreshStyle(decoration) {
    const line = decoration.marker.line - this._bufferService.buffers.active.ydisp;
    if (line < 0 || line >= this._bufferService.rows) {
      if (decoration.element) {
        decoration.element.style.display = "none";
        decoration.onRenderEmitter.fire(decoration.element);
      }
    } else {
      let element = this._decorationElements.get(decoration);
      if (!element) {
        element = this._createElement(decoration);
        decoration.element = element;
        this._decorationElements.set(decoration, element);
        this._container.appendChild(element);
        decoration.onDispose(() => {
          this._decorationElements.delete(decoration);
          element.remove();
        });
      }
      element.style.display = this._altBufferIsActive ? "none" : "block";
      if (!this._altBufferIsActive) {
        element.style.width = `${Math.round((decoration.options.width || 1) * this._renderService.dimensions.css.cell.width)}px`;
        element.style.height = `${(decoration.options.height || 1) * this._renderService.dimensions.css.cell.height}px`;
        element.style.top = `${line * this._renderService.dimensions.css.cell.height}px`;
        element.style.lineHeight = `${this._renderService.dimensions.css.cell.height}px`;
      }
      decoration.onRenderEmitter.fire(element);
    }
  }
  _refreshXPosition(decoration, element = decoration.element) {
    if (!element) {
      return;
    }
    const x = decoration.options.x ?? 0;
    if ((decoration.options.anchor || "left") === "right") {
      element.style.right = x ? `${x * this._renderService.dimensions.css.cell.width}px` : "";
    } else {
      element.style.left = x ? `${x * this._renderService.dimensions.css.cell.width}px` : "";
    }
  }
  _removeDecoration(decoration) {
    this._decorationElements.get(decoration)?.remove();
    this._decorationElements.delete(decoration);
    decoration.dispose();
  }
};
BufferDecorationRenderer = __decorateClass([
  __decorateParam(1, import_Services2.IBufferService),
  __decorateParam(2, import_Services.ICoreBrowserService),
  __decorateParam(3, import_Services2.IDecorationService),
  __decorateParam(4, import_Services.IRenderService)
], BufferDecorationRenderer);
//# sourceMappingURL=BufferDecorationRenderer.js.map
