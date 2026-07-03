"use strict";
var import_chai = require("chai");
var import_SelectionService = require("./SelectionService");
var import_TestUtils = require("common/TestUtils.test");
var import_BufferLine = require("common/buffer/BufferLine");
var import_TestUtils2 = require("browser/TestUtils.test");
var import_CellData = require("common/buffer/CellData");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class TestSelectionService extends import_SelectionService.SelectionService {
  constructor(bufferService, optionsService, renderService) {
    super(null, null, null, bufferService, new import_TestUtils.MockCoreService(), new import_TestUtils2.MockMouseService(), optionsService, renderService, new import_TestUtils2.MockCoreBrowserService());
  }
  get model() {
    return this._model;
  }
  set selectionMode(mode) {
    this._activeSelectionMode = mode;
  }
  selectLineAt(line) {
    this._selectLineAt(line);
  }
  selectWordAt(coords) {
    this._selectWordAt(coords, true);
  }
  areCoordsInSelection(coords, start, end) {
    return this._areCoordsInSelection(coords, start, end);
  }
  // Disable DOM interaction
  enable() {
  }
  disable() {
  }
  refresh() {
  }
}
describe("SelectionService", () => {
  let buffer;
  let bufferService;
  let optionsService;
  let selectionService;
  beforeEach(() => {
    optionsService = new import_TestUtils.MockOptionsService();
    bufferService = new import_TestUtils.MockBufferService(20, 20, optionsService);
    buffer = bufferService.buffer;
    const renderService = new import_TestUtils2.MockRenderService();
    renderService.dimensions.css.canvas.height = 10 * 20;
    renderService.dimensions.css.canvas.width = 10 * 20;
    selectionService = new TestSelectionService(bufferService, optionsService, renderService);
  });
  function stringToRow(text) {
    const result = new import_BufferLine.BufferLine(text.length);
    for (let i = 0; i < text.length; i++) {
      result.setCell(i, import_CellData.CellData.fromCharData([0, text.charAt(i), 1, text.charCodeAt(i)]));
    }
    return result;
  }
  function stringArrayToRow(chars) {
    const line = new import_BufferLine.BufferLine(chars.length);
    chars.map((c, idx) => line.setCell(idx, import_CellData.CellData.fromCharData([0, c, 1, c.charCodeAt(0)])));
    return line;
  }
  describe("_selectWordAt", () => {
    it("should expand selection for normal width chars", () => {
      buffer.lines.set(0, stringToRow("foo bar"));
      selectionService.selectWordAt([0, 0]);
      import_chai.assert.equal(selectionService.selectionText, "foo");
      selectionService.selectWordAt([1, 0]);
      import_chai.assert.equal(selectionService.selectionText, "foo");
      selectionService.selectWordAt([2, 0]);
      import_chai.assert.equal(selectionService.selectionText, "foo");
      selectionService.selectWordAt([3, 0]);
      import_chai.assert.equal(selectionService.selectionText, " ");
      selectionService.selectWordAt([4, 0]);
      import_chai.assert.equal(selectionService.selectionText, "bar");
      selectionService.selectWordAt([5, 0]);
      import_chai.assert.equal(selectionService.selectionText, "bar");
      selectionService.selectWordAt([6, 0]);
      import_chai.assert.equal(selectionService.selectionText, "bar");
    });
    it("should expand selection for whitespace", () => {
      buffer.lines.set(0, stringToRow("a   b"));
      selectionService.selectWordAt([0, 0]);
      import_chai.assert.equal(selectionService.selectionText, "a");
      selectionService.selectWordAt([1, 0]);
      import_chai.assert.equal(selectionService.selectionText, "   ");
      selectionService.selectWordAt([2, 0]);
      import_chai.assert.equal(selectionService.selectionText, "   ");
      selectionService.selectWordAt([3, 0]);
      import_chai.assert.equal(selectionService.selectionText, "   ");
      selectionService.selectWordAt([4, 0]);
      import_chai.assert.equal(selectionService.selectionText, "b");
    });
    it("should expand selection for wide characters", () => {
      const data = [
        [0, "\u4E2D", 2, "\u4E2D".charCodeAt(0)],
        [0, "", 0, 0],
        [0, "\u6587", 2, "\u6587".charCodeAt(0)],
        [0, "", 0, 0],
        [0, " ", 1, " ".charCodeAt(0)],
        [0, "a", 1, "a".charCodeAt(0)],
        [0, "\u4E2D", 2, "\u4E2D".charCodeAt(0)],
        [0, "", 0, 0],
        [0, "\u6587", 2, "\u6587".charCodeAt(0)],
        [0, "", 0, "".charCodeAt(0)],
        [0, "b", 1, "b".charCodeAt(0)],
        [0, " ", 1, " ".charCodeAt(0)],
        [0, "f", 1, "f".charCodeAt(0)],
        [0, "o", 1, "o".charCodeAt(0)],
        [0, "o", 1, "o".charCodeAt(0)]
      ];
      const line = new import_BufferLine.BufferLine(data.length);
      for (let i = 0; i < data.length; ++i) line.setCell(i, import_CellData.CellData.fromCharData(data[i]));
      buffer.lines.set(0, line);
      selectionService.selectWordAt([0, 0]);
      import_chai.assert.equal(selectionService.selectionText, "\u4E2D\u6587");
      selectionService.selectWordAt([1, 0]);
      import_chai.assert.equal(selectionService.selectionText, "\u4E2D\u6587");
      selectionService.selectWordAt([2, 0]);
      import_chai.assert.equal(selectionService.selectionText, "\u4E2D\u6587");
      selectionService.selectWordAt([3, 0]);
      import_chai.assert.equal(selectionService.selectionText, "\u4E2D\u6587");
      selectionService.selectWordAt([4, 0]);
      import_chai.assert.equal(selectionService.selectionText, " ");
      selectionService.selectWordAt([5, 0]);
      import_chai.assert.equal(selectionService.selectionText, "a\u4E2D\u6587b");
      selectionService.selectWordAt([6, 0]);
      import_chai.assert.equal(selectionService.selectionText, "a\u4E2D\u6587b");
      selectionService.selectWordAt([7, 0]);
      import_chai.assert.equal(selectionService.selectionText, "a\u4E2D\u6587b");
      selectionService.selectWordAt([8, 0]);
      import_chai.assert.equal(selectionService.selectionText, "a\u4E2D\u6587b");
      selectionService.selectWordAt([9, 0]);
      import_chai.assert.equal(selectionService.selectionText, "a\u4E2D\u6587b");
      selectionService.selectWordAt([10, 0]);
      import_chai.assert.equal(selectionService.selectionText, "a\u4E2D\u6587b");
      selectionService.selectWordAt([11, 0]);
      import_chai.assert.equal(selectionService.selectionText, " ");
      selectionService.selectWordAt([12, 0]);
      import_chai.assert.equal(selectionService.selectionText, "foo");
      selectionService.selectWordAt([13, 0]);
      import_chai.assert.equal(selectionService.selectionText, "foo");
      selectionService.selectWordAt([14, 0]);
      import_chai.assert.equal(selectionService.selectionText, "foo");
    });
    it("should select up to non-path characters that are commonly adjacent to paths", () => {
      buffer.lines.set(0, stringToRow(`(cd)[ef]{gh}'ij"`));
      selectionService.selectWordAt([0, 0]);
      import_chai.assert.equal(selectionService.selectionText, "(cd");
      selectionService.selectWordAt([1, 0]);
      import_chai.assert.equal(selectionService.selectionText, "cd");
      selectionService.selectWordAt([2, 0]);
      import_chai.assert.equal(selectionService.selectionText, "cd");
      selectionService.selectWordAt([3, 0]);
      import_chai.assert.equal(selectionService.selectionText, "cd)");
      selectionService.selectWordAt([4, 0]);
      import_chai.assert.equal(selectionService.selectionText, "[ef");
      selectionService.selectWordAt([5, 0]);
      import_chai.assert.equal(selectionService.selectionText, "ef");
      selectionService.selectWordAt([6, 0]);
      import_chai.assert.equal(selectionService.selectionText, "ef");
      selectionService.selectWordAt([7, 0]);
      import_chai.assert.equal(selectionService.selectionText, "ef]");
      selectionService.selectWordAt([8, 0]);
      import_chai.assert.equal(selectionService.selectionText, "{gh");
      selectionService.selectWordAt([9, 0]);
      import_chai.assert.equal(selectionService.selectionText, "gh");
      selectionService.selectWordAt([10, 0]);
      import_chai.assert.equal(selectionService.selectionText, "gh");
      selectionService.selectWordAt([11, 0]);
      import_chai.assert.equal(selectionService.selectionText, "gh}");
      selectionService.selectWordAt([12, 0]);
      import_chai.assert.equal(selectionService.selectionText, "'ij");
      selectionService.selectWordAt([13, 0]);
      import_chai.assert.equal(selectionService.selectionText, "ij");
      selectionService.selectWordAt([14, 0]);
      import_chai.assert.equal(selectionService.selectionText, "ij");
      selectionService.selectWordAt([15, 0]);
      import_chai.assert.equal(selectionService.selectionText, 'ij"');
    });
    it("should expand upwards or downards for wrapped lines", () => {
      buffer.lines.set(0, stringToRow("                 foo"));
      buffer.lines.set(1, stringToRow("bar                 "));
      buffer.lines.get(1).isWrapped = true;
      selectionService.selectWordAt([1, 1]);
      import_chai.assert.equal(selectionService.selectionText, "foobar");
      selectionService.model.clearSelection();
      selectionService.selectWordAt([18, 0]);
      import_chai.assert.equal(selectionService.selectionText, "foobar");
    });
    it("should expand both upwards and downwards for word wrapped over many lines", () => {
      const expectedText = "fooaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbccccccccccccccccccccbar";
      buffer.lines.set(0, stringToRow("                 foo"));
      buffer.lines.set(1, stringToRow("aaaaaaaaaaaaaaaaaaaa"));
      buffer.lines.set(2, stringToRow("bbbbbbbbbbbbbbbbbbbb"));
      buffer.lines.set(3, stringToRow("cccccccccccccccccccc"));
      buffer.lines.set(4, stringToRow("bar                 "));
      buffer.lines.get(1).isWrapped = true;
      buffer.lines.get(2).isWrapped = true;
      buffer.lines.get(3).isWrapped = true;
      buffer.lines.get(4).isWrapped = true;
      selectionService.selectWordAt([18, 0]);
      import_chai.assert.equal(selectionService.selectionText, expectedText);
      selectionService.model.clearSelection();
      selectionService.selectWordAt([10, 1]);
      import_chai.assert.equal(selectionService.selectionText, expectedText);
      selectionService.model.clearSelection();
      selectionService.selectWordAt([10, 2]);
      import_chai.assert.equal(selectionService.selectionText, expectedText);
      selectionService.model.clearSelection();
      selectionService.selectWordAt([10, 3]);
      import_chai.assert.equal(selectionService.selectionText, expectedText);
      selectionService.model.clearSelection();
      selectionService.selectWordAt([1, 4]);
      import_chai.assert.equal(selectionService.selectionText, expectedText);
    });
    describe("emoji", () => {
      it("should treat a single emoji as a word when wrapped in spaces", () => {
        buffer.lines.set(0, stringToRow(" \u26BD a"));
        selectionService.selectWordAt([0, 0]);
        import_chai.assert.equal(selectionService.selectionText, " ");
        selectionService.selectWordAt([1, 0]);
        import_chai.assert.equal(selectionService.selectionText, "\u26BD");
        selectionService.selectWordAt([2, 0]);
        import_chai.assert.equal(selectionService.selectionText, " ");
      });
      it("should treat multiple emojis as a word when wrapped in spaces", () => {
        buffer.lines.set(0, stringToRow(" \u26BD\u26BD a"));
        selectionService.selectWordAt([0, 0]);
        import_chai.assert.equal(selectionService.selectionText, " ");
        selectionService.selectWordAt([1, 0]);
        import_chai.assert.equal(selectionService.selectionText, "\u26BD\u26BD");
        selectionService.selectWordAt([2, 0]);
        import_chai.assert.equal(selectionService.selectionText, "\u26BD\u26BD");
        selectionService.selectWordAt([3, 0]);
        import_chai.assert.equal(selectionService.selectionText, " ");
      });
      it("should treat emojis using the zero-width-joiner as a single word", () => {
        buffer.lines.set(0, stringArrayToRow([
          " ",
          "\u{1F468}\u200D",
          "\u{1F469}\u200D",
          "\u{1F467}\u200D",
          "\u{1F466}",
          " ",
          "a"
        ]));
        selectionService.selectWordAt([0, 0]);
        import_chai.assert.equal(selectionService.selectionText, " ");
        selectionService.selectWordAt([1, 0]);
        import_chai.assert.equal(selectionService.selectionText, "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}");
        selectionService.selectWordAt([2, 0]);
        import_chai.assert.equal(selectionService.selectionText, "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}");
        selectionService.selectWordAt([3, 0]);
        import_chai.assert.equal(selectionService.selectionText, "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}");
        selectionService.selectWordAt([4, 0]);
        import_chai.assert.equal(selectionService.selectionText, "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}");
        selectionService.selectWordAt([5, 0]);
        import_chai.assert.equal(selectionService.selectionText, " ");
      });
      it("should treat emojis and characters joined together as a word", () => {
        buffer.lines.set(0, stringToRow(" \u26BDab cd\u26BD ef\u26BDgh"));
        selectionService.selectWordAt([0, 0]);
        import_chai.assert.equal(selectionService.selectionText, " ");
        selectionService.selectWordAt([1, 0]);
        import_chai.assert.equal(selectionService.selectionText, "\u26BDab");
        selectionService.selectWordAt([2, 0]);
        import_chai.assert.equal(selectionService.selectionText, "\u26BDab");
        selectionService.selectWordAt([3, 0]);
        import_chai.assert.equal(selectionService.selectionText, "\u26BDab");
        selectionService.selectWordAt([4, 0]);
        import_chai.assert.equal(selectionService.selectionText, " ");
        selectionService.selectWordAt([5, 0]);
        import_chai.assert.equal(selectionService.selectionText, "cd\u26BD");
        selectionService.selectWordAt([6, 0]);
        import_chai.assert.equal(selectionService.selectionText, "cd\u26BD");
        selectionService.selectWordAt([7, 0]);
        import_chai.assert.equal(selectionService.selectionText, "cd\u26BD");
        selectionService.selectWordAt([8, 0]);
        import_chai.assert.equal(selectionService.selectionText, " ");
        selectionService.selectWordAt([9, 0]);
        import_chai.assert.equal(selectionService.selectionText, "ef\u26BDgh");
        selectionService.selectWordAt([10, 0]);
        import_chai.assert.equal(selectionService.selectionText, "ef\u26BDgh");
        selectionService.selectWordAt([11, 0]);
        import_chai.assert.equal(selectionService.selectionText, "ef\u26BDgh");
        selectionService.selectWordAt([12, 0]);
        import_chai.assert.equal(selectionService.selectionText, "ef\u26BDgh");
        selectionService.selectWordAt([13, 0]);
        import_chai.assert.equal(selectionService.selectionText, "ef\u26BDgh");
      });
      it("should treat complex emojis and characters joined together as a word", () => {
        buffer.lines.set(0, stringArrayToRow([
          " ",
          "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
          "a",
          "b",
          " ",
          "c",
          "d",
          "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
          " ",
          "e",
          "f",
          "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
          "g",
          "h",
          " ",
          "a"
        ]));
        selectionService.selectWordAt([0, 0]);
        import_chai.assert.equal(selectionService.selectionText, " ");
        selectionService.selectWordAt([1, 0]);
        import_chai.assert.equal(selectionService.selectionText, "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}ab");
        selectionService.selectWordAt([2, 0]);
        import_chai.assert.equal(selectionService.selectionText, "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}ab");
        selectionService.selectWordAt([3, 0]);
        import_chai.assert.equal(selectionService.selectionText, "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}ab");
        selectionService.selectWordAt([4, 0]);
        import_chai.assert.equal(selectionService.selectionText, " ");
        selectionService.selectWordAt([5, 0]);
        import_chai.assert.equal(selectionService.selectionText, "cd\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}");
        selectionService.selectWordAt([6, 0]);
        import_chai.assert.equal(selectionService.selectionText, "cd\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}");
        selectionService.selectWordAt([7, 0]);
        import_chai.assert.equal(selectionService.selectionText, "cd\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}");
        selectionService.selectWordAt([8, 0]);
        import_chai.assert.equal(selectionService.selectionText, " ");
        selectionService.selectWordAt([9, 0]);
        import_chai.assert.equal(selectionService.selectionText, "ef\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}gh");
        selectionService.selectWordAt([10, 0]);
        import_chai.assert.equal(selectionService.selectionText, "ef\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}gh");
        selectionService.selectWordAt([11, 0]);
        import_chai.assert.equal(selectionService.selectionText, "ef\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}gh");
        selectionService.selectWordAt([12, 0]);
        import_chai.assert.equal(selectionService.selectionText, "ef\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}gh");
        selectionService.selectWordAt([13, 0]);
        import_chai.assert.equal(selectionService.selectionText, "ef\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}gh");
      });
    });
  });
  describe("_selectLineAt", () => {
    it("should select the entire line", () => {
      buffer.lines.set(0, stringToRow("foo bar"));
      selectionService.selectLineAt(0);
      import_chai.assert.equal(selectionService.selectionText, "foo bar", "The selected text is correct");
      import_chai.assert.deepEqual(selectionService.model.selectionStart, [0, 0]);
      import_chai.assert.deepEqual(selectionService.model.selectionEnd, void 0);
      import_chai.assert.deepEqual(selectionService.model.selectionStartLength, 20);
      import_chai.assert.deepEqual(selectionService.model.finalSelectionStart, [0, 0]);
      import_chai.assert.deepEqual(selectionService.model.finalSelectionEnd, [bufferService.cols, 0], "The actual selection spans the entire column");
    });
    it("should select the entire wrapped line", () => {
      buffer.lines.set(0, stringToRow("foo"));
      const line2 = stringToRow("bar");
      line2.isWrapped = true;
      buffer.lines.set(1, line2);
      selectionService.selectLineAt(0);
      import_chai.assert.equal(selectionService.selectionText, "foobar", "The selected text is correct");
      import_chai.assert.deepEqual(selectionService.model.selectionStart, [0, 0]);
      import_chai.assert.deepEqual(selectionService.model.selectionEnd, void 0);
      import_chai.assert.deepEqual(selectionService.model.selectionStartLength, 40);
      import_chai.assert.deepEqual(selectionService.model.finalSelectionStart, [0, 0]);
      import_chai.assert.deepEqual(selectionService.model.finalSelectionEnd, [bufferService.cols, 1], "The actual selection spans the entire column");
    });
  });
  describe("selectAll", () => {
    it("should select the entire buffer, beyond the viewport", () => {
      bufferService.resize(20, 5);
      buffer.lines.set(0, stringToRow("1"));
      buffer.lines.set(1, stringToRow("2"));
      buffer.lines.set(2, stringToRow("3"));
      buffer.lines.set(3, stringToRow("4"));
      buffer.lines.set(4, stringToRow("5"));
      selectionService.selectAll();
      import_chai.assert.equal(selectionService.selectionText, "1\n2\n3\n4\n5");
    });
  });
  describe("selectLines", () => {
    it("should select a single line", () => {
      buffer.lines.length = 3;
      buffer.lines.set(0, stringToRow("1"));
      buffer.lines.set(1, stringToRow("2"));
      buffer.lines.set(2, stringToRow("3"));
      selectionService.selectLines(1, 1);
      import_chai.assert.deepEqual(selectionService.model.finalSelectionStart, [0, 1]);
      import_chai.assert.deepEqual(selectionService.model.finalSelectionEnd, [bufferService.cols, 1]);
    });
    it("should select multiple lines", () => {
      buffer.lines.length = 5;
      buffer.lines.set(0, stringToRow("1"));
      buffer.lines.set(1, stringToRow("2"));
      buffer.lines.set(2, stringToRow("3"));
      buffer.lines.set(3, stringToRow("4"));
      buffer.lines.set(4, stringToRow("5"));
      selectionService.selectLines(1, 3);
      import_chai.assert.deepEqual(selectionService.model.finalSelectionStart, [0, 1]);
      import_chai.assert.deepEqual(selectionService.model.finalSelectionEnd, [bufferService.cols, 3]);
    });
    it("should select the to the start when requesting a negative row", () => {
      buffer.lines.length = 2;
      buffer.lines.set(0, stringToRow("1"));
      buffer.lines.set(1, stringToRow("2"));
      selectionService.selectLines(-1, 0);
      import_chai.assert.deepEqual(selectionService.model.finalSelectionStart, [0, 0]);
      import_chai.assert.deepEqual(selectionService.model.finalSelectionEnd, [bufferService.cols, 0]);
    });
    it("should select the to the end when requesting beyond the final row", () => {
      buffer.lines.length = 2;
      buffer.lines.set(0, stringToRow("1"));
      buffer.lines.set(1, stringToRow("2"));
      selectionService.selectLines(1, 2);
      import_chai.assert.deepEqual(selectionService.model.finalSelectionStart, [0, 1]);
      import_chai.assert.deepEqual(selectionService.model.finalSelectionEnd, [bufferService.cols, 1]);
    });
  });
  describe("hasSelection", () => {
    it("should return whether there is a selection", () => {
      selectionService.model.selectionStart = [0, 0];
      selectionService.model.selectionStartLength = 0;
      import_chai.assert.equal(selectionService.hasSelection, false);
      selectionService.model.selectionEnd = [0, 0];
      import_chai.assert.equal(selectionService.hasSelection, false);
      selectionService.model.selectionEnd = [1, 0];
      import_chai.assert.equal(selectionService.hasSelection, true);
      selectionService.model.selectionEnd = [0, 1];
      import_chai.assert.equal(selectionService.hasSelection, true);
      selectionService.model.selectionEnd = [1, 1];
      import_chai.assert.equal(selectionService.hasSelection, true);
    });
  });
  describe("column selection", () => {
    it("should select a column of text", () => {
      buffer.lines.length = 3;
      buffer.lines.set(0, stringToRow("abcdefghij"));
      buffer.lines.set(1, stringToRow("klmnopqrst"));
      buffer.lines.set(2, stringToRow("uvwxyz"));
      selectionService.selectionMode = import_SelectionService.SelectionMode.COLUMN;
      selectionService.model.selectionStart = [2, 0];
      selectionService.model.selectionEnd = [4, 2];
      import_chai.assert.equal(selectionService.selectionText, "cd\nmn\nwx");
    });
    it("should select a column of text without chopping up double width characters", () => {
      buffer.lines.length = 3;
      buffer.lines.set(0, stringToRow("a"));
      buffer.lines.set(1, stringToRow("\u8A9E"));
      buffer.lines.set(2, stringToRow("b"));
      selectionService.selectionMode = import_SelectionService.SelectionMode.COLUMN;
      selectionService.model.selectionStart = [0, 0];
      selectionService.model.selectionEnd = [1, 2];
      import_chai.assert.equal(selectionService.selectionText, "a\n\u8A9E\nb");
    });
    it("should select a column of text with single character emojis", () => {
      buffer.lines.length = 3;
      buffer.lines.set(0, stringToRow("a"));
      buffer.lines.set(1, stringToRow("\u2603"));
      buffer.lines.set(2, stringToRow("c"));
      selectionService.selectionMode = import_SelectionService.SelectionMode.COLUMN;
      selectionService.model.selectionStart = [0, 0];
      selectionService.model.selectionEnd = [1, 2];
      import_chai.assert.equal(selectionService.selectionText, "a\n\u2603\nc");
    });
    it("should select a column of text with double character emojis", () => {
      buffer.lines.length = 3;
      buffer.lines.set(0, stringToRow("a "));
      buffer.lines.set(1, stringArrayToRow(["\u{1F601}", " "]));
      buffer.lines.set(2, stringToRow("c "));
      selectionService.selectionMode = import_SelectionService.SelectionMode.COLUMN;
      selectionService.model.selectionStart = [0, 0];
      selectionService.model.selectionEnd = [1, 2];
      import_chai.assert.equal(selectionService.selectionText, "a\n\u{1F601}\nc");
    });
  });
  describe("_areCoordsInSelection", () => {
    it("should return whether coords are in the selection", () => {
      import_chai.assert.isFalse(selectionService.areCoordsInSelection([0, 0], [2, 0], [2, 1]));
      import_chai.assert.isFalse(selectionService.areCoordsInSelection([1, 0], [2, 0], [2, 1]));
      import_chai.assert.isTrue(selectionService.areCoordsInSelection([2, 0], [2, 0], [2, 1]));
      import_chai.assert.isTrue(selectionService.areCoordsInSelection([10, 0], [2, 0], [2, 1]));
      import_chai.assert.isTrue(selectionService.areCoordsInSelection([0, 1], [2, 0], [2, 1]));
      import_chai.assert.isTrue(selectionService.areCoordsInSelection([1, 1], [2, 0], [2, 1]));
      import_chai.assert.isFalse(selectionService.areCoordsInSelection([2, 1], [2, 0], [2, 1]));
    });
  });
});
//# sourceMappingURL=SelectionService.test.js.map
