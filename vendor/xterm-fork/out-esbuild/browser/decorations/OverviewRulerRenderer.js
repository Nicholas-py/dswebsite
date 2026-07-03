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
var OverviewRulerRenderer_exports = {};
__export(OverviewRulerRenderer_exports, {
  OverviewRulerRenderer: () => OverviewRulerRenderer
});
module.exports = __toCommonJS(OverviewRulerRenderer_exports);
var import_ColorZoneStore = require("browser/decorations/ColorZoneStore");
var import_Services = require("browser/services/Services");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_Services2 = require("common/services/Services");
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["OVERVIEW_RULER_BORDER_WIDTH"] = 1] = "OVERVIEW_RULER_BORDER_WIDTH";
  return Constants2;
})(Constants || {});
const drawHeight = {
  full: 0,
  left: 0,
  center: 0,
  right: 0
};
const drawWidth = {
  full: 0,
  left: 0,
  center: 0,
  right: 0
};
const drawX = {
  full: 0,
  left: 0,
  center: 0,
  right: 0
};
let OverviewRulerRenderer = class extends import_lifecycle.Disposable {
  constructor(_viewportElement, _screenElement, _bufferService, _decorationService, _renderService, _optionsService, _themeService, _coreBrowserService) {
    super();
    this._viewportElement = _viewportElement;
    this._screenElement = _screenElement;
    this._bufferService = _bufferService;
    this._decorationService = _decorationService;
    this._renderService = _renderService;
    this._optionsService = _optionsService;
    this._themeService = _themeService;
    this._coreBrowserService = _coreBrowserService;
    this._colorZoneStore = new import_ColorZoneStore.ColorZoneStore();
    this._shouldUpdateDimensions = true;
    this._shouldUpdateAnchor = true;
    this._lastKnownBufferLength = 0;
    this._canvas = this._coreBrowserService.mainDocument.createElement("canvas");
    this._canvas.classList.add("xterm-decoration-overview-ruler");
    this._refreshCanvasDimensions();
    this._viewportElement.parentElement?.insertBefore(this._canvas, this._viewportElement);
    this._register((0, import_lifecycle.toDisposable)(() => this._canvas?.remove()));
    const ctx = this._canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Ctx cannot be null");
    } else {
      this._ctx = ctx;
    }
    this._register(this._decorationService.onDecorationRegistered(() => this._queueRefresh(void 0, true)));
    this._register(this._decorationService.onDecorationRemoved(() => this._queueRefresh(void 0, true)));
    this._register(this._renderService.onRenderedViewportChange(() => this._queueRefresh()));
    this._register(this._bufferService.buffers.onBufferActivate(() => {
      this._canvas.style.display = this._bufferService.buffer === this._bufferService.buffers.alt ? "none" : "block";
    }));
    this._register(this._bufferService.onScroll(() => {
      if (this._lastKnownBufferLength !== this._bufferService.buffers.normal.lines.length) {
        this._refreshDrawHeightConstants();
        this._refreshColorZonePadding();
      }
    }));
    this._register(this._renderService.onRender(() => {
      if (!this._containerHeight || this._containerHeight !== this._screenElement.clientHeight) {
        this._queueRefresh(true);
        this._containerHeight = this._screenElement.clientHeight;
      }
    }));
    this._register(this._coreBrowserService.onDprChange(() => this._queueRefresh(true)));
    this._register(this._optionsService.onSpecificOptionChange("overviewRuler", () => this._queueRefresh(true)));
    this._register(this._themeService.onChangeColors(() => this._queueRefresh()));
    this._queueRefresh(true);
  }
  get _width() {
    return this._optionsService.options.overviewRuler?.width || 0;
  }
  _refreshDrawConstants() {
    const outerWidth = Math.floor((this._canvas.width - 1 /* OVERVIEW_RULER_BORDER_WIDTH */) / 3);
    const innerWidth = Math.ceil((this._canvas.width - 1 /* OVERVIEW_RULER_BORDER_WIDTH */) / 3);
    drawWidth.full = this._canvas.width;
    drawWidth.left = outerWidth;
    drawWidth.center = innerWidth;
    drawWidth.right = outerWidth;
    this._refreshDrawHeightConstants();
    drawX.full = 1 /* OVERVIEW_RULER_BORDER_WIDTH */;
    drawX.left = 1 /* OVERVIEW_RULER_BORDER_WIDTH */;
    drawX.center = 1 /* OVERVIEW_RULER_BORDER_WIDTH */ + drawWidth.left;
    drawX.right = 1 /* OVERVIEW_RULER_BORDER_WIDTH */ + drawWidth.left + drawWidth.center;
  }
  _refreshDrawHeightConstants() {
    drawHeight.full = Math.round(2 * this._coreBrowserService.dpr);
    const pixelsPerLine = this._canvas.height / this._bufferService.buffer.lines.length;
    const nonFullHeight = Math.round(Math.max(Math.min(pixelsPerLine, 12), 6) * this._coreBrowserService.dpr);
    drawHeight.left = nonFullHeight;
    drawHeight.center = nonFullHeight;
    drawHeight.right = nonFullHeight;
  }
  _refreshColorZonePadding() {
    this._colorZoneStore.setPadding({
      full: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * drawHeight.full),
      left: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * drawHeight.left),
      center: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * drawHeight.center),
      right: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * drawHeight.right)
    });
    this._lastKnownBufferLength = this._bufferService.buffers.normal.lines.length;
  }
  _refreshCanvasDimensions() {
    this._canvas.style.width = `${this._width}px`;
    this._canvas.width = Math.round(this._width * this._coreBrowserService.dpr);
    this._canvas.style.height = `${this._screenElement.clientHeight}px`;
    this._canvas.height = Math.round(this._screenElement.clientHeight * this._coreBrowserService.dpr);
    this._refreshDrawConstants();
    this._refreshColorZonePadding();
  }
  _refreshDecorations() {
    if (this._shouldUpdateDimensions) {
      this._refreshCanvasDimensions();
    }
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._colorZoneStore.clear();
    for (const decoration of this._decorationService.decorations) {
      this._colorZoneStore.addDecoration(decoration);
    }
    this._ctx.lineWidth = 1;
    this._renderRulerOutline();
    const zones = this._colorZoneStore.zones;
    for (const zone of zones) {
      if (zone.position !== "full") {
        this._renderColorZone(zone);
      }
    }
    for (const zone of zones) {
      if (zone.position === "full") {
        this._renderColorZone(zone);
      }
    }
    this._shouldUpdateDimensions = false;
    this._shouldUpdateAnchor = false;
  }
  _renderRulerOutline() {
    this._ctx.fillStyle = this._themeService.colors.overviewRulerBorder.css;
    this._ctx.fillRect(0, 0, 1 /* OVERVIEW_RULER_BORDER_WIDTH */, this._canvas.height);
    if (this._optionsService.rawOptions.overviewRuler.showTopBorder) {
      this._ctx.fillRect(1 /* OVERVIEW_RULER_BORDER_WIDTH */, 0, this._canvas.width - 1 /* OVERVIEW_RULER_BORDER_WIDTH */, 1 /* OVERVIEW_RULER_BORDER_WIDTH */);
    }
    if (this._optionsService.rawOptions.overviewRuler.showBottomBorder) {
      this._ctx.fillRect(1 /* OVERVIEW_RULER_BORDER_WIDTH */, this._canvas.height - 1 /* OVERVIEW_RULER_BORDER_WIDTH */, this._canvas.width - 1 /* OVERVIEW_RULER_BORDER_WIDTH */, this._canvas.height);
    }
  }
  _renderColorZone(zone) {
    this._ctx.fillStyle = zone.color;
    this._ctx.fillRect(
      /* x */
      drawX[zone.position || "full"],
      /* y */
      Math.round(
        (this._canvas.height - 1) * // -1 to ensure at least 2px are allowed for decoration on last line
        (zone.startBufferLine / this._bufferService.buffers.active.lines.length) - drawHeight[zone.position || "full"] / 2
      ),
      /* w */
      drawWidth[zone.position || "full"],
      /* h */
      Math.round(
        (this._canvas.height - 1) * // -1 to ensure at least 2px are allowed for decoration on last line
        ((zone.endBufferLine - zone.startBufferLine) / this._bufferService.buffers.active.lines.length) + drawHeight[zone.position || "full"]
      )
    );
  }
  _queueRefresh(updateCanvasDimensions, updateAnchor) {
    this._shouldUpdateDimensions = updateCanvasDimensions || this._shouldUpdateDimensions;
    this._shouldUpdateAnchor = updateAnchor || this._shouldUpdateAnchor;
    if (this._animationFrame !== void 0) {
      return;
    }
    this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
      this._refreshDecorations();
      this._animationFrame = void 0;
    });
  }
};
OverviewRulerRenderer = __decorateClass([
  __decorateParam(2, import_Services2.IBufferService),
  __decorateParam(3, import_Services2.IDecorationService),
  __decorateParam(4, import_Services.IRenderService),
  __decorateParam(5, import_Services2.IOptionsService),
  __decorateParam(6, import_Services.IThemeService),
  __decorateParam(7, import_Services.ICoreBrowserService)
], OverviewRulerRenderer);
//# sourceMappingURL=OverviewRulerRenderer.js.map
