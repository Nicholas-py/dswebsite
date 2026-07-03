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
var BufferLine_exports = {};
__export(BufferLine_exports, {
  BufferLine: () => BufferLine,
  DEFAULT_ATTR_DATA: () => DEFAULT_ATTR_DATA
});
module.exports = __toCommonJS(BufferLine_exports);
var import_AttributeData = require("common/buffer/AttributeData");
var import_CellData = require("common/buffer/CellData");
var import_Constants = require("common/buffer/Constants");
var import_TextDecoder = require("common/input/TextDecoder");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const CELL_SIZE = 3;
var Cell = /* @__PURE__ */ ((Cell2) => {
  Cell2[Cell2["CONTENT"] = 0] = "CONTENT";
  Cell2[Cell2["FG"] = 1] = "FG";
  Cell2[Cell2["BG"] = 2] = "BG";
  return Cell2;
})(Cell || {});
const DEFAULT_ATTR_DATA = Object.freeze(new import_AttributeData.AttributeData());
let $startIndex = 0;
const CLEANUP_THRESHOLD = 2;
class BufferLine {
  constructor(cols, fillCellData, isWrapped = false) {
    this.isWrapped = isWrapped;
    this._combined = {};
    this._extendedAttrs = {};
    this._data = new Uint32Array(cols * CELL_SIZE);
    const cell = fillCellData || import_CellData.CellData.fromCharData([0, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]);
    for (let i = 0; i < cols; ++i) {
      this.setCell(i, cell);
    }
    this.length = cols;
  }
  /**
   * Get cell data CharData.
   * @deprecated
   */
  get(index) {
    const content = this._data[index * CELL_SIZE + 0 /* CONTENT */];
    const cp = content & import_Constants.Content.CODEPOINT_MASK;
    return [
      this._data[index * CELL_SIZE + 1 /* FG */],
      content & import_Constants.Content.IS_COMBINED_MASK ? this._combined[index] : cp ? (0, import_TextDecoder.stringFromCodePoint)(cp) : "",
      content >> import_Constants.Content.WIDTH_SHIFT,
      content & import_Constants.Content.IS_COMBINED_MASK ? this._combined[index].charCodeAt(this._combined[index].length - 1) : cp
    ];
  }
  /**
   * Set cell data from CharData.
   * @deprecated
   */
  set(index, value) {
    this._data[index * CELL_SIZE + 1 /* FG */] = value[import_Constants.CHAR_DATA_ATTR_INDEX];
    if (value[import_Constants.CHAR_DATA_CHAR_INDEX].length > 1) {
      this._combined[index] = value[1];
      this._data[index * CELL_SIZE + 0 /* CONTENT */] = index | import_Constants.Content.IS_COMBINED_MASK | value[import_Constants.CHAR_DATA_WIDTH_INDEX] << import_Constants.Content.WIDTH_SHIFT;
    } else {
      this._data[index * CELL_SIZE + 0 /* CONTENT */] = value[import_Constants.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | value[import_Constants.CHAR_DATA_WIDTH_INDEX] << import_Constants.Content.WIDTH_SHIFT;
    }
  }
  /**
   * primitive getters
   * use these when only one value is needed, otherwise use `loadCell`
   */
  getWidth(index) {
    return this._data[index * CELL_SIZE + 0 /* CONTENT */] >> import_Constants.Content.WIDTH_SHIFT;
  }
  /** Test whether content has width. */
  hasWidth(index) {
    return this._data[index * CELL_SIZE + 0 /* CONTENT */] & import_Constants.Content.WIDTH_MASK;
  }
  /** Get FG cell component. */
  getFg(index) {
    return this._data[index * CELL_SIZE + 1 /* FG */];
  }
  /** Get BG cell component. */
  getBg(index) {
    return this._data[index * CELL_SIZE + 2 /* BG */];
  }
  /**
   * Test whether contains any chars.
   * Basically an empty has no content, but other cells might differ in FG/BG
   * from real empty cells.
   */
  hasContent(index) {
    return this._data[index * CELL_SIZE + 0 /* CONTENT */] & import_Constants.Content.HAS_CONTENT_MASK;
  }
  /**
   * Get codepoint of the cell.
   * To be in line with `code` in CharData this either returns
   * a single UTF32 codepoint or the last codepoint of a combined string.
   */
  getCodePoint(index) {
    const content = this._data[index * CELL_SIZE + 0 /* CONTENT */];
    if (content & import_Constants.Content.IS_COMBINED_MASK) {
      return this._combined[index].charCodeAt(this._combined[index].length - 1);
    }
    return content & import_Constants.Content.CODEPOINT_MASK;
  }
  /** Test whether the cell contains a combined string. */
  isCombined(index) {
    return this._data[index * CELL_SIZE + 0 /* CONTENT */] & import_Constants.Content.IS_COMBINED_MASK;
  }
  /** Returns the string content of the cell. */
  getString(index) {
    const content = this._data[index * CELL_SIZE + 0 /* CONTENT */];
    if (content & import_Constants.Content.IS_COMBINED_MASK) {
      return this._combined[index];
    }
    if (content & import_Constants.Content.CODEPOINT_MASK) {
      return (0, import_TextDecoder.stringFromCodePoint)(content & import_Constants.Content.CODEPOINT_MASK);
    }
    return "";
  }
  /** Get state of protected flag. */
  isProtected(index) {
    return this._data[index * CELL_SIZE + 2 /* BG */] & import_Constants.BgFlags.PROTECTED;
  }
  /**
   * Load data at `index` into `cell`. This is used to access cells in a way that's more friendly
   * to GC as it significantly reduced the amount of new objects/references needed.
   */
  loadCell(index, cell) {
    $startIndex = index * CELL_SIZE;
    cell.content = this._data[$startIndex + 0 /* CONTENT */];
    cell.fg = this._data[$startIndex + 1 /* FG */];
    cell.bg = this._data[$startIndex + 2 /* BG */];
    if (cell.content & import_Constants.Content.IS_COMBINED_MASK) {
      cell.combinedData = this._combined[index];
    }
    if (cell.bg & import_Constants.BgFlags.HAS_EXTENDED) {
      cell.extended = this._extendedAttrs[index];
    }
    return cell;
  }
  /**
   * Set data at `index` to `cell`.
   */
  setCell(index, cell) {
    if (cell.content & import_Constants.Content.IS_COMBINED_MASK) {
      this._combined[index] = cell.combinedData;
    }
    if (cell.bg & import_Constants.BgFlags.HAS_EXTENDED) {
      this._extendedAttrs[index] = cell.extended;
    }
    this._data[index * CELL_SIZE + 0 /* CONTENT */] = cell.content;
    this._data[index * CELL_SIZE + 1 /* FG */] = cell.fg;
    this._data[index * CELL_SIZE + 2 /* BG */] = cell.bg;
  }
  /**
   * Set cell data from input handler.
   * Since the input handler see the incoming chars as UTF32 codepoints,
   * it gets an optimized access method.
   */
  setCellFromCodepoint(index, codePoint, width, attrs) {
    if (attrs.bg & import_Constants.BgFlags.HAS_EXTENDED) {
      this._extendedAttrs[index] = attrs.extended;
    }
    this._data[index * CELL_SIZE + 0 /* CONTENT */] = codePoint | width << import_Constants.Content.WIDTH_SHIFT;
    this._data[index * CELL_SIZE + 1 /* FG */] = attrs.fg;
    this._data[index * CELL_SIZE + 2 /* BG */] = attrs.bg;
  }
  /**
   * Add a codepoint to a cell from input handler.
   * During input stage combining chars with a width of 0 follow and stack
   * onto a leading char. Since we already set the attrs
   * by the previous `setDataFromCodePoint` call, we can omit it here.
   */
  addCodepointToCell(index, codePoint, width) {
    let content = this._data[index * CELL_SIZE + 0 /* CONTENT */];
    if (content & import_Constants.Content.IS_COMBINED_MASK) {
      this._combined[index] += (0, import_TextDecoder.stringFromCodePoint)(codePoint);
    } else {
      if (content & import_Constants.Content.CODEPOINT_MASK) {
        this._combined[index] = (0, import_TextDecoder.stringFromCodePoint)(content & import_Constants.Content.CODEPOINT_MASK) + (0, import_TextDecoder.stringFromCodePoint)(codePoint);
        content &= ~import_Constants.Content.CODEPOINT_MASK;
        content |= import_Constants.Content.IS_COMBINED_MASK;
      } else {
        content = codePoint | 1 << import_Constants.Content.WIDTH_SHIFT;
      }
    }
    if (width) {
      content &= ~import_Constants.Content.WIDTH_MASK;
      content |= width << import_Constants.Content.WIDTH_SHIFT;
    }
    this._data[index * CELL_SIZE + 0 /* CONTENT */] = content;
  }
  insertCells(pos, n, fillCellData) {
    pos %= this.length;
    if (pos && this.getWidth(pos - 1) === 2) {
      this.setCellFromCodepoint(pos - 1, 0, 1, fillCellData);
    }
    if (n < this.length - pos) {
      const cell = new import_CellData.CellData();
      for (let i = this.length - pos - n - 1; i >= 0; --i) {
        this.setCell(pos + n + i, this.loadCell(pos + i, cell));
      }
      for (let i = 0; i < n; ++i) {
        this.setCell(pos + i, fillCellData);
      }
    } else {
      for (let i = pos; i < this.length; ++i) {
        this.setCell(i, fillCellData);
      }
    }
    if (this.getWidth(this.length - 1) === 2) {
      this.setCellFromCodepoint(this.length - 1, 0, 1, fillCellData);
    }
  }
  deleteCells(pos, n, fillCellData) {
    pos %= this.length;
    if (n < this.length - pos) {
      const cell = new import_CellData.CellData();
      for (let i = 0; i < this.length - pos - n; ++i) {
        this.setCell(pos + i, this.loadCell(pos + n + i, cell));
      }
      for (let i = this.length - n; i < this.length; ++i) {
        this.setCell(i, fillCellData);
      }
    } else {
      for (let i = pos; i < this.length; ++i) {
        this.setCell(i, fillCellData);
      }
    }
    if (pos && this.getWidth(pos - 1) === 2) {
      this.setCellFromCodepoint(pos - 1, 0, 1, fillCellData);
    }
    if (this.getWidth(pos) === 0 && !this.hasContent(pos)) {
      this.setCellFromCodepoint(pos, 0, 1, fillCellData);
    }
  }
  replaceCells(start, end, fillCellData, respectProtect = false) {
    if (respectProtect) {
      if (start && this.getWidth(start - 1) === 2 && !this.isProtected(start - 1)) {
        this.setCellFromCodepoint(start - 1, 0, 1, fillCellData);
      }
      if (end < this.length && this.getWidth(end - 1) === 2 && !this.isProtected(end)) {
        this.setCellFromCodepoint(end, 0, 1, fillCellData);
      }
      while (start < end && start < this.length) {
        if (!this.isProtected(start)) {
          this.setCell(start, fillCellData);
        }
        start++;
      }
      return;
    }
    if (start && this.getWidth(start - 1) === 2) {
      this.setCellFromCodepoint(start - 1, 0, 1, fillCellData);
    }
    if (end < this.length && this.getWidth(end - 1) === 2) {
      this.setCellFromCodepoint(end, 0, 1, fillCellData);
    }
    while (start < end && start < this.length) {
      this.setCell(start++, fillCellData);
    }
  }
  /**
   * Resize BufferLine to `cols` filling excess cells with `fillCellData`.
   * The underlying array buffer will not change if there is still enough space
   * to hold the new buffer line data.
   * Returns a boolean indicating, whether a `cleanupMemory` call would free
   * excess memory (true after shrinking > CLEANUP_THRESHOLD).
   */
  resize(cols, fillCellData) {
    if (cols === this.length) {
      return this._data.length * 4 * CLEANUP_THRESHOLD < this._data.buffer.byteLength;
    }
    const uint32Cells = cols * CELL_SIZE;
    if (cols > this.length) {
      if (this._data.buffer.byteLength >= uint32Cells * 4) {
        this._data = new Uint32Array(this._data.buffer, 0, uint32Cells);
      } else {
        const data = new Uint32Array(uint32Cells);
        data.set(this._data);
        this._data = data;
      }
      for (let i = this.length; i < cols; ++i) {
        this.setCell(i, fillCellData);
      }
    } else {
      this._data = this._data.subarray(0, uint32Cells);
      const keys = Object.keys(this._combined);
      for (let i = 0; i < keys.length; i++) {
        const key = parseInt(keys[i], 10);
        if (key >= cols) {
          delete this._combined[key];
        }
      }
      const extKeys = Object.keys(this._extendedAttrs);
      for (let i = 0; i < extKeys.length; i++) {
        const key = parseInt(extKeys[i], 10);
        if (key >= cols) {
          delete this._extendedAttrs[key];
        }
      }
    }
    this.length = cols;
    return uint32Cells * 4 * CLEANUP_THRESHOLD < this._data.buffer.byteLength;
  }
  /**
   * Cleanup underlying array buffer.
   * A cleanup will be triggered if the array buffer exceeds the actual used
   * memory by a factor of CLEANUP_THRESHOLD.
   * Returns 0 or 1 indicating whether a cleanup happened.
   */
  cleanupMemory() {
    if (this._data.length * 4 * CLEANUP_THRESHOLD < this._data.buffer.byteLength) {
      const data = new Uint32Array(this._data.length);
      data.set(this._data);
      this._data = data;
      return 1;
    }
    return 0;
  }
  /** fill a line with fillCharData */
  fill(fillCellData, respectProtect = false) {
    if (respectProtect) {
      for (let i = 0; i < this.length; ++i) {
        if (!this.isProtected(i)) {
          this.setCell(i, fillCellData);
        }
      }
      return;
    }
    this._combined = {};
    this._extendedAttrs = {};
    for (let i = 0; i < this.length; ++i) {
      this.setCell(i, fillCellData);
    }
  }
  /** alter to a full copy of line  */
  copyFrom(line) {
    if (this.length !== line.length) {
      this._data = new Uint32Array(line._data);
    } else {
      this._data.set(line._data);
    }
    this.length = line.length;
    this._combined = {};
    for (const el in line._combined) {
      this._combined[el] = line._combined[el];
    }
    this._extendedAttrs = {};
    for (const el in line._extendedAttrs) {
      this._extendedAttrs[el] = line._extendedAttrs[el];
    }
    this.isWrapped = line.isWrapped;
  }
  /** create a new clone */
  clone() {
    const newLine = new BufferLine(0);
    newLine._data = new Uint32Array(this._data);
    newLine.length = this.length;
    for (const el in this._combined) {
      newLine._combined[el] = this._combined[el];
    }
    for (const el in this._extendedAttrs) {
      newLine._extendedAttrs[el] = this._extendedAttrs[el];
    }
    newLine.isWrapped = this.isWrapped;
    return newLine;
  }
  getTrimmedLength() {
    for (let i = this.length - 1; i >= 0; --i) {
      if (this._data[i * CELL_SIZE + 0 /* CONTENT */] & import_Constants.Content.HAS_CONTENT_MASK) {
        return i + (this._data[i * CELL_SIZE + 0 /* CONTENT */] >> import_Constants.Content.WIDTH_SHIFT);
      }
    }
    return 0;
  }
  getNoBgTrimmedLength() {
    for (let i = this.length - 1; i >= 0; --i) {
      if (this._data[i * CELL_SIZE + 0 /* CONTENT */] & import_Constants.Content.HAS_CONTENT_MASK || this._data[i * CELL_SIZE + 2 /* BG */] & import_Constants.Attributes.CM_MASK) {
        return i + (this._data[i * CELL_SIZE + 0 /* CONTENT */] >> import_Constants.Content.WIDTH_SHIFT);
      }
    }
    return 0;
  }
  copyCellsFrom(src, srcCol, destCol, length, applyInReverse) {
    const srcData = src._data;
    if (applyInReverse) {
      for (let cell = length - 1; cell >= 0; cell--) {
        for (let i = 0; i < CELL_SIZE; i++) {
          this._data[(destCol + cell) * CELL_SIZE + i] = srcData[(srcCol + cell) * CELL_SIZE + i];
        }
        if (srcData[(srcCol + cell) * CELL_SIZE + 2 /* BG */] & import_Constants.BgFlags.HAS_EXTENDED) {
          this._extendedAttrs[destCol + cell] = src._extendedAttrs[srcCol + cell];
        }
      }
    } else {
      for (let cell = 0; cell < length; cell++) {
        for (let i = 0; i < CELL_SIZE; i++) {
          this._data[(destCol + cell) * CELL_SIZE + i] = srcData[(srcCol + cell) * CELL_SIZE + i];
        }
        if (srcData[(srcCol + cell) * CELL_SIZE + 2 /* BG */] & import_Constants.BgFlags.HAS_EXTENDED) {
          this._extendedAttrs[destCol + cell] = src._extendedAttrs[srcCol + cell];
        }
      }
    }
    const srcCombinedKeys = Object.keys(src._combined);
    for (let i = 0; i < srcCombinedKeys.length; i++) {
      const key = parseInt(srcCombinedKeys[i], 10);
      if (key >= srcCol) {
        this._combined[key - srcCol + destCol] = src._combined[key];
      }
    }
  }
  /**
   * Translates the buffer line to a string.
   *
   * @param trimRight Whether to trim any empty cells on the right.
   * @param startCol The column to start the string (0-based inclusive).
   * @param endCol The column to end the string (0-based exclusive).
   * @param outColumns if specified, this array will be filled with column numbers such that
   * `returnedString[i]` is displayed at `outColumns[i]` column. `outColumns[returnedString.length]`
   * is where the character following `returnedString` will be displayed.
   *
   * When a single cell is translated to multiple UTF-16 code units (e.g. surrogate pair) in the
   * returned string, the corresponding entries in `outColumns` will have the same column number.
   */
  translateToString(trimRight, startCol, endCol, outColumns) {
    startCol = startCol ?? 0;
    endCol = endCol ?? this.length;
    if (trimRight) {
      endCol = Math.min(endCol, this.getTrimmedLength());
    }
    if (outColumns) {
      outColumns.length = 0;
    }
    let result = "";
    while (startCol < endCol) {
      const content = this._data[startCol * CELL_SIZE + 0 /* CONTENT */];
      const cp = content & import_Constants.Content.CODEPOINT_MASK;
      const chars = content & import_Constants.Content.IS_COMBINED_MASK ? this._combined[startCol] : cp ? (0, import_TextDecoder.stringFromCodePoint)(cp) : import_Constants.WHITESPACE_CELL_CHAR;
      result += chars;
      if (outColumns) {
        for (let i = 0; i < chars.length; ++i) {
          outColumns.push(startCol);
        }
      }
      startCol += content >> import_Constants.Content.WIDTH_SHIFT || 1;
    }
    if (outColumns) {
      outColumns.push(startCol);
    }
    return result;
  }
}
//# sourceMappingURL=BufferLine.js.map
