"use strict";
var import_Constants = require("common/buffer/Constants");
var import_BufferLine = require("common/buffer//BufferLine");
var import_CellData = require("common/buffer/CellData");
var import_chai = require("chai");
var import_AttributeData = require("common/buffer/AttributeData");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class TestBufferLine extends import_BufferLine.BufferLine {
  get combined() {
    return this._combined;
  }
  toArray() {
    const result = [];
    for (let i = 0; i < this.length; ++i) {
      result.push(this.loadCell(i, new import_CellData.CellData()).getAsCharData());
    }
    return result;
  }
}
describe("AttributeData", () => {
  describe("extended attributes", () => {
    it("hasExtendedAttrs", () => {
      const attrs = new import_AttributeData.AttributeData();
      import_chai.assert.equal(!!attrs.hasExtendedAttrs(), false);
      attrs.bg |= import_Constants.BgFlags.HAS_EXTENDED;
      import_chai.assert.equal(!!attrs.hasExtendedAttrs(), true);
    });
    it("getUnderlineColor - P256", () => {
      const attrs = new import_AttributeData.AttributeData();
      attrs.extended.underlineColor = import_Constants.Attributes.CM_P256 | 45;
      import_chai.assert.equal(attrs.getUnderlineColor(), -1);
      attrs.bg |= import_Constants.BgFlags.HAS_EXTENDED;
      import_chai.assert.equal(attrs.getUnderlineColor(), 45);
      attrs.extended.underlineColor = 0;
      attrs.fg |= import_Constants.Attributes.CM_P256 | 123;
      import_chai.assert.equal(attrs.getUnderlineColor(), 123);
    });
    it("getUnderlineColor - RGB", () => {
      const attrs = new import_AttributeData.AttributeData();
      attrs.extended.underlineColor = import_Constants.Attributes.CM_RGB | 1 << 16 | 2 << 8 | 3;
      import_chai.assert.equal(attrs.getUnderlineColor(), -1);
      attrs.bg |= import_Constants.BgFlags.HAS_EXTENDED;
      import_chai.assert.equal(attrs.getUnderlineColor(), 1 << 16 | 2 << 8 | 3);
      attrs.extended.underlineColor = 0;
      attrs.fg |= import_Constants.Attributes.CM_P256 | 123;
      import_chai.assert.equal(attrs.getUnderlineColor(), 123);
    });
    it("getUnderlineColorMode / isUnderlineColorRGB / isUnderlineColorPalette / isUnderlineColorDefault", () => {
      const attrs = new import_AttributeData.AttributeData();
      for (const mode of [import_Constants.Attributes.CM_DEFAULT, import_Constants.Attributes.CM_P16, import_Constants.Attributes.CM_P256, import_Constants.Attributes.CM_RGB]) {
        attrs.extended.underlineColor = mode;
        import_chai.assert.equal(attrs.getUnderlineColorMode(), attrs.getFgColorMode());
        import_chai.assert.equal(attrs.isUnderlineColorDefault(), true);
      }
      attrs.fg = import_Constants.Attributes.CM_RGB;
      for (const mode of [import_Constants.Attributes.CM_DEFAULT, import_Constants.Attributes.CM_P16, import_Constants.Attributes.CM_P256, import_Constants.Attributes.CM_RGB]) {
        attrs.extended.underlineColor = mode;
        import_chai.assert.equal(attrs.getUnderlineColorMode(), attrs.getFgColorMode());
        import_chai.assert.equal(attrs.isUnderlineColorDefault(), false);
        import_chai.assert.equal(attrs.isUnderlineColorRGB(), true);
      }
      attrs.bg |= import_Constants.BgFlags.HAS_EXTENDED;
      attrs.extended.underlineColor = import_Constants.Attributes.CM_DEFAULT;
      import_chai.assert.equal(attrs.getUnderlineColorMode(), import_Constants.Attributes.CM_DEFAULT);
      attrs.extended.underlineColor = import_Constants.Attributes.CM_P16;
      import_chai.assert.equal(attrs.getUnderlineColorMode(), import_Constants.Attributes.CM_P16);
      import_chai.assert.equal(attrs.isUnderlineColorPalette(), true);
      attrs.extended.underlineColor = import_Constants.Attributes.CM_P256;
      import_chai.assert.equal(attrs.getUnderlineColorMode(), import_Constants.Attributes.CM_P256);
      import_chai.assert.equal(attrs.isUnderlineColorPalette(), true);
      attrs.extended.underlineColor = import_Constants.Attributes.CM_RGB;
      import_chai.assert.equal(attrs.getUnderlineColorMode(), import_Constants.Attributes.CM_RGB);
      import_chai.assert.equal(attrs.isUnderlineColorRGB(), true);
    });
    it("getUnderlineStyle", () => {
      const attrs = new import_AttributeData.AttributeData();
      import_chai.assert.equal(attrs.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
      attrs.extended.underlineStyle = import_Constants.UnderlineStyle.CURLY;
      import_chai.assert.equal(attrs.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
      attrs.fg |= import_Constants.FgFlags.UNDERLINE;
      import_chai.assert.equal(attrs.getUnderlineStyle(), import_Constants.UnderlineStyle.SINGLE);
      attrs.bg |= import_Constants.BgFlags.HAS_EXTENDED;
      import_chai.assert.equal(attrs.getUnderlineStyle(), import_Constants.UnderlineStyle.CURLY);
      attrs.fg &= ~import_Constants.FgFlags.UNDERLINE;
      import_chai.assert.equal(attrs.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
    });
    it("getUnderlineVariantOffset", () => {
      const attrs = new import_AttributeData.AttributeData();
      import_chai.assert.equal(attrs.getUnderlineVariantOffset(), 0);
      for (let i = 0; i < 8; ++i) {
        attrs.extended.underlineVariantOffset = i;
        import_chai.assert.equal(attrs.getUnderlineVariantOffset(), i);
      }
    });
  });
});
describe("CellData", () => {
  it("CharData <--> CellData equality", () => {
    const cell = new import_CellData.CellData();
    cell.setFromCharData([123, "a", 1, "a".charCodeAt(0)]);
    import_chai.assert.deepEqual(cell.getAsCharData(), [123, "a", 1, "a".charCodeAt(0)]);
    import_chai.assert.equal(cell.isCombined(), 0);
    cell.setFromCharData([123, "e\u0301", 1, "\u0301".charCodeAt(0)]);
    import_chai.assert.deepEqual(cell.getAsCharData(), [123, "e\u0301", 1, "\u0301".charCodeAt(0)]);
    import_chai.assert.equal(cell.isCombined(), import_Constants.Content.IS_COMBINED_MASK);
    cell.setFromCharData([123, "\u{1D11E}", 1, 119070]);
    import_chai.assert.deepEqual(cell.getAsCharData(), [123, "\u{1D11E}", 1, 119070]);
    import_chai.assert.equal(cell.isCombined(), 0);
    cell.setFromCharData([123, "\u{13080}\u0301", 1, "\u{13080}\u0301".charCodeAt(2)]);
    import_chai.assert.deepEqual(cell.getAsCharData(), [123, "\u{13080}\u0301", 1, "\u{13080}\u0301".charCodeAt(2)]);
    import_chai.assert.equal(cell.isCombined(), import_Constants.Content.IS_COMBINED_MASK);
    cell.setFromCharData([123, "\uFF11", 2, "\uFF11".charCodeAt(0)]);
    import_chai.assert.deepEqual(cell.getAsCharData(), [123, "\uFF11", 2, "\uFF11".charCodeAt(0)]);
    import_chai.assert.equal(cell.isCombined(), 0);
  });
});
describe("BufferLine", function() {
  it("ctor", function() {
    let line = new TestBufferLine(0);
    import_chai.assert.equal(line.length, 0);
    import_chai.assert.equal(line.isWrapped, false);
    line = new TestBufferLine(10);
    import_chai.assert.equal(line.length, 10);
    import_chai.assert.deepEqual(line.loadCell(0, new import_CellData.CellData()).getAsCharData(), [0, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]);
    import_chai.assert.equal(line.isWrapped, false);
    line = new TestBufferLine(10, void 0, true);
    import_chai.assert.equal(line.length, 10);
    import_chai.assert.deepEqual(line.loadCell(0, new import_CellData.CellData()).getAsCharData(), [0, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]);
    import_chai.assert.equal(line.isWrapped, true);
    line = new TestBufferLine(10, import_CellData.CellData.fromCharData([123, "a", 456, "a".charCodeAt(0)]), true);
    import_chai.assert.equal(line.length, 10);
    import_chai.assert.deepEqual(line.loadCell(0, new import_CellData.CellData()).getAsCharData(), [123, "a", 456, "a".charCodeAt(0)]);
    import_chai.assert.equal(line.isWrapped, true);
  });
  it("insertCells", function() {
    const line = new TestBufferLine(3);
    line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]));
    line.setCell(1, import_CellData.CellData.fromCharData([2, "b", 0, "b".charCodeAt(0)]));
    line.setCell(2, import_CellData.CellData.fromCharData([3, "c", 0, "c".charCodeAt(0)]));
    line.insertCells(1, 3, import_CellData.CellData.fromCharData([4, "d", 0, "d".charCodeAt(0)]));
    import_chai.assert.deepEqual(line.toArray(), [
      [1, "a", 0, "a".charCodeAt(0)],
      [4, "d", 0, "d".charCodeAt(0)],
      [4, "d", 0, "d".charCodeAt(0)]
    ]);
  });
  it("deleteCells", function() {
    const line = new TestBufferLine(5);
    line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]));
    line.setCell(1, import_CellData.CellData.fromCharData([2, "b", 0, "b".charCodeAt(0)]));
    line.setCell(2, import_CellData.CellData.fromCharData([3, "c", 0, "c".charCodeAt(0)]));
    line.setCell(3, import_CellData.CellData.fromCharData([4, "d", 0, "d".charCodeAt(0)]));
    line.setCell(4, import_CellData.CellData.fromCharData([5, "e", 0, "e".charCodeAt(0)]));
    line.deleteCells(1, 2, import_CellData.CellData.fromCharData([6, "f", 0, "f".charCodeAt(0)]));
    import_chai.assert.deepEqual(line.toArray(), [
      [1, "a", 0, "a".charCodeAt(0)],
      [4, "d", 0, "d".charCodeAt(0)],
      [5, "e", 0, "e".charCodeAt(0)],
      [6, "f", 0, "f".charCodeAt(0)],
      [6, "f", 0, "f".charCodeAt(0)]
    ]);
  });
  it("replaceCells", function() {
    const line = new TestBufferLine(5);
    line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]));
    line.setCell(1, import_CellData.CellData.fromCharData([2, "b", 0, "b".charCodeAt(0)]));
    line.setCell(2, import_CellData.CellData.fromCharData([3, "c", 0, "c".charCodeAt(0)]));
    line.setCell(3, import_CellData.CellData.fromCharData([4, "d", 0, "d".charCodeAt(0)]));
    line.setCell(4, import_CellData.CellData.fromCharData([5, "e", 0, "e".charCodeAt(0)]));
    line.replaceCells(2, 4, import_CellData.CellData.fromCharData([6, "f", 0, "f".charCodeAt(0)]));
    import_chai.assert.deepEqual(line.toArray(), [
      [1, "a", 0, "a".charCodeAt(0)],
      [2, "b", 0, "b".charCodeAt(0)],
      [6, "f", 0, "f".charCodeAt(0)],
      [6, "f", 0, "f".charCodeAt(0)],
      [5, "e", 0, "e".charCodeAt(0)]
    ]);
  });
  it("fill", function() {
    const line = new TestBufferLine(5);
    line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]));
    line.setCell(1, import_CellData.CellData.fromCharData([2, "b", 0, "b".charCodeAt(0)]));
    line.setCell(2, import_CellData.CellData.fromCharData([3, "c", 0, "c".charCodeAt(0)]));
    line.setCell(3, import_CellData.CellData.fromCharData([4, "d", 0, "d".charCodeAt(0)]));
    line.setCell(4, import_CellData.CellData.fromCharData([5, "e", 0, "e".charCodeAt(0)]));
    line.fill(import_CellData.CellData.fromCharData([123, "z", 0, "z".charCodeAt(0)]));
    import_chai.assert.deepEqual(line.toArray(), [
      [123, "z", 0, "z".charCodeAt(0)],
      [123, "z", 0, "z".charCodeAt(0)],
      [123, "z", 0, "z".charCodeAt(0)],
      [123, "z", 0, "z".charCodeAt(0)],
      [123, "z", 0, "z".charCodeAt(0)]
    ]);
  });
  it("clone", function() {
    const line = new TestBufferLine(5, void 0, true);
    line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]));
    line.setCell(1, import_CellData.CellData.fromCharData([2, "b", 0, "b".charCodeAt(0)]));
    line.setCell(2, import_CellData.CellData.fromCharData([3, "c", 0, "c".charCodeAt(0)]));
    line.setCell(3, import_CellData.CellData.fromCharData([4, "d", 0, "d".charCodeAt(0)]));
    line.setCell(4, import_CellData.CellData.fromCharData([5, "e", 0, "e".charCodeAt(0)]));
    const line2 = line.clone();
    import_chai.assert.deepEqual(TestBufferLine.prototype.toArray.apply(line2), line.toArray());
    import_chai.assert.equal(line2.length, line.length);
    import_chai.assert.equal(line2.isWrapped, line.isWrapped);
  });
  it("copyFrom", function() {
    const line = new TestBufferLine(5);
    line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]));
    line.setCell(1, import_CellData.CellData.fromCharData([2, "b", 0, "b".charCodeAt(0)]));
    line.setCell(2, import_CellData.CellData.fromCharData([3, "c", 0, "c".charCodeAt(0)]));
    line.setCell(3, import_CellData.CellData.fromCharData([4, "d", 0, "d".charCodeAt(0)]));
    line.setCell(4, import_CellData.CellData.fromCharData([5, "e", 0, "e".charCodeAt(0)]));
    const line2 = new TestBufferLine(5, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]), true);
    line2.copyFrom(line);
    import_chai.assert.deepEqual(line2.toArray(), line.toArray());
    import_chai.assert.equal(line2.length, line.length);
    import_chai.assert.equal(line2.isWrapped, line.isWrapped);
  });
  it("should support combining chars", function() {
    const line = new TestBufferLine(2, import_CellData.CellData.fromCharData([1, "e\u0301", 0, "\u0301".charCodeAt(0)]));
    import_chai.assert.deepEqual(line.toArray(), [[1, "e\u0301", 0, "\u0301".charCodeAt(0)], [1, "e\u0301", 0, "\u0301".charCodeAt(0)]]);
    const line2 = new TestBufferLine(5, import_CellData.CellData.fromCharData([1, "a", 0, "\u0301".charCodeAt(0)]), true);
    line2.copyFrom(line);
    import_chai.assert.deepEqual(line2.toArray(), line.toArray());
    const line3 = line.clone();
    import_chai.assert.deepEqual(TestBufferLine.prototype.toArray.apply(line3), line.toArray());
  });
  describe("resize", function() {
    it("enlarge(false)", function() {
      const line = new TestBufferLine(5, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]), false);
      line.resize(10, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]));
      import_chai.assert.deepEqual(line.toArray(), Array(10).fill([1, "a", 0, "a".charCodeAt(0)]));
    });
    it("enlarge(true)", function() {
      const line = new TestBufferLine(5, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]), false);
      line.resize(10, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]));
      import_chai.assert.deepEqual(line.toArray(), Array(10).fill([1, "a", 0, "a".charCodeAt(0)]));
    });
    it("shrink(true) - should apply new size", function() {
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]), false);
      line.resize(5, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]));
      import_chai.assert.deepEqual(line.toArray(), Array(5).fill([1, "a", 0, "a".charCodeAt(0)]));
    });
    it("shrink to 0 length", function() {
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]), false);
      line.resize(0, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]));
      import_chai.assert.deepEqual(line.toArray(), Array(0).fill([1, "a", 0, "a".charCodeAt(0)]));
    });
    it("should remove combining data on replaced cells after shrinking then enlarging", () => {
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]), false);
      line.set(2, [0, "\u{1F601}", 1, "\u{1F601}".charCodeAt(0)]);
      line.set(9, [0, "\u{1F601}", 1, "\u{1F601}".charCodeAt(0)]);
      import_chai.assert.equal(line.translateToString(), "aa\u{1F601}aaaaaa\u{1F601}");
      import_chai.assert.equal(Object.keys(line.combined).length, 2);
      line.resize(5, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), "aa\u{1F601}aa");
      line.resize(10, import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), "aa\u{1F601}aaaaaaa");
      import_chai.assert.equal(Object.keys(line.combined).length, 1);
    });
  });
  describe("getTrimLength", function() {
    it("empty line", function() {
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]), false);
      import_chai.assert.equal(line.getTrimmedLength(), 0);
    });
    it("ASCII", function() {
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]), false);
      line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      line.setCell(2, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.getTrimmedLength(), 3);
    });
    it("surrogate", function() {
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]), false);
      line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      line.setCell(2, import_CellData.CellData.fromCharData([1, "\u{1D11E}", 1, "\u{1D11E}".charCodeAt(0)]));
      import_chai.assert.equal(line.getTrimmedLength(), 3);
    });
    it("combining", function() {
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]), false);
      line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      line.setCell(2, import_CellData.CellData.fromCharData([1, "e\u0301", 1, "\u0301".charCodeAt(0)]));
      import_chai.assert.equal(line.getTrimmedLength(), 3);
    });
    it("fullwidth", function() {
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]), false);
      line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      line.setCell(2, import_CellData.CellData.fromCharData([1, "\uFF11", 2, "\uFF11".charCodeAt(0)]));
      line.setCell(3, import_CellData.CellData.fromCharData([0, "", 0, 0]));
      import_chai.assert.equal(line.getTrimmedLength(), 4);
    });
  });
  describe("translateToString with and w'o trimming", function() {
    it("empty line", function() {
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]), false);
      const columns = [];
      import_chai.assert.equal(line.translateToString(false, void 0, void 0, columns), "          ");
      import_chai.assert.deepEqual(columns, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      import_chai.assert.equal(line.translateToString(true, void 0, void 0, columns), "");
      import_chai.assert.deepEqual(columns, [0]);
    });
    it("ASCII", function() {
      const columns = [];
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]), false);
      line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      line.setCell(2, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      line.setCell(4, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      line.setCell(5, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(false, void 0, void 0, columns), "a a aa    ");
      import_chai.assert.deepEqual(columns, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      import_chai.assert.equal(line.translateToString(true, void 0, void 0, columns), "a a aa");
      import_chai.assert.deepEqual(columns, [0, 1, 2, 3, 4, 5, 6]);
      for (const trimRight of [true, false]) {
        import_chai.assert.equal(line.translateToString(trimRight, 0, 5, columns), "a a a");
        import_chai.assert.deepEqual(columns, [0, 1, 2, 3, 4, 5]);
        import_chai.assert.equal(line.translateToString(trimRight, 0, 4, columns), "a a ");
        import_chai.assert.deepEqual(columns, [0, 1, 2, 3, 4]);
        import_chai.assert.equal(line.translateToString(trimRight, 0, 3, columns), "a a");
        import_chai.assert.deepEqual(columns, [0, 1, 2, 3]);
      }
    });
    it("surrogate", function() {
      const columns = [];
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]), false);
      line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      line.setCell(2, import_CellData.CellData.fromCharData([1, "\u{1D11E}", 1, "\u{1D11E}".charCodeAt(0)]));
      line.setCell(4, import_CellData.CellData.fromCharData([1, "\u{1D11E}", 1, "\u{1D11E}".charCodeAt(0)]));
      line.setCell(5, import_CellData.CellData.fromCharData([1, "\u{1D11E}", 1, "\u{1D11E}".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(false, void 0, void 0, columns), "a \u{1D11E} \u{1D11E}\u{1D11E}    ");
      import_chai.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10]);
      import_chai.assert.equal(line.translateToString(true, void 0, void 0, columns), "a \u{1D11E} \u{1D11E}\u{1D11E}");
      import_chai.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4, 4, 5, 5, 6]);
      for (const trimRight of [true, false]) {
        import_chai.assert.equal(line.translateToString(trimRight, 0, 5, columns), "a \u{1D11E} \u{1D11E}");
        import_chai.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4, 4, 5]);
        import_chai.assert.equal(line.translateToString(trimRight, 0, 4, columns), "a \u{1D11E} ");
        import_chai.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4]);
        import_chai.assert.equal(line.translateToString(trimRight, 0, 3, columns), "a \u{1D11E}");
        import_chai.assert.deepEqual(columns, [0, 1, 2, 2, 3]);
      }
    });
    it("combining", function() {
      const columns = [];
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]), false);
      line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      line.setCell(2, import_CellData.CellData.fromCharData([1, "e\u0301", 1, "\u0301".charCodeAt(0)]));
      line.setCell(4, import_CellData.CellData.fromCharData([1, "e\u0301", 1, "\u0301".charCodeAt(0)]));
      line.setCell(5, import_CellData.CellData.fromCharData([1, "e\u0301", 1, "\u0301".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(false, void 0, void 0, columns), "a e\u0301 e\u0301e\u0301    ");
      import_chai.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10]);
      import_chai.assert.equal(line.translateToString(true, void 0, void 0, columns), "a e\u0301 e\u0301e\u0301");
      import_chai.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4, 4, 5, 5, 6]);
      for (const trimRight of [true, false]) {
        import_chai.assert.equal(line.translateToString(trimRight, 0, 5, columns), "a e\u0301 e\u0301");
        import_chai.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4, 4, 5]);
        import_chai.assert.equal(line.translateToString(trimRight, 0, 4, columns), "a e\u0301 ");
        import_chai.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4]);
        import_chai.assert.equal(line.translateToString(trimRight, 0, 3, columns), "a e\u0301");
        import_chai.assert.deepEqual(columns, [0, 1, 2, 2, 3]);
      }
    });
    it("fullwidth", function() {
      const columns = [];
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]), false);
      line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      line.setCell(2, import_CellData.CellData.fromCharData([1, "\uFF11", 2, "\uFF11".charCodeAt(0)]));
      line.setCell(3, import_CellData.CellData.fromCharData([0, "", 0, 0]));
      line.setCell(5, import_CellData.CellData.fromCharData([1, "\uFF11", 2, "\uFF11".charCodeAt(0)]));
      line.setCell(6, import_CellData.CellData.fromCharData([0, "", 0, 0]));
      line.setCell(7, import_CellData.CellData.fromCharData([1, "\uFF11", 2, "\uFF11".charCodeAt(0)]));
      line.setCell(8, import_CellData.CellData.fromCharData([0, "", 0, 0]));
      import_chai.assert.equal(line.translateToString(false, void 0, void 0, columns), "a \uFF11 \uFF11\uFF11 ");
      import_chai.assert.deepEqual(columns, [0, 1, 2, 4, 5, 7, 9, 10]);
      import_chai.assert.equal(line.translateToString(true, void 0, void 0, columns), "a \uFF11 \uFF11\uFF11");
      import_chai.assert.deepEqual(columns, [0, 1, 2, 4, 5, 7, 9]);
      for (const trimRight of [true, false]) {
        import_chai.assert.equal(line.translateToString(trimRight, 0, 7, columns), "a \uFF11 \uFF11");
        import_chai.assert.deepEqual(columns, [0, 1, 2, 4, 5, 7]);
        import_chai.assert.equal(line.translateToString(trimRight, 0, 6, columns), "a \uFF11 \uFF11");
        import_chai.assert.deepEqual(columns, [0, 1, 2, 4, 5, 7]);
        import_chai.assert.equal(line.translateToString(trimRight, 0, 5, columns), "a \uFF11 ");
        import_chai.assert.deepEqual(columns, [0, 1, 2, 4, 5]);
        import_chai.assert.equal(line.translateToString(trimRight, 0, 4, columns), "a \uFF11");
        import_chai.assert.deepEqual(columns, [0, 1, 2, 4]);
        import_chai.assert.equal(line.translateToString(trimRight, 0, 3, columns), "a \uFF11");
        import_chai.assert.deepEqual(columns, [0, 1, 2, 4]);
        import_chai.assert.equal(line.translateToString(trimRight, 0, 2, columns), "a ");
        import_chai.assert.deepEqual(columns, [0, 1, 2]);
      }
    });
    it("space at end", function() {
      const columns = [];
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]), false);
      line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      line.setCell(2, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      line.setCell(4, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      line.setCell(5, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      line.setCell(6, import_CellData.CellData.fromCharData([1, " ", 1, " ".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(false, void 0, void 0, columns), "a a aa    ");
      import_chai.assert.deepEqual(columns, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      import_chai.assert.equal(line.translateToString(true, void 0, void 0, columns), "a a aa ");
      import_chai.assert.deepEqual(columns, [0, 1, 2, 3, 4, 5, 6, 7]);
    });
    it("should always return some sane value", function() {
      const columns = [];
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      import_chai.assert.equal(line.translateToString(false, void 0, void 0, columns), "          ");
      import_chai.assert.deepEqual(columns, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      import_chai.assert.equal(line.translateToString(true, void 0, void 0, columns), "");
      import_chai.assert.deepEqual(columns, [0]);
    });
    it("should work with endCol=0", () => {
      const columns = [];
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      line.setCell(0, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(true, 0, 0, columns), "");
      import_chai.assert.deepEqual(columns, [0]);
    });
  });
  describe("addCharToCell", () => {
    it("should set width to 1 for empty cell", () => {
      const line = new TestBufferLine(3, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]), false);
      line.addCodepointToCell(0, "\u0301".charCodeAt(0), 0);
      const cell = line.loadCell(0, new import_CellData.CellData());
      import_chai.assert.deepEqual(cell.getAsCharData(), [import_Constants.DEFAULT_ATTR, "\u0301", 1, 769]);
      import_chai.assert.equal(cell.isCombined(), 0);
    });
    it("should add char to combining string in cell", () => {
      const line = new TestBufferLine(3, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]), false);
      const cell = line.loadCell(0, new import_CellData.CellData());
      cell.setFromCharData([123, "e\u0301", 1, "e\u0301".charCodeAt(1)]);
      line.setCell(0, cell);
      line.addCodepointToCell(0, "\u0301".charCodeAt(0), 0);
      line.loadCell(0, cell);
      import_chai.assert.deepEqual(cell.getAsCharData(), [123, "e\u0301\u0301", 1, 769]);
      import_chai.assert.equal(cell.isCombined(), import_Constants.Content.IS_COMBINED_MASK);
    });
    it("should create combining string on taken cell", () => {
      const line = new TestBufferLine(3, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]), false);
      const cell = line.loadCell(0, new import_CellData.CellData());
      cell.setFromCharData([123, "e", 1, "e".charCodeAt(1)]);
      line.setCell(0, cell);
      line.addCodepointToCell(0, "\u0301".charCodeAt(0), 0);
      line.loadCell(0, cell);
      import_chai.assert.deepEqual(cell.getAsCharData(), [123, "e\u0301", 1, 769]);
      import_chai.assert.equal(cell.isCombined(), import_Constants.Content.IS_COMBINED_MASK);
    });
  });
  describe("correct fullwidth handling", () => {
    function populate(line) {
      const cell = import_CellData.CellData.fromCharData([1, "\uFFE5", 2, "\uFFE5".charCodeAt(0)]);
      for (let i = 0; i < line.length; i += 2) {
        line.setCell(i, cell);
      }
    }
    it("insert - wide char at pos", () => {
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.insertCells(9, 1, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), "\uFFE5\uFFE5\uFFE5\uFFE5 a");
      line.insertCells(8, 1, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), "\uFFE5\uFFE5\uFFE5\uFFE5a ");
      line.insertCells(1, 1, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), " a \uFFE5\uFFE5\uFFE5a");
    });
    it("insert - wide char at end", () => {
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.insertCells(0, 3, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), "aaa\uFFE5\uFFE5\uFFE5 ");
      line.insertCells(4, 1, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), "aaa a \uFFE5\uFFE5");
      line.insertCells(4, 1, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), "aaa aa \uFFE5 ");
    });
    it("delete", () => {
      const line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.deleteCells(0, 1, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), " \uFFE5\uFFE5\uFFE5\uFFE5a");
      line.deleteCells(5, 2, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), " \uFFE5\uFFE5\uFFE5aaa");
      line.deleteCells(0, 2, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), " \uFFE5\uFFE5aaaaa");
    });
    it("replace - start at 0", () => {
      let line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.replaceCells(0, 1, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), "a \uFFE5\uFFE5\uFFE5\uFFE5");
      line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.replaceCells(0, 2, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), "aa\uFFE5\uFFE5\uFFE5\uFFE5");
      line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.replaceCells(0, 3, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), "aaa \uFFE5\uFFE5\uFFE5");
      line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.replaceCells(0, 8, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), "aaaaaaaa\uFFE5");
      line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.replaceCells(0, 9, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), "aaaaaaaaa ");
      line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.replaceCells(0, 10, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), "aaaaaaaaaa");
    });
    it("replace - start at 1", () => {
      let line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.replaceCells(1, 2, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), " a\uFFE5\uFFE5\uFFE5\uFFE5");
      line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.replaceCells(1, 3, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), " aa \uFFE5\uFFE5\uFFE5");
      line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.replaceCells(1, 4, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), " aaa\uFFE5\uFFE5\uFFE5");
      line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.replaceCells(1, 8, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), " aaaaaaa\uFFE5");
      line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.replaceCells(1, 9, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), " aaaaaaaa ");
      line = new TestBufferLine(10, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, 0, import_Constants.NULL_CELL_CODE]), false);
      populate(line);
      line.replaceCells(1, 10, import_CellData.CellData.fromCharData([1, "a", 1, "a".charCodeAt(0)]));
      import_chai.assert.equal(line.translateToString(), " aaaaaaaaa");
    });
  });
  describe("extended attributes", () => {
    it("setCells", function() {
      const line = new TestBufferLine(5);
      const cell = import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]);
      line.setCell(0, cell);
      cell.extended.underlineStyle = import_Constants.UnderlineStyle.CURLY;
      cell.bg |= import_Constants.BgFlags.HAS_EXTENDED;
      line.setCell(1, cell);
      cell.content = 65;
      line.setCell(2, cell);
      cell.extended = cell.extended.clone();
      cell.extended.underlineStyle = import_Constants.UnderlineStyle.DOTTED;
      line.setCell(3, cell);
      cell.bg &= ~import_Constants.BgFlags.HAS_EXTENDED;
      line.setCell(4, cell);
      import_chai.assert.deepEqual(line.toArray(), [
        [1, "a", 0, "a".charCodeAt(0)],
        [1, "a", 0, "a".charCodeAt(0)],
        [1, "A", 0, "A".charCodeAt(0)],
        [1, "A", 0, "A".charCodeAt(0)],
        [1, "A", 0, "A".charCodeAt(0)]
      ]);
      import_chai.assert.equal(line._extendedAttrs[0], void 0);
      import_chai.assert.equal(line._extendedAttrs[1].underlineStyle, import_Constants.UnderlineStyle.CURLY);
      import_chai.assert.equal(line._extendedAttrs[2].underlineStyle, import_Constants.UnderlineStyle.CURLY);
      import_chai.assert.equal(line._extendedAttrs[3].underlineStyle, import_Constants.UnderlineStyle.DOTTED);
      import_chai.assert.equal(line._extendedAttrs[4], void 0);
      import_chai.assert.equal(line._extendedAttrs[1], line._extendedAttrs[2]);
      import_chai.assert.notEqual(line._extendedAttrs[1], line._extendedAttrs[3]);
    });
    it("loadCell", () => {
      const line = new TestBufferLine(5);
      const cell = import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]);
      line.setCell(0, cell);
      cell.extended.underlineStyle = import_Constants.UnderlineStyle.CURLY;
      cell.bg |= import_Constants.BgFlags.HAS_EXTENDED;
      line.setCell(1, cell);
      cell.content = 65;
      line.setCell(2, cell);
      cell.extended = cell.extended.clone();
      cell.extended.underlineStyle = import_Constants.UnderlineStyle.DOTTED;
      line.setCell(3, cell);
      cell.bg &= ~import_Constants.BgFlags.HAS_EXTENDED;
      line.setCell(4, cell);
      const cell0 = new import_CellData.CellData();
      line.loadCell(0, cell0);
      const cell1 = new import_CellData.CellData();
      line.loadCell(1, cell1);
      const cell2 = new import_CellData.CellData();
      line.loadCell(2, cell2);
      const cell3 = new import_CellData.CellData();
      line.loadCell(3, cell3);
      const cell4 = new import_CellData.CellData();
      line.loadCell(4, cell4);
      import_chai.assert.equal(cell0.extended.underlineStyle, import_Constants.UnderlineStyle.NONE);
      import_chai.assert.equal(cell1.extended.underlineStyle, import_Constants.UnderlineStyle.CURLY);
      import_chai.assert.equal(cell2.extended.underlineStyle, import_Constants.UnderlineStyle.CURLY);
      import_chai.assert.equal(cell3.extended.underlineStyle, import_Constants.UnderlineStyle.DOTTED);
      import_chai.assert.equal(cell4.extended.underlineStyle, import_Constants.UnderlineStyle.NONE);
      import_chai.assert.equal(cell1.extended, cell2.extended);
      import_chai.assert.notEqual(cell2.extended, cell3.extended);
    });
    it("fill", () => {
      const line = new TestBufferLine(3);
      const cell = import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]);
      cell.extended.underlineStyle = import_Constants.UnderlineStyle.CURLY;
      cell.bg |= import_Constants.BgFlags.HAS_EXTENDED;
      line.fill(cell);
      import_chai.assert.equal(line._extendedAttrs[0].underlineStyle, import_Constants.UnderlineStyle.CURLY);
      import_chai.assert.equal(line._extendedAttrs[1].underlineStyle, import_Constants.UnderlineStyle.CURLY);
      import_chai.assert.equal(line._extendedAttrs[2].underlineStyle, import_Constants.UnderlineStyle.CURLY);
    });
    it("insertCells", () => {
      const line = new TestBufferLine(5);
      const cell = import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]);
      cell.extended.underlineStyle = import_Constants.UnderlineStyle.CURLY;
      cell.bg |= import_Constants.BgFlags.HAS_EXTENDED;
      line.insertCells(1, 3, cell);
      import_chai.assert.equal(line._extendedAttrs[1].underlineStyle, import_Constants.UnderlineStyle.CURLY);
      import_chai.assert.equal(line._extendedAttrs[2].underlineStyle, import_Constants.UnderlineStyle.CURLY);
      import_chai.assert.equal(line._extendedAttrs[3].underlineStyle, import_Constants.UnderlineStyle.CURLY);
      import_chai.assert.equal(line._extendedAttrs[4], void 0);
      cell.extended = cell.extended.clone();
      cell.extended.underlineStyle = import_Constants.UnderlineStyle.DOTTED;
      line.insertCells(2, 2, cell);
      import_chai.assert.equal(line._extendedAttrs[1].underlineStyle, import_Constants.UnderlineStyle.CURLY);
      import_chai.assert.equal(line._extendedAttrs[2].underlineStyle, import_Constants.UnderlineStyle.DOTTED);
      import_chai.assert.equal(line._extendedAttrs[3].underlineStyle, import_Constants.UnderlineStyle.DOTTED);
      import_chai.assert.equal(line._extendedAttrs[4].underlineStyle, import_Constants.UnderlineStyle.CURLY);
    });
    it("deleteCells", () => {
      const line = new TestBufferLine(5);
      const fillCell = import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]);
      fillCell.extended.underlineStyle = import_Constants.UnderlineStyle.CURLY;
      fillCell.bg |= import_Constants.BgFlags.HAS_EXTENDED;
      line.fill(fillCell);
      fillCell.extended = fillCell.extended.clone();
      fillCell.extended.underlineStyle = import_Constants.UnderlineStyle.DOUBLE;
      line.deleteCells(1, 3, fillCell);
      import_chai.assert.equal(line._extendedAttrs[0].underlineStyle, import_Constants.UnderlineStyle.CURLY);
      import_chai.assert.equal(line._extendedAttrs[1].underlineStyle, import_Constants.UnderlineStyle.CURLY);
      import_chai.assert.equal(line._extendedAttrs[2].underlineStyle, import_Constants.UnderlineStyle.DOUBLE);
      import_chai.assert.equal(line._extendedAttrs[3].underlineStyle, import_Constants.UnderlineStyle.DOUBLE);
      import_chai.assert.equal(line._extendedAttrs[4].underlineStyle, import_Constants.UnderlineStyle.DOUBLE);
    });
    it("replaceCells", () => {
      const line = new TestBufferLine(5);
      const fillCell = import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]);
      fillCell.extended.underlineStyle = import_Constants.UnderlineStyle.CURLY;
      fillCell.bg |= import_Constants.BgFlags.HAS_EXTENDED;
      line.fill(fillCell);
      fillCell.extended = fillCell.extended.clone();
      fillCell.extended.underlineStyle = import_Constants.UnderlineStyle.DOUBLE;
      line.replaceCells(1, 3, fillCell);
      import_chai.assert.equal(line._extendedAttrs[0].underlineStyle, import_Constants.UnderlineStyle.CURLY);
      import_chai.assert.equal(line._extendedAttrs[1].underlineStyle, import_Constants.UnderlineStyle.DOUBLE);
      import_chai.assert.equal(line._extendedAttrs[2].underlineStyle, import_Constants.UnderlineStyle.DOUBLE);
      import_chai.assert.equal(line._extendedAttrs[3].underlineStyle, import_Constants.UnderlineStyle.CURLY);
      import_chai.assert.equal(line._extendedAttrs[4].underlineStyle, import_Constants.UnderlineStyle.CURLY);
    });
    it("clone", () => {
      const line = new TestBufferLine(5);
      const cell = import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]);
      line.setCell(0, cell);
      cell.extended.underlineStyle = import_Constants.UnderlineStyle.CURLY;
      cell.bg |= import_Constants.BgFlags.HAS_EXTENDED;
      line.setCell(1, cell);
      cell.content = 65;
      line.setCell(2, cell);
      cell.extended = cell.extended.clone();
      cell.extended.underlineStyle = import_Constants.UnderlineStyle.DOTTED;
      line.setCell(3, cell);
      cell.bg &= ~import_Constants.BgFlags.HAS_EXTENDED;
      line.setCell(4, cell);
      const nLine = line.clone();
      import_chai.assert.equal(nLine._extendedAttrs[0], line._extendedAttrs[0]);
      import_chai.assert.equal(nLine._extendedAttrs[1], line._extendedAttrs[1]);
      import_chai.assert.equal(nLine._extendedAttrs[2], line._extendedAttrs[2]);
      import_chai.assert.equal(nLine._extendedAttrs[3], line._extendedAttrs[3]);
      import_chai.assert.equal(nLine._extendedAttrs[4], line._extendedAttrs[4]);
    });
    it("copyFrom", () => {
      const initial = new TestBufferLine(5);
      const cell = import_CellData.CellData.fromCharData([1, "a", 0, "a".charCodeAt(0)]);
      initial.setCell(0, cell);
      cell.extended.underlineStyle = import_Constants.UnderlineStyle.CURLY;
      cell.bg |= import_Constants.BgFlags.HAS_EXTENDED;
      initial.setCell(1, cell);
      cell.content = 65;
      initial.setCell(2, cell);
      cell.extended = cell.extended.clone();
      cell.extended.underlineStyle = import_Constants.UnderlineStyle.DOTTED;
      initial.setCell(3, cell);
      cell.bg &= ~import_Constants.BgFlags.HAS_EXTENDED;
      initial.setCell(4, cell);
      const line = new TestBufferLine(5);
      line.fill(import_CellData.CellData.fromCharData([1, "b", 0, "b".charCodeAt(0)]));
      line.copyFrom(initial);
      import_chai.assert.equal(line._extendedAttrs[0], initial._extendedAttrs[0]);
      import_chai.assert.equal(line._extendedAttrs[1], initial._extendedAttrs[1]);
      import_chai.assert.equal(line._extendedAttrs[2], initial._extendedAttrs[2]);
      import_chai.assert.equal(line._extendedAttrs[3], initial._extendedAttrs[3]);
      import_chai.assert.equal(line._extendedAttrs[4], initial._extendedAttrs[4]);
    });
  });
});
//# sourceMappingURL=BufferLine.test.js.map
