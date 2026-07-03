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
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
var MouseService_exports = {};
__export(MouseService_exports, {
  MouseService: () => MouseService
});
module.exports = __toCommonJS(MouseService_exports);
var import_Services = require("./Services");
var import_Mouse = require("browser/input/Mouse");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let MouseService = class {
  constructor(_renderService, _charSizeService) {
    this._renderService = _renderService;
    this._charSizeService = _charSizeService;
  }
  getCoords(event, element, colCount, rowCount, isSelection) {
    return (0, import_Mouse.getCoords)(
      window,
      event,
      element,
      colCount,
      rowCount,
      this._charSizeService.hasValidSize,
      this._renderService.dimensions.css.cell.width,
      this._renderService.dimensions.css.cell.height,
      isSelection
    );
  }
  getMouseReportCoords(event, element) {
    const coords = (0, import_Mouse.getCoordsRelativeToElement)(window, event, element);
    if (!this._charSizeService.hasValidSize) {
      return void 0;
    }
    coords[0] = Math.min(Math.max(coords[0], 0), this._renderService.dimensions.css.canvas.width - 1);
    coords[1] = Math.min(Math.max(coords[1], 0), this._renderService.dimensions.css.canvas.height - 1);
    return {
      col: Math.floor(coords[0] / this._renderService.dimensions.css.cell.width),
      row: Math.floor(coords[1] / this._renderService.dimensions.css.cell.height),
      x: Math.floor(coords[0]),
      y: Math.floor(coords[1])
    };
  }
};
MouseService = __decorateClass([
  __decorateParam(0, import_Services.IRenderService),
  __decorateParam(1, import_Services.ICharSizeService)
], MouseService);
//# sourceMappingURL=MouseService.js.map
