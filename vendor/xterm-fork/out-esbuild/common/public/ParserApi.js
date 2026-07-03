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
var ParserApi_exports = {};
__export(ParserApi_exports, {
  ParserApi: () => ParserApi
});
module.exports = __toCommonJS(ParserApi_exports);
/**
 * Copyright (c) 2021 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class ParserApi {
  constructor(_core) {
    this._core = _core;
  }
  registerCsiHandler(id, callback) {
    return this._core.registerCsiHandler(id, (params) => callback(params.toArray()));
  }
  addCsiHandler(id, callback) {
    return this.registerCsiHandler(id, callback);
  }
  registerDcsHandler(id, callback) {
    return this._core.registerDcsHandler(id, (data, params) => callback(data, params.toArray()));
  }
  addDcsHandler(id, callback) {
    return this.registerDcsHandler(id, callback);
  }
  registerEscHandler(id, handler) {
    return this._core.registerEscHandler(id, handler);
  }
  addEscHandler(id, handler) {
    return this.registerEscHandler(id, handler);
  }
  registerOscHandler(ident, callback) {
    return this._core.registerOscHandler(ident, callback);
  }
  addOscHandler(ident, callback) {
    return this.registerOscHandler(ident, callback);
  }
}
//# sourceMappingURL=ParserApi.js.map
