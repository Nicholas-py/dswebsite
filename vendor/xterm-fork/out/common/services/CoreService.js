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
exports.CoreService = void 0;
const Clone_1 = require("common/Clone");
const lifecycle_1 = require("vs/base/common/lifecycle");
const Services_1 = require("common/services/Services");
const event_1 = require("vs/base/common/event");
const DEFAULT_MODES = Object.freeze({
    insertMode: false
});
const DEFAULT_DEC_PRIVATE_MODES = Object.freeze({
    applicationCursorKeys: false,
    applicationKeypad: false,
    bracketedPasteMode: false,
    cursorBlink: undefined,
    cursorStyle: undefined,
    origin: false,
    reverseWraparound: false,
    sendFocus: false,
    wraparound: true
});
let CoreService = class CoreService extends lifecycle_1.Disposable {
    constructor(_bufferService, _logService, _optionsService) {
        super();
        this._bufferService = _bufferService;
        this._logService = _logService;
        this._optionsService = _optionsService;
        this.isCursorInitialized = false;
        this.isCursorHidden = false;
        this._onData = this._register(new event_1.Emitter());
        this.onData = this._onData.event;
        this._onUserInput = this._register(new event_1.Emitter());
        this.onUserInput = this._onUserInput.event;
        this._onBinary = this._register(new event_1.Emitter());
        this.onBinary = this._onBinary.event;
        this._onRequestScrollToBottom = this._register(new event_1.Emitter());
        this.onRequestScrollToBottom = this._onRequestScrollToBottom.event;
        this.modes = (0, Clone_1.clone)(DEFAULT_MODES);
        this.decPrivateModes = (0, Clone_1.clone)(DEFAULT_DEC_PRIVATE_MODES);
    }
    reset() {
        this.modes = (0, Clone_1.clone)(DEFAULT_MODES);
        this.decPrivateModes = (0, Clone_1.clone)(DEFAULT_DEC_PRIVATE_MODES);
    }
    triggerDataEvent(data, wasUserInput = false) {
        if (this._optionsService.rawOptions.disableStdin) {
            return;
        }
        const buffer = this._bufferService.buffer;
        if (wasUserInput && this._optionsService.rawOptions.scrollOnUserInput && buffer.ybase !== buffer.ydisp) {
            this._onRequestScrollToBottom.fire();
        }
        if (wasUserInput) {
            this._onUserInput.fire();
        }
        this._logService.debug(`sending data "${data}"`, () => data.split('').map(e => e.charCodeAt(0)));
        this._onData.fire(data);
    }
    triggerBinaryEvent(data) {
        if (this._optionsService.rawOptions.disableStdin) {
            return;
        }
        this._logService.debug(`sending binary "${data}"`, () => data.split('').map(e => e.charCodeAt(0)));
        this._onBinary.fire(data);
    }
};
exports.CoreService = CoreService;
exports.CoreService = CoreService = __decorate([
    __param(0, Services_1.IBufferService),
    __param(1, Services_1.ILogService),
    __param(2, Services_1.IOptionsService)
], CoreService);
//# sourceMappingURL=CoreService.js.map