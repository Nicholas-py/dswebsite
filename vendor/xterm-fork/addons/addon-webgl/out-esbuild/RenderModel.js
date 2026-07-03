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
var RenderModel_exports = {};
__export(RenderModel_exports, {
  COMBINED_CHAR_BIT_MASK: () => COMBINED_CHAR_BIT_MASK,
  RENDER_MODEL_BG_OFFSET: () => RENDER_MODEL_BG_OFFSET,
  RENDER_MODEL_EXT_OFFSET: () => RENDER_MODEL_EXT_OFFSET,
  RENDER_MODEL_FG_OFFSET: () => RENDER_MODEL_FG_OFFSET,
  RENDER_MODEL_INDICIES_PER_CELL: () => RENDER_MODEL_INDICIES_PER_CELL,
  RenderModel: () => RenderModel
});
module.exports = __toCommonJS(RenderModel_exports);
var import_SelectionRenderModel = require("browser/renderer/shared/SelectionRenderModel");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const RENDER_MODEL_INDICIES_PER_CELL = 4;
const RENDER_MODEL_BG_OFFSET = 1;
const RENDER_MODEL_FG_OFFSET = 2;
const RENDER_MODEL_EXT_OFFSET = 3;
const COMBINED_CHAR_BIT_MASK = 2147483648;
class RenderModel {
  constructor() {
    this.cells = new Uint32Array(0);
    this.lineLengths = new Uint32Array(0);
    this.selection = (0, import_SelectionRenderModel.createSelectionRenderModel)();
  }
  resize(cols, rows) {
    const indexCount = cols * rows * RENDER_MODEL_INDICIES_PER_CELL;
    if (indexCount !== this.cells.length) {
      this.cells = new Uint32Array(indexCount);
      this.lineLengths = new Uint32Array(rows);
    }
  }
  clear() {
    this.cells.fill(0, 0);
    this.lineLengths.fill(0, 0);
  }
}
//# sourceMappingURL=RenderModel.js.map
