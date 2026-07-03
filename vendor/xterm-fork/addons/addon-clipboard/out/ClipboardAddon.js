"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base64 = exports.BrowserClipboardProvider = exports.ClipboardAddon = void 0;
const js_base64_1 = require("js-base64");
class ClipboardAddon {
    constructor(_base64 = new Base64(), _provider = new BrowserClipboardProvider()) {
        this._base64 = _base64;
        this._provider = _provider;
    }
    activate(terminal) {
        this._terminal = terminal;
        this._disposable = terminal.parser.registerOscHandler(52, data => this._setOrReportClipboard(data));
    }
    dispose() {
        return this._disposable?.dispose();
    }
    _readText(sel, data) {
        const b64 = this._base64.encodeText(data);
        this._terminal?.input(`\x1b]52;${sel};${b64}\x07`, false);
    }
    _setOrReportClipboard(data) {
        const args = data.split(';');
        if (args.length < 2) {
            return true;
        }
        const pc = args[0];
        const pd = args[1];
        if (pd === '?') {
            const text = this._provider.readText(pc);
            if (text instanceof Promise) {
                return text.then((data) => {
                    this._readText(pc, data);
                    return true;
                });
            }
            this._readText(pc, text);
            return true;
        }
        let text = '';
        try {
            text = this._base64.decodeText(pd);
        }
        catch { }
        const result = this._provider.writeText(pc, text);
        if (result instanceof Promise) {
            return result.then(() => true);
        }
        return true;
    }
}
exports.ClipboardAddon = ClipboardAddon;
class BrowserClipboardProvider {
    async readText(selection) {
        if (selection !== 'c') {
            return Promise.resolve('');
        }
        return navigator.clipboard.readText();
    }
    async writeText(selection, text) {
        if (selection !== 'c') {
            return Promise.resolve();
        }
        return navigator.clipboard.writeText(text);
    }
}
exports.BrowserClipboardProvider = BrowserClipboardProvider;
class Base64 {
    encodeText(data) {
        return js_base64_1.Base64.encode(data);
    }
    decodeText(data) {
        const text = js_base64_1.Base64.decode(data);
        if (!js_base64_1.Base64.isValid(data) || js_base64_1.Base64.encode(text) !== data) {
            return '';
        }
        return text;
    }
}
exports.Base64 = Base64;
//# sourceMappingURL=ClipboardAddon.js.map