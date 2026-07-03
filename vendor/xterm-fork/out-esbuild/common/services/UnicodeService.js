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
var UnicodeService_exports = {};
__export(UnicodeService_exports, {
  UnicodeService: () => UnicodeService
});
module.exports = __toCommonJS(UnicodeService_exports);
var import_UnicodeV6 = require("common/input/UnicodeV6");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class UnicodeService {
  constructor() {
    this._providers = /* @__PURE__ */ Object.create(null);
    this._active = "";
    this._onChange = new import_event.Emitter();
    this.onChange = this._onChange.event;
    const defaultProvider = new import_UnicodeV6.UnicodeV6();
    this.register(defaultProvider);
    this._active = defaultProvider.version;
    this._activeProvider = defaultProvider;
  }
  static extractShouldJoin(value) {
    return (value & 1) !== 0;
  }
  static extractWidth(value) {
    return value >> 1 & 3;
  }
  static extractCharKind(value) {
    return value >> 3;
  }
  static createPropertyValue(state, width, shouldJoin = false) {
    return (state & 16777215) << 3 | (width & 3) << 1 | (shouldJoin ? 1 : 0);
  }
  dispose() {
    this._onChange.dispose();
  }
  get versions() {
    return Object.keys(this._providers);
  }
  get activeVersion() {
    return this._active;
  }
  set activeVersion(version) {
    if (!this._providers[version]) {
      throw new Error(`unknown Unicode version "${version}"`);
    }
    this._active = version;
    this._activeProvider = this._providers[version];
    this._onChange.fire(version);
  }
  register(provider) {
    this._providers[provider.version] = provider;
  }
  /**
   * Unicode version dependent interface.
   */
  wcwidth(num) {
    return this._activeProvider.wcwidth(num);
  }
  getStringCellWidth(s) {
    let result = 0;
    let precedingInfo = 0;
    const length = s.length;
    for (let i = 0; i < length; ++i) {
      let code = s.charCodeAt(i);
      if (55296 <= code && code <= 56319) {
        if (++i >= length) {
          return result + this.wcwidth(code);
        }
        const second = s.charCodeAt(i);
        if (56320 <= second && second <= 57343) {
          code = (code - 55296) * 1024 + second - 56320 + 65536;
        } else {
          result += this.wcwidth(second);
        }
      }
      const currentInfo = this.charProperties(code, precedingInfo);
      let chWidth = UnicodeService.extractWidth(currentInfo);
      if (UnicodeService.extractShouldJoin(currentInfo)) {
        chWidth -= UnicodeService.extractWidth(precedingInfo);
      }
      result += chWidth;
      precedingInfo = currentInfo;
    }
    return result;
  }
  charProperties(codepoint, preceding) {
    return this._activeProvider.charProperties(codepoint, preceding);
  }
}
//# sourceMappingURL=UnicodeService.js.map
