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
var Mouse_exports = {};
__export(Mouse_exports, {
  getCoords: () => getCoords,
  getCoordsRelativeToElement: () => getCoordsRelativeToElement
});
module.exports = __toCommonJS(Mouse_exports);
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function getCoordsRelativeToElement(window, event, element) {
  const rect = element.getBoundingClientRect();
  const elementStyle = window.getComputedStyle(element);
  const leftPadding = parseInt(elementStyle.getPropertyValue("padding-left"));
  const topPadding = parseInt(elementStyle.getPropertyValue("padding-top"));
  return [
    event.clientX - rect.left - leftPadding,
    event.clientY - rect.top - topPadding
  ];
}
function getCoords(window, event, element, colCount, rowCount, hasValidCharSize, cssCellWidth, cssCellHeight, isSelection) {
  if (!hasValidCharSize) {
    return void 0;
  }
  const coords = getCoordsRelativeToElement(window, event, element);
  if (!coords) {
    return void 0;
  }
  coords[0] = Math.ceil((coords[0] + (isSelection ? cssCellWidth / 2 : 0)) / cssCellWidth);
  coords[1] = Math.ceil(coords[1] / cssCellHeight);
  coords[0] = Math.min(Math.max(coords[0], 1), colCount + (isSelection ? 1 : 0));
  coords[1] = Math.min(Math.max(coords[1], 1), rowCount);
  return coords;
}
//# sourceMappingURL=Mouse.js.map
