"use strict";
var import_chai = require("chai");
var import_TestUtils = require("common/TestUtils.test");
var import_MoveToCell = require("./MoveToCell");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("MoveToCell", () => {
  let bufferService;
  beforeEach(() => {
    bufferService = new import_TestUtils.MockBufferService(5, 5);
    bufferService.buffer.x = 3;
    bufferService.buffer.y = 3;
  });
  describe("normal buffer", () => {
    it("should use the right directional escape sequences", () => {
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(1, 3, bufferService, false), "\x1B[D\x1B[D");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(2, 3, bufferService, false), "\x1B[D");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(4, 3, bufferService, false), "\x1B[C");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(5, 3, bufferService, false), "\x1B[C\x1B[C");
    });
    it("should wrap around entire row instead of doing up and down when the Y value differs", () => {
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(1, 1, bufferService, false), "\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(2, 1, bufferService, false), "\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(3, 1, bufferService, false), "\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(4, 1, bufferService, false), "\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(5, 1, bufferService, false), "\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(1, 2, bufferService, false), "\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(2, 2, bufferService, false), "\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(3, 2, bufferService, false), "\x1B[D\x1B[D\x1B[D\x1B[D\x1B[D");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(4, 2, bufferService, false), "\x1B[D\x1B[D\x1B[D\x1B[D");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(5, 2, bufferService, false), "\x1B[D\x1B[D\x1B[D");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(1, 4, bufferService, false), "\x1B[C\x1B[C\x1B[C");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(2, 4, bufferService, false), "\x1B[C\x1B[C\x1B[C\x1B[C");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(3, 4, bufferService, false), "\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(4, 4, bufferService, false), "\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(5, 4, bufferService, false), "\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(1, 5, bufferService, false), "\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(2, 5, bufferService, false), "\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(3, 5, bufferService, false), "\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(4, 5, bufferService, false), "\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(5, 5, bufferService, false), "\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C\x1B[C");
    });
    it("should use the correct character for application cursor", () => {
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(3, 1, bufferService, true), "\x1BOD\x1BOD\x1BOD\x1BOD\x1BOD\x1BOD\x1BOD\x1BOD\x1BOD\x1BOD");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(3, 2, bufferService, true), "\x1BOD\x1BOD\x1BOD\x1BOD\x1BOD");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(2, 3, bufferService, true), "\x1BOD");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(4, 3, bufferService, true), "\x1BOC");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(3, 4, bufferService, true), "\x1BOC\x1BOC\x1BOC\x1BOC\x1BOC");
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(3, 5, bufferService, true), "\x1BOC\x1BOC\x1BOC\x1BOC\x1BOC\x1BOC\x1BOC\x1BOC\x1BOC\x1BOC");
    });
  });
  describe("alt buffer", () => {
    beforeEach(() => {
      bufferService.buffers.activateAltBuffer();
      bufferService.buffer.x = 3;
      bufferService.buffer.y = 3;
    });
    it("should move the cursor across rows", () => {
      import_chai.assert.equal((0, import_MoveToCell.moveToCellSequence)(4, 4, bufferService, false), "\x1B[B\x1B[C");
    });
  });
});
//# sourceMappingURL=MoveToCell.test.js.map
