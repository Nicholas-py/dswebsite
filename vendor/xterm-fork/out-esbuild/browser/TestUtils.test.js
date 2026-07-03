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
var TestUtils_test_exports = {};
__export(TestUtils_test_exports, {
  MockBuffer: () => MockBuffer,
  MockCharSizeService: () => MockCharSizeService,
  MockCharacterJoinerService: () => MockCharacterJoinerService,
  MockCompositionHelper: () => MockCompositionHelper,
  MockCoreBrowserService: () => MockCoreBrowserService,
  MockMouseService: () => MockMouseService,
  MockRenderService: () => MockRenderService,
  MockRenderer: () => MockRenderer,
  MockSelectionService: () => MockSelectionService,
  MockTerminal: () => MockTerminal,
  MockThemeService: () => MockThemeService,
  MockViewport: () => MockViewport,
  TestTerminal: () => TestTerminal
});
module.exports = __toCommonJS(TestUtils_test_exports);
var import_Buffer = require("common/buffer/Buffer");
var Browser = __toESM(require("common/Platform"));
var import_CoreBrowserTerminal = require("browser/CoreBrowserTerminal");
var import_AttributeData = require("common/buffer/AttributeData");
var import_Color = require("common/Color");
var import_RendererUtils = require("browser/renderer/shared/RendererUtils");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class TestTerminal extends import_CoreBrowserTerminal.CoreBrowserTerminal {
  get curAttrData() {
    return this._inputHandler._curAttrData;
  }
  keyDown(ev) {
    return this._keyDown(ev);
  }
  keyPress(ev) {
    return this._keyPress(ev);
  }
  writeP(data) {
    return new Promise((r) => this.write(data, r));
  }
}
class MockTerminal {
  constructor() {
    this.browser = Browser;
  }
  registerMarker(cursorYOffset) {
    throw new Error("Method not implemented.");
  }
  selectLines(start, end) {
    throw new Error("Method not implemented.");
  }
  scrollToLine(line) {
    throw new Error("Method not implemented.");
  }
  setOption(key, value) {
    throw new Error("Method not implemented.");
  }
  blur() {
    throw new Error("Method not implemented.");
  }
  focus() {
    throw new Error("Method not implemented.");
  }
  input(data, wasUserInput = true) {
    throw new Error("Method not implemented.");
  }
  resize(columns, rows) {
    throw new Error("Method not implemented.");
  }
  writeln(data) {
    throw new Error("Method not implemented.");
  }
  paste(data) {
    throw new Error("Method not implemented.");
  }
  open(parent) {
    throw new Error("Method not implemented.");
  }
  attachCustomKeyEventHandler(customKeyEventHandler) {
    throw new Error("Method not implemented.");
  }
  attachCustomWheelEventHandler(customWheelEventHandler) {
    throw new Error("Method not implemented.");
  }
  registerCsiHandler(id, callback) {
    throw new Error("Method not implemented.");
  }
  registerDcsHandler(id, callback) {
    throw new Error("Method not implemented.");
  }
  registerEscHandler(id, handler) {
    throw new Error("Method not implemented.");
  }
  registerOscHandler(ident, callback) {
    throw new Error("Method not implemented.");
  }
  registerLinkProvider(linkProvider) {
    throw new Error("Method not implemented.");
  }
  registerDecoration(decorationOptions) {
    throw new Error("Method not implemented.");
  }
  hasSelection() {
    throw new Error("Method not implemented.");
  }
  getSelection() {
    throw new Error("Method not implemented.");
  }
  getSelectionPosition() {
    throw new Error("Method not implemented.");
  }
  clearSelection() {
    throw new Error("Method not implemented.");
  }
  select(column, row, length) {
    throw new Error("Method not implemented.");
  }
  selectAll() {
    throw new Error("Method not implemented.");
  }
  dispose() {
    throw new Error("Method not implemented.");
  }
  scrollPages(pageCount) {
    throw new Error("Method not implemented.");
  }
  scrollToTop() {
    throw new Error("Method not implemented.");
  }
  scrollToBottom() {
    throw new Error("Method not implemented.");
  }
  clear() {
    throw new Error("Method not implemented.");
  }
  write(data) {
    throw new Error("Method not implemented.");
  }
  getBufferElements(startLine, endLine) {
    throw new Error("Method not implemented.");
  }
  registerBufferElementProvider(bufferProvider) {
    throw new Error("Method not implemented.");
  }
  handler(data) {
    throw new Error("Method not implemented.");
  }
  on(event, callback) {
    throw new Error("Method not implemented.");
  }
  off(type, listener) {
    throw new Error("Method not implemented.");
  }
  addDisposableListener(type, handler) {
    throw new Error("Method not implemented.");
  }
  scrollLines(disp) {
    throw new Error("Method not implemented.");
  }
  scrollToRow(absoluteRow) {
    throw new Error("Method not implemented.");
  }
  cancel(ev, force) {
    throw new Error("Method not implemented.");
  }
  log(text) {
    throw new Error("Method not implemented.");
  }
  emit(event, data) {
    throw new Error("Method not implemented.");
  }
  reset() {
    throw new Error("Method not implemented.");
  }
  clearTextureAtlas() {
    throw new Error("Method not implemented.");
  }
  refresh(start, end) {
    throw new Error("Method not implemented.");
  }
  registerCharacterJoiner(handler) {
    return 0;
  }
  deregisterCharacterJoiner(joinerId) {
  }
}
class MockBuffer {
  constructor() {
    this.savedCurAttrData = new import_AttributeData.AttributeData();
  }
  addMarker(y) {
    throw new Error("Method not implemented.");
  }
  translateBufferLineToString(lineIndex, trimRight, startCol, endCol) {
    return import_Buffer.Buffer.prototype.translateBufferLineToString.apply(this, arguments);
  }
  getWrappedRangeForLine(y) {
    return import_Buffer.Buffer.prototype.getWrappedRangeForLine.apply(this, arguments);
  }
  nextStop(x) {
    throw new Error("Method not implemented.");
  }
  prevStop(x) {
    throw new Error("Method not implemented.");
  }
  setLines(lines) {
    this.lines = lines;
  }
  getBlankLine(attr, isWrapped) {
    return import_Buffer.Buffer.prototype.getBlankLine.apply(this, arguments);
  }
  getNullCell(attr) {
    throw new Error("Method not implemented.");
  }
  getWhitespaceCell(attr) {
    throw new Error("Method not implemented.");
  }
  clearMarkers(y) {
    throw new Error("Method not implemented.");
  }
  clearAllMarkers() {
    throw new Error("Method not implemented.");
  }
}
class MockRenderer {
  dispose() {
    throw new Error("Method not implemented.");
  }
  on(type, listener) {
    throw new Error("Method not implemented.");
  }
  off(type, listener) {
    throw new Error("Method not implemented.");
  }
  emit(type, data) {
    throw new Error("Method not implemented.");
  }
  addDisposableListener(type, handler) {
    throw new Error("Method not implemented.");
  }
  registerDecoration(decorationOptions) {
    throw new Error("Method not implemented.");
  }
  handleResize(cols, rows) {
  }
  handleCharSizeChanged() {
  }
  handleBlur() {
  }
  handleFocus() {
  }
  handleSelectionChanged(start, end) {
  }
  handleCursorMove() {
  }
  handleOptionsChanged() {
  }
  handleDevicePixelRatioChange() {
  }
  clear() {
  }
  renderRows(start, end) {
  }
}
class MockViewport {
  constructor() {
    this._onRequestScrollLines = new import_event.Emitter();
    this.onRequestScrollLines = this._onRequestScrollLines.event;
    this.scrollBarWidth = 0;
  }
  dispose() {
    throw new Error("Method not implemented.");
  }
  handleThemeChange(colors) {
    throw new Error("Method not implemented.");
  }
  handleWheel(ev) {
    throw new Error("Method not implemented.");
  }
  handleTouchStart(ev) {
    throw new Error("Method not implemented.");
  }
  handleTouchMove(ev) {
    throw new Error("Method not implemented.");
  }
  syncScrollArea() {
  }
  getLinesScrolled(ev) {
    throw new Error("Method not implemented.");
  }
  getBufferElements(startLine, endLine) {
    throw new Error("Method not implemented.");
  }
  scrollLines(disp) {
    this._onRequestScrollLines.fire({ amount: disp, suppressScrollEvent: false });
  }
  reset() {
  }
}
class MockCompositionHelper {
  get isComposing() {
    return false;
  }
  compositionstart() {
    throw new Error("Method not implemented.");
  }
  compositionupdate(ev) {
    throw new Error("Method not implemented.");
  }
  compositionend() {
    throw new Error("Method not implemented.");
  }
  updateCompositionElements(dontRecurse) {
    throw new Error("Method not implemented.");
  }
  keydown(ev) {
    return true;
  }
}
class MockCoreBrowserService {
  constructor() {
    this.onDprChange = new import_event.Emitter().event;
    this.onWindowChange = new import_event.Emitter().event;
    this.isFocused = true;
    this.dpr = 1;
  }
  get window() {
    throw Error("Window object not available in tests");
  }
  get mainDocument() {
    throw Error("Document object not available in tests");
  }
}
class MockCharSizeService {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.onCharSizeChange = new import_event.Emitter().event;
  }
  get hasValidSize() {
    return this.width > 0 && this.height > 0;
  }
  measure() {
  }
}
class MockMouseService {
  getCoords(event, element, colCount, rowCount, isSelection) {
    throw new Error("Not implemented");
  }
  getMouseReportCoords(event, element) {
    throw new Error("Not implemented");
  }
}
class MockRenderService {
  constructor() {
    this.onDimensionsChange = new import_event.Emitter().event;
    this.onRenderedViewportChange = new import_event.Emitter().event;
    this.onRender = new import_event.Emitter().event;
    this.onRefreshRequest = new import_event.Emitter().event;
    this.dimensions = (0, import_RendererUtils.createRenderDimensions)();
  }
  refreshRows(start, end) {
    throw new Error("Method not implemented.");
  }
  addRefreshCallback(callback) {
    throw new Error("Method not implemented.");
  }
  clearTextureAtlas() {
    throw new Error("Method not implemented.");
  }
  resize(cols, rows) {
    throw new Error("Method not implemented.");
  }
  hasRenderer() {
    throw new Error("Method not implemented.");
  }
  setRenderer(renderer) {
    throw new Error("Method not implemented.");
  }
  handleDevicePixelRatioChange() {
    throw new Error("Method not implemented.");
  }
  handleResize(cols, rows) {
    throw new Error("Method not implemented.");
  }
  handleCharSizeChanged() {
    throw new Error("Method not implemented.");
  }
  handleBlur() {
    throw new Error("Method not implemented.");
  }
  handleFocus() {
    throw new Error("Method not implemented.");
  }
  handleSelectionChanged(start, end, columnSelectMode) {
    throw new Error("Method not implemented.");
  }
  handleCursorMove() {
    throw new Error("Method not implemented.");
  }
  clear() {
    throw new Error("Method not implemented.");
  }
  dispose() {
    throw new Error("Method not implemented.");
  }
  registerDecoration(decorationOptions) {
    throw new Error("Method not implemented.");
  }
}
class MockCharacterJoinerService {
  register(handler) {
    return 0;
  }
  deregister(joinerId) {
    return true;
  }
  getJoinedCharacters(row) {
    return [];
  }
}
class MockSelectionService {
  constructor() {
    this.selectionText = "";
    this.hasSelection = false;
    this.onLinuxMouseSelection = new import_event.Emitter().event;
    this.onRequestRedraw = new import_event.Emitter().event;
    this.onRequestScrollLines = new import_event.Emitter().event;
    this.onSelectionChange = new import_event.Emitter().event;
  }
  disable() {
    throw new Error("Method not implemented.");
  }
  enable() {
    throw new Error("Method not implemented.");
  }
  reset() {
    throw new Error("Method not implemented.");
  }
  setSelection(row, col, length) {
    throw new Error("Method not implemented.");
  }
  selectAll() {
    throw new Error("Method not implemented.");
  }
  selectLines(start, end) {
    throw new Error("Method not implemented.");
  }
  clearSelection() {
    throw new Error("Method not implemented.");
  }
  rightClickSelect(event) {
    throw new Error("Method not implemented.");
  }
  shouldColumnSelect(event) {
    throw new Error("Method not implemented.");
  }
  shouldForceSelection(event) {
    throw new Error("Method not implemented.");
  }
  refresh(isLinuxMouseSelection) {
    throw new Error("Method not implemented.");
  }
  handleMouseDown(event) {
    throw new Error("Method not implemented.");
  }
  isCellInSelection(x, y) {
    return false;
  }
}
class MockThemeService {
  constructor() {
    this.onChangeColors = new import_event.Emitter().event;
    this.colors = {
      background: import_Color.css.toColor("#010101"),
      foreground: import_Color.css.toColor("#020202"),
      ansi: [
        // dark:
        import_Color.css.toColor("#2e3436"),
        import_Color.css.toColor("#cc0000"),
        import_Color.css.toColor("#4e9a06"),
        import_Color.css.toColor("#c4a000"),
        import_Color.css.toColor("#3465a4"),
        import_Color.css.toColor("#75507b"),
        import_Color.css.toColor("#06989a"),
        import_Color.css.toColor("#d3d7cf"),
        // bright:
        import_Color.css.toColor("#555753"),
        import_Color.css.toColor("#ef2929"),
        import_Color.css.toColor("#8ae234"),
        import_Color.css.toColor("#fce94f"),
        import_Color.css.toColor("#729fcf"),
        import_Color.css.toColor("#ad7fa8"),
        import_Color.css.toColor("#34e2e2"),
        import_Color.css.toColor("#eeeeec")
      ],
      selectionBackgroundOpaque: import_Color.css.toColor("#ff0000"),
      selectionInactiveBackgroundOpaque: import_Color.css.toColor("#00ff00")
    };
  }
  restoreColor(slot) {
    throw new Error("Method not implemented.");
  }
  modifyColors(callback) {
    throw new Error("Method not implemented.");
  }
}
//# sourceMappingURL=TestUtils.test.js.map
