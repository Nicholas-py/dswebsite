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
var CharacterJoinerService_exports = {};
__export(CharacterJoinerService_exports, {
  CharacterJoinerService: () => CharacterJoinerService,
  JoinedCellData: () => JoinedCellData
});
module.exports = __toCommonJS(CharacterJoinerService_exports);
var import_AttributeData = require("common/buffer/AttributeData");
var import_Constants = require("common/buffer/Constants");
var import_CellData = require("common/buffer/CellData");
var import_Services = require("common/services/Services");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class JoinedCellData extends import_AttributeData.AttributeData {
  constructor(firstCell, chars, width) {
    super();
    // .content carries no meaning for joined CellData, simply nullify it
    // thus we have to overload all other .content accessors
    this.content = 0;
    this.combinedData = "";
    this.fg = firstCell.fg;
    this.bg = firstCell.bg;
    this.combinedData = chars;
    this._width = width;
  }
  isCombined() {
    return import_Constants.Content.IS_COMBINED_MASK;
  }
  getWidth() {
    return this._width;
  }
  getChars() {
    return this.combinedData;
  }
  getCode() {
    return 2097151;
  }
  setFromCharData(value) {
    throw new Error("not implemented");
  }
  getAsCharData() {
    return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
  }
}
let CharacterJoinerService = class {
  constructor(_bufferService) {
    this._bufferService = _bufferService;
    this._characterJoiners = [];
    this._nextCharacterJoinerId = 0;
    this._workCell = new import_CellData.CellData();
  }
  register(handler) {
    const joiner = {
      id: this._nextCharacterJoinerId++,
      handler
    };
    this._characterJoiners.push(joiner);
    return joiner.id;
  }
  deregister(joinerId) {
    for (let i = 0; i < this._characterJoiners.length; i++) {
      if (this._characterJoiners[i].id === joinerId) {
        this._characterJoiners.splice(i, 1);
        return true;
      }
    }
    return false;
  }
  getJoinedCharacters(row) {
    if (this._characterJoiners.length === 0) {
      return [];
    }
    const line = this._bufferService.buffer.lines.get(row);
    if (!line || line.length === 0) {
      return [];
    }
    const ranges = [];
    const lineStr = line.translateToString(true);
    let rangeStartColumn = 0;
    let currentStringIndex = 0;
    let rangeStartStringIndex = 0;
    let rangeAttrFG = line.getFg(0);
    let rangeAttrBG = line.getBg(0);
    for (let x = 0; x < line.getTrimmedLength(); x++) {
      line.loadCell(x, this._workCell);
      if (this._workCell.getWidth() === 0) {
        continue;
      }
      if (this._workCell.fg !== rangeAttrFG || this._workCell.bg !== rangeAttrBG) {
        if (x - rangeStartColumn > 1) {
          const joinedRanges = this._getJoinedRanges(
            lineStr,
            rangeStartStringIndex,
            currentStringIndex,
            line,
            rangeStartColumn
          );
          for (let i = 0; i < joinedRanges.length; i++) {
            ranges.push(joinedRanges[i]);
          }
        }
        rangeStartColumn = x;
        rangeStartStringIndex = currentStringIndex;
        rangeAttrFG = this._workCell.fg;
        rangeAttrBG = this._workCell.bg;
      }
      currentStringIndex += this._workCell.getChars().length || import_Constants.WHITESPACE_CELL_CHAR.length;
    }
    if (this._bufferService.cols - rangeStartColumn > 1) {
      const joinedRanges = this._getJoinedRanges(
        lineStr,
        rangeStartStringIndex,
        currentStringIndex,
        line,
        rangeStartColumn
      );
      for (let i = 0; i < joinedRanges.length; i++) {
        ranges.push(joinedRanges[i]);
      }
    }
    return ranges;
  }
  /**
   * Given a segment of a line of text, find all ranges of text that should be
   * joined in a single rendering unit. Ranges are internally converted to
   * column ranges, rather than string ranges.
   * @param line String representation of the full line of text
   * @param startIndex Start position of the range to search in the string (inclusive)
   * @param endIndex End position of the range to search in the string (exclusive)
   */
  _getJoinedRanges(line, startIndex, endIndex, lineData, startCol) {
    const text = line.substring(startIndex, endIndex);
    let allJoinedRanges = [];
    try {
      allJoinedRanges = this._characterJoiners[0].handler(text);
    } catch (error) {
      console.error(error);
    }
    for (let i = 1; i < this._characterJoiners.length; i++) {
      try {
        const joinerRanges = this._characterJoiners[i].handler(text);
        for (let j = 0; j < joinerRanges.length; j++) {
          CharacterJoinerService._mergeRanges(allJoinedRanges, joinerRanges[j]);
        }
      } catch (error) {
        console.error(error);
      }
    }
    this._stringRangesToCellRanges(allJoinedRanges, lineData, startCol);
    return allJoinedRanges;
  }
  /**
   * Modifies the provided ranges in-place to adjust for variations between
   * string length and cell width so that the range represents a cell range,
   * rather than the string range the joiner provides.
   * @param ranges String ranges containing start (inclusive) and end (exclusive) index
   * @param line Cell data for the relevant line in the terminal
   * @param startCol Offset within the line to start from
   */
  _stringRangesToCellRanges(ranges, line, startCol) {
    let currentRangeIndex = 0;
    let currentRangeStarted = false;
    let currentStringIndex = 0;
    let currentRange = ranges[currentRangeIndex];
    if (!currentRange) {
      return;
    }
    for (let x = startCol; x < this._bufferService.cols; x++) {
      const width = line.getWidth(x);
      const length = line.getString(x).length || import_Constants.WHITESPACE_CELL_CHAR.length;
      if (width === 0) {
        continue;
      }
      if (!currentRangeStarted && currentRange[0] <= currentStringIndex) {
        currentRange[0] = x;
        currentRangeStarted = true;
      }
      if (currentRange[1] <= currentStringIndex) {
        currentRange[1] = x;
        currentRange = ranges[++currentRangeIndex];
        if (!currentRange) {
          break;
        }
        if (currentRange[0] <= currentStringIndex) {
          currentRange[0] = x;
          currentRangeStarted = true;
        } else {
          currentRangeStarted = false;
        }
      }
      currentStringIndex += length;
    }
    if (currentRange) {
      currentRange[1] = this._bufferService.cols;
    }
  }
  /**
   * Merges the range defined by the provided start and end into the list of
   * existing ranges. The merge is done in place on the existing range for
   * performance and is also returned.
   * @param ranges Existing range list
   * @param newRange Tuple of two numbers representing the new range to merge in.
   * @returns The ranges input with the new range merged in place
   */
  static _mergeRanges(ranges, newRange) {
    let inRange = false;
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      if (!inRange) {
        if (newRange[1] <= range[0]) {
          ranges.splice(i, 0, newRange);
          return ranges;
        }
        if (newRange[1] <= range[1]) {
          range[0] = Math.min(newRange[0], range[0]);
          return ranges;
        }
        if (newRange[0] < range[1]) {
          range[0] = Math.min(newRange[0], range[0]);
          inRange = true;
        }
        continue;
      } else {
        if (newRange[1] <= range[0]) {
          ranges[i - 1][1] = newRange[1];
          return ranges;
        }
        if (newRange[1] <= range[1]) {
          ranges[i - 1][1] = Math.max(newRange[1], range[1]);
          ranges.splice(i, 1);
          return ranges;
        }
        ranges.splice(i, 1);
        i--;
      }
    }
    if (inRange) {
      ranges[ranges.length - 1][1] = newRange[1];
    } else {
      ranges.push(newRange);
    }
    return ranges;
  }
};
CharacterJoinerService = __decorateClass([
  __decorateParam(0, import_Services.IBufferService)
], CharacterJoinerService);
//# sourceMappingURL=CharacterJoinerService.js.map
