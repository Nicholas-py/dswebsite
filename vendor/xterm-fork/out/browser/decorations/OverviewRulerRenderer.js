"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverviewRulerRenderer = void 0;
const ColorZoneStore_1 = require("browser/decorations/ColorZoneStore");
const Services_1 = require("browser/services/Services");
const lifecycle_1 = require("vs/base/common/lifecycle");
const Services_2 = require("common/services/Services");
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
let OverviewRulerRenderer = class OverviewRulerRenderer extends lifecycle_1.Disposable {
    get _width() {
        return this._optionsService.options.overviewRuler?.width || 0;
    }
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
        this._colorZoneStore = new ColorZoneStore_1.ColorZoneStore();
        this._shouldUpdateDimensions = true;
        this._shouldUpdateAnchor = true;
        this._lastKnownBufferLength = 0;
        this._canvas = this._coreBrowserService.mainDocument.createElement('canvas');
        this._canvas.classList.add('xterm-decoration-overview-ruler');
        this._refreshCanvasDimensions();
        this._viewportElement.parentElement?.insertBefore(this._canvas, this._viewportElement);
        this._register((0, lifecycle_1.toDisposable)(() => this._canvas?.remove()));
        const ctx = this._canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Ctx cannot be null');
        }
        else {
            this._ctx = ctx;
        }
        this._register(this._decorationService.onDecorationRegistered(() => this._queueRefresh(undefined, true)));
        this._register(this._decorationService.onDecorationRemoved(() => this._queueRefresh(undefined, true)));
        this._register(this._renderService.onRenderedViewportChange(() => this._queueRefresh()));
        this._register(this._bufferService.buffers.onBufferActivate(() => {
            this._canvas.style.display = this._bufferService.buffer === this._bufferService.buffers.alt ? 'none' : 'block';
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
        this._register(this._optionsService.onSpecificOptionChange('overviewRuler', () => this._queueRefresh(true)));
        this._register(this._themeService.onChangeColors(() => this._queueRefresh()));
        this._queueRefresh(true);
    }
    _refreshDrawConstants() {
        const outerWidth = Math.floor((this._canvas.width - 1) / 3);
        const innerWidth = Math.ceil((this._canvas.width - 1) / 3);
        drawWidth.full = this._canvas.width;
        drawWidth.left = outerWidth;
        drawWidth.center = innerWidth;
        drawWidth.right = outerWidth;
        this._refreshDrawHeightConstants();
        drawX.full = 1;
        drawX.left = 1;
        drawX.center = 1 + drawWidth.left;
        drawX.right = 1 + drawWidth.left + drawWidth.center;
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
            if (zone.position !== 'full') {
                this._renderColorZone(zone);
            }
        }
        for (const zone of zones) {
            if (zone.position === 'full') {
                this._renderColorZone(zone);
            }
        }
        this._shouldUpdateDimensions = false;
        this._shouldUpdateAnchor = false;
    }
    _renderRulerOutline() {
        this._ctx.fillStyle = this._themeService.colors.overviewRulerBorder.css;
        this._ctx.fillRect(0, 0, 1, this._canvas.height);
        if (this._optionsService.rawOptions.overviewRuler.showTopBorder) {
            this._ctx.fillRect(1, 0, this._canvas.width - 1, 1);
        }
        if (this._optionsService.rawOptions.overviewRuler.showBottomBorder) {
            this._ctx.fillRect(1, this._canvas.height - 1, this._canvas.width - 1, this._canvas.height);
        }
    }
    _renderColorZone(zone) {
        this._ctx.fillStyle = zone.color;
        this._ctx.fillRect(drawX[zone.position || 'full'], Math.round((this._canvas.height - 1) *
            (zone.startBufferLine / this._bufferService.buffers.active.lines.length) - drawHeight[zone.position || 'full'] / 2), drawWidth[zone.position || 'full'], Math.round((this._canvas.height - 1) *
            ((zone.endBufferLine - zone.startBufferLine) / this._bufferService.buffers.active.lines.length) + drawHeight[zone.position || 'full']));
    }
    _queueRefresh(updateCanvasDimensions, updateAnchor) {
        this._shouldUpdateDimensions = updateCanvasDimensions || this._shouldUpdateDimensions;
        this._shouldUpdateAnchor = updateAnchor || this._shouldUpdateAnchor;
        if (this._animationFrame !== undefined) {
            return;
        }
        this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
            this._refreshDecorations();
            this._animationFrame = undefined;
        });
    }
};
exports.OverviewRulerRenderer = OverviewRulerRenderer;
exports.OverviewRulerRenderer = OverviewRulerRenderer = __decorate([
    __param(2, Services_2.IBufferService),
    __param(3, Services_2.IDecorationService),
    __param(4, Services_1.IRenderService),
    __param(5, Services_2.IOptionsService),
    __param(6, Services_1.IThemeService),
    __param(7, Services_1.ICoreBrowserService)
], OverviewRulerRenderer);
//# sourceMappingURL=OverviewRulerRenderer.js.map