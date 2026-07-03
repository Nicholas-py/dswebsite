"use strict";
var import_chai = require("chai");
var import_BufferLine = require("common/buffer/BufferLine");
var import_Constants = require("common/buffer/Constants");
var import_BufferReflow = require("common/buffer/BufferReflow");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("BufferReflow", () => {
  describe("reflowSmallerGetNewLineLengths", () => {
    it("should return correct line lengths for a small line with wide characters", () => {
      const line = new import_BufferLine.BufferLine(4);
      line.set(0, [0, "\u6C49", 2, "\u6C49".charCodeAt(0)]);
      line.set(1, [0, "", 0, 0]);
      line.set(2, [0, "\u8BED", 2, "\u8BED".charCodeAt(0)]);
      line.set(3, [0, "", 0, 0]);
      import_chai.assert.equal(line.translateToString(true), "\u6C49\u8BED");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 4, 3), [2, 2], "line: \u6C49, \u8BED");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 4, 2), [2, 2], "line: \u6C49, \u8BED");
    });
    it("should return correct line lengths for a large line with wide characters", () => {
      const line = new import_BufferLine.BufferLine(12);
      for (let i = 0; i < 12; i += 4) {
        line.set(i, [0, "\u6C49", 2, "\u6C49".charCodeAt(0)]);
        line.set(i + 2, [0, "\u8BED", 2, "\u8BED".charCodeAt(0)]);
      }
      for (let i = 1; i < 12; i += 2) {
        line.set(i, [0, "", 0, 0]);
        line.set(i, [0, "", 0, 0]);
      }
      import_chai.assert.equal(line.translateToString(), "\u6C49\u8BED\u6C49\u8BED\u6C49\u8BED");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 12, 11), [10, 2], "line: \u6C49\u8BED\u6C49\u8BED\u6C49, \u8BED");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 12, 10), [10, 2], "line: \u6C49\u8BED\u6C49\u8BED\u6C49, \u8BED");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 12, 9), [8, 4], "line: \u6C49\u8BED\u6C49\u8BED, \u6C49\u8BED");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 12, 8), [8, 4], "line: \u6C49\u8BED\u6C49\u8BED, \u6C49\u8BED");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 12, 7), [6, 6], "line: \u6C49\u8BED\u6C49, \u8BED\u6C49\u8BED");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 12, 6), [6, 6], "line: \u6C49\u8BED\u6C49, \u8BED\u6C49\u8BED");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 12, 5), [4, 4, 4], "line: \u6C49\u8BED, \u6C49\u8BED, \u6C49\u8BED");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 12, 4), [4, 4, 4], "line: \u6C49\u8BED, \u6C49\u8BED, \u6C49\u8BED");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 12, 3), [2, 2, 2, 2, 2, 2], "line: \u6C49, \u8BED, \u6C49, \u8BED, \u6C49, \u8BED");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 12, 2), [2, 2, 2, 2, 2, 2], "line: \u6C49, \u8BED, \u6C49, \u8BED, \u6C49, \u8BED");
    });
    it("should return correct line lengths for a string with wide and single characters", () => {
      const line = new import_BufferLine.BufferLine(6);
      line.set(0, [0, "a", 1, "a".charCodeAt(0)]);
      line.set(1, [0, "\u6C49", 2, "\u6C49".charCodeAt(0)]);
      line.set(2, [0, "", 0, 0]);
      line.set(3, [0, "\u8BED", 2, "\u8BED".charCodeAt(0)]);
      line.set(4, [0, "", 0, 0]);
      line.set(5, [0, "b", 1, "b".charCodeAt(0)]);
      import_chai.assert.equal(line.translateToString(), "a\u6C49\u8BEDb");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 6, 5), [5, 1], "line: a\u6C49\u8BEDb");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 6, 4), [3, 3], "line: a\u6C49, \u8BEDb");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 6, 3), [3, 3], "line: a\u6C49, \u8BEDb");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 6, 2), [1, 2, 2, 1], "line: a, \u6C49, \u8BED, b");
    });
    it("should return correct line lengths for a wrapped line with wide and single characters", () => {
      const line1 = new import_BufferLine.BufferLine(6);
      line1.set(0, [0, "a", 1, "a".charCodeAt(0)]);
      line1.set(1, [0, "\u6C49", 2, "\u6C49".charCodeAt(0)]);
      line1.set(2, [0, "", 0, 0]);
      line1.set(3, [0, "\u8BED", 2, "\u8BED".charCodeAt(0)]);
      line1.set(4, [0, "", 0, 0]);
      line1.set(5, [0, "b", 1, "b".charCodeAt(0)]);
      const line2 = new import_BufferLine.BufferLine(6, void 0, true);
      line2.set(0, [0, "a", 1, "a".charCodeAt(0)]);
      line2.set(1, [0, "\u6C49", 2, "\u6C49".charCodeAt(0)]);
      line2.set(2, [0, "", 0, 0]);
      line2.set(3, [0, "\u8BED", 2, "\u8BED".charCodeAt(0)]);
      line2.set(4, [0, "", 0, 0]);
      line2.set(5, [0, "b", 1, "b".charCodeAt(0)]);
      import_chai.assert.equal(line1.translateToString(), "a\u6C49\u8BEDb");
      import_chai.assert.equal(line2.translateToString(), "a\u6C49\u8BEDb");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line1, line2], 6, 5), [5, 4, 3], "lines: a\u6C49\u8BED, ba\u6C49, \u8BEDb");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line1, line2], 6, 4), [3, 4, 4, 1], "lines: a\u6C49, \u8BEDba, \u6C49\u8BED, b");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line1, line2], 6, 3), [3, 3, 3, 3], "lines: a\u6C49, \u8BEDb, a\u6C49, \u8BEDb");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line1, line2], 6, 2), [1, 2, 2, 2, 2, 2, 1], "lines: a, \u6C49, \u8BED, ba, \u6C49, \u8BED, b");
    });
    it("should work on lines ending in null space", () => {
      const line = new import_BufferLine.BufferLine(5);
      line.set(0, [0, "\u6C49", 2, "\u6C49".charCodeAt(0)]);
      line.set(1, [0, "", 0, 0]);
      line.set(2, [0, "\u8BED", 2, "\u8BED".charCodeAt(0)]);
      line.set(3, [0, "", 0, 0]);
      line.set(4, [0, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]);
      import_chai.assert.equal(line.translateToString(true), "\u6C49\u8BED");
      import_chai.assert.equal(line.translateToString(false), "\u6C49\u8BED ");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 4, 3), [2, 2], "line: \u6C49, \u8BED");
      import_chai.assert.deepEqual((0, import_BufferReflow.reflowSmallerGetNewLineLengths)([line], 4, 2), [2, 2], "line: \u6C49, \u8BED");
    });
  });
});
//# sourceMappingURL=BufferReflow.test.js.map
