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
var WebglRenderer_exports = {};
__export(WebglRenderer_exports, {
  JoinedCellData: () => JoinedCellData,
  WebglRenderer: () => WebglRenderer
});
module.exports = __toCommonJS(WebglRenderer_exports);
var import_CellColorResolver = require("browser/renderer/shared/CellColorResolver");
var import_CharAtlasCache = require("browser/renderer/shared/CharAtlasCache");
var import_CursorBlinkStateManager = require("browser/renderer/shared/CursorBlinkStateManager");
var import_DevicePixelObserver = require("browser/renderer/shared/DevicePixelObserver");
var import_RendererUtils = require("browser/renderer/shared/RendererUtils");
var import_AttributeData = require("common/buffer/AttributeData");
var import_CellData = require("common/buffer/CellData");
var import_Constants = require("common/buffer/Constants");
var import_GlyphRenderer = require("./GlyphRenderer");
var import_RectangleRenderer = require("./RectangleRenderer");
var import_ShimRenderer = require("./ShimRenderer");
var import_RenderModel = require("./RenderModel");
var import_LinkRenderLayer = require("./renderLayer/LinkRenderLayer");
var import_event = require("vs/base/common/event");
var import_dom = require("vs/base/browser/dom");
var import_lifecycle = require("vs/base/common/lifecycle");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class WebglRenderer extends import_lifecycle.Disposable {
  constructor(_terminal, _characterJoinerService, _charSizeService, _coreBrowserService, _coreService, _decorationService, _optionsService, _themeService, preserveDrawingBuffer) {
    super();
    this._terminal = _terminal;
    this._characterJoinerService = _characterJoinerService;
    this._charSizeService = _charSizeService;
    this._coreBrowserService = _coreBrowserService;
    this._coreService = _coreService;
    this._decorationService = _decorationService;
    this._optionsService = _optionsService;
    this._themeService = _themeService;
    this._cursorBlinkStateManager = new import_lifecycle.MutableDisposable();
    this._charAtlasDisposable = this._register(new import_lifecycle.MutableDisposable());
    this._observerDisposable = this._register(new import_lifecycle.MutableDisposable());
    this._model = new import_RenderModel.RenderModel();
    this._workCell = new import_CellData.CellData();
    this._workCell2 = new import_CellData.CellData();
    this._rectangleRenderer = this._register(new import_lifecycle.MutableDisposable());
    this._glyphRenderer = this._register(new import_lifecycle.MutableDisposable());
    this._shimRenderer = this._register(new import_lifecycle.MutableDisposable());
    this._onChangeTextureAtlas = this._register(new import_event.Emitter());
    this.onChangeTextureAtlas = this._onChangeTextureAtlas.event;
    this._onAddTextureAtlasCanvas = this._register(new import_event.Emitter());
    this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event;
    this._onRemoveTextureAtlasCanvas = this._register(new import_event.Emitter());
    this.onRemoveTextureAtlasCanvas = this._onRemoveTextureAtlasCanvas.event;
    this._onRequestRedraw = this._register(new import_event.Emitter());
    this.onRequestRedraw = this._onRequestRedraw.event;
    this._onContextLoss = this._register(new import_event.Emitter());
    this.onContextLoss = this._onContextLoss.event;
    this._register(this._themeService.onChangeColors(() => this._handleColorChange()));
    this._cellColorResolver = new import_CellColorResolver.CellColorResolver(this._terminal, this._optionsService, this._model.selection, this._decorationService, this._coreBrowserService, this._themeService);
    this._core = this._terminal._core;
    this._renderLayers = [
      new import_LinkRenderLayer.LinkRenderLayer(this._core.screenElement, 2, this._terminal, this._core.linkifier, this._coreBrowserService, _optionsService, this._themeService)
    ];
    this.dimensions = (0, import_RendererUtils.createRenderDimensions)();
    this._devicePixelRatio = this._coreBrowserService.dpr;
    this._updateDimensions();
    this._updateCursorBlink();
    this._register(_optionsService.onOptionChange(() => this._handleOptionsChanged()));
    this._canvas = this._coreBrowserService.mainDocument.createElement("canvas");
    const contextAttributes = {
      antialias: false,
      depth: false,
      preserveDrawingBuffer
    };
    this._gl = this._canvas.getContext("webgl2", contextAttributes);
    if (!this._gl) {
      throw new Error("WebGL2 not supported " + this._gl);
    }
    this._register((0, import_dom.addDisposableListener)(this._canvas, "webglcontextlost", (e) => {
      console.log("webglcontextlost event received");
      e.preventDefault();
      this._contextRestorationTimeout = setTimeout(
        () => {
          this._contextRestorationTimeout = void 0;
          console.warn("webgl context not restored; firing onContextLoss");
          this._onContextLoss.fire(e);
        },
        3e3
        /* ms */
      );
    }));
    this._register((0, import_dom.addDisposableListener)(this._canvas, "webglcontextrestored", (e) => {
      console.warn("webglcontextrestored event received");
      clearTimeout(this._contextRestorationTimeout);
      this._contextRestorationTimeout = void 0;
      (0, import_CharAtlasCache.removeTerminalFromCache)(this._terminal);
      this._initializeWebGLState();
      this._requestRedrawViewport();
    }));
    this._observerDisposable.value = (0, import_DevicePixelObserver.observeDevicePixelDimensions)(this._canvas, this._coreBrowserService.window, (w, h) => this._setCanvasDevicePixelDimensions(w, h));
    this._register(this._coreBrowserService.onWindowChange((w) => {
      this._observerDisposable.value = (0, import_DevicePixelObserver.observeDevicePixelDimensions)(this._canvas, w, (w2, h) => this._setCanvasDevicePixelDimensions(w2, h));
    }));
    this._core.screenElement.appendChild(this._canvas);
    [this._rectangleRenderer.value, this._glyphRenderer.value, this._shimRenderer.value] = this._initializeWebGLState();
    this._isAttached = this._coreBrowserService.window.document.body.contains(this._core.screenElement);
    this._register((0, import_lifecycle.toDisposable)(() => {
      for (const l of this._renderLayers) {
        l.dispose();
      }
      this._canvas.parentElement?.removeChild(this._canvas);
      (0, import_CharAtlasCache.removeTerminalFromCache)(this._terminal);
    }));
  }
  get textureAtlas() {
    return this._charAtlas?.pages[0].canvas;
  }
  _handleColorChange() {
    this._refreshCharAtlas();
    this._clearModel(true);
  }
  handleDevicePixelRatioChange() {
    if (this._devicePixelRatio !== this._coreBrowserService.dpr) {
      this._devicePixelRatio = this._coreBrowserService.dpr;
      this.handleResize(this._terminal.cols, this._terminal.rows);
    }
  }
  handleResize(cols, rows) {
    this._updateDimensions();
    this._model.resize(this._terminal.cols, this._terminal.rows);
    for (const l of this._renderLayers) {
      l.resize(this._terminal, this.dimensions);
    }
    this._canvas.width = this.dimensions.device.canvas.width;
    this._canvas.height = this.dimensions.device.canvas.height;
    this._canvas.style.width = `${this.dimensions.css.canvas.width}px`;
    this._canvas.style.height = `${this.dimensions.css.canvas.height}px`;
    this._core.screenElement.style.width = `${this.dimensions.css.canvas.width}px`;
    this._core.screenElement.style.height = `${this.dimensions.css.canvas.height}px`;
    this._rectangleRenderer.value?.setDimensions(this.dimensions);
    this._rectangleRenderer.value?.handleResize();
    this._glyphRenderer.value?.setDimensions(this.dimensions);
    this._glyphRenderer.value?.handleResize();
    this._shimRenderer.value?.setDimensions(this.dimensions);
    this._shimRenderer.value?.handleResize();
    this._refreshCharAtlas();
    this._clearModel(false);
  }
  handleCharSizeChanged() {
    this.handleResize(this._terminal.cols, this._terminal.rows);
  }
  handleBlur() {
    for (const l of this._renderLayers) {
      l.handleBlur(this._terminal);
    }
    this._cursorBlinkStateManager.value?.pause();
    this._requestRedrawViewport();
  }
  handleFocus() {
    for (const l of this._renderLayers) {
      l.handleFocus(this._terminal);
    }
    this._cursorBlinkStateManager.value?.resume();
    this._requestRedrawViewport();
  }
  handleSelectionChanged(start, end, columnSelectMode) {
    for (const l of this._renderLayers) {
      l.handleSelectionChanged(this._terminal, start, end, columnSelectMode);
    }
    this._model.selection.update(this._core, start, end, columnSelectMode);
    this._requestRedrawViewport();
  }
  handleCursorMove() {
    for (const l of this._renderLayers) {
      l.handleCursorMove(this._terminal);
    }
    this._cursorBlinkStateManager.value?.restartBlinkAnimation();
  }
  _handleOptionsChanged() {
    this._updateDimensions();
    this._refreshCharAtlas();
    this._updateCursorBlink();
  }
  /**
   * Initializes members dependent on WebGL context state.
   */
  _initializeWebGLState() {
    this._rectangleRenderer.value = new import_RectangleRenderer.RectangleRenderer(this._terminal, this._gl, this.dimensions, this._themeService);
    this._glyphRenderer.value = new import_GlyphRenderer.GlyphRenderer(this._terminal, this._gl, this.dimensions, this._optionsService);
    this._shimRenderer.value = new import_ShimRenderer.ShimRenderer(this._terminal, this._gl, this.dimensions);
    this.handleCharSizeChanged();
    return [this._rectangleRenderer.value, this._glyphRenderer.value, this._shimRenderer.value];
  }
  /**
   * Refreshes the char atlas, aquiring a new one if necessary.
   */
  _refreshCharAtlas() {
    if (this.dimensions.device.char.width <= 0 && this.dimensions.device.char.height <= 0) {
      this._isAttached = false;
      return;
    }
    const atlas = (0, import_CharAtlasCache.acquireTextureAtlas)(
      this._terminal,
      this._optionsService.rawOptions,
      this._themeService.colors,
      this.dimensions.device.cell.width,
      this.dimensions.device.cell.height,
      this.dimensions.device.char.width,
      this.dimensions.device.char.height,
      this._coreBrowserService.dpr
    );
    if (this._charAtlas !== atlas) {
      this._onChangeTextureAtlas.fire(atlas.pages[0].canvas);
      this._charAtlasDisposable.value = (0, import_lifecycle.combinedDisposable)(
        import_event.Event.forward(atlas.onAddTextureAtlasCanvas, this._onAddTextureAtlasCanvas),
        import_event.Event.forward(atlas.onRemoveTextureAtlasCanvas, this._onRemoveTextureAtlasCanvas)
      );
    }
    this._charAtlas = atlas;
    this._charAtlas.warmUp();
    this._glyphRenderer.value?.setAtlas(this._charAtlas);
  }
  /**
   * Clear the model.
   * @param clearGlyphRenderer Whether to also clear the glyph renderer. This
   * should be true generally to make sure it is in the same state as the model.
   */
  _clearModel(clearGlyphRenderer) {
    this._model.clear();
    if (clearGlyphRenderer) {
      this._glyphRenderer.value?.clear();
    }
  }
  clearTextureAtlas() {
    this._charAtlas?.clearTexture();
    this._clearModel(true);
    this._requestRedrawViewport();
  }
  clear() {
    this._clearModel(true);
    for (const l of this._renderLayers) {
      l.reset(this._terminal);
    }
    this._cursorBlinkStateManager.value?.restartBlinkAnimation();
    this._updateCursorBlink();
  }
  renderRows(start, end) {
    if (!this._isAttached) {
      if (this._coreBrowserService.window.document.body.contains(this._core.screenElement) && this._charSizeService.width && this._charSizeService.height) {
        this._updateDimensions();
        this._refreshCharAtlas();
        this._isAttached = true;
      } else {
        return;
      }
    }
    for (const l of this._renderLayers) {
      l.handleGridChanged(this._terminal, start, end);
    }
    if (!this._glyphRenderer.value || !this._rectangleRenderer.value) {
      return;
    }
    if (this._glyphRenderer.value.beginFrame()) {
      this._clearModel(true);
      this._updateModel(0, this._terminal.rows - 1);
    } else {
      this._updateModel(start, end);
    }
    this._shimRenderer.value?.beginFrame();
    this._rectangleRenderer.value.renderBackgrounds();
    this._glyphRenderer.value.render(this._model);
    if (!this._cursorBlinkStateManager.value || this._cursorBlinkStateManager.value.isCursorVisible) {
      this._rectangleRenderer.value.renderCursor();
    }
    this._shimRenderer.value?.render();
  }
  _updateCursorBlink() {
    if (this._coreService.decPrivateModes.cursorBlink ?? this._terminal.options.cursorBlink) {
      this._cursorBlinkStateManager.value = new import_CursorBlinkStateManager.CursorBlinkStateManager(() => {
        this._requestRedrawCursor();
      }, this._coreBrowserService);
    } else {
      this._cursorBlinkStateManager.clear();
    }
    this._requestRedrawCursor();
  }
  _updateModel(start, end) {
    const terminal = this._core;
    let cell = this._workCell;
    let lastBg;
    let y;
    let row;
    let line;
    let joinedRanges;
    let isJoined;
    let skipJoinedCheckUntilX = 0;
    let isValidJoinRange = true;
    let lastCharX;
    let range;
    let isCursorRow;
    let chars;
    let code;
    let width;
    let i;
    let x;
    let j;
    start = clamp(start, terminal.rows - 1, 0);
    end = clamp(end, terminal.rows - 1, 0);
    const cursorStyle = this._coreService.decPrivateModes.cursorStyle ?? terminal.options.cursorStyle ?? "block";
    const cursorY = this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY;
    const viewportRelativeCursorY = cursorY - terminal.buffer.ydisp;
    const cursorX = Math.min(this._terminal.buffer.active.cursorX, terminal.cols - 1);
    let lastCursorX = -1;
    const isCursorVisible = this._coreService.isCursorInitialized && !this._coreService.isCursorHidden && (!this._cursorBlinkStateManager.value || this._cursorBlinkStateManager.value.isCursorVisible);
    this._model.cursor = void 0;
    let modelUpdated = false;
    for (y = start; y <= end; y++) {
      row = y + terminal.buffer.ydisp;
      line = terminal.buffer.lines.get(row);
      this._model.lineLengths[y] = 0;
      isCursorRow = cursorY === row;
      skipJoinedCheckUntilX = 0;
      joinedRanges = this._characterJoinerService.getJoinedCharacters(row);
      for (x = 0; x < terminal.cols; x++) {
        lastBg = this._cellColorResolver.result.bg;
        line.loadCell(x, cell);
        if (x === 0) {
          lastBg = this._cellColorResolver.result.bg;
        }
        isJoined = false;
        isValidJoinRange = x >= skipJoinedCheckUntilX;
        lastCharX = x;
        if (joinedRanges.length > 0 && x === joinedRanges[0][0] && isValidJoinRange) {
          range = joinedRanges.shift();
          const firstSelectionState = this._model.selection.isCellSelected(this._terminal, range[0], row);
          for (i = range[0] + 1; i < range[1]; i++) {
            isValidJoinRange &&= firstSelectionState === this._model.selection.isCellSelected(this._terminal, i, row);
          }
          isValidJoinRange &&= !isCursorRow || cursorX < range[0] || cursorX >= range[1];
          if (!isValidJoinRange) {
            skipJoinedCheckUntilX = range[1];
          } else {
            isJoined = true;
            cell = new JoinedCellData(
              cell,
              line.translateToString(true, range[0], range[1]),
              range[1] - range[0]
            );
            lastCharX = range[1] - 1;
          }
        }
        chars = cell.getChars();
        code = cell.getCode();
        i = (y * terminal.cols + x) * import_RenderModel.RENDER_MODEL_INDICIES_PER_CELL;
        this._cellColorResolver.resolve(cell, x, row, this.dimensions.device.cell.width);
        if (isCursorVisible && row === cursorY) {
          if (x === cursorX) {
            this._model.cursor = {
              x: cursorX,
              y: viewportRelativeCursorY,
              width: cell.getWidth(),
              style: this._coreBrowserService.isFocused ? cursorStyle : terminal.options.cursorInactiveStyle,
              cursorWidth: terminal.options.cursorWidth,
              dpr: this._devicePixelRatio
            };
            lastCursorX = cursorX + cell.getWidth() - 1;
          }
          if (x >= cursorX && x <= lastCursorX && (this._coreBrowserService.isFocused && cursorStyle === "block" || this._coreBrowserService.isFocused === false && terminal.options.cursorInactiveStyle === "block")) {
            this._cellColorResolver.result.fg = import_Constants.Attributes.CM_RGB | this._themeService.colors.cursorAccent.rgba >> 8 & import_Constants.Attributes.RGB_MASK;
            this._cellColorResolver.result.bg = import_Constants.Attributes.CM_RGB | this._themeService.colors.cursor.rgba >> 8 & import_Constants.Attributes.RGB_MASK;
          }
        }
        if (code !== import_Constants.NULL_CELL_CODE) {
          this._model.lineLengths[y] = x + 1;
        }
        if (this._model.cells[i] === code && this._model.cells[i + import_RenderModel.RENDER_MODEL_BG_OFFSET] === this._cellColorResolver.result.bg && this._model.cells[i + import_RenderModel.RENDER_MODEL_FG_OFFSET] === this._cellColorResolver.result.fg && this._model.cells[i + import_RenderModel.RENDER_MODEL_EXT_OFFSET] === this._cellColorResolver.result.ext) {
          continue;
        }
        modelUpdated = true;
        if (chars.length > 1) {
          code |= import_RenderModel.COMBINED_CHAR_BIT_MASK;
        }
        this._model.cells[i] = code;
        this._model.cells[i + import_RenderModel.RENDER_MODEL_BG_OFFSET] = this._cellColorResolver.result.bg;
        this._model.cells[i + import_RenderModel.RENDER_MODEL_FG_OFFSET] = this._cellColorResolver.result.fg;
        this._model.cells[i + import_RenderModel.RENDER_MODEL_EXT_OFFSET] = this._cellColorResolver.result.ext;
        width = cell.getWidth();
        this._glyphRenderer.value.updateCell(x, y, code, this._cellColorResolver.result.bg, this._cellColorResolver.result.fg, this._cellColorResolver.result.ext, chars, width, lastBg);
        if (isJoined) {
          cell = this._workCell;
          for (x++; x <= lastCharX; x++) {
            j = (y * terminal.cols + x) * import_RenderModel.RENDER_MODEL_INDICIES_PER_CELL;
            this._glyphRenderer.value.updateCell(x, y, import_Constants.NULL_CELL_CODE, 0, 0, 0, import_Constants.NULL_CELL_CHAR, 0, 0);
            this._model.cells[j] = import_Constants.NULL_CELL_CODE;
            this._model.cells[j + import_RenderModel.RENDER_MODEL_BG_OFFSET] = this._cellColorResolver.result.bg;
            this._model.cells[j + import_RenderModel.RENDER_MODEL_FG_OFFSET] = this._cellColorResolver.result.fg;
            this._model.cells[j + import_RenderModel.RENDER_MODEL_EXT_OFFSET] = this._cellColorResolver.result.ext;
          }
          x--;
        }
      }
    }
    if (modelUpdated) {
      this._rectangleRenderer.value.updateBackgrounds(this._model);
    }
    this._rectangleRenderer.value.updateCursor(this._model);
  }
  /**
   * Recalculates the character and canvas dimensions.
   */
  _updateDimensions() {
    if (!this._charSizeService.width || !this._charSizeService.height) {
      return;
    }
    this.dimensions.device.char.width = Math.floor(this._charSizeService.width * this._devicePixelRatio);
    this.dimensions.device.char.height = Math.ceil(this._charSizeService.height * this._devicePixelRatio);
    this.dimensions.device.cell.height = Math.floor(this.dimensions.device.char.height * this._optionsService.rawOptions.lineHeight);
    this.dimensions.device.char.top = this._optionsService.rawOptions.lineHeight === 1 ? 0 : Math.round((this.dimensions.device.cell.height - this.dimensions.device.char.height) / 2);
    this.dimensions.device.cell.width = this.dimensions.device.char.width + Math.round(this._optionsService.rawOptions.letterSpacing);
    this.dimensions.device.char.left = Math.floor(this._optionsService.rawOptions.letterSpacing / 2);
    this.dimensions.device.canvas.height = this._terminal.rows * this.dimensions.device.cell.height;
    this.dimensions.device.canvas.width = this._terminal.cols * this.dimensions.device.cell.width;
    this.dimensions.css.canvas.height = Math.round(this.dimensions.device.canvas.height / this._devicePixelRatio);
    this.dimensions.css.canvas.width = Math.round(this.dimensions.device.canvas.width / this._devicePixelRatio);
    this.dimensions.css.cell.height = this.dimensions.device.cell.height / this._devicePixelRatio;
    this.dimensions.css.cell.width = this.dimensions.device.cell.width / this._devicePixelRatio;
  }
  _setCanvasDevicePixelDimensions(width, height) {
    if (this._canvas.width === width && this._canvas.height === height) {
      return;
    }
    this._canvas.width = width;
    this._canvas.height = height;
    this._requestRedrawViewport();
  }
  _requestRedrawViewport() {
    this._onRequestRedraw.fire({ start: 0, end: this._terminal.rows - 1 });
  }
  _requestRedrawCursor() {
    const cursorY = this._terminal.buffer.active.cursorY;
    this._onRequestRedraw.fire({ start: cursorY, end: cursorY });
  }
}
class JoinedCellData extends import_AttributeData.AttributeData {
  constructor(firstCell, chars, width) {
    super();
    // .content carries no meaning for joined CellData, simply nullify it
    // thus we have to overload all other .content accessors
    this.content = 0;
    this.combinedData = "";
    this.fg = firstCell.fg;
    this.bg = firstCell.bg;
    this.combinedData = chars;
    this._width = width;
  }
  isCombined() {
    return import_Constants.Content.IS_COMBINED_MASK;
  }
  getWidth() {
    return this._width;
  }
  getChars() {
    return this.combinedData;
  }
  getCode() {
    return 2097151;
  }
  setFromCharData(value) {
    throw new Error("not implemented");
  }
  getAsCharData() {
    return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
  }
}
function clamp(value, max, min = 0) {
  return Math.max(Math.min(value, max), min);
}
//# sourceMappingURL=WebglRenderer.js.map
