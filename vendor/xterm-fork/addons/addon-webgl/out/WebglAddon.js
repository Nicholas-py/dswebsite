"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebglAddon = void 0;
const lifecycle_1 = require("vs/base/common/lifecycle");
const Platform_1 = require("common/Platform");
const WebglRenderer_1 = require("./WebglRenderer");
const LogService_1 = require("common/services/LogService");
const event_1 = require("vs/base/common/event");
class WebglAddon extends lifecycle_1.Disposable {
    constructor(_preserveDrawingBuffer) {
        if (Platform_1.isSafari && (0, Platform_1.getSafariVersion)() < 16) {
            const contextAttributes = {
                antialias: false,
                depth: false,
                preserveDrawingBuffer: true
            };
            const gl = document.createElement('canvas').getContext('webgl2', contextAttributes);
            if (!gl) {
                throw new Error('Webgl2 is only supported on Safari 16 and above');
            }
        }
        super();
        this._preserveDrawingBuffer = _preserveDrawingBuffer;
        this._onChangeTextureAtlas = this._register(new event_1.Emitter());
        this.onChangeTextureAtlas = this._onChangeTextureAtlas.event;
        this._onAddTextureAtlasCanvas = this._register(new event_1.Emitter());
        this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event;
        this._onRemoveTextureAtlasCanvas = this._register(new event_1.Emitter());
        this.onRemoveTextureAtlasCanvas = this._onRemoveTextureAtlasCanvas.event;
        this._onContextLoss = this._register(new event_1.Emitter());
        this.onContextLoss = this._onContextLoss.event;
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
        (0, LogService_1.setTraceLogger)(logService);
        this._renderer = this._register(new WebglRenderer_1.WebglRenderer(terminal, characterJoinerService, charSizeService, coreBrowserService, coreService, decorationService, optionsService, themeService, this._preserveDrawingBuffer));
        this._register(event_1.Event.forward(this._renderer.onContextLoss, this._onContextLoss));
        this._register(event_1.Event.forward(this._renderer.onChangeTextureAtlas, this._onChangeTextureAtlas));
        this._register(event_1.Event.forward(this._renderer.onAddTextureAtlasCanvas, this._onAddTextureAtlasCanvas));
        this._register(event_1.Event.forward(this._renderer.onRemoveTextureAtlasCanvas, this._onRemoveTextureAtlasCanvas));
        renderService.setRenderer(this._renderer);
        this._register((0, lifecycle_1.toDisposable)(() => {
            if (this._terminal._core._store._isDisposed) {
                return;
            }
            const renderService = this._terminal._core._renderService;
            renderService.setRenderer(this._terminal._core._createRenderer());
            renderService.handleResize(terminal.cols, terminal.rows);
        }));
    }
    get textureAtlas() {
        return this._renderer?.textureAtlas;
    }
    clearTextureAtlas() {
        this._renderer?.clearTextureAtlas();
    }
}
exports.WebglAddon = WebglAddon;
WebglAddon.onInit = undefined;
WebglAddon.onResize = undefined;
WebglAddon.onRender = undefined;
//# sourceMappingURL=WebglAddon.js.map