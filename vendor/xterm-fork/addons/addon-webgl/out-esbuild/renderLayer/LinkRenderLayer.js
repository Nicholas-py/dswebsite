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
var LinkRenderLayer_exports = {};
__export(LinkRenderLayer_exports, {
  LinkRenderLayer: () => LinkRenderLayer
});
module.exports = __toCommonJS(LinkRenderLayer_exports);
var import_CharAtlasUtils = require("browser/renderer/shared/CharAtlasUtils");
var import_Constants = require("browser/renderer/shared/Constants");
var import_BaseRenderLayer = require("./BaseRenderLayer");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class LinkRenderLayer extends import_BaseRenderLayer.BaseRenderLayer {
  constructor(container, zIndex, terminal, linkifier2, coreBrowserService, optionsService, themeService) {
    super(terminal, container, "link", zIndex, true, coreBrowserService, optionsService, themeService);
    this._register(linkifier2.onShowLinkUnderline((e) => this._handleShowLinkUnderline(e)));
    this._register(linkifier2.onHideLinkUnderline((e) => this._handleHideLinkUnderline(e)));
  }
  resize(terminal, dim) {
    super.resize(terminal, dim);
    this._state = void 0;
  }
  reset(terminal) {
    this._clearCurrentLink();
  }
  _clearCurrentLink() {
    if (this._state) {
      this._clearCells(this._state.x1, this._state.y1, this._state.cols - this._state.x1, 1);
      const middleRowCount = this._state.y2 - this._state.y1 - 1;
      if (middleRowCount > 0) {
        this._clearCells(0, this._state.y1 + 1, this._state.cols, middleRowCount);
      }
      this._clearCells(0, this._state.y2, this._state.x2, 1);
      this._state = void 0;
    }
  }
  _handleShowLinkUnderline(e) {
    if (e.fg === import_Constants.INVERTED_DEFAULT_COLOR) {
      this._ctx.fillStyle = this._themeService.colors.background.css;
    } else if (e.fg !== void 0 && (0, import_CharAtlasUtils.is256Color)(e.fg)) {
      this._ctx.fillStyle = this._themeService.colors.ansi[e.fg].css;
    } else {
      this._ctx.fillStyle = this._themeService.colors.foreground.css;
    }
    if (e.y1 === e.y2) {
      this._fillBottomLineAtCells(e.x1, e.y1, e.x2 - e.x1);
    } else {
      this._fillBottomLineAtCells(e.x1, e.y1, e.cols - e.x1);
      for (let y = e.y1 + 1; y < e.y2; y++) {
        this._fillBottomLineAtCells(0, y, e.cols);
      }
      this._fillBottomLineAtCells(0, e.y2, e.x2);
    }
    this._state = e;
  }
  _handleHideLinkUnderline(e) {
    this._clearCurrentLink();
  }
}
//# sourceMappingURL=LinkRenderLayer.js.map
