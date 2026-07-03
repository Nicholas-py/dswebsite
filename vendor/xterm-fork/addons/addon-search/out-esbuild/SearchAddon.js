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
var SearchAddon_exports = {};
__export(SearchAddon_exports, {
  SearchAddon: () => SearchAddon
});
module.exports = __toCommonJS(SearchAddon_exports);
var import_event = require("vs/base/common/event");
var import_lifecycle = require("vs/base/common/lifecycle");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const NON_WORD_CHARACTERS = " ~!@#$%^&*()+`-=[]{}|\\;:\"',./<>?";
const LINES_CACHE_TIME_TO_LIVE = 15 * 1e3;
const DEFAULT_HIGHLIGHT_LIMIT = 1e3;
class SearchAddon extends import_lifecycle.Disposable {
  constructor(options) {
    super();
    this._highlightedLines = /* @__PURE__ */ new Set();
    this._highlightDecorations = [];
    this._selectedDecoration = this._register(new import_lifecycle.MutableDisposable());
    this._linesCacheTimeoutId = 0;
    this._linesCacheDisposables = new import_lifecycle.MutableDisposable();
    this._onDidChangeResults = this._register(new import_event.Emitter());
    this.onDidChangeResults = this._onDidChangeResults.event;
    this._highlightLimit = options?.highlightLimit ?? DEFAULT_HIGHLIGHT_LIMIT;
  }
  activate(terminal) {
    this._terminal = terminal;
    this._register(this._terminal.onWriteParsed(() => this._updateMatches()));
    this._register(this._terminal.onResize(() => this._updateMatches()));
    this._register((0, import_lifecycle.toDisposable)(() => this.clearDecorations()));
  }
  _updateMatches() {
    if (this._highlightTimeout) {
      window.clearTimeout(this._highlightTimeout);
    }
    if (this._cachedSearchTerm && this._lastSearchOptions?.decorations) {
      this._highlightTimeout = setTimeout(() => {
        const term = this._cachedSearchTerm;
        this._cachedSearchTerm = void 0;
        this.findPrevious(term, { ...this._lastSearchOptions, incremental: true, noScroll: true });
      }, 200);
    }
  }
  clearDecorations(retainCachedSearchTerm) {
    this._selectedDecoration.clear();
    (0, import_lifecycle.dispose)(this._highlightDecorations);
    this._highlightDecorations = [];
    this._highlightedLines.clear();
    if (!retainCachedSearchTerm) {
      this._cachedSearchTerm = void 0;
    }
  }
  clearActiveDecoration() {
    this._selectedDecoration.clear();
  }
  /**
   * Find the next instance of the term, then scroll to and select it. If it
   * doesn't exist, do nothing.
   * @param term The search term.
   * @param searchOptions Search options.
   * @returns Whether a result was found.
   */
  findNext(term, searchOptions) {
    if (!this._terminal) {
      throw new Error("Cannot use addon until it has been loaded");
    }
    const didOptionsChanged = this._lastSearchOptions ? this._didOptionsChange(this._lastSearchOptions, searchOptions) : true;
    this._lastSearchOptions = searchOptions;
    if (searchOptions?.decorations) {
      if (this._cachedSearchTerm === void 0 || term !== this._cachedSearchTerm || didOptionsChanged) {
        this._highlightAllMatches(term, searchOptions);
      }
    }
    const found = this._findNextAndSelect(term, searchOptions);
    this._fireResults(searchOptions);
    this._cachedSearchTerm = term;
    return found;
  }
  _highlightAllMatches(term, searchOptions) {
    if (!this._terminal) {
      throw new Error("Cannot use addon until it has been loaded");
    }
    if (!term || term.length === 0) {
      this.clearDecorations();
      return;
    }
    searchOptions = searchOptions || {};
    this.clearDecorations(true);
    const searchResultsWithHighlight = [];
    let prevResult = void 0;
    let result = this._find(term, 0, 0, searchOptions);
    while (result && (prevResult?.row !== result.row || prevResult?.col !== result.col)) {
      if (searchResultsWithHighlight.length >= this._highlightLimit) {
        break;
      }
      prevResult = result;
      searchResultsWithHighlight.push(prevResult);
      result = this._find(
        term,
        prevResult.col + prevResult.term.length >= this._terminal.cols ? prevResult.row + 1 : prevResult.row,
        prevResult.col + prevResult.term.length >= this._terminal.cols ? 0 : prevResult.col + 1,
        searchOptions
      );
    }
    for (const match of searchResultsWithHighlight) {
      const decoration = this._createResultDecoration(match, searchOptions.decorations);
      if (decoration) {
        this._highlightedLines.add(decoration.marker.line);
        this._highlightDecorations.push({ decoration, match, dispose() {
          decoration.dispose();
        } });
      }
    }
  }
  _find(term, startRow, startCol, searchOptions) {
    if (!this._terminal || !term || term.length === 0) {
      this._terminal?.clearSelection();
      this.clearDecorations();
      return void 0;
    }
    if (startCol > this._terminal.cols) {
      throw new Error(`Invalid col: ${startCol} to search in terminal of ${this._terminal.cols} cols`);
    }
    let result = void 0;
    this._initLinesCache();
    const searchPosition = {
      startRow,
      startCol
    };
    result = this._findInLine(term, searchPosition, searchOptions);
    if (!result) {
      for (let y = startRow + 1; y < this._terminal.buffer.active.baseY + this._terminal.rows; y++) {
        searchPosition.startRow = y;
        searchPosition.startCol = 0;
        result = this._findInLine(term, searchPosition, searchOptions);
        if (result) {
          break;
        }
      }
    }
    return result;
  }
  _findNextAndSelect(term, searchOptions) {
    if (!this._terminal || !term || term.length === 0) {
      this._terminal?.clearSelection();
      this.clearDecorations();
      return false;
    }
    const prevSelectedPos = this._terminal.getSelectionPosition();
    this._terminal.clearSelection();
    let startCol = 0;
    let startRow = 0;
    if (prevSelectedPos) {
      if (this._cachedSearchTerm === term) {
        startCol = prevSelectedPos.end.x;
        startRow = prevSelectedPos.end.y;
      } else {
        startCol = prevSelectedPos.start.x;
        startRow = prevSelectedPos.start.y;
      }
    }
    this._initLinesCache();
    const searchPosition = {
      startRow,
      startCol
    };
    let result = this._findInLine(term, searchPosition, searchOptions);
    if (!result) {
      for (let y = startRow + 1; y < this._terminal.buffer.active.baseY + this._terminal.rows; y++) {
        searchPosition.startRow = y;
        searchPosition.startCol = 0;
        result = this._findInLine(term, searchPosition, searchOptions);
        if (result) {
          break;
        }
      }
    }
    if (!result && startRow !== 0) {
      for (let y = 0; y < startRow; y++) {
        searchPosition.startRow = y;
        searchPosition.startCol = 0;
        result = this._findInLine(term, searchPosition, searchOptions);
        if (result) {
          break;
        }
      }
    }
    if (!result && prevSelectedPos) {
      searchPosition.startRow = prevSelectedPos.start.y;
      searchPosition.startCol = 0;
      result = this._findInLine(term, searchPosition, searchOptions);
    }
    return this._selectResult(result, searchOptions?.decorations, searchOptions?.noScroll);
  }
  /**
   * Find the previous instance of the term, then scroll to and select it. If it
   * doesn't exist, do nothing.
   * @param term The search term.
   * @param searchOptions Search options.
   * @returns Whether a result was found.
   */
  findPrevious(term, searchOptions) {
    if (!this._terminal) {
      throw new Error("Cannot use addon until it has been loaded");
    }
    const didOptionsChanged = this._lastSearchOptions ? this._didOptionsChange(this._lastSearchOptions, searchOptions) : true;
    this._lastSearchOptions = searchOptions;
    if (searchOptions?.decorations) {
      if (this._cachedSearchTerm === void 0 || term !== this._cachedSearchTerm || didOptionsChanged) {
        this._highlightAllMatches(term, searchOptions);
      }
    }
    const found = this._findPreviousAndSelect(term, searchOptions);
    this._fireResults(searchOptions);
    this._cachedSearchTerm = term;
    return found;
  }
  _didOptionsChange(lastSearchOptions, searchOptions) {
    if (!searchOptions) {
      return false;
    }
    if (lastSearchOptions.caseSensitive !== searchOptions.caseSensitive) {
      return true;
    }
    if (lastSearchOptions.regex !== searchOptions.regex) {
      return true;
    }
    if (lastSearchOptions.wholeWord !== searchOptions.wholeWord) {
      return true;
    }
    return false;
  }
  _fireResults(searchOptions) {
    if (searchOptions?.decorations) {
      let resultIndex = -1;
      if (this._selectedDecoration.value) {
        const selectedMatch = this._selectedDecoration.value.match;
        for (let i = 0; i < this._highlightDecorations.length; i++) {
          const match = this._highlightDecorations[i].match;
          if (match.row === selectedMatch.row && match.col === selectedMatch.col && match.size === selectedMatch.size) {
            resultIndex = i;
            break;
          }
        }
      }
      this._onDidChangeResults.fire({ resultIndex, resultCount: this._highlightDecorations.length });
    }
  }
  _findPreviousAndSelect(term, searchOptions) {
    if (!this._terminal) {
      throw new Error("Cannot use addon until it has been loaded");
    }
    if (!this._terminal || !term || term.length === 0) {
      this._terminal?.clearSelection();
      this.clearDecorations();
      return false;
    }
    const prevSelectedPos = this._terminal.getSelectionPosition();
    this._terminal.clearSelection();
    let startRow = this._terminal.buffer.active.baseY + this._terminal.rows - 1;
    let startCol = this._terminal.cols;
    const isReverseSearch = true;
    this._initLinesCache();
    const searchPosition = {
      startRow,
      startCol
    };
    let result;
    if (prevSelectedPos) {
      searchPosition.startRow = startRow = prevSelectedPos.start.y;
      searchPosition.startCol = startCol = prevSelectedPos.start.x;
      if (this._cachedSearchTerm !== term) {
        result = this._findInLine(term, searchPosition, searchOptions, false);
        if (!result) {
          searchPosition.startRow = startRow = prevSelectedPos.end.y;
          searchPosition.startCol = startCol = prevSelectedPos.end.x;
        }
      }
    }
    if (!result) {
      result = this._findInLine(term, searchPosition, searchOptions, isReverseSearch);
    }
    if (!result) {
      searchPosition.startCol = Math.max(searchPosition.startCol, this._terminal.cols);
      for (let y = startRow - 1; y >= 0; y--) {
        searchPosition.startRow = y;
        result = this._findInLine(term, searchPosition, searchOptions, isReverseSearch);
        if (result) {
          break;
        }
      }
    }
    if (!result && startRow !== this._terminal.buffer.active.baseY + this._terminal.rows - 1) {
      for (let y = this._terminal.buffer.active.baseY + this._terminal.rows - 1; y >= startRow; y--) {
        searchPosition.startRow = y;
        result = this._findInLine(term, searchPosition, searchOptions, isReverseSearch);
        if (result) {
          break;
        }
      }
    }
    return this._selectResult(result, searchOptions?.decorations, searchOptions?.noScroll);
  }
  /**
   * Sets up a line cache with a ttl
   */
  _initLinesCache() {
    const terminal = this._terminal;
    if (!this._linesCache) {
      this._linesCache = new Array(terminal.buffer.active.length);
      this._linesCacheDisposables.value = (0, import_lifecycle.combinedDisposable)(
        terminal.onLineFeed(() => this._destroyLinesCache()),
        terminal.onCursorMove(() => this._destroyLinesCache()),
        terminal.onResize(() => this._destroyLinesCache())
      );
    }
    window.clearTimeout(this._linesCacheTimeoutId);
    this._linesCacheTimeoutId = window.setTimeout(() => this._destroyLinesCache(), LINES_CACHE_TIME_TO_LIVE);
  }
  _destroyLinesCache() {
    this._linesCache = void 0;
    this._linesCacheDisposables.clear();
    if (this._linesCacheTimeoutId) {
      window.clearTimeout(this._linesCacheTimeoutId);
      this._linesCacheTimeoutId = 0;
    }
  }
  /**
   * A found substring is a whole word if it doesn't have an alphanumeric character directly
   * adjacent to it.
   * @param searchIndex starting indext of the potential whole word substring
   * @param line entire string in which the potential whole word was found
   * @param term the substring that starts at searchIndex
   */
  _isWholeWord(searchIndex, line, term) {
    return (searchIndex === 0 || NON_WORD_CHARACTERS.includes(line[searchIndex - 1])) && (searchIndex + term.length === line.length || NON_WORD_CHARACTERS.includes(line[searchIndex + term.length]));
  }
  /**
   * Searches a line for a search term. Takes the provided terminal line and searches the text line,
   * which may contain subsequent terminal lines if the text is wrapped. If the provided line number
   * is part of a wrapped text line that started on an earlier line then it is skipped since it will
   * be properly searched when the terminal line that the text starts on is searched.
   * @param term The search term.
   * @param searchPosition The position to start the search.
   * @param searchOptions Search options.
   * @param isReverseSearch Whether the search should start from the right side of the terminal and
   * search to the left.
   * @returns The search result if it was found.
   */
  _findInLine(term, searchPosition, searchOptions = {}, isReverseSearch = false) {
    const terminal = this._terminal;
    const row = searchPosition.startRow;
    const col = searchPosition.startCol;
    const firstLine = terminal.buffer.active.getLine(row);
    if (firstLine?.isWrapped) {
      if (isReverseSearch) {
        searchPosition.startCol += terminal.cols;
        return;
      }
      searchPosition.startRow--;
      searchPosition.startCol += terminal.cols;
      return this._findInLine(term, searchPosition, searchOptions);
    }
    let cache = this._linesCache?.[row];
    if (!cache) {
      cache = this._translateBufferLineToStringWithWrap(row, true);
      if (this._linesCache) {
        this._linesCache[row] = cache;
      }
    }
    const [stringLine, offsets] = cache;
    const offset = this._bufferColsToStringOffset(row, col);
    const searchTerm = searchOptions.caseSensitive ? term : term.toLowerCase();
    const searchStringLine = searchOptions.caseSensitive ? stringLine : stringLine.toLowerCase();
    let resultIndex = -1;
    if (searchOptions.regex) {
      const searchRegex = RegExp(searchTerm, "g");
      let foundTerm;
      if (isReverseSearch) {
        while (foundTerm = searchRegex.exec(searchStringLine.slice(0, offset))) {
          resultIndex = searchRegex.lastIndex - foundTerm[0].length;
          term = foundTerm[0];
          searchRegex.lastIndex -= term.length - 1;
        }
      } else {
        foundTerm = searchRegex.exec(searchStringLine.slice(offset));
        if (foundTerm && foundTerm[0].length > 0) {
          resultIndex = offset + (searchRegex.lastIndex - foundTerm[0].length);
          term = foundTerm[0];
        }
      }
    } else {
      if (isReverseSearch) {
        if (offset - searchTerm.length >= 0) {
          resultIndex = searchStringLine.lastIndexOf(searchTerm, offset - searchTerm.length);
        }
      } else {
        resultIndex = searchStringLine.indexOf(searchTerm, offset);
      }
    }
    if (resultIndex >= 0) {
      if (searchOptions.wholeWord && !this._isWholeWord(resultIndex, searchStringLine, term)) {
        return;
      }
      let startRowOffset = 0;
      while (startRowOffset < offsets.length - 1 && resultIndex >= offsets[startRowOffset + 1]) {
        startRowOffset++;
      }
      let endRowOffset = startRowOffset;
      while (endRowOffset < offsets.length - 1 && resultIndex + term.length >= offsets[endRowOffset + 1]) {
        endRowOffset++;
      }
      const startColOffset = resultIndex - offsets[startRowOffset];
      const endColOffset = resultIndex + term.length - offsets[endRowOffset];
      const startColIndex = this._stringLengthToBufferSize(row + startRowOffset, startColOffset);
      const endColIndex = this._stringLengthToBufferSize(row + endRowOffset, endColOffset);
      const size = endColIndex - startColIndex + terminal.cols * (endRowOffset - startRowOffset);
      return {
        term,
        col: startColIndex,
        row: row + startRowOffset,
        size
      };
    }
  }
  _stringLengthToBufferSize(row, offset) {
    const line = this._terminal.buffer.active.getLine(row);
    if (!line) {
      return 0;
    }
    for (let i = 0; i < offset; i++) {
      const cell = line.getCell(i);
      if (!cell) {
        break;
      }
      const char = cell.getChars();
      if (char.length > 1) {
        offset -= char.length - 1;
      }
      const nextCell = line.getCell(i + 1);
      if (nextCell && nextCell.getWidth() === 0) {
        offset++;
      }
    }
    return offset;
  }
  _bufferColsToStringOffset(startRow, cols) {
    const terminal = this._terminal;
    let lineIndex = startRow;
    let offset = 0;
    let line = terminal.buffer.active.getLine(lineIndex);
    while (cols > 0 && line) {
      for (let i = 0; i < cols && i < terminal.cols; i++) {
        const cell = line.getCell(i);
        if (!cell) {
          break;
        }
        if (cell.getWidth()) {
          offset += cell.getCode() === 0 ? 1 : cell.getChars().length;
        }
      }
      lineIndex++;
      line = terminal.buffer.active.getLine(lineIndex);
      if (line && !line.isWrapped) {
        break;
      }
      cols -= terminal.cols;
    }
    return offset;
  }
  /**
   * Translates a buffer line to a string, including subsequent lines if they are wraps.
   * Wide characters will count as two columns in the resulting string. This
   * function is useful for getting the actual text underneath the raw selection
   * position.
   * @param lineIndex The index of the line being translated.
   * @param trimRight Whether to trim whitespace to the right.
   */
  _translateBufferLineToStringWithWrap(lineIndex, trimRight) {
    const terminal = this._terminal;
    const strings = [];
    const lineOffsets = [0];
    let line = terminal.buffer.active.getLine(lineIndex);
    while (line) {
      const nextLine = terminal.buffer.active.getLine(lineIndex + 1);
      const lineWrapsToNext = nextLine ? nextLine.isWrapped : false;
      let string = line.translateToString(!lineWrapsToNext && trimRight);
      if (lineWrapsToNext && nextLine) {
        const lastCell = line.getCell(line.length - 1);
        const lastCellIsNull = lastCell && lastCell.getCode() === 0 && lastCell.getWidth() === 1;
        if (lastCellIsNull && nextLine.getCell(0)?.getWidth() === 2) {
          string = string.slice(0, -1);
        }
      }
      strings.push(string);
      if (lineWrapsToNext) {
        lineOffsets.push(lineOffsets[lineOffsets.length - 1] + string.length);
      } else {
        break;
      }
      lineIndex++;
      line = nextLine;
    }
    return [strings.join(""), lineOffsets];
  }
  /**
   * Selects and scrolls to a result.
   * @param result The result to select.
   * @returns Whether a result was selected.
   */
  _selectResult(result, options, noScroll) {
    const terminal = this._terminal;
    this._selectedDecoration.clear();
    if (!result) {
      terminal.clearSelection();
      return false;
    }
    terminal.select(result.col, result.row, result.size);
    if (options) {
      const marker = terminal.registerMarker(-terminal.buffer.active.baseY - terminal.buffer.active.cursorY + result.row);
      if (marker) {
        const decoration = terminal.registerDecoration({
          marker,
          x: result.col,
          width: result.size,
          backgroundColor: options.activeMatchBackground,
          layer: "top",
          overviewRulerOptions: {
            color: options.activeMatchColorOverviewRuler
          }
        });
        if (decoration) {
          const disposables = [];
          disposables.push(marker);
          disposables.push(decoration.onRender((e) => this._applyStyles(e, options.activeMatchBorder, true)));
          disposables.push(decoration.onDispose(() => (0, import_lifecycle.dispose)(disposables)));
          this._selectedDecoration.value = { decoration, match: result, dispose() {
            decoration.dispose();
          } };
        }
      }
    }
    if (!noScroll) {
      if (result.row >= terminal.buffer.active.viewportY + terminal.rows || result.row < terminal.buffer.active.viewportY) {
        let scroll = result.row - terminal.buffer.active.viewportY;
        scroll -= Math.floor(terminal.rows / 2);
        terminal.scrollLines(scroll);
      }
    }
    return true;
  }
  /**
   * Applies styles to the decoration when it is rendered.
   * @param element The decoration's element.
   * @param borderColor The border color to apply.
   * @param isActiveResult Whether the element is part of the active search result.
   * @returns
   */
  _applyStyles(element, borderColor, isActiveResult) {
    if (!element.classList.contains("xterm-find-result-decoration")) {
      element.classList.add("xterm-find-result-decoration");
      if (borderColor) {
        element.style.outline = `1px solid ${borderColor}`;
      }
    }
    if (isActiveResult) {
      element.classList.add("xterm-find-active-result-decoration");
    }
  }
  /**
   * Creates a decoration for the result and applies styles
   * @param result the search result for which to create the decoration
   * @param options the options for the decoration
   * @returns the {@link IDecoration} or undefined if the marker has already been disposed of
   */
  _createResultDecoration(result, options) {
    const terminal = this._terminal;
    const marker = terminal.registerMarker(-terminal.buffer.active.baseY - terminal.buffer.active.cursorY + result.row);
    if (!marker) {
      return void 0;
    }
    const findResultDecoration = terminal.registerDecoration({
      marker,
      x: result.col,
      width: result.size,
      backgroundColor: options.matchBackground,
      overviewRulerOptions: this._highlightedLines.has(marker.line) ? void 0 : {
        color: options.matchOverviewRuler,
        position: "center"
      }
    });
    if (findResultDecoration) {
      const disposables = [];
      disposables.push(marker);
      disposables.push(findResultDecoration.onRender((e) => this._applyStyles(e, options.matchBorder, false)));
      disposables.push(findResultDecoration.onDispose(() => (0, import_lifecycle.dispose)(disposables)));
    }
    return findResultDecoration;
  }
}
//# sourceMappingURL=SearchAddon.js.map
