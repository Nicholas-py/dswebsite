"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
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
var SelectionService_exports = {};
__export(SelectionService_exports, {
  SelectionMode: () => SelectionMode,
  SelectionService: () => SelectionService
});
module.exports = __toCommonJS(SelectionService_exports);
var import_Mouse = require("browser/input/Mouse");
var import_MoveToCell = require("browser/input/MoveToCell");
var import_SelectionModel = require("browser/selection/SelectionModel");
var import_Services = require("browser/services/Services");
var import_lifecycle = require("vs/base/common/lifecycle");
var Browser = __toESM(require("common/Platform"));
var import_BufferRange = require("common/buffer/BufferRange");
var import_CellData = require("common/buffer/CellData");
var import_Services2 = require("common/services/Services");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const DRAG_SCROLL_MAX_THRESHOLD = 50;
const DRAG_SCROLL_MAX_SPEED = 15;
const DRAG_SCROLL_INTERVAL = 50;
const ALT_CLICK_MOVE_CURSOR_TIME = 500;
const NON_BREAKING_SPACE_CHAR = String.fromCharCode(160);
const ALL_NON_BREAKING_SPACE_REGEX = new RegExp(NON_BREAKING_SPACE_CHAR, "g");
var SelectionMode = /* @__PURE__ */ ((SelectionMode2) => {
  SelectionMode2[SelectionMode2["NORMAL"] = 0] = "NORMAL";
  SelectionMode2[SelectionMode2["WORD"] = 1] = "WORD";
  SelectionMode2[SelectionMode2["LINE"] = 2] = "LINE";
  SelectionMode2[SelectionMode2["COLUMN"] = 3] = "COLUMN";
  return SelectionMode2;
})(SelectionMode || {});
let SelectionService = class extends import_lifecycle.Disposable {
  constructor(_element, _screenElement, _linkifier, _bufferService, _coreService, _mouseService, _optionsService, _renderService, _coreBrowserService) {
    super();
    this._element = _element;
    this._screenElement = _screenElement;
    this._linkifier = _linkifier;
    this._bufferService = _bufferService;
    this._coreService = _coreService;
    this._mouseService = _mouseService;
    this._optionsService = _optionsService;
    this._renderService = _renderService;
    this._coreBrowserService = _coreBrowserService;
    /**
     * The amount to scroll every drag scroll update (depends on how far the mouse
     * drag is above or below the terminal).
     */
    this._dragScrollAmount = 0;
    /**
     * Whether selection is enabled.
     */
    this._enabled = true;
    this._workCell = new import_CellData.CellData();
    this._mouseDownTimeStamp = 0;
    this._oldHasSelection = false;
    this._oldSelectionStart = void 0;
    this._oldSelectionEnd = void 0;
    this._onLinuxMouseSelection = this._register(new import_event.Emitter());
    this.onLinuxMouseSelection = this._onLinuxMouseSelection.event;
    this._onRedrawRequest = this._register(new import_event.Emitter());
    this.onRequestRedraw = this._onRedrawRequest.event;
    this._onSelectionChange = this._register(new import_event.Emitter());
    this.onSelectionChange = this._onSelectionChange.event;
    this._onRequestScrollLines = this._register(new import_event.Emitter());
    this.onRequestScrollLines = this._onRequestScrollLines.event;
    this._mouseMoveListener = (event) => this._handleMouseMove(event);
    this._mouseUpListener = (event) => this._handleMouseUp(event);
    this._coreService.onUserInput(() => {
      if (this.hasSelection) {
        this.clearSelection();
      }
    });
    this._trimListener = this._bufferService.buffer.lines.onTrim((amount) => this._handleTrim(amount));
    this._register(this._bufferService.buffers.onBufferActivate((e) => this._handleBufferActivate(e)));
    this.enable();
    this._model = new import_SelectionModel.SelectionModel(this._bufferService);
    this._activeSelectionMode = 0 /* NORMAL */;
    this._register((0, import_lifecycle.toDisposable)(() => {
      this._removeMouseDownListeners();
    }));
  }
  reset() {
    this.clearSelection();
  }
  /**
   * Disables the selection manager. This is useful for when terminal mouse
   * are enabled.
   */
  disable() {
    this.clearSelection();
    this._enabled = false;
  }
  /**
   * Enable the selection manager.
   */
  enable() {
    this._enabled = true;
  }
  get selectionStart() {
    return this._model.finalSelectionStart;
  }
  get selectionEnd() {
    return this._model.finalSelectionEnd;
  }
  /**
   * Gets whether there is an active text selection.
   */
  get hasSelection() {
    const start = this._model.finalSelectionStart;
    const end = this._model.finalSelectionEnd;
    if (!start || !end) {
      return false;
    }
    return start[0] !== end[0] || start[1] !== end[1];
  }
  /**
   * Gets the text currently selected.
   */
  get selectionText() {
    const start = this._model.finalSelectionStart;
    const end = this._model.finalSelectionEnd;
    if (!start || !end) {
      return "";
    }
    const buffer = this._bufferService.buffer;
    const result = [];
    if (this._activeSelectionMode === 3 /* COLUMN */) {
      if (start[0] === end[0]) {
        return "";
      }
      const startCol = start[0] < end[0] ? start[0] : end[0];
      const endCol = start[0] < end[0] ? end[0] : start[0];
      for (let i = start[1]; i <= end[1]; i++) {
        const lineText = buffer.translateBufferLineToString(i, true, startCol, endCol);
        result.push(lineText);
      }
    } else {
      const startRowEndCol = start[1] === end[1] ? end[0] : void 0;
      result.push(buffer.translateBufferLineToString(start[1], true, start[0], startRowEndCol));
      for (let i = start[1] + 1; i <= end[1] - 1; i++) {
        const bufferLine = buffer.lines.get(i);
        const lineText = buffer.translateBufferLineToString(i, true);
        if (bufferLine?.isWrapped) {
          result[result.length - 1] += lineText;
        } else {
          result.push(lineText);
        }
      }
      if (start[1] !== end[1]) {
        const bufferLine = buffer.lines.get(end[1]);
        const lineText = buffer.translateBufferLineToString(end[1], true, 0, end[0]);
        if (bufferLine && bufferLine.isWrapped) {
          result[result.length - 1] += lineText;
        } else {
          result.push(lineText);
        }
      }
    }
    const formattedResult = result.map((line) => {
      return line.replace(ALL_NON_BREAKING_SPACE_REGEX, " ");
    }).join(Browser.isWindows ? "\r\n" : "\n");
    return formattedResult;
  }
  /**
   * Clears the current terminal selection.
   */
  clearSelection() {
    this._model.clearSelection();
    this._removeMouseDownListeners();
    this.refresh();
    this._onSelectionChange.fire();
  }
  /**
   * Queues a refresh, redrawing the selection on the next opportunity.
   * @param isLinuxMouseSelection Whether the selection should be registered as a new
   * selection on Linux.
   */
  refresh(isLinuxMouseSelection) {
    if (!this._refreshAnimationFrame) {
      this._refreshAnimationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._refresh());
    }
    if (Browser.isLinux && isLinuxMouseSelection) {
      const selectionText = this.selectionText;
      if (selectionText.length) {
        this._onLinuxMouseSelection.fire(this.selectionText);
      }
    }
  }
  /**
   * Fires the refresh event, causing consumers to pick it up and redraw the
   * selection state.
   */
  _refresh() {
    this._refreshAnimationFrame = void 0;
    this._onRedrawRequest.fire({
      start: this._model.finalSelectionStart,
      end: this._model.finalSelectionEnd,
      columnSelectMode: this._activeSelectionMode === 3 /* COLUMN */
    });
  }
  /**
   * Checks if the current click was inside the current selection
   * @param event The mouse event
   */
  _isClickInSelection(event) {
    const coords = this._getMouseBufferCoords(event);
    const start = this._model.finalSelectionStart;
    const end = this._model.finalSelectionEnd;
    if (!start || !end || !coords) {
      return false;
    }
    return this._areCoordsInSelection(coords, start, end);
  }
  isCellInSelection(x, y) {
    const start = this._model.finalSelectionStart;
    const end = this._model.finalSelectionEnd;
    if (!start || !end) {
      return false;
    }
    return this._areCoordsInSelection([x, y], start, end);
  }
  _areCoordsInSelection(coords, start, end) {
    return coords[1] > start[1] && coords[1] < end[1] || start[1] === end[1] && coords[1] === start[1] && coords[0] >= start[0] && coords[0] < end[0] || start[1] < end[1] && coords[1] === end[1] && coords[0] < end[0] || start[1] < end[1] && coords[1] === start[1] && coords[0] >= start[0];
  }
  /**
   * Selects word at the current mouse event coordinates.
   * @param event The mouse event.
   */
  _selectWordAtCursor(event, allowWhitespaceOnlySelection) {
    const range = this._linkifier.currentLink?.link?.range;
    if (range) {
      this._model.selectionStart = [range.start.x - 1, range.start.y - 1];
      this._model.selectionStartLength = (0, import_BufferRange.getRangeLength)(range, this._bufferService.cols);
      this._model.selectionEnd = void 0;
      return true;
    }
    const coords = this._getMouseBufferCoords(event);
    if (coords) {
      this._selectWordAt(coords, allowWhitespaceOnlySelection);
      this._model.selectionEnd = void 0;
      return true;
    }
    return false;
  }
  /**
   * Selects all text within the terminal.
   */
  selectAll() {
    this._model.isSelectAllActive = true;
    this.refresh();
    this._onSelectionChange.fire();
  }
  selectLines(start, end) {
    this._model.clearSelection();
    start = Math.max(start, 0);
    end = Math.min(end, this._bufferService.buffer.lines.length - 1);
    this._model.selectionStart = [0, start];
    this._model.selectionEnd = [this._bufferService.cols, end];
    this.refresh();
    this._onSelectionChange.fire();
  }
  /**
   * Handle the buffer being trimmed, adjust the selection position.
   * @param amount The amount the buffer is being trimmed.
   */
  _handleTrim(amount) {
    const needsRefresh = this._model.handleTrim(amount);
    if (needsRefresh) {
      this.refresh();
    }
  }
  /**
   * Gets the 0-based [x, y] buffer coordinates of the current mouse event.
   * @param event The mouse event.
   */
  _getMouseBufferCoords(event) {
    const coords = this._mouseService.getCoords(event, this._screenElement, this._bufferService.cols, this._bufferService.rows, true);
    if (!coords) {
      return void 0;
    }
    coords[0]--;
    coords[1]--;
    coords[1] += this._bufferService.buffer.ydisp;
    return coords;
  }
  /**
   * Gets the amount the viewport should be scrolled based on how far out of the
   * terminal the mouse is.
   * @param event The mouse event.
   */
  _getMouseEventScrollAmount(event) {
    let offset = (0, import_Mouse.getCoordsRelativeToElement)(this._coreBrowserService.window, event, this._screenElement)[1];
    const terminalHeight = this._renderService.dimensions.css.canvas.height;
    if (offset >= 0 && offset <= terminalHeight) {
      return 0;
    }
    if (offset > terminalHeight) {
      offset -= terminalHeight;
    }
    offset = Math.min(Math.max(offset, -DRAG_SCROLL_MAX_THRESHOLD), DRAG_SCROLL_MAX_THRESHOLD);
    offset /= DRAG_SCROLL_MAX_THRESHOLD;
    return offset / Math.abs(offset) + Math.round(offset * (DRAG_SCROLL_MAX_SPEED - 1));
  }
  /**
   * Returns whether the selection manager should force selection, regardless of
   * whether the terminal is in mouse events mode.
   * @param event The mouse event.
   */
  shouldForceSelection(event) {
    if (Browser.isMac) {
      return event.altKey && this._optionsService.rawOptions.macOptionClickForcesSelection;
    }
    return event.shiftKey;
  }
  /**
   * Handles te mousedown event, setting up for a new selection.
   * @param event The mousedown event.
   */
  handleMouseDown(event) {
    this._mouseDownTimeStamp = event.timeStamp;
    if (event.button === 2 && this.hasSelection) {
      return;
    }
    if (event.button !== 0) {
      return;
    }
    if (!this._enabled) {
      if (!this.shouldForceSelection(event)) {
        return;
      }
      event.stopPropagation();
    }
    event.preventDefault();
    this._dragScrollAmount = 0;
    if (this._enabled && event.shiftKey) {
      this._handleIncrementalClick(event);
    } else {
      if (event.detail === 1) {
        this._handleSingleClick(event);
      } else if (event.detail === 2) {
        this._handleDoubleClick(event);
      } else if (event.detail === 3) {
        this._handleTripleClick(event);
      }
    }
    this._addMouseDownListeners();
    this.refresh(true);
  }
  /**
   * Adds listeners when mousedown is triggered.
   */
  _addMouseDownListeners() {
    if (this._screenElement.ownerDocument) {
      this._screenElement.ownerDocument.addEventListener("mousemove", this._mouseMoveListener);
      this._screenElement.ownerDocument.addEventListener("mouseup", this._mouseUpListener);
    }
    this._dragScrollIntervalTimer = this._coreBrowserService.window.setInterval(() => this._dragScroll(), DRAG_SCROLL_INTERVAL);
  }
  /**
   * Removes the listeners that are registered when mousedown is triggered.
   */
  _removeMouseDownListeners() {
    if (this._screenElement.ownerDocument) {
      this._screenElement.ownerDocument.removeEventListener("mousemove", this._mouseMoveListener);
      this._screenElement.ownerDocument.removeEventListener("mouseup", this._mouseUpListener);
    }
    this._coreBrowserService.window.clearInterval(this._dragScrollIntervalTimer);
    this._dragScrollIntervalTimer = void 0;
  }
  /**
   * Performs an incremental click, setting the selection end position to the mouse
   * position.
   * @param event The mouse event.
   */
  _handleIncrementalClick(event) {
    if (this._model.selectionStart) {
      this._model.selectionEnd = this._getMouseBufferCoords(event);
    }
  }
  /**
   * Performs a single click, resetting relevant state and setting the selection
   * start position.
   * @param event The mouse event.
   */
  _handleSingleClick(event) {
    this._model.selectionStartLength = 0;
    this._model.isSelectAllActive = false;
    this._activeSelectionMode = this.shouldColumnSelect(event) ? 3 /* COLUMN */ : 0 /* NORMAL */;
    this._model.selectionStart = this._getMouseBufferCoords(event);
    if (!this._model.selectionStart) {
      return;
    }
    this._model.selectionEnd = void 0;
    const line = this._bufferService.buffer.lines.get(this._model.selectionStart[1]);
    if (!line) {
      return;
    }
    if (line.length === this._model.selectionStart[0]) {
      return;
    }
    if (line.hasWidth(this._model.selectionStart[0]) === 0) {
      this._model.selectionStart[0]++;
    }
  }
  /**
   * Performs a double click, selecting the current word.
   * @param event The mouse event.
   */
  _handleDoubleClick(event) {
    if (this._selectWordAtCursor(event, true)) {
      this._activeSelectionMode = 1 /* WORD */;
    }
  }
  /**
   * Performs a triple click, selecting the current line and activating line
   * select mode.
   * @param event The mouse event.
   */
  _handleTripleClick(event) {
    const coords = this._getMouseBufferCoords(event);
    if (coords) {
      this._activeSelectionMode = 2 /* LINE */;
      this._selectLineAt(coords[1]);
    }
  }
  /**
   * Returns whether the selection manager should operate in column select mode
   * @param event the mouse or keyboard event
   */
  shouldColumnSelect(event) {
    return event.altKey && !(Browser.isMac && this._optionsService.rawOptions.macOptionClickForcesSelection);
  }
  /**
   * Handles the mousemove event when the mouse button is down, recording the
   * end of the selection and refreshing the selection.
   * @param event The mousemove event.
   */
  _handleMouseMove(event) {
    event.stopImmediatePropagation();
    if (!this._model.selectionStart) {
      return;
    }
    const previousSelectionEnd = this._model.selectionEnd ? [this._model.selectionEnd[0], this._model.selectionEnd[1]] : null;
    this._model.selectionEnd = this._getMouseBufferCoords(event);
    if (!this._model.selectionEnd) {
      this.refresh(true);
      return;
    }
    if (this._activeSelectionMode === 2 /* LINE */) {
      if (this._model.selectionEnd[1] < this._model.selectionStart[1]) {
        this._model.selectionEnd[0] = 0;
      } else {
        this._model.selectionEnd[0] = this._bufferService.cols;
      }
    } else if (this._activeSelectionMode === 1 /* WORD */) {
      this._selectToWordAt(this._model.selectionEnd);
    }
    this._dragScrollAmount = this._getMouseEventScrollAmount(event);
    if (this._activeSelectionMode !== 3 /* COLUMN */) {
      if (this._dragScrollAmount > 0) {
        this._model.selectionEnd[0] = this._bufferService.cols;
      } else if (this._dragScrollAmount < 0) {
        this._model.selectionEnd[0] = 0;
      }
    }
    const buffer = this._bufferService.buffer;
    if (this._model.selectionEnd[1] < buffer.lines.length) {
      const line = buffer.lines.get(this._model.selectionEnd[1]);
      if (line && line.hasWidth(this._model.selectionEnd[0]) === 0) {
        if (this._model.selectionEnd[0] < this._bufferService.cols) {
          this._model.selectionEnd[0]++;
        }
      }
    }
    if (!previousSelectionEnd || previousSelectionEnd[0] !== this._model.selectionEnd[0] || previousSelectionEnd[1] !== this._model.selectionEnd[1]) {
      this.refresh(true);
    }
  }
  /**
   * The callback that occurs every DRAG_SCROLL_INTERVAL ms that does the
   * scrolling of the viewport.
   */
  _dragScroll() {
    if (!this._model.selectionEnd || !this._model.selectionStart) {
      return;
    }
    if (this._dragScrollAmount) {
      this._onRequestScrollLines.fire({ amount: this._dragScrollAmount, suppressScrollEvent: false });
      const buffer = this._bufferService.buffer;
      if (this._dragScrollAmount > 0) {
        if (this._activeSelectionMode !== 3 /* COLUMN */) {
          this._model.selectionEnd[0] = this._bufferService.cols;
        }
        this._model.selectionEnd[1] = Math.min(buffer.ydisp + this._bufferService.rows, buffer.lines.length - 1);
      } else {
        if (this._activeSelectionMode !== 3 /* COLUMN */) {
          this._model.selectionEnd[0] = 0;
        }
        this._model.selectionEnd[1] = buffer.ydisp;
      }
      this.refresh();
    }
  }
  /**
   * Handles the mouseup event, removing the mousedown listeners.
   * @param event The mouseup event.
   */
  _handleMouseUp(event) {
    const timeElapsed = event.timeStamp - this._mouseDownTimeStamp;
    this._removeMouseDownListeners();
    if (this.selectionText.length <= 1 && timeElapsed < ALT_CLICK_MOVE_CURSOR_TIME && event.altKey && this._optionsService.rawOptions.altClickMovesCursor) {
      if (this._bufferService.buffer.ybase === this._bufferService.buffer.ydisp) {
        const coordinates = this._mouseService.getCoords(
          event,
          this._element,
          this._bufferService.cols,
          this._bufferService.rows,
          false
        );
        if (coordinates && coordinates[0] !== void 0 && coordinates[1] !== void 0) {
          const sequence = (0, import_MoveToCell.moveToCellSequence)(coordinates[0] - 1, coordinates[1] - 1, this._bufferService, this._coreService.decPrivateModes.applicationCursorKeys);
          this._coreService.triggerDataEvent(sequence, true);
        }
      }
    } else {
      this._fireEventIfSelectionChanged();
    }
  }
  _fireEventIfSelectionChanged() {
    const start = this._model.finalSelectionStart;
    const end = this._model.finalSelectionEnd;
    const hasSelection = !!start && !!end && (start[0] !== end[0] || start[1] !== end[1]);
    if (!hasSelection) {
      if (this._oldHasSelection) {
        this._fireOnSelectionChange(start, end, hasSelection);
      }
      return;
    }
    if (!start || !end) {
      return;
    }
    if (!this._oldSelectionStart || !this._oldSelectionEnd || (start[0] !== this._oldSelectionStart[0] || start[1] !== this._oldSelectionStart[1] || end[0] !== this._oldSelectionEnd[0] || end[1] !== this._oldSelectionEnd[1])) {
      this._fireOnSelectionChange(start, end, hasSelection);
    }
  }
  _fireOnSelectionChange(start, end, hasSelection) {
    this._oldSelectionStart = start;
    this._oldSelectionEnd = end;
    this._oldHasSelection = hasSelection;
    this._onSelectionChange.fire();
  }
  _handleBufferActivate(e) {
    this.clearSelection();
    this._trimListener.dispose();
    this._trimListener = e.activeBuffer.lines.onTrim((amount) => this._handleTrim(amount));
  }
  /**
   * Converts a viewport column (0 to cols - 1) to the character index on the
   * buffer line, the latter takes into account wide and null characters.
   * @param bufferLine The buffer line to use.
   * @param x The x index in the buffer line to convert.
   */
  _convertViewportColToCharacterIndex(bufferLine, x) {
    let charIndex = x;
    for (let i = 0; x >= i; i++) {
      const length = bufferLine.loadCell(i, this._workCell).getChars().length;
      if (this._workCell.getWidth() === 0) {
        charIndex--;
      } else if (length > 1 && x !== i) {
        charIndex += length - 1;
      }
    }
    return charIndex;
  }
  setSelection(col, row, length) {
    this._model.clearSelection();
    this._removeMouseDownListeners();
    this._model.selectionStart = [col, row];
    this._model.selectionStartLength = length;
    this.refresh();
    this._fireEventIfSelectionChanged();
  }
  rightClickSelect(ev) {
    if (!this._isClickInSelection(ev)) {
      if (this._selectWordAtCursor(ev, false)) {
        this.refresh(true);
      }
      this._fireEventIfSelectionChanged();
    }
  }
  /**
   * Gets positional information for the word at the coordinated specified.
   * @param coords The coordinates to get the word at.
   */
  _getWordAt(coords, allowWhitespaceOnlySelection, followWrappedLinesAbove = true, followWrappedLinesBelow = true) {
    if (coords[0] >= this._bufferService.cols) {
      return void 0;
    }
    const buffer = this._bufferService.buffer;
    const bufferLine = buffer.lines.get(coords[1]);
    if (!bufferLine) {
      return void 0;
    }
    const line = buffer.translateBufferLineToString(coords[1], false);
    let startIndex = this._convertViewportColToCharacterIndex(bufferLine, coords[0]);
    let endIndex = startIndex;
    const charOffset = coords[0] - startIndex;
    let leftWideCharCount = 0;
    let rightWideCharCount = 0;
    let leftLongCharOffset = 0;
    let rightLongCharOffset = 0;
    if (line.charAt(startIndex) === " ") {
      while (startIndex > 0 && line.charAt(startIndex - 1) === " ") {
        startIndex--;
      }
      while (endIndex < line.length && line.charAt(endIndex + 1) === " ") {
        endIndex++;
      }
    } else {
      let startCol = coords[0];
      let endCol = coords[0];
      if (bufferLine.getWidth(startCol) === 0) {
        leftWideCharCount++;
        startCol--;
      }
      if (bufferLine.getWidth(endCol) === 2) {
        rightWideCharCount++;
        endCol++;
      }
      const length2 = bufferLine.getString(endCol).length;
      if (length2 > 1) {
        rightLongCharOffset += length2 - 1;
        endIndex += length2 - 1;
      }
      while (startCol > 0 && startIndex > 0 && !this._isCharWordSeparator(bufferLine.loadCell(startCol - 1, this._workCell))) {
        bufferLine.loadCell(startCol - 1, this._workCell);
        const length3 = this._workCell.getChars().length;
        if (this._workCell.getWidth() === 0) {
          leftWideCharCount++;
          startCol--;
        } else if (length3 > 1) {
          leftLongCharOffset += length3 - 1;
          startIndex -= length3 - 1;
        }
        startIndex--;
        startCol--;
      }
      while (endCol < bufferLine.length && endIndex + 1 < line.length && !this._isCharWordSeparator(bufferLine.loadCell(endCol + 1, this._workCell))) {
        bufferLine.loadCell(endCol + 1, this._workCell);
        const length3 = this._workCell.getChars().length;
        if (this._workCell.getWidth() === 2) {
          rightWideCharCount++;
          endCol++;
        } else if (length3 > 1) {
          rightLongCharOffset += length3 - 1;
          endIndex += length3 - 1;
        }
        endIndex++;
        endCol++;
      }
    }
    endIndex++;
    let start = startIndex + charOffset - leftWideCharCount + leftLongCharOffset;
    let length = Math.min(
      this._bufferService.cols,
      // Disallow lengths larger than the terminal cols
      endIndex - startIndex + leftWideCharCount + rightWideCharCount - leftLongCharOffset - rightLongCharOffset
    );
    if (!allowWhitespaceOnlySelection && line.slice(startIndex, endIndex).trim() === "") {
      return void 0;
    }
    if (followWrappedLinesAbove) {
      if (start === 0 && bufferLine.getCodePoint(0) !== 32) {
        const previousBufferLine = buffer.lines.get(coords[1] - 1);
        if (previousBufferLine && bufferLine.isWrapped && previousBufferLine.getCodePoint(this._bufferService.cols - 1) !== 32) {
          const previousLineWordPosition = this._getWordAt([this._bufferService.cols - 1, coords[1] - 1], false, true, false);
          if (previousLineWordPosition) {
            const offset = this._bufferService.cols - previousLineWordPosition.start;
            start -= offset;
            length += offset;
          }
        }
      }
    }
    if (followWrappedLinesBelow) {
      if (start + length === this._bufferService.cols && bufferLine.getCodePoint(this._bufferService.cols - 1) !== 32) {
        const nextBufferLine = buffer.lines.get(coords[1] + 1);
        if (nextBufferLine?.isWrapped && nextBufferLine.getCodePoint(0) !== 32) {
          const nextLineWordPosition = this._getWordAt([0, coords[1] + 1], false, false, true);
          if (nextLineWordPosition) {
            length += nextLineWordPosition.length;
          }
        }
      }
    }
    return { start, length };
  }
  /**
   * Selects the word at the coordinates specified.
   * @param coords The coordinates to get the word at.
   * @param allowWhitespaceOnlySelection If whitespace should be selected
   */
  _selectWordAt(coords, allowWhitespaceOnlySelection) {
    const wordPosition = this._getWordAt(coords, allowWhitespaceOnlySelection);
    if (wordPosition) {
      while (wordPosition.start < 0) {
        wordPosition.start += this._bufferService.cols;
        coords[1]--;
      }
      this._model.selectionStart = [wordPosition.start, coords[1]];
      this._model.selectionStartLength = wordPosition.length;
    }
  }
  /**
   * Sets the selection end to the word at the coordinated specified.
   * @param coords The coordinates to get the word at.
   */
  _selectToWordAt(coords) {
    const wordPosition = this._getWordAt(coords, true);
    if (wordPosition) {
      let endRow = coords[1];
      while (wordPosition.start < 0) {
        wordPosition.start += this._bufferService.cols;
        endRow--;
      }
      if (!this._model.areSelectionValuesReversed()) {
        while (wordPosition.start + wordPosition.length > this._bufferService.cols) {
          wordPosition.length -= this._bufferService.cols;
          endRow++;
        }
      }
      this._model.selectionEnd = [this._model.areSelectionValuesReversed() ? wordPosition.start : wordPosition.start + wordPosition.length, endRow];
    }
  }
  /**
   * Gets whether the character is considered a word separator by the select
   * word logic.
   * @param cell The cell to check.
   */
  _isCharWordSeparator(cell) {
    if (cell.getWidth() === 0) {
      return false;
    }
    return this._optionsService.rawOptions.wordSeparator.indexOf(cell.getChars()) >= 0;
  }
  /**
   * Selects the line specified.
   * @param line The line index.
   */
  _selectLineAt(line) {
    const wrappedRange = this._bufferService.buffer.getWrappedRangeForLine(line);
    const range = {
      start: { x: 0, y: wrappedRange.first },
      end: { x: this._bufferService.cols - 1, y: wrappedRange.last }
    };
    this._model.selectionStart = [0, wrappedRange.first];
    this._model.selectionEnd = void 0;
    this._model.selectionStartLength = (0, import_BufferRange.getRangeLength)(range, this._bufferService.cols);
  }
};
SelectionService = __decorateClass([
  __decorateParam(3, import_Services2.IBufferService),
  __decorateParam(4, import_Services2.ICoreService),
  __decorateParam(5, import_Services.IMouseService),
  __decorateParam(6, import_Services2.IOptionsService),
  __decorateParam(7, import_Services.IRenderService),
  __decorateParam(8, import_Services.ICoreBrowserService)
], SelectionService);
//# sourceMappingURL=SelectionService.js.map
