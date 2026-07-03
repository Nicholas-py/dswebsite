"use strict";
var import_chai = require("chai");
var import_BufferRange = require("common/buffer/BufferRange");
/**
 * Copyright (c) 2021 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("BufferRange", () => {
  describe("getRangeLength", () => {
    it("should get range for single line", () => {
      import_chai.assert.equal((0, import_BufferRange.getRangeLength)(createRange(1, 1, 4, 1), 0), 4);
    });
    it("should throw for invalid range", () => {
      import_chai.assert.throws(() => (0, import_BufferRange.getRangeLength)(createRange(1, 3, 1, 1), 0));
    });
    it("should get range multiple lines", () => {
      import_chai.assert.equal((0, import_BufferRange.getRangeLength)(createRange(1, 1, 4, 5), 5), 24);
    });
    it("should get range for end line right after start line", () => {
      import_chai.assert.equal((0, import_BufferRange.getRangeLength)(createRange(1, 1, 7, 2), 5), 12);
    });
  });
});
function createRange(x1, y1, x2, y2) {
  return {
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 }
  };
}
//# sourceMappingURL=BufferRange.test.js.map
