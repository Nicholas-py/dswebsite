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
var WebLinksAddon_exports = {};
__export(WebLinksAddon_exports, {
  WebLinksAddon: () => WebLinksAddon
});
module.exports = __toCommonJS(WebLinksAddon_exports);
var import_WebLinkProvider = require("./WebLinkProvider");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const strictUrlRegex = /(https?|HTTPS?):[/]{2}[^\s"'!*(){}|\\\^<>`]*[^\s"':,.!?{}|\\\^~\[\]`()<>]/;
function handleLink(event, uri) {
  const newWindow = window.open();
  if (newWindow) {
    try {
      newWindow.opener = null;
    } catch {
    }
    newWindow.location.href = uri;
  } else {
    console.warn("Opening link blocked as opener could not be cleared");
  }
}
class WebLinksAddon {
  constructor(_handler = handleLink, _options = {}) {
    this._handler = _handler;
    this._options = _options;
  }
  activate(terminal) {
    this._terminal = terminal;
    const options = this._options;
    const regex = options.urlRegex || strictUrlRegex;
    this._linkProvider = this._terminal.registerLinkProvider(new import_WebLinkProvider.WebLinkProvider(this._terminal, regex, this._handler, options));
  }
  dispose() {
    this._linkProvider?.dispose();
  }
}
//# sourceMappingURL=WebLinksAddon.js.map
