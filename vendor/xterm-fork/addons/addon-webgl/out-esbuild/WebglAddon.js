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
var WebglAddon_exports = {};
__export(WebglAddon_exports, {
  WebglAddon: () => WebglAddon
});
module.exports = __toCommonJS(WebglAddon_exports);
var import_lifecycle = require("vs/base/common/lifecycle");
var import_Platform = require("common/Platform");
var import_WebglRenderer = require("./WebglRenderer");
var import_LogService = require("common/services/LogService");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class WebglAddon extends import_lifecycle.Disposable {
  constructor(_preserveDrawingBuffer) {
    if (import_Platform.isSafari && (0, import_Platform.getSafariVersion)() < 16) {
      const contextAttributes = {
        antialias: false,
        depth: false,
        preserveDrawingBuffer: true
      };
      const gl = document.createElement("canvas").getContext("webgl2", contextAttributes);
      if (!gl) {
        throw new Error("Webgl2 is only supported on Safari 16 and above");
      }
    }
    super();
    this._preserveDrawingBuffer = _preserveDrawingBuffer;
    this._onChangeTextureAtlas = this._register(new import_event.Emitter());
    this.onChangeTextureAtlas = this._onChangeTextureAtlas.event;
    this._onAddTextureAtlasCanvas = this._register(new import_event.Emitter());
    this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event;
    this._onRemoveTextureAtlasCanvas = this._register(new import_event.Emitter());
    this.onRemoveTextureAtlasCanvas = this._onRemoveTextureAtlasCanvas.event;
    this._onContextLoss = this._register(new import_event.Emitter());
    this.onContextLoss = this._onContextLoss.event;
  }
  static {
    this.onInit = void 0;
  }
  static {
    this.onResize = void 0;
  }
  static {
    this.onRender = void 0;
  }
  activate(terminal) {
    const core = terminal._core;
    if (!terminal.element) {
      this._register(core.onWillOpen(() => this.activate(terminal)));
      return;
    }
    this._terminal = terminal;
    const coreService = core.coreService;
    const optionsService = core.optionsService;
    const unsafeCore = core;
    const renderService = unsafeCore._renderService;
    const characterJoinerService = unsafeCore._characterJoinerService;
    const charSizeService = unsafeCore._charSizeService;
    const coreBrowserService = unsafeCore._coreBrowserService;
    const decorationService = unsafeCore._decorationService;
    const logService = unsafeCore._logService;
    const themeService = unsafeCore._themeService;
    (0, import_LogService.setTraceLogger)(logService);
    this._renderer = this._register(new import_WebglRenderer.WebglRenderer(
      terminal,
      characterJoinerService,
      charSizeService,
      coreBrowserService,
      coreService,
      decorationService,
      optionsService,
      themeService,
      this._preserveDrawingBuffer
    ));
    this._register(import_event.Event.forward(this._renderer.onContextLoss, this._onContextLoss));
    this._register(import_event.Event.forward(this._renderer.onChangeTextureAtlas, this._onChangeTextureAtlas));
    this._register(import_event.Event.forward(this._renderer.onAddTextureAtlasCanvas, this._onAddTextureAtlasCanvas));
    this._register(import_event.Event.forward(this._renderer.onRemoveTextureAtlasCanvas, this._onRemoveTextureAtlasCanvas));
    renderService.setRenderer(this._renderer);
    this._register((0, import_lifecycle.toDisposable)(() => {
      if (this._terminal._core._store._isDisposed) {
        return;
      }
      const renderService2 = this._terminal._core._renderService;
      renderService2.setRenderer(this._terminal._core._createRenderer());
      renderService2.handleResize(terminal.cols, terminal.rows);
    }));
  }
  get textureAtlas() {
    return this._renderer?.textureAtlas;
  }
  clearTextureAtlas() {
    this._renderer?.clearTextureAtlas();
  }
}
//# sourceMappingURL=WebglAddon.js.map
