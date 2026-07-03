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
var CharSizeService_exports = {};
__export(CharSizeService_exports, {
  CharSizeService: () => CharSizeService
});
module.exports = __toCommonJS(CharSizeService_exports);
var import_Services = require("common/services/Services");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2016 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let CharSizeService = class extends import_lifecycle.Disposable {
  constructor(document, parentElement, _optionsService) {
    super();
    this._optionsService = _optionsService;
    this.width = 0;
    this.height = 0;
    this._onCharSizeChange = this._register(new import_event.Emitter());
    this.onCharSizeChange = this._onCharSizeChange.event;
    try {
      this._measureStrategy = this._register(new TextMetricsMeasureStrategy(this._optionsService));
    } catch {
      this._measureStrategy = this._register(new DomMeasureStrategy(document, parentElement, this._optionsService));
    }
    this._register(this._optionsService.onMultipleOptionChange(["fontFamily", "fontSize"], () => this.measure()));
  }
  get hasValidSize() {
    return this.width > 0 && this.height > 0;
  }
  measure() {
    const result = this._measureStrategy.measure();
    if (result.width !== this.width || result.height !== this.height) {
      this.width = result.width;
      this.height = result.height;
      this._onCharSizeChange.fire();
    }
  }
};
CharSizeService = __decorateClass([
  __decorateParam(2, import_Services.IOptionsService)
], CharSizeService);
var DomMeasureStrategyConstants = /* @__PURE__ */ ((DomMeasureStrategyConstants2) => {
  DomMeasureStrategyConstants2[DomMeasureStrategyConstants2["REPEAT"] = 32] = "REPEAT";
  return DomMeasureStrategyConstants2;
})(DomMeasureStrategyConstants || {});
class BaseMeasureStategy extends import_lifecycle.Disposable {
  constructor() {
    super(...arguments);
    this._result = { width: 0, height: 0 };
  }
  _validateAndSet(width, height) {
    if (width !== void 0 && width > 0 && height !== void 0 && height > 0) {
      this._result.width = width;
      this._result.height = height;
    }
  }
}
class DomMeasureStrategy extends BaseMeasureStategy {
  constructor(_document, _parentElement, _optionsService) {
    super();
    this._document = _document;
    this._parentElement = _parentElement;
    this._optionsService = _optionsService;
    this._measureElement = this._document.createElement("span");
    this._measureElement.classList.add("xterm-char-measure-element");
    this._measureElement.textContent = "W".repeat(32 /* REPEAT */);
    this._measureElement.setAttribute("aria-hidden", "true");
    this._measureElement.style.whiteSpace = "pre";
    this._measureElement.style.fontKerning = "none";
    this._parentElement.appendChild(this._measureElement);
  }
  measure() {
    this._measureElement.style.fontFamily = this._optionsService.rawOptions.fontFamily;
    this._measureElement.style.fontSize = `${this._optionsService.rawOptions.fontSize}px`;
    this._validateAndSet(Number(this._measureElement.offsetWidth) / 32 /* REPEAT */, Number(this._measureElement.offsetHeight));
    return this._result;
  }
}
class TextMetricsMeasureStrategy extends BaseMeasureStategy {
  constructor(_optionsService) {
    super();
    this._optionsService = _optionsService;
    this._canvas = new OffscreenCanvas(100, 100);
    this._ctx = this._canvas.getContext("2d");
    const a = this._ctx.measureText("W");
    if (!("width" in a && "fontBoundingBoxAscent" in a && "fontBoundingBoxDescent" in a)) {
      throw new Error("Required font metrics not supported");
    }
  }
  measure() {
    this._ctx.font = `${this._optionsService.rawOptions.fontSize}px ${this._optionsService.rawOptions.fontFamily}`;
    const metrics = this._ctx.measureText("W");
    this._validateAndSet(metrics.width, metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent);
    return this._result;
  }
}
//# sourceMappingURL=CharSizeService.js.map
