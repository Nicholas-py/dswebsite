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
exports.Viewport = void 0;
const Services_1 = require("browser/services/Services");
const lifecycle_1 = require("vs/base/common/lifecycle");
const Services_2 = require("common/services/Services");
const dom_1 = require("vs/base/browser/dom");
const scrollableElement_1 = require("vs/base/browser/ui/scrollbar/scrollableElement");
const event_1 = require("vs/base/common/event");
const scrollable_1 = require("vs/base/common/scrollable");
let Viewport = class Viewport extends lifecycle_1.Disposable {
    constructor(element, screenElement, _bufferService, coreBrowserService, coreMouseService, themeService, _optionsService, _renderService) {
        super();
        this._bufferService = _bufferService;
        this._optionsService = _optionsService;
        this._renderService = _renderService;
        this._onRequestScrollLines = this._register(new event_1.Emitter());
        this.onRequestScrollLines = this._onRequestScrollLines.event;
        this._isSyncing = false;
        this._isHandlingScroll = false;
        this._suppressOnScrollHandler = false;
        const scrollable = this._register(new scrollable_1.Scrollable({
            forceIntegerValues: false,
            smoothScrollDuration: this._optionsService.rawOptions.smoothScrollDuration,
            scheduleAtNextAnimationFrame: cb => (0, dom_1.scheduleAtNextAnimationFrame)(coreBrowserService.window, cb)
        }));
        this._register(this._optionsService.onSpecificOptionChange('smoothScrollDuration', () => {
            scrollable.setSmoothScrollDuration(this._optionsService.rawOptions.smoothScrollDuration);
        }));
        this._scrollableElement = this._register(new scrollableElement_1.SmoothScrollableElement(screenElement, {
            vertical: 1,
            horizontal: 2,
            useShadows: false,
            mouseWheelSmoothScroll: true,
            ...this._getChangeOptions()
        }, scrollable));
        this._register(this._optionsService.onMultipleOptionChange([
            'scrollSensitivity',
            'fastScrollSensitivity',
            'overviewRuler'
        ], () => this._scrollableElement.updateOptions(this._getChangeOptions())));
        this._register(coreMouseService.onProtocolChange(type => {
            this._scrollableElement.updateOptions({
                handleMouseWheel: !(type & 16)
            });
        }));
        this._scrollableElement.setScrollDimensions({ height: 0, scrollHeight: 0 });
        this._register(event_1.Event.runAndSubscribe(themeService.onChangeColors, () => {
            this._scrollableElement.getDomNode().style.backgroundColor = themeService.colors.background.css;
        }));
        element.appendChild(this._scrollableElement.getDomNode());
        this._register((0, lifecycle_1.toDisposable)(() => this._scrollableElement.getDomNode().remove()));
        this._styleElement = coreBrowserService.mainDocument.createElement('style');
        screenElement.appendChild(this._styleElement);
        this._register((0, lifecycle_1.toDisposable)(() => this._styleElement.remove()));
        this._register(event_1.Event.runAndSubscribe(themeService.onChangeColors, () => {
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
            ].join('\n');
        }));
        this._register(this._bufferService.onResize(() => this._queueSync()));
        this._register(this._bufferService.buffers.onBufferActivate(() => this._queueSync()));
        this._register(this._bufferService.onScroll(() => this._sync()));
        this._register(this._scrollableElement.onScroll(e => this._handleScroll(e)));
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
            verticalScrollbarSize: this._optionsService.rawOptions.overviewRuler?.width || 14
        };
    }
    _queueSync(ydisp) {
        if (ydisp !== undefined) {
            this._latestYDisp = ydisp;
        }
        if (this._queuedAnimationFrame !== undefined) {
            return;
        }
        this._queuedAnimationFrame = this._renderService.addRefreshCallback(() => {
            this._queuedAnimationFrame = undefined;
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
exports.Viewport = Viewport;
exports.Viewport = Viewport = __decorate([
    __param(2, Services_2.IBufferService),
    __param(3, Services_1.ICoreBrowserService),
    __param(4, Services_2.ICoreMouseService),
    __param(5, Services_1.IThemeService),
    __param(6, Services_2.IOptionsService),
    __param(7, Services_1.IRenderService)
], Viewport);
//# sourceMappingURL=Viewport.js.map