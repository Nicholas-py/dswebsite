"use strict";
var import_chai = require("chai");
var import_Buffer = require("common/buffer/Buffer");
var import_CircularList = require("common/CircularList");
var import_TestUtils = require("common/TestUtils.test");
var import_BufferLine = require("common/buffer/BufferLine");
var import_CellData = require("common/buffer/CellData");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const INIT_COLS = 80;
const INIT_ROWS = 24;
const INIT_SCROLLBACK = 1e3;
describe("Buffer", () => {
  let optionsService;
  let bufferService;
  let buffer;
  beforeEach(() => {
    optionsService = new import_TestUtils.MockOptionsService({ scrollback: INIT_SCROLLBACK });
    bufferService = new import_TestUtils.MockBufferService(INIT_COLS, INIT_ROWS);
    buffer = new import_Buffer.Buffer(true, optionsService, bufferService);
  });
  describe("constructor", () => {
    it("should create a CircularList with max length equal to rows + scrollback, for its lines", () => {
      import_chai.assert.instanceOf(buffer.lines, import_CircularList.CircularList);
      import_chai.assert.equal(buffer.lines.maxLength, bufferService.rows + INIT_SCROLLBACK);
    });
    it("should set the Buffer's scrollBottom value equal to the terminal's rows -1", () => {
      import_chai.assert.equal(buffer.scrollBottom, bufferService.rows - 1);
    });
  });
  describe("fillViewportRows", () => {
    it("should fill the buffer with blank lines based on the size of the viewport", () => {
      const blankLineChar = buffer.getBlankLine(import_BufferLine.DEFAULT_ATTR_DATA).loadCell(0, new import_CellData.CellData()).getAsCharData();
      buffer.fillViewportRows();
      import_chai.assert.equal(buffer.lines.length, INIT_ROWS);
      for (let y = 0; y < INIT_ROWS; y++) {
        import_chai.assert.equal(buffer.lines.get(y).length, INIT_COLS);
        for (let x = 0; x < INIT_COLS; x++) {
          import_chai.assert.deepEqual(buffer.lines.get(y).loadCell(x, new import_CellData.CellData()).getAsCharData(), blankLineChar);
        }
      }
    });
  });
  describe("getWrappedRangeForLine", () => {
    describe("non-wrapped", () => {
      it("should return a single row for the first row", () => {
        buffer.fillViewportRows();
        import_chai.assert.deepEqual(buffer.getWrappedRangeForLine(0), { first: 0, last: 0 });
      });
      it("should return a single row for a middle row", () => {
        buffer.fillViewportRows();
        import_chai.assert.deepEqual(buffer.getWrappedRangeForLine(12), { first: 12, last: 12 });
      });
      it("should return a single row for the last row", () => {
        buffer.fillViewportRows();
        import_chai.assert.deepEqual(buffer.getWrappedRangeForLine(buffer.lines.length - 1), { first: 23, last: 23 });
      });
    });
    describe("wrapped", () => {
      it("should return a range for the first row", () => {
        buffer.fillViewportRows();
        buffer.lines.get(1).isWrapped = true;
        import_chai.assert.deepEqual(buffer.getWrappedRangeForLine(0), { first: 0, last: 1 });
      });
      it("should return a range for a middle row wrapping upwards", () => {
        buffer.fillViewportRows();
        buffer.lines.get(12).isWrapped = true;
        import_chai.assert.deepEqual(buffer.getWrappedRangeForLine(12), { first: 11, last: 12 });
      });
      it("should return a range for a middle row wrapping downwards", () => {
        buffer.fillViewportRows();
        buffer.lines.get(13).isWrapped = true;
        import_chai.assert.deepEqual(buffer.getWrappedRangeForLine(12), { first: 12, last: 13 });
      });
      it("should return a range for a middle row wrapping both ways", () => {
        buffer.fillViewportRows();
        buffer.lines.get(11).isWrapped = true;
        buffer.lines.get(12).isWrapped = true;
        buffer.lines.get(13).isWrapped = true;
        buffer.lines.get(14).isWrapped = true;
        import_chai.assert.deepEqual(buffer.getWrappedRangeForLine(12), { first: 10, last: 14 });
      });
      it("should return a range for the last row", () => {
        buffer.fillViewportRows();
        buffer.lines.get(23).isWrapped = true;
        import_chai.assert.deepEqual(buffer.getWrappedRangeForLine(buffer.lines.length - 1), { first: 22, last: 23 });
      });
      it("should return a range for a row that wraps upward to first row", () => {
        buffer.fillViewportRows();
        buffer.lines.get(1).isWrapped = true;
        import_chai.assert.deepEqual(buffer.getWrappedRangeForLine(1), { first: 0, last: 1 });
      });
      it("should return a range for a row that wraps downward to last row", () => {
        buffer.fillViewportRows();
        buffer.lines.get(buffer.lines.length - 1).isWrapped = true;
        import_chai.assert.deepEqual(buffer.getWrappedRangeForLine(buffer.lines.length - 2), { first: 22, last: 23 });
      });
    });
  });
  describe("resize", () => {
    describe("column size is reduced", () => {
      it("should trim the data in the buffer", () => {
        buffer.fillViewportRows();
        buffer.resize(INIT_COLS / 2, INIT_ROWS);
        import_chai.assert.equal(buffer.lines.length, INIT_ROWS);
        for (let i = 0; i < INIT_ROWS; i++) {
          import_chai.assert.equal(buffer.lines.get(i).length, INIT_COLS / 2);
        }
      });
    });
    describe("column size is increased", () => {
      it("should add pad columns", () => {
        buffer.fillViewportRows();
        buffer.resize(INIT_COLS + 10, INIT_ROWS);
        import_chai.assert.equal(buffer.lines.length, INIT_ROWS);
        for (let i = 0; i < INIT_ROWS; i++) {
          import_chai.assert.equal(buffer.lines.get(i).length, INIT_COLS + 10);
        }
      });
    });
    describe("row size reduced", () => {
      it("should trim blank lines from the end", () => {
        buffer.fillViewportRows();
        buffer.resize(INIT_COLS, INIT_ROWS - 10);
        import_chai.assert.equal(buffer.lines.length, INIT_ROWS - 10);
      });
      it("should move the viewport down when it's at the end", () => {
        buffer.fillViewportRows();
        buffer.y = INIT_ROWS - 5 - 1;
        buffer.resize(INIT_COLS, INIT_ROWS - 10);
        import_chai.assert.equal(buffer.lines.length, INIT_ROWS - 5);
        import_chai.assert.equal(buffer.ydisp, 5);
        import_chai.assert.equal(buffer.ybase, 5);
      });
      describe("no scrollback", () => {
        it("should trim from the top of the buffer when the cursor reaches the bottom", () => {
          buffer = new import_Buffer.Buffer(true, new import_TestUtils.MockOptionsService({ scrollback: 0 }), bufferService);
          import_chai.assert.equal(buffer.lines.maxLength, INIT_ROWS);
          buffer.y = INIT_ROWS - 1;
          buffer.fillViewportRows();
          let chData = buffer.lines.get(5).loadCell(0, new import_CellData.CellData()).getAsCharData();
          chData[1] = "a";
          buffer.lines.get(5).setCell(0, import_CellData.CellData.fromCharData(chData));
          chData = buffer.lines.get(INIT_ROWS - 1).loadCell(0, new import_CellData.CellData()).getAsCharData();
          chData[1] = "b";
          buffer.lines.get(INIT_ROWS - 1).setCell(0, import_CellData.CellData.fromCharData(chData));
          buffer.resize(INIT_COLS, INIT_ROWS - 5);
          import_chai.assert.equal(buffer.lines.get(0).loadCell(0, new import_CellData.CellData()).getAsCharData()[1], "a");
          import_chai.assert.equal(buffer.lines.get(INIT_ROWS - 1 - 5).loadCell(0, new import_CellData.CellData()).getAsCharData()[1], "b");
        });
      });
    });
    describe("row size increased", () => {
      describe("empty buffer", () => {
        it("should add blank lines to end", () => {
          buffer.fillViewportRows();
          import_chai.assert.equal(buffer.ydisp, 0);
          buffer.resize(INIT_COLS, INIT_ROWS + 10);
          import_chai.assert.equal(buffer.ydisp, 0);
          import_chai.assert.equal(buffer.lines.length, INIT_ROWS + 10);
        });
      });
      describe("filled buffer", () => {
        it("should show more of the buffer above", () => {
          buffer.fillViewportRows();
          for (let i = 0; i < 10; i++) {
            buffer.lines.push(buffer.getBlankLine(import_BufferLine.DEFAULT_ATTR_DATA));
          }
          buffer.y = INIT_ROWS - 1;
          buffer.ybase = 10;
          buffer.ydisp = 10;
          import_chai.assert.equal(buffer.lines.length, INIT_ROWS + 10);
          buffer.resize(INIT_COLS, INIT_ROWS + 5);
          import_chai.assert.equal(buffer.ydisp, 5);
          import_chai.assert.equal(buffer.ybase, 5);
          import_chai.assert.equal(buffer.lines.length, INIT_ROWS + 10);
        });
        it("should show more of the buffer below when the viewport is at the top of the buffer", () => {
          buffer.fillViewportRows();
          for (let i = 0; i < 10; i++) {
            buffer.lines.push(buffer.getBlankLine(import_BufferLine.DEFAULT_ATTR_DATA));
          }
          buffer.y = INIT_ROWS - 1;
          buffer.ybase = 10;
          buffer.ydisp = 0;
          import_chai.assert.equal(buffer.lines.length, INIT_ROWS + 10);
          buffer.resize(INIT_COLS, INIT_ROWS + 5);
          import_chai.assert.equal(buffer.ydisp, 0);
          import_chai.assert.equal(buffer.ybase, 5);
          import_chai.assert.equal(buffer.lines.length, INIT_ROWS + 10);
        });
      });
    });
    describe("row and column increased", () => {
      it("should resize properly", () => {
        buffer.fillViewportRows();
        buffer.resize(INIT_COLS + 5, INIT_ROWS + 5);
        import_chai.assert.equal(buffer.lines.length, INIT_ROWS + 5);
        for (let i = 0; i < INIT_ROWS + 5; i++) {
          import_chai.assert.equal(buffer.lines.get(i).length, INIT_COLS + 5);
        }
      });
    });
    describe("reflow", () => {
      it("should not wrap empty lines", () => {
        buffer.fillViewportRows();
        import_chai.assert.equal(buffer.lines.length, INIT_ROWS);
        buffer.resize(INIT_COLS - 5, INIT_ROWS);
        import_chai.assert.equal(buffer.lines.length, INIT_ROWS);
      });
      it("should shrink row length", () => {
        buffer.fillViewportRows();
        buffer.resize(5, 10);
        import_chai.assert.equal(buffer.lines.length, 10);
        import_chai.assert.equal(buffer.lines.get(0).length, 5);
        import_chai.assert.equal(buffer.lines.get(1).length, 5);
        import_chai.assert.equal(buffer.lines.get(2).length, 5);
        import_chai.assert.equal(buffer.lines.get(3).length, 5);
        import_chai.assert.equal(buffer.lines.get(4).length, 5);
        import_chai.assert.equal(buffer.lines.get(5).length, 5);
        import_chai.assert.equal(buffer.lines.get(6).length, 5);
        import_chai.assert.equal(buffer.lines.get(7).length, 5);
        import_chai.assert.equal(buffer.lines.get(8).length, 5);
        import_chai.assert.equal(buffer.lines.get(9).length, 5);
      });
      it("should wrap and unwrap lines", () => {
        buffer.fillViewportRows();
        buffer.resize(5, 10);
        const firstLine = buffer.lines.get(0);
        for (let i = 0; i < 5; i++) {
          const code = "a".charCodeAt(0) + i;
          const char = String.fromCharCode(code);
          firstLine.set(i, [0, char, 1, code]);
        }
        buffer.y = 1;
        import_chai.assert.equal(buffer.lines.get(0).length, 5);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "abcde");
        buffer.resize(1, 10);
        import_chai.assert.equal(buffer.lines.length, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "a");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "b");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(), "c");
        import_chai.assert.equal(buffer.lines.get(3).translateToString(), "d");
        import_chai.assert.equal(buffer.lines.get(4).translateToString(), "e");
        import_chai.assert.equal(buffer.lines.get(5).translateToString(), " ");
        import_chai.assert.equal(buffer.lines.get(6).translateToString(), " ");
        import_chai.assert.equal(buffer.lines.get(7).translateToString(), " ");
        import_chai.assert.equal(buffer.lines.get(8).translateToString(), " ");
        import_chai.assert.equal(buffer.lines.get(9).translateToString(), " ");
        buffer.resize(5, 10);
        import_chai.assert.equal(buffer.lines.length, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "abcde");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "     ");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(), "     ");
        import_chai.assert.equal(buffer.lines.get(3).translateToString(), "     ");
        import_chai.assert.equal(buffer.lines.get(4).translateToString(), "     ");
        import_chai.assert.equal(buffer.lines.get(5).translateToString(), "     ");
        import_chai.assert.equal(buffer.lines.get(6).translateToString(), "     ");
        import_chai.assert.equal(buffer.lines.get(7).translateToString(), "     ");
        import_chai.assert.equal(buffer.lines.get(8).translateToString(), "     ");
        import_chai.assert.equal(buffer.lines.get(9).translateToString(), "     ");
      });
      it("should discard parts of wrapped lines that go out of the scrollback", () => {
        buffer.fillViewportRows();
        optionsService.options.scrollback = 1;
        buffer.resize(10, 5);
        const lastLine = buffer.lines.get(3);
        for (let i = 0; i < 10; i++) {
          const code = "a".charCodeAt(0) + i;
          const char = String.fromCharCode(code);
          lastLine.set(i, [0, char, 1, code]);
        }
        import_chai.assert.equal(buffer.lines.length, 5);
        buffer.y = 4;
        buffer.resize(2, 5);
        import_chai.assert.equal(buffer.y, 4);
        import_chai.assert.equal(buffer.ybase, 1);
        import_chai.assert.equal(buffer.lines.length, 6);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "ab");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "cd");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(), "ef");
        import_chai.assert.equal(buffer.lines.get(3).translateToString(), "gh");
        import_chai.assert.equal(buffer.lines.get(4).translateToString(), "ij");
        import_chai.assert.equal(buffer.lines.get(5).translateToString(), "  ");
        buffer.resize(1, 5);
        import_chai.assert.equal(buffer.y, 4);
        import_chai.assert.equal(buffer.ybase, 1);
        import_chai.assert.equal(buffer.lines.length, 6);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "f");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "g");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(), "h");
        import_chai.assert.equal(buffer.lines.get(3).translateToString(), "i");
        import_chai.assert.equal(buffer.lines.get(4).translateToString(), "j");
        import_chai.assert.equal(buffer.lines.get(5).translateToString(), " ");
        buffer.resize(10, 5);
        import_chai.assert.equal(buffer.y, 1);
        import_chai.assert.equal(buffer.ybase, 0);
        import_chai.assert.equal(buffer.lines.length, 5);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "fghij     ");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "          ");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(), "          ");
        import_chai.assert.equal(buffer.lines.get(3).translateToString(), "          ");
        import_chai.assert.equal(buffer.lines.get(4).translateToString(), "          ");
      });
      it("should remove the correct amount of rows when reflowing larger", () => {
        buffer.fillViewportRows();
        buffer.resize(10, 10);
        buffer.y = 2;
        const firstLine = buffer.lines.get(0);
        const secondLine = buffer.lines.get(1);
        for (let i = 0; i < 10; i++) {
          const code = "a".charCodeAt(0) + i;
          const char = String.fromCharCode(code);
          firstLine.set(i, [0, char, 1, code]);
        }
        for (let i = 0; i < 10; i++) {
          const code = "0".charCodeAt(0) + i;
          const char = String.fromCharCode(code);
          secondLine.set(i, [0, char, 1, code]);
        }
        import_chai.assert.equal(buffer.lines.length, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "abcdefghij");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "0123456789");
        for (let i = 2; i < 10; i++) {
          import_chai.assert.equal(buffer.lines.get(i).translateToString(), "          ");
        }
        buffer.resize(2, 10);
        import_chai.assert.equal(buffer.ybase, 1);
        import_chai.assert.equal(buffer.lines.length, 11);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "ab");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "cd");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(), "ef");
        import_chai.assert.equal(buffer.lines.get(3).translateToString(), "gh");
        import_chai.assert.equal(buffer.lines.get(4).translateToString(), "ij");
        import_chai.assert.equal(buffer.lines.get(5).translateToString(), "01");
        import_chai.assert.equal(buffer.lines.get(6).translateToString(), "23");
        import_chai.assert.equal(buffer.lines.get(7).translateToString(), "45");
        import_chai.assert.equal(buffer.lines.get(8).translateToString(), "67");
        import_chai.assert.equal(buffer.lines.get(9).translateToString(), "89");
        import_chai.assert.equal(buffer.lines.get(10).translateToString(), "  ");
        buffer.resize(10, 10);
        import_chai.assert.equal(buffer.ybase, 0);
        import_chai.assert.equal(buffer.lines.length, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "abcdefghij");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "0123456789");
        for (let i = 2; i < 10; i++) {
          import_chai.assert.equal(buffer.lines.get(i).translateToString(), "          ");
        }
      });
      it("should transfer combined char data over to reflowed lines", () => {
        buffer.fillViewportRows();
        buffer.resize(4, 3);
        buffer.y = 2;
        const firstLine = buffer.lines.get(0);
        firstLine.set(0, [0, "a", 1, "a".charCodeAt(0)]);
        firstLine.set(1, [0, "b", 1, "b".charCodeAt(0)]);
        firstLine.set(2, [0, "c", 1, "c".charCodeAt(0)]);
        firstLine.set(3, [0, "\u{1F601}", 1, "\u{1F601}".charCodeAt(0)]);
        import_chai.assert.equal(buffer.lines.length, 3);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "abc\u{1F601}");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "    ");
        buffer.resize(2, 3);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "ab");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "c\u{1F601}");
      });
      it("should adjust markers when reflowing", () => {
        buffer.fillViewportRows();
        buffer.resize(10, 16);
        for (let i = 0; i < 10; i++) {
          const code = "a".charCodeAt(0) + i;
          const char = String.fromCharCode(code);
          buffer.lines.get(0).set(i, [0, char, 1, code]);
        }
        for (let i = 0; i < 10; i++) {
          const code = "0".charCodeAt(0) + i;
          const char = String.fromCharCode(code);
          buffer.lines.get(1).set(i, [0, char, 1, code]);
        }
        for (let i = 0; i < 10; i++) {
          const code = "k".charCodeAt(0) + i;
          const char = String.fromCharCode(code);
          buffer.lines.get(2).set(i, [0, char, 1, code]);
        }
        buffer.y = 3;
        const firstMarker = buffer.addMarker(0);
        const secondMarker = buffer.addMarker(1);
        const thirdMarker = buffer.addMarker(2);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "abcdefghij");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "0123456789");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(), "klmnopqrst");
        import_chai.assert.equal(firstMarker.line, 0);
        import_chai.assert.equal(secondMarker.line, 1);
        import_chai.assert.equal(thirdMarker.line, 2);
        buffer.resize(2, 16);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "ab");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "cd");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(), "ef");
        import_chai.assert.equal(buffer.lines.get(3).translateToString(), "gh");
        import_chai.assert.equal(buffer.lines.get(4).translateToString(), "ij");
        import_chai.assert.equal(buffer.lines.get(5).translateToString(), "01");
        import_chai.assert.equal(buffer.lines.get(6).translateToString(), "23");
        import_chai.assert.equal(buffer.lines.get(7).translateToString(), "45");
        import_chai.assert.equal(buffer.lines.get(8).translateToString(), "67");
        import_chai.assert.equal(buffer.lines.get(9).translateToString(), "89");
        import_chai.assert.equal(buffer.lines.get(10).translateToString(), "kl");
        import_chai.assert.equal(buffer.lines.get(11).translateToString(), "mn");
        import_chai.assert.equal(buffer.lines.get(12).translateToString(), "op");
        import_chai.assert.equal(buffer.lines.get(13).translateToString(), "qr");
        import_chai.assert.equal(buffer.lines.get(14).translateToString(), "st");
        import_chai.assert.equal(firstMarker.line, 0, "first marker should remain unchanged");
        import_chai.assert.equal(secondMarker.line, 5, "second marker should be shifted since the first line wrapped");
        import_chai.assert.equal(thirdMarker.line, 10, "third marker should be shifted since the first and second lines wrapped");
        buffer.resize(10, 16);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "abcdefghij");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "0123456789");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(), "klmnopqrst");
        import_chai.assert.equal(firstMarker.line, 0, "first marker should remain unchanged");
        import_chai.assert.equal(secondMarker.line, 1, "second marker should be restored to it's original line");
        import_chai.assert.equal(thirdMarker.line, 2, "third marker should be restored to it's original line");
        import_chai.assert.equal(firstMarker.isDisposed, false);
        import_chai.assert.equal(secondMarker.isDisposed, false);
        import_chai.assert.equal(thirdMarker.isDisposed, false);
      });
      it("should dispose markers whose rows are trimmed during a reflow", () => {
        buffer.fillViewportRows();
        optionsService.options.scrollback = 1;
        buffer.resize(10, 11);
        for (let i = 0; i < 10; i++) {
          const code = "a".charCodeAt(0) + i;
          const char = String.fromCharCode(code);
          buffer.lines.get(0).set(i, [0, char, 1, code]);
        }
        for (let i = 0; i < 10; i++) {
          const code = "0".charCodeAt(0) + i;
          const char = String.fromCharCode(code);
          buffer.lines.get(1).set(i, [0, char, 1, code]);
        }
        for (let i = 0; i < 10; i++) {
          const code = "k".charCodeAt(0) + i;
          const char = String.fromCharCode(code);
          buffer.lines.get(2).set(i, [0, char, 1, code]);
        }
        buffer.y = 10;
        const firstMarker = buffer.addMarker(0);
        const secondMarker = buffer.addMarker(1);
        const thirdMarker = buffer.addMarker(2);
        buffer.y = 3;
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "abcdefghij");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "0123456789");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(), "klmnopqrst");
        import_chai.assert.equal(firstMarker.line, 0);
        import_chai.assert.equal(secondMarker.line, 1);
        import_chai.assert.equal(thirdMarker.line, 2);
        buffer.resize(2, 11);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "ij");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "01");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(), "23");
        import_chai.assert.equal(buffer.lines.get(3).translateToString(), "45");
        import_chai.assert.equal(buffer.lines.get(4).translateToString(), "67");
        import_chai.assert.equal(buffer.lines.get(5).translateToString(), "89");
        import_chai.assert.equal(buffer.lines.get(6).translateToString(), "kl");
        import_chai.assert.equal(buffer.lines.get(7).translateToString(), "mn");
        import_chai.assert.equal(buffer.lines.get(8).translateToString(), "op");
        import_chai.assert.equal(buffer.lines.get(9).translateToString(), "qr");
        import_chai.assert.equal(buffer.lines.get(10).translateToString(), "st");
        import_chai.assert.equal(secondMarker.line, 1, "second marker should remain the same as it was shifted 4 and trimmed 4");
        import_chai.assert.equal(thirdMarker.line, 6, "third marker should be shifted since the first and second lines wrapped");
        import_chai.assert.equal(firstMarker.isDisposed, true, "first marker was trimmed");
        import_chai.assert.equal(secondMarker.isDisposed, false);
        import_chai.assert.equal(thirdMarker.isDisposed, false);
        buffer.resize(10, 11);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(), "ij        ");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(), "0123456789");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(), "klmnopqrst");
        import_chai.assert.equal(secondMarker.line, 1, "second marker should be restored");
        import_chai.assert.equal(thirdMarker.line, 2, "third marker should be restored");
      });
      it("should correctly reflow wrapped lines that end in 0 space (via tab char)", () => {
        buffer.fillViewportRows();
        buffer.resize(4, 10);
        buffer.y = 2;
        buffer.lines.get(0).set(0, [0, "a", 1, "a".charCodeAt(0)]);
        buffer.lines.get(0).set(1, [0, "b", 1, "b".charCodeAt(0)]);
        buffer.lines.get(1).set(0, [0, "c", 1, "c".charCodeAt(0)]);
        buffer.lines.get(1).set(1, [0, "d", 1, "d".charCodeAt(0)]);
        buffer.lines.get(1).isWrapped = true;
        buffer.resize(5, 10);
        import_chai.assert.equal(buffer.ybase, 0);
        import_chai.assert.equal(buffer.lines.length, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(true), "ab  c");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(false), "d    ");
        buffer.resize(6, 10);
        import_chai.assert.equal(buffer.ybase, 0);
        import_chai.assert.equal(buffer.lines.length, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(true), "ab  cd");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(false), "      ");
      });
      it("should wrap wide characters correctly when reflowing larger", () => {
        buffer.fillViewportRows();
        buffer.resize(12, 10);
        buffer.y = 2;
        for (let i = 0; i < 12; i += 4) {
          buffer.lines.get(0).set(i, [0, "\u6C49", 2, "\u6C49".charCodeAt(0)]);
          buffer.lines.get(1).set(i, [0, "\u6C49", 2, "\u6C49".charCodeAt(0)]);
        }
        for (let i = 2; i < 12; i += 4) {
          buffer.lines.get(0).set(i, [0, "\u8BED", 2, "\u8BED".charCodeAt(0)]);
          buffer.lines.get(1).set(i, [0, "\u8BED", 2, "\u8BED".charCodeAt(0)]);
        }
        for (let i = 1; i < 12; i += 2) {
          buffer.lines.get(0).set(i, [0, "", 0, 0]);
          buffer.lines.get(1).set(i, [0, "", 0, 0]);
        }
        buffer.lines.get(1).isWrapped = true;
        import_chai.assert.equal(buffer.lines.get(0).translateToString(true), "\u6C49\u8BED\u6C49\u8BED\u6C49\u8BED");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(true), "\u6C49\u8BED\u6C49\u8BED\u6C49\u8BED");
        buffer.resize(13, 10);
        import_chai.assert.equal(buffer.ybase, 0);
        import_chai.assert.equal(buffer.lines.length, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(true), "\u6C49\u8BED\u6C49\u8BED\u6C49\u8BED");
        import_chai.assert.equal(buffer.lines.get(0).translateToString(false), "\u6C49\u8BED\u6C49\u8BED\u6C49\u8BED ");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(true), "\u6C49\u8BED\u6C49\u8BED\u6C49\u8BED");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(false), "\u6C49\u8BED\u6C49\u8BED\u6C49\u8BED ");
        buffer.resize(14, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(true), "\u6C49\u8BED\u6C49\u8BED\u6C49\u8BED\u6C49");
        import_chai.assert.equal(buffer.lines.get(0).translateToString(false), "\u6C49\u8BED\u6C49\u8BED\u6C49\u8BED\u6C49");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(true), "\u8BED\u6C49\u8BED\u6C49\u8BED");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(false), "\u8BED\u6C49\u8BED\u6C49\u8BED    ");
      });
      it("should correctly reflow wrapped lines that end in 0 space (via tab char)", () => {
        buffer.fillViewportRows();
        buffer.resize(4, 10);
        buffer.y = 2;
        buffer.lines.get(0).set(0, [0, "a", 1, "a".charCodeAt(0)]);
        buffer.lines.get(0).set(1, [0, "b", 1, "b".charCodeAt(0)]);
        buffer.lines.get(1).set(0, [0, "c", 1, "c".charCodeAt(0)]);
        buffer.lines.get(1).set(1, [0, "d", 1, "d".charCodeAt(0)]);
        buffer.lines.get(1).isWrapped = true;
        buffer.resize(3, 10);
        import_chai.assert.equal(buffer.y, 2);
        import_chai.assert.equal(buffer.ybase, 0);
        import_chai.assert.equal(buffer.lines.length, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(false), "ab ");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(false), " cd");
        buffer.resize(2, 10);
        import_chai.assert.equal(buffer.y, 3);
        import_chai.assert.equal(buffer.ybase, 0);
        import_chai.assert.equal(buffer.lines.length, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(false), "ab");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(false), "  ");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(false), "cd");
      });
      it("should wrap wide characters correctly when reflowing smaller", () => {
        buffer.fillViewportRows();
        buffer.resize(12, 10);
        buffer.y = 2;
        for (let i = 0; i < 12; i += 4) {
          buffer.lines.get(0).set(i, [0, "\u6C49", 2, "\u6C49".charCodeAt(0)]);
          buffer.lines.get(1).set(i, [0, "\u6C49", 2, "\u6C49".charCodeAt(0)]);
        }
        for (let i = 2; i < 12; i += 4) {
          buffer.lines.get(0).set(i, [0, "\u8BED", 2, "\u8BED".charCodeAt(0)]);
          buffer.lines.get(1).set(i, [0, "\u8BED", 2, "\u8BED".charCodeAt(0)]);
        }
        for (let i = 1; i < 12; i += 2) {
          buffer.lines.get(0).set(i, [0, "", 0, 0]);
          buffer.lines.get(1).set(i, [0, "", 0, 0]);
        }
        buffer.lines.get(1).isWrapped = true;
        import_chai.assert.equal(buffer.lines.get(0).translateToString(true), "\u6C49\u8BED\u6C49\u8BED\u6C49\u8BED");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(true), "\u6C49\u8BED\u6C49\u8BED\u6C49\u8BED");
        buffer.resize(11, 10);
        import_chai.assert.equal(buffer.ybase, 0);
        import_chai.assert.equal(buffer.lines.length, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(true), "\u6C49\u8BED\u6C49\u8BED\u6C49");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(true), "\u8BED\u6C49\u8BED\u6C49\u8BED");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(true), "\u6C49\u8BED");
        buffer.resize(10, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(true), "\u6C49\u8BED\u6C49\u8BED\u6C49");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(true), "\u8BED\u6C49\u8BED\u6C49\u8BED");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(true), "\u6C49\u8BED");
        buffer.resize(9, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(true), "\u6C49\u8BED\u6C49\u8BED");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(true), "\u6C49\u8BED\u6C49\u8BED");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(true), "\u6C49\u8BED\u6C49\u8BED");
        buffer.resize(8, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(true), "\u6C49\u8BED\u6C49\u8BED");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(true), "\u6C49\u8BED\u6C49\u8BED");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(true), "\u6C49\u8BED\u6C49\u8BED");
        buffer.resize(7, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(true), "\u6C49\u8BED\u6C49");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(true), "\u8BED\u6C49\u8BED");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(true), "\u6C49\u8BED\u6C49");
        import_chai.assert.equal(buffer.lines.get(3).translateToString(true), "\u8BED\u6C49\u8BED");
        buffer.resize(6, 10);
        import_chai.assert.equal(buffer.lines.get(0).translateToString(true), "\u6C49\u8BED\u6C49");
        import_chai.assert.equal(buffer.lines.get(1).translateToString(true), "\u8BED\u6C49\u8BED");
        import_chai.assert.equal(buffer.lines.get(2).translateToString(true), "\u6C49\u8BED\u6C49");
        import_chai.assert.equal(buffer.lines.get(3).translateToString(true), "\u8BED\u6C49\u8BED");
      });
      describe("reflowLarger cases", () => {
        beforeEach(() => {
          buffer.fillViewportRows();
          buffer.resize(2, 10);
          buffer.lines.get(0).set(0, [0, "a", 1, "a".charCodeAt(0)]);
          buffer.lines.get(0).set(1, [0, "b", 1, "b".charCodeAt(0)]);
          buffer.lines.get(1).set(0, [0, "c", 1, "c".charCodeAt(0)]);
          buffer.lines.get(1).set(1, [0, "d", 1, "d".charCodeAt(0)]);
          buffer.lines.get(1).isWrapped = true;
          buffer.lines.get(2).set(0, [0, "e", 1, "e".charCodeAt(0)]);
          buffer.lines.get(2).set(1, [0, "f", 1, "f".charCodeAt(0)]);
          buffer.lines.get(3).set(0, [0, "g", 1, "g".charCodeAt(0)]);
          buffer.lines.get(3).set(1, [0, "h", 1, "h".charCodeAt(0)]);
          buffer.lines.get(3).isWrapped = true;
          buffer.lines.get(4).set(0, [0, "i", 1, "i".charCodeAt(0)]);
          buffer.lines.get(4).set(1, [0, "j", 1, "j".charCodeAt(0)]);
          buffer.lines.get(5).set(0, [0, "k", 1, "k".charCodeAt(0)]);
          buffer.lines.get(5).set(1, [0, "l", 1, "l".charCodeAt(0)]);
          buffer.lines.get(5).isWrapped = true;
        });
        describe("viewport not yet filled", () => {
          it("should move the cursor up and add empty lines", () => {
            buffer.y = 6;
            buffer.resize(4, 10);
            import_chai.assert.equal(buffer.y, 3);
            import_chai.assert.equal(buffer.ydisp, 0);
            import_chai.assert.equal(buffer.ybase, 0);
            import_chai.assert.equal(buffer.lines.length, 10);
            import_chai.assert.equal(buffer.lines.get(0).translateToString(), "abcd");
            import_chai.assert.equal(buffer.lines.get(1).translateToString(), "efgh");
            import_chai.assert.equal(buffer.lines.get(2).translateToString(), "ijkl");
            for (let i = 3; i < 10; i++) {
              import_chai.assert.equal(buffer.lines.get(i).translateToString(), "    ");
            }
            const wrappedLines = [];
            for (let i = 0; i < buffer.lines.length; i++) {
              import_chai.assert.equal(buffer.lines.get(i).isWrapped, wrappedLines.includes(i), `line ${i} isWrapped must equal ${wrappedLines.includes(i)}`);
            }
          });
        });
        describe("viewport filled, scrollback remaining", () => {
          beforeEach(() => {
            buffer.y = 9;
          });
          describe("ybase === 0", () => {
            it("should move the cursor up and add empty lines", () => {
              buffer.resize(4, 10);
              import_chai.assert.equal(buffer.y, 6);
              import_chai.assert.equal(buffer.ydisp, 0);
              import_chai.assert.equal(buffer.ybase, 0);
              import_chai.assert.equal(buffer.lines.length, 10);
              import_chai.assert.equal(buffer.lines.get(0).translateToString(), "abcd");
              import_chai.assert.equal(buffer.lines.get(1).translateToString(), "efgh");
              import_chai.assert.equal(buffer.lines.get(2).translateToString(), "ijkl");
              for (let i = 3; i < 10; i++) {
                import_chai.assert.equal(buffer.lines.get(i).translateToString(), "    ");
              }
              const wrappedLines = [];
              for (let i = 0; i < buffer.lines.length; i++) {
                import_chai.assert.equal(buffer.lines.get(i).isWrapped, wrappedLines.includes(i), `line ${i} isWrapped must equal ${wrappedLines.includes(i)}`);
              }
            });
          });
          describe("ybase !== 0", () => {
            beforeEach(() => {
              for (let i = 0; i < 10; i++) {
                buffer.lines.splice(0, 0, buffer.getBlankLine(import_BufferLine.DEFAULT_ATTR_DATA));
              }
              buffer.ybase = 10;
            });
            describe("&& ydisp === ybase", () => {
              it("should adjust the viewport and keep ydisp = ybase", () => {
                buffer.ydisp = 10;
                buffer.resize(4, 10);
                import_chai.assert.equal(buffer.y, 9);
                import_chai.assert.equal(buffer.ydisp, 7);
                import_chai.assert.equal(buffer.ybase, 7);
                import_chai.assert.equal(buffer.lines.length, 17);
                for (let i = 0; i < 10; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "    ");
                }
                import_chai.assert.equal(buffer.lines.get(10).translateToString(), "abcd");
                import_chai.assert.equal(buffer.lines.get(11).translateToString(), "efgh");
                import_chai.assert.equal(buffer.lines.get(12).translateToString(), "ijkl");
                for (let i = 13; i < 17; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "    ");
                }
                const wrappedLines = [];
                for (let i = 0; i < buffer.lines.length; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).isWrapped, wrappedLines.includes(i), `line ${i} isWrapped must equal ${wrappedLines.includes(i)}`);
                }
              });
            });
            describe("&& ydisp !== ybase", () => {
              it("should keep ydisp at the same value", () => {
                buffer.ydisp = 5;
                buffer.resize(4, 10);
                import_chai.assert.equal(buffer.y, 9);
                import_chai.assert.equal(buffer.ydisp, 5);
                import_chai.assert.equal(buffer.ybase, 7);
                import_chai.assert.equal(buffer.lines.length, 17);
                for (let i = 0; i < 10; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "    ");
                }
                import_chai.assert.equal(buffer.lines.get(10).translateToString(), "abcd");
                import_chai.assert.equal(buffer.lines.get(11).translateToString(), "efgh");
                import_chai.assert.equal(buffer.lines.get(12).translateToString(), "ijkl");
                for (let i = 13; i < 17; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "    ");
                }
                const wrappedLines = [];
                for (let i = 0; i < buffer.lines.length; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).isWrapped, wrappedLines.includes(i), `line ${i} isWrapped must equal ${wrappedLines.includes(i)}`);
                }
              });
            });
          });
        });
        describe("viewport filled, no scrollback remaining", () => {
          describe("ybase !== 0", () => {
            beforeEach(() => {
              optionsService.options.scrollback = 10;
              for (let i = 0; i < 10; i++) {
                buffer.lines.splice(0, 0, buffer.getBlankLine(import_BufferLine.DEFAULT_ATTR_DATA));
              }
              buffer.y = 9;
              buffer.ybase = 10;
            });
            describe("&& ydisp === ybase", () => {
              it("should trim lines and keep ydisp = ybase", () => {
                buffer.ydisp = 10;
                buffer.resize(4, 10);
                import_chai.assert.equal(buffer.y, 9);
                import_chai.assert.equal(buffer.ydisp, 7);
                import_chai.assert.equal(buffer.ybase, 7);
                import_chai.assert.equal(buffer.lines.length, 17);
                for (let i = 0; i < 10; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "    ");
                }
                import_chai.assert.equal(buffer.lines.get(10).translateToString(), "abcd");
                import_chai.assert.equal(buffer.lines.get(11).translateToString(), "efgh");
                import_chai.assert.equal(buffer.lines.get(12).translateToString(), "ijkl");
                for (let i = 13; i < 17; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "    ");
                }
                const wrappedLines = [];
                for (let i = 0; i < buffer.lines.length; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).isWrapped, wrappedLines.includes(i), `line ${i} isWrapped must equal ${wrappedLines.includes(i)}`);
                }
              });
            });
            describe("&& ydisp !== ybase", () => {
              it("should trim lines and not change ydisp", () => {
                buffer.ydisp = 5;
                buffer.resize(4, 10);
                import_chai.assert.equal(buffer.y, 9);
                import_chai.assert.equal(buffer.ydisp, 5);
                import_chai.assert.equal(buffer.ybase, 7);
                import_chai.assert.equal(buffer.lines.length, 17);
                for (let i = 0; i < 10; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "    ");
                }
                import_chai.assert.equal(buffer.lines.get(10).translateToString(), "abcd");
                import_chai.assert.equal(buffer.lines.get(11).translateToString(), "efgh");
                import_chai.assert.equal(buffer.lines.get(12).translateToString(), "ijkl");
                for (let i = 13; i < 17; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "    ");
                }
                const wrappedLines = [];
                for (let i = 0; i < buffer.lines.length; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).isWrapped, wrappedLines.includes(i), `line ${i} isWrapped must equal ${wrappedLines.includes(i)}`);
                }
              });
            });
          });
        });
      });
      describe("reflowSmaller cases", () => {
        beforeEach(() => {
          buffer.fillViewportRows();
          buffer.resize(4, 10);
          buffer.lines.get(0).set(0, [0, "a", 1, "a".charCodeAt(0)]);
          buffer.lines.get(0).set(1, [0, "b", 1, "b".charCodeAt(0)]);
          buffer.lines.get(0).set(2, [0, "c", 1, "c".charCodeAt(0)]);
          buffer.lines.get(0).set(3, [0, "d", 1, "d".charCodeAt(0)]);
          buffer.lines.get(1).set(0, [0, "e", 1, "e".charCodeAt(0)]);
          buffer.lines.get(1).set(1, [0, "f", 1, "f".charCodeAt(0)]);
          buffer.lines.get(1).set(2, [0, "g", 1, "g".charCodeAt(0)]);
          buffer.lines.get(1).set(3, [0, "h", 1, "h".charCodeAt(0)]);
          buffer.lines.get(2).set(0, [0, "i", 1, "i".charCodeAt(0)]);
          buffer.lines.get(2).set(1, [0, "j", 1, "j".charCodeAt(0)]);
          buffer.lines.get(2).set(2, [0, "k", 1, "k".charCodeAt(0)]);
          buffer.lines.get(2).set(3, [0, "l", 1, "l".charCodeAt(0)]);
        });
        describe("viewport not yet filled", () => {
          it("should move the cursor down", () => {
            buffer.y = 3;
            buffer.resize(2, 10);
            import_chai.assert.equal(buffer.y, 6);
            import_chai.assert.equal(buffer.ydisp, 0);
            import_chai.assert.equal(buffer.ybase, 0);
            import_chai.assert.equal(buffer.lines.length, 10);
            import_chai.assert.equal(buffer.lines.get(0).translateToString(), "ab");
            import_chai.assert.equal(buffer.lines.get(1).translateToString(), "cd");
            import_chai.assert.equal(buffer.lines.get(2).translateToString(), "ef");
            import_chai.assert.equal(buffer.lines.get(3).translateToString(), "gh");
            import_chai.assert.equal(buffer.lines.get(4).translateToString(), "ij");
            import_chai.assert.equal(buffer.lines.get(5).translateToString(), "kl");
            for (let i = 6; i < 10; i++) {
              import_chai.assert.equal(buffer.lines.get(i).translateToString(), "  ");
            }
            const wrappedLines = [1, 3, 5];
            for (let i = 0; i < buffer.lines.length; i++) {
              import_chai.assert.equal(buffer.lines.get(i).isWrapped, wrappedLines.includes(i), `line ${i} isWrapped must equal ${wrappedLines.includes(i)}`);
            }
          });
        });
        describe("viewport filled, scrollback remaining", () => {
          beforeEach(() => {
            buffer.y = 9;
          });
          describe("ybase === 0", () => {
            it("should trim the top", () => {
              buffer.resize(2, 10);
              import_chai.assert.equal(buffer.y, 9);
              import_chai.assert.equal(buffer.ydisp, 3);
              import_chai.assert.equal(buffer.ybase, 3);
              import_chai.assert.equal(buffer.lines.length, 13);
              import_chai.assert.equal(buffer.lines.get(0).translateToString(), "ab");
              import_chai.assert.equal(buffer.lines.get(1).translateToString(), "cd");
              import_chai.assert.equal(buffer.lines.get(2).translateToString(), "ef");
              import_chai.assert.equal(buffer.lines.get(3).translateToString(), "gh");
              import_chai.assert.equal(buffer.lines.get(4).translateToString(), "ij");
              import_chai.assert.equal(buffer.lines.get(5).translateToString(), "kl");
              for (let i = 6; i < 13; i++) {
                import_chai.assert.equal(buffer.lines.get(i).translateToString(), "  ");
              }
              const wrappedLines = [1, 3, 5];
              for (let i = 0; i < buffer.lines.length; i++) {
                import_chai.assert.equal(buffer.lines.get(i).isWrapped, wrappedLines.includes(i), `line ${i} isWrapped must equal ${wrappedLines.includes(i)}`);
              }
            });
          });
          describe("ybase !== 0", () => {
            beforeEach(() => {
              for (let i = 0; i < 10; i++) {
                buffer.lines.splice(0, 0, buffer.getBlankLine(import_BufferLine.DEFAULT_ATTR_DATA));
              }
              buffer.ybase = 10;
            });
            describe("&& ydisp === ybase", () => {
              it("should adjust the viewport and keep ydisp = ybase", () => {
                buffer.ydisp = 10;
                buffer.resize(2, 10);
                import_chai.assert.equal(buffer.ydisp, 13);
                import_chai.assert.equal(buffer.ybase, 13);
                import_chai.assert.equal(buffer.lines.length, 23);
                for (let i = 0; i < 10; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "  ");
                }
                import_chai.assert.equal(buffer.lines.get(10).translateToString(), "ab");
                import_chai.assert.equal(buffer.lines.get(11).translateToString(), "cd");
                import_chai.assert.equal(buffer.lines.get(12).translateToString(), "ef");
                import_chai.assert.equal(buffer.lines.get(13).translateToString(), "gh");
                import_chai.assert.equal(buffer.lines.get(14).translateToString(), "ij");
                import_chai.assert.equal(buffer.lines.get(15).translateToString(), "kl");
                for (let i = 16; i < 23; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "  ");
                }
                const wrappedLines = [11, 13, 15];
                for (let i = 0; i < buffer.lines.length; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).isWrapped, wrappedLines.includes(i), `line ${i} isWrapped must equal ${wrappedLines.includes(i)}`);
                }
              });
            });
            describe("&& ydisp !== ybase", () => {
              it("should keep ydisp at the same value", () => {
                buffer.ydisp = 5;
                buffer.resize(2, 10);
                import_chai.assert.equal(buffer.ydisp, 5);
                import_chai.assert.equal(buffer.ybase, 13);
                import_chai.assert.equal(buffer.lines.length, 23);
                for (let i = 0; i < 10; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "  ");
                }
                import_chai.assert.equal(buffer.lines.get(10).translateToString(), "ab");
                import_chai.assert.equal(buffer.lines.get(11).translateToString(), "cd");
                import_chai.assert.equal(buffer.lines.get(12).translateToString(), "ef");
                import_chai.assert.equal(buffer.lines.get(13).translateToString(), "gh");
                import_chai.assert.equal(buffer.lines.get(14).translateToString(), "ij");
                import_chai.assert.equal(buffer.lines.get(15).translateToString(), "kl");
                for (let i = 16; i < 23; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "  ");
                }
                const wrappedLines = [11, 13, 15];
                for (let i = 0; i < buffer.lines.length; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).isWrapped, wrappedLines.includes(i), `line ${i} isWrapped must equal ${wrappedLines.includes(i)}`);
                }
              });
            });
          });
        });
        describe("viewport filled, no scrollback remaining", () => {
          describe("ybase !== 0", () => {
            beforeEach(() => {
              optionsService.options.scrollback = 10;
              for (let i = 0; i < 10; i++) {
                buffer.lines.splice(0, 0, buffer.getBlankLine(import_BufferLine.DEFAULT_ATTR_DATA));
              }
              buffer.ybase = 10;
            });
            describe("&& ydisp === ybase", () => {
              it("should trim lines and keep ydisp = ybase", () => {
                buffer.ydisp = 10;
                buffer.y = 13;
                buffer.resize(2, 10);
                import_chai.assert.equal(buffer.ydisp, 10);
                import_chai.assert.equal(buffer.ybase, 10);
                import_chai.assert.equal(buffer.lines.length, 20);
                for (let i = 0; i < 7; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "  ");
                }
                import_chai.assert.equal(buffer.lines.get(7).translateToString(), "ab");
                import_chai.assert.equal(buffer.lines.get(8).translateToString(), "cd");
                import_chai.assert.equal(buffer.lines.get(9).translateToString(), "ef");
                import_chai.assert.equal(buffer.lines.get(10).translateToString(), "gh");
                import_chai.assert.equal(buffer.lines.get(11).translateToString(), "ij");
                import_chai.assert.equal(buffer.lines.get(12).translateToString(), "kl");
                for (let i = 13; i < 20; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "  ");
                }
                const wrappedLines = [8, 10, 12];
                for (let i = 0; i < buffer.lines.length; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).isWrapped, wrappedLines.includes(i), `line ${i} isWrapped must equal ${wrappedLines.includes(i)}`);
                }
              });
            });
            describe("&& ydisp !== ybase", () => {
              it("should trim lines and not change ydisp", () => {
                buffer.ydisp = 5;
                buffer.y = 13;
                buffer.resize(2, 10);
                import_chai.assert.equal(buffer.ydisp, 5);
                import_chai.assert.equal(buffer.ybase, 10);
                import_chai.assert.equal(buffer.lines.length, 20);
                for (let i = 0; i < 7; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "  ");
                }
                import_chai.assert.equal(buffer.lines.get(7).translateToString(), "ab");
                import_chai.assert.equal(buffer.lines.get(8).translateToString(), "cd");
                import_chai.assert.equal(buffer.lines.get(9).translateToString(), "ef");
                import_chai.assert.equal(buffer.lines.get(10).translateToString(), "gh");
                import_chai.assert.equal(buffer.lines.get(11).translateToString(), "ij");
                import_chai.assert.equal(buffer.lines.get(12).translateToString(), "kl");
                for (let i = 13; i < 20; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).translateToString(), "  ");
                }
                const wrappedLines = [8, 10, 12];
                for (let i = 0; i < buffer.lines.length; i++) {
                  import_chai.assert.equal(buffer.lines.get(i).isWrapped, wrappedLines.includes(i), `line ${i} isWrapped must equal ${wrappedLines.includes(i)}`);
                }
              });
            });
          });
        });
      });
    });
  });
  describe("buffer marked to have no scrollback", () => {
    it("should always have a scrollback of 0", () => {
      buffer = new import_Buffer.Buffer(false, new import_TestUtils.MockOptionsService({ scrollback: 1e3 }), bufferService);
      buffer.fillViewportRows();
      import_chai.assert.equal(buffer.lines.maxLength, INIT_ROWS);
      buffer.resize(INIT_COLS, INIT_ROWS * 2);
      import_chai.assert.equal(buffer.lines.maxLength, INIT_ROWS * 2);
      buffer.resize(INIT_COLS, INIT_ROWS / 2);
      import_chai.assert.equal(buffer.lines.maxLength, INIT_ROWS / 2);
    });
  });
  describe("addMarker", () => {
    it("should adjust a marker line when the buffer is trimmed", () => {
      buffer = new import_Buffer.Buffer(true, new import_TestUtils.MockOptionsService({ scrollback: 0 }), bufferService);
      buffer.fillViewportRows();
      const marker = buffer.addMarker(buffer.lines.length - 1);
      import_chai.assert.equal(marker.line, buffer.lines.length - 1);
      buffer.lines.onTrimEmitter.fire(1);
      import_chai.assert.equal(marker.line, buffer.lines.length - 2);
    });
    it("should dispose of a marker if it is trimmed off the buffer", () => {
      buffer = new import_Buffer.Buffer(true, new import_TestUtils.MockOptionsService({ scrollback: 0 }), bufferService);
      buffer.fillViewportRows();
      import_chai.assert.equal(buffer.markers.length, 0);
      const marker = buffer.addMarker(0);
      import_chai.assert.equal(marker.isDisposed, false);
      import_chai.assert.equal(buffer.markers.length, 1);
      buffer.lines.onTrimEmitter.fire(1);
      import_chai.assert.equal(marker.isDisposed, true);
      import_chai.assert.equal(buffer.markers.length, 0);
    });
    it("should call onDispose", () => {
      const eventStack = [];
      buffer = new import_Buffer.Buffer(true, new import_TestUtils.MockOptionsService({ scrollback: 0 }), bufferService);
      buffer.fillViewportRows();
      import_chai.assert.equal(buffer.markers.length, 0);
      const marker = buffer.addMarker(0);
      marker.onDispose(() => eventStack.push("disposed"));
      import_chai.assert.equal(marker.isDisposed, false);
      import_chai.assert.equal(buffer.markers.length, 1);
      buffer.lines.onTrimEmitter.fire(1);
      import_chai.assert.equal(marker.isDisposed, true);
      import_chai.assert.equal(buffer.markers.length, 0);
      import_chai.assert.deepEqual(eventStack, ["disposed"]);
    });
  });
  describe("translateBufferLineToString", () => {
    it("should handle selecting a section of ascii text", () => {
      const line = new import_BufferLine.BufferLine(4);
      line.setCell(0, import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]));
      line.setCell(1, import_CellData.CellData.fromCharData([0, "b", 1, "b".charCodeAt(0)]));
      line.setCell(2, import_CellData.CellData.fromCharData([0, "c", 1, "c".charCodeAt(0)]));
      line.setCell(3, import_CellData.CellData.fromCharData([0, "d", 1, "d".charCodeAt(0)]));
      buffer.lines.set(0, line);
      const str = buffer.translateBufferLineToString(0, true, 0, 2);
      import_chai.assert.equal(str, "ab");
    });
    it("should handle a cut-off double width character by including it", () => {
      const line = new import_BufferLine.BufferLine(3);
      line.setCell(0, import_CellData.CellData.fromCharData([0, "\u8A9E", 2, 35486]));
      line.setCell(1, import_CellData.CellData.fromCharData([0, "", 0, 0]));
      line.setCell(2, import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]));
      buffer.lines.set(0, line);
      const str1 = buffer.translateBufferLineToString(0, true, 0, 1);
      import_chai.assert.equal(str1, "\u8A9E");
    });
    it("should handle a zero width character in the middle of the string by not including it", () => {
      const line = new import_BufferLine.BufferLine(3);
      line.setCell(0, import_CellData.CellData.fromCharData([0, "\u8A9E", 2, "\u8A9E".charCodeAt(0)]));
      line.setCell(1, import_CellData.CellData.fromCharData([0, "", 0, 0]));
      line.setCell(2, import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]));
      buffer.lines.set(0, line);
      const str0 = buffer.translateBufferLineToString(0, true, 0, 1);
      import_chai.assert.equal(str0, "\u8A9E");
      const str1 = buffer.translateBufferLineToString(0, true, 0, 2);
      import_chai.assert.equal(str1, "\u8A9E");
      const str2 = buffer.translateBufferLineToString(0, true, 0, 3);
      import_chai.assert.equal(str2, "\u8A9Ea");
    });
    it("should handle single width emojis", () => {
      const line = new import_BufferLine.BufferLine(2);
      line.setCell(0, import_CellData.CellData.fromCharData([0, "\u{1F601}", 1, "\u{1F601}".charCodeAt(0)]));
      line.setCell(1, import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]));
      buffer.lines.set(0, line);
      const str1 = buffer.translateBufferLineToString(0, true, 0, 1);
      import_chai.assert.equal(str1, "\u{1F601}");
      const str2 = buffer.translateBufferLineToString(0, true, 0, 2);
      import_chai.assert.equal(str2, "\u{1F601}a");
    });
    it("should handle double width emojis", () => {
      const line = new import_BufferLine.BufferLine(2);
      line.setCell(0, import_CellData.CellData.fromCharData([0, "\u{1F601}", 2, "\u{1F601}".charCodeAt(0)]));
      line.setCell(1, import_CellData.CellData.fromCharData([0, "", 0, 0]));
      buffer.lines.set(0, line);
      const str1 = buffer.translateBufferLineToString(0, true, 0, 1);
      import_chai.assert.equal(str1, "\u{1F601}");
      const str2 = buffer.translateBufferLineToString(0, true, 0, 2);
      import_chai.assert.equal(str2, "\u{1F601}");
      const line2 = new import_BufferLine.BufferLine(3);
      line2.setCell(0, import_CellData.CellData.fromCharData([0, "\u{1F601}", 2, "\u{1F601}".charCodeAt(0)]));
      line2.setCell(1, import_CellData.CellData.fromCharData([0, "", 0, 0]));
      line2.setCell(2, import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]));
      buffer.lines.set(0, line2);
      const str3 = buffer.translateBufferLineToString(0, true, 0, 3);
      import_chai.assert.equal(str3, "\u{1F601}a");
    });
  });
  describe("memory cleanup after shrinking", () => {
    it("should realign memory from idle task execution", async () => {
      buffer.fillViewportRows();
      buffer.resize(INIT_COLS / 2 - 1, INIT_ROWS);
      for (let i = 0; i < INIT_ROWS; i++) {
        const line = buffer.lines.get(i);
        import_chai.assert.equal(line._data.buffer.byteLength, INIT_COLS * 3 * 4);
        import_chai.assert.equal(line._data.length, (INIT_COLS / 2 - 1) * 3);
        import_chai.assert.equal(line.length, INIT_COLS / 2 - 1);
      }
      await new Promise((r) => setTimeout(r, 30));
      for (let i = 0; i < INIT_ROWS; i++) {
        const line = buffer.lines.get(i);
        import_chai.assert.equal(line._data.buffer.byteLength, (INIT_COLS / 2 - 1) * 3 * 4);
      }
    });
  });
});
//# sourceMappingURL=Buffer.test.js.map
