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
var ClipboardAddon_exports = {};
__export(ClipboardAddon_exports, {
  Base64: () => Base64,
  BrowserClipboardProvider: () => BrowserClipboardProvider,
  ClipboardAddon: () => ClipboardAddon
});
module.exports = __toCommonJS(ClipboardAddon_exports);
var import_js_base64 = require("js-base64");
/**
 * Copyright (c) 2023 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class ClipboardAddon {
  constructor(_base64 = new Base64(), _provider = new BrowserClipboardProvider()) {
    this._base64 = _base64;
    this._provider = _provider;
  }
  activate(terminal) {
    this._terminal = terminal;
    this._disposable = terminal.parser.registerOscHandler(52, (data) => this._setOrReportClipboard(data));
  }
  dispose() {
    return this._disposable?.dispose();
  }
  _readText(sel, data) {
    const b64 = this._base64.encodeText(data);
    this._terminal?.input(`\x1B]52;${sel};${b64}\x07`, false);
  }
  _setOrReportClipboard(data) {
    const args = data.split(";");
    if (args.length < 2) {
      return true;
    }
    const pc = args[0];
    const pd = args[1];
    if (pd === "?") {
      const text2 = this._provider.readText(pc);
      if (text2 instanceof Promise) {
        return text2.then((data2) => {
          this._readText(pc, data2);
          return true;
        });
      }
      this._readText(pc, text2);
      return true;
    }
    let text = "";
    try {
      text = this._base64.decodeText(pd);
    } catch {
    }
    const result = this._provider.writeText(pc, text);
    if (result instanceof Promise) {
      return result.then(() => true);
    }
    return true;
  }
}
class BrowserClipboardProvider {
  async readText(selection) {
    if (selection !== "c") {
      return Promise.resolve("");
    }
    return navigator.clipboard.readText();
  }
  async writeText(selection, text) {
    if (selection !== "c") {
      return Promise.resolve();
    }
    return navigator.clipboard.writeText(text);
  }
}
class Base64 {
  encodeText(data) {
    return import_js_base64.Base64.encode(data);
  }
  decodeText(data) {
    const text = import_js_base64.Base64.decode(data);
    if (!import_js_base64.Base64.isValid(data) || import_js_base64.Base64.encode(text) !== data) {
      return "";
    }
    return text;
  }
}
//# sourceMappingURL=ClipboardAddon.js.map
