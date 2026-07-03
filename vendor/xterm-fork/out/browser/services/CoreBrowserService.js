"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreBrowserService = void 0;
const event_1 = require("vs/base/common/event");
const dom_1 = require("vs/base/browser/dom");
const lifecycle_1 = require("vs/base/common/lifecycle");
class CoreBrowserService extends lifecycle_1.Disposable {
    constructor(_textarea, _window, mainDocument) {
        super();
        this._textarea = _textarea;
        this._window = _window;
        this.mainDocument = mainDocument;
        this._isFocused = false;
        this._cachedIsFocused = undefined;
        this._screenDprMonitor = this._register(new ScreenDprMonitor(this._window));
        this._onDprChange = this._register(new event_1.Emitter());
        this.onDprChange = this._onDprChange.event;
        this._onWindowChange = this._register(new event_1.Emitter());
        this.onWindowChange = this._onWindowChange.event;
        this._register(this.onWindowChange(w => this._screenDprMonitor.setWindow(w)));
        this._register(event_1.Event.forward(this._screenDprMonitor.onDprChange, this._onDprChange));
        this._register((0, dom_1.addDisposableListener)(this._textarea, 'focus', () => this._isFocused = true));
        this._register((0, dom_1.addDisposableListener)(this._textarea, 'blur', () => this._isFocused = false));
    }
    get window() {
        return this._window;
    }
    set window(value) {
        if (this._window !== value) {
            this._window = value;
            this._onWindowChange.fire(this._window);
        }
    }
    get dpr() {
        return this.window.devicePixelRatio;
    }
    get isFocused() {
        if (this._cachedIsFocused === undefined) {
            this._cachedIsFocused = this._isFocused && this._textarea.ownerDocument.hasFocus();
            queueMicrotask(() => this._cachedIsFocused = undefined);
        }
        return this._cachedIsFocused;
    }
}
exports.CoreBrowserService = CoreBrowserService;
class ScreenDprMonitor extends lifecycle_1.Disposable {
    constructor(_parentWindow) {
        super();
        this._parentWindow = _parentWindow;
        this._windowResizeListener = this._register(new lifecycle_1.MutableDisposable());
        this._onDprChange = this._register(new event_1.Emitter());
        this.onDprChange = this._onDprChange.event;
        this._outerListener = () => this._setDprAndFireIfDiffers();
        this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio;
        this._updateDpr();
        this._setWindowResizeListener();
        this._register((0, lifecycle_1.toDisposable)(() => this.clearListener()));
    }
    setWindow(parentWindow) {
        this._parentWindow = parentWindow;
        this._setWindowResizeListener();
        this._setDprAndFireIfDiffers();
    }
    _setWindowResizeListener() {
        this._windowResizeListener.value = (0, dom_1.addDisposableListener)(this._parentWindow, 'resize', () => this._setDprAndFireIfDiffers());
    }
    _setDprAndFireIfDiffers() {
        if (this._parentWindow.devicePixelRatio !== this._currentDevicePixelRatio) {
            this._onDprChange.fire(this._parentWindow.devicePixelRatio);
        }
        this._updateDpr();
    }
    _updateDpr() {
        if (!this._outerListener) {
            return;
        }
        this._resolutionMediaMatchList?.removeListener(this._outerListener);
        this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio;
        this._resolutionMediaMatchList = this._parentWindow.matchMedia(`screen and (resolution: ${this._parentWindow.devicePixelRatio}dppx)`);
        this._resolutionMediaMatchList.addListener(this._outerListener);
    }
    clearListener() {
        if (!this._resolutionMediaMatchList || !this._outerListener) {
            return;
        }
        this._resolutionMediaMatchList.removeListener(this._outerListener);
        this._resolutionMediaMatchList = undefined;
        this._outerListener = undefined;
    }
}
//# sourceMappingURL=CoreBrowserService.js.map