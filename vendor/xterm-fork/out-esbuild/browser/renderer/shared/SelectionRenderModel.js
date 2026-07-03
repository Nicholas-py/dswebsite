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
var SelectionRenderModel_exports = {};
__export(SelectionRenderModel_exports, {
  createSelectionRenderModel: () => createSelectionRenderModel
});
module.exports = __toCommonJS(SelectionRenderModel_exports);
/**
 * Copyright (c) 2022 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class SelectionRenderModel {
  constructor() {
    this.clear();
  }
  clear() {
    this.hasSelection = false;
    this.columnSelectMode = false;
    this.viewportStartRow = 0;
    this.viewportEndRow = 0;
    this.viewportCappedStartRow = 0;
    this.viewportCappedEndRow = 0;
    this.startCol = 0;
    this.endCol = 0;
    this.selectionStart = void 0;
    this.selectionEnd = void 0;
  }
  update(terminal, start, end, columnSelectMode = false) {
    this.selectionStart = start;
    this.selectionEnd = end;
    if (!start || !end || start[0] === end[0] && start[1] === end[1]) {
      this.clear();
      return;
    }
    const viewportY = terminal.buffers.active.ydisp;
    const viewportStartRow = start[1] - viewportY;
    const viewportEndRow = end[1] - viewportY;
    const viewportCappedStartRow = Math.max(viewportStartRow, 0);
    const viewportCappedEndRow = Math.min(viewportEndRow, terminal.rows - 1);
    if (viewportCappedStartRow >= terminal.rows || viewportCappedEndRow < 0) {
      this.clear();
      return;
    }
    this.hasSelection = true;
    this.columnSelectMode = columnSelectMode;
    this.viewportStartRow = viewportStartRow;
    this.viewportEndRow = viewportEndRow;
    this.viewportCappedStartRow = viewportCappedStartRow;
    this.viewportCappedEndRow = viewportCappedEndRow;
    this.startCol = start[0];
    this.endCol = end[0];
  }
  isCellSelected(terminal, x, y) {
    if (!this.hasSelection) {
      return false;
    }
    y -= terminal.buffer.active.viewportY;
    if (this.columnSelectMode) {
      if (this.startCol <= this.endCol) {
        return x >= this.startCol && y >= this.viewportCappedStartRow && x < this.endCol && y <= this.viewportCappedEndRow;
      }
      return x < this.startCol && y >= this.viewportCappedStartRow && x >= this.endCol && y <= this.viewportCappedEndRow;
    }
    return y > this.viewportStartRow && y < this.viewportEndRow || this.viewportStartRow === this.viewportEndRow && y === this.viewportStartRow && x >= this.startCol && x < this.endCol || this.viewportStartRow < this.viewportEndRow && y === this.viewportEndRow && x < this.endCol || this.viewportStartRow < this.viewportEndRow && y === this.viewportStartRow && x >= this.startCol;
  }
}
function createSelectionRenderModel() {
  return new SelectionRenderModel();
}
//# sourceMappingURL=SelectionRenderModel.js.map
