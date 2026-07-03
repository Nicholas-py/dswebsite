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
var AccessibilityManager_exports = {};
__export(AccessibilityManager_exports, {
  AccessibilityManager: () => AccessibilityManager
});
module.exports = __toCommonJS(AccessibilityManager_exports);
var Strings = __toESM(require("browser/LocalizableStrings"));
var import_TimeBasedDebouncer = require("browser/TimeBasedDebouncer");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_Services = require("browser/services/Services");
var import_Services2 = require("common/services/Services");
var import_dom = require("vs/base/browser/dom");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const MAX_ROWS_TO_READ = 20;
var BoundaryPosition = /* @__PURE__ */ ((BoundaryPosition2) => {
  BoundaryPosition2[BoundaryPosition2["TOP"] = 0] = "TOP";
  BoundaryPosition2[BoundaryPosition2["BOTTOM"] = 1] = "BOTTOM";
  return BoundaryPosition2;
})(BoundaryPosition || {});
const DEBUG = false;
let AccessibilityManager = class extends import_lifecycle.Disposable {
  constructor(_terminal, instantiationService, _coreBrowserService, _renderService) {
    super();
    this._terminal = _terminal;
    this._coreBrowserService = _coreBrowserService;
    this._renderService = _renderService;
    this._rowColumns = /* @__PURE__ */ new WeakMap();
    this._liveRegionLineCount = 0;
    /**
     * This queue has a character pushed to it for keys that are pressed, if the
     * next character added to the terminal is equal to the key char then it is
     * not announced (added to live region) because it has already been announced
     * by the textarea event (which cannot be canceled). There are some race
     * condition cases if there is typing while data is streaming, but this covers
     * the main case of typing into the prompt and inputting the answer to a
     * question (Y/N, etc.).
     */
    this._charsToConsume = [];
    this._charsToAnnounce = "";
    const doc = this._coreBrowserService.mainDocument;
    this._accessibilityContainer = doc.createElement("div");
    this._accessibilityContainer.classList.add("xterm-accessibility");
    this._rowContainer = doc.createElement("div");
    this._rowContainer.setAttribute("role", "list");
    this._rowContainer.classList.add("xterm-accessibility-tree");
    this._rowElements = [];
    for (let i = 0; i < this._terminal.rows; i++) {
      this._rowElements[i] = this._createAccessibilityTreeNode();
      this._rowContainer.appendChild(this._rowElements[i]);
    }
    this._topBoundaryFocusListener = (e) => this._handleBoundaryFocus(e, 0 /* TOP */);
    this._bottomBoundaryFocusListener = (e) => this._handleBoundaryFocus(e, 1 /* BOTTOM */);
    this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener);
    this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener);
    this._accessibilityContainer.appendChild(this._rowContainer);
    this._liveRegion = doc.createElement("div");
    this._liveRegion.classList.add("live-region");
    this._liveRegion.setAttribute("aria-live", "assertive");
    this._accessibilityContainer.appendChild(this._liveRegion);
    this._liveRegionDebouncer = this._register(new import_TimeBasedDebouncer.TimeBasedDebouncer(this._renderRows.bind(this)));
    if (!this._terminal.element) {
      throw new Error("Cannot enable accessibility before Terminal.open");
    }
    if (DEBUG) {
      this._accessibilityContainer.classList.add("debug");
      this._rowContainer.classList.add("debug");
      this._debugRootContainer = doc.createElement("div");
      this._debugRootContainer.classList.add("xterm");
      this._debugRootContainer.appendChild(doc.createTextNode("------start a11y------"));
      this._debugRootContainer.appendChild(this._accessibilityContainer);
      this._debugRootContainer.appendChild(doc.createTextNode("------end a11y------"));
      this._terminal.element.insertAdjacentElement("afterend", this._debugRootContainer);
    } else {
      this._terminal.element.insertAdjacentElement("afterbegin", this._accessibilityContainer);
    }
    this._register(this._terminal.onResize((e) => this._handleResize(e.rows)));
    this._register(this._terminal.onRender((e) => this._refreshRows(e.start, e.end)));
    this._register(this._terminal.onScroll(() => this._refreshRows()));
    this._register(this._terminal.onA11yChar((char) => this._handleChar(char)));
    this._register(this._terminal.onLineFeed(() => this._handleChar("\n")));
    this._register(this._terminal.onA11yTab((spaceCount) => this._handleTab(spaceCount)));
    this._register(this._terminal.onKey((e) => this._handleKey(e.key)));
    this._register(this._terminal.onBlur(() => this._clearLiveRegion()));
    this._register(this._renderService.onDimensionsChange(() => this._refreshRowsDimensions()));
    this._register((0, import_dom.addDisposableListener)(doc, "selectionchange", () => this._handleSelectionChange()));
    this._register(this._coreBrowserService.onDprChange(() => this._refreshRowsDimensions()));
    this._refreshRowsDimensions();
    this._refreshRows();
    this._register((0, import_lifecycle.toDisposable)(() => {
      if (DEBUG) {
        this._debugRootContainer.remove();
      } else {
        this._accessibilityContainer.remove();
      }
      this._rowElements.length = 0;
    }));
  }
  _handleTab(spaceCount) {
    for (let i = 0; i < spaceCount; i++) {
      this._handleChar(" ");
    }
  }
  _handleChar(char) {
    if (this._liveRegionLineCount < MAX_ROWS_TO_READ + 1) {
      if (this._charsToConsume.length > 0) {
        const shiftedChar = this._charsToConsume.shift();
        if (shiftedChar !== char) {
          this._charsToAnnounce += char;
        }
      } else {
        this._charsToAnnounce += char;
      }
      if (char === "\n") {
        this._liveRegionLineCount++;
        if (this._liveRegionLineCount === MAX_ROWS_TO_READ + 1) {
          this._liveRegion.textContent += Strings.tooMuchOutput.get();
        }
      }
    }
  }
  _clearLiveRegion() {
    this._liveRegion.textContent = "";
    this._liveRegionLineCount = 0;
  }
  _handleKey(keyChar) {
    this._clearLiveRegion();
    if (!/\p{Control}/u.test(keyChar)) {
      this._charsToConsume.push(keyChar);
    }
  }
  _refreshRows(start, end) {
    this._liveRegionDebouncer.refresh(start, end, this._terminal.rows);
  }
  _renderRows(start, end) {
    const buffer = this._terminal.buffer;
    const setSize = buffer.lines.length.toString();
    for (let i = start; i <= end; i++) {
      const line = buffer.lines.get(buffer.ydisp + i);
      const columns = [];
      const lineData = line?.translateToString(true, void 0, void 0, columns) || "";
      const posInSet = (buffer.ydisp + i + 1).toString();
      const element = this._rowElements[i];
      if (element) {
        if (lineData.length === 0) {
          element.innerText = "\xA0";
          this._rowColumns.set(element, [0, 1]);
        } else {
          element.textContent = lineData;
          this._rowColumns.set(element, columns);
        }
        element.setAttribute("aria-posinset", posInSet);
        element.setAttribute("aria-setsize", setSize);
        this._alignRowWidth(element);
      }
    }
    this._announceCharacters();
  }
  _announceCharacters() {
    if (this._charsToAnnounce.length === 0) {
      return;
    }
    this._liveRegion.textContent += this._charsToAnnounce;
    this._charsToAnnounce = "";
  }
  _handleBoundaryFocus(e, position) {
    const boundaryElement = e.target;
    const beforeBoundaryElement = this._rowElements[position === 0 /* TOP */ ? 1 : this._rowElements.length - 2];
    const posInSet = boundaryElement.getAttribute("aria-posinset");
    const lastRowPos = position === 0 /* TOP */ ? "1" : `${this._terminal.buffer.lines.length}`;
    if (posInSet === lastRowPos) {
      return;
    }
    if (e.relatedTarget !== beforeBoundaryElement) {
      return;
    }
    let topBoundaryElement;
    let bottomBoundaryElement;
    if (position === 0 /* TOP */) {
      topBoundaryElement = boundaryElement;
      bottomBoundaryElement = this._rowElements.pop();
      this._rowContainer.removeChild(bottomBoundaryElement);
    } else {
      topBoundaryElement = this._rowElements.shift();
      bottomBoundaryElement = boundaryElement;
      this._rowContainer.removeChild(topBoundaryElement);
    }
    topBoundaryElement.removeEventListener("focus", this._topBoundaryFocusListener);
    bottomBoundaryElement.removeEventListener("focus", this._bottomBoundaryFocusListener);
    if (position === 0 /* TOP */) {
      const newElement = this._createAccessibilityTreeNode();
      this._rowElements.unshift(newElement);
      this._rowContainer.insertAdjacentElement("afterbegin", newElement);
    } else {
      const newElement = this._createAccessibilityTreeNode();
      this._rowElements.push(newElement);
      this._rowContainer.appendChild(newElement);
    }
    this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener);
    this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener);
    this._terminal.scrollLines(position === 0 /* TOP */ ? -1 : 1);
    this._rowElements[position === 0 /* TOP */ ? 1 : this._rowElements.length - 2].focus();
    e.preventDefault();
    e.stopImmediatePropagation();
  }
  _handleSelectionChange() {
    if (this._rowElements.length === 0) {
      return;
    }
    const selection = this._coreBrowserService.mainDocument.getSelection();
    if (!selection) {
      return;
    }
    if (selection.isCollapsed) {
      if (this._rowContainer.contains(selection.anchorNode)) {
        this._terminal.clearSelection();
      }
      return;
    }
    if (!selection.anchorNode || !selection.focusNode) {
      console.error("anchorNode and/or focusNode are null");
      return;
    }
    let begin = { node: selection.anchorNode, offset: selection.anchorOffset };
    let end = { node: selection.focusNode, offset: selection.focusOffset };
    if (begin.node.compareDocumentPosition(end.node) & Node.DOCUMENT_POSITION_PRECEDING || begin.node === end.node && begin.offset > end.offset) {
      [begin, end] = [end, begin];
    }
    if (begin.node.compareDocumentPosition(this._rowElements[0]) & (Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING)) {
      begin = { node: this._rowElements[0].childNodes[0], offset: 0 };
    }
    if (!this._rowContainer.contains(begin.node)) {
      return;
    }
    const lastRowElement = this._rowElements.slice(-1)[0];
    if (end.node.compareDocumentPosition(lastRowElement) & (Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_PRECEDING)) {
      end = {
        node: lastRowElement,
        offset: lastRowElement.textContent?.length ?? 0
      };
    }
    if (!this._rowContainer.contains(end.node)) {
      return;
    }
    const toRowColumn = ({ node, offset }) => {
      const rowElement = node instanceof Text ? node.parentNode : node;
      let row = parseInt(rowElement?.getAttribute("aria-posinset"), 10) - 1;
      if (isNaN(row)) {
        console.warn("row is invalid. Race condition?");
        return null;
      }
      const columns = this._rowColumns.get(rowElement);
      if (!columns) {
        console.warn("columns is null. Race condition?");
        return null;
      }
      let column = offset < columns.length ? columns[offset] : columns.slice(-1)[0] + 1;
      if (column >= this._terminal.cols) {
        ++row;
        column = 0;
      }
      return {
        row,
        column
      };
    };
    const beginRowColumn = toRowColumn(begin);
    const endRowColumn = toRowColumn(end);
    if (!beginRowColumn || !endRowColumn) {
      return;
    }
    if (beginRowColumn.row > endRowColumn.row || beginRowColumn.row === endRowColumn.row && beginRowColumn.column >= endRowColumn.column) {
      throw new Error("invalid range");
    }
    this._terminal.select(
      beginRowColumn.column,
      beginRowColumn.row,
      (endRowColumn.row - beginRowColumn.row) * this._terminal.cols - beginRowColumn.column + endRowColumn.column
    );
  }
  _handleResize(rows) {
    this._rowElements[this._rowElements.length - 1].removeEventListener("focus", this._bottomBoundaryFocusListener);
    for (let i = this._rowContainer.children.length; i < this._terminal.rows; i++) {
      this._rowElements[i] = this._createAccessibilityTreeNode();
      this._rowContainer.appendChild(this._rowElements[i]);
    }
    while (this._rowElements.length > rows) {
      this._rowContainer.removeChild(this._rowElements.pop());
    }
    this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener);
    this._refreshRowsDimensions();
  }
  _createAccessibilityTreeNode() {
    const element = this._coreBrowserService.mainDocument.createElement("div");
    element.setAttribute("role", "listitem");
    element.tabIndex = -1;
    this._refreshRowDimensions(element);
    return element;
  }
  _refreshRowsDimensions() {
    if (!this._renderService.dimensions.css.cell.height) {
      return;
    }
    Object.assign(this._accessibilityContainer.style, {
      width: `${this._renderService.dimensions.css.canvas.width}px`,
      fontSize: `${this._terminal.options.fontSize}px`
    });
    if (this._rowElements.length !== this._terminal.rows) {
      this._handleResize(this._terminal.rows);
    }
    for (let i = 0; i < this._terminal.rows; i++) {
      this._refreshRowDimensions(this._rowElements[i]);
      this._alignRowWidth(this._rowElements[i]);
    }
  }
  _refreshRowDimensions(element) {
    element.style.height = `${this._renderService.dimensions.css.cell.height}px`;
  }
  /**
   * Scale the width of a row so that each of the character is (mostly) aligned
   * with the actual rendering. This will allow the screen reader to draw
   * selection outline at the correct position.
   *
   * On top of using the "monospace" font and correct font size, the scaling
   * here is necessary to handle characters that are not covered by the font
   * (e.g. CJK).
   */
  _alignRowWidth(element) {
    element.style.transform = "";
    const width = element.getBoundingClientRect().width;
    const lastColumn = this._rowColumns.get(element)?.slice(-1)?.[0];
    if (!lastColumn) {
      return;
    }
    const targetWidth = lastColumn * this._renderService.dimensions.css.cell.width;
    element.style.transform = `scaleX(${targetWidth / width})`;
  }
};
AccessibilityManager = __decorateClass([
  __decorateParam(1, import_Services2.IInstantiationService),
  __decorateParam(2, import_Services.ICoreBrowserService),
  __decorateParam(3, import_Services.IRenderService)
], AccessibilityManager);
//# sourceMappingURL=AccessibilityManager.js.map
