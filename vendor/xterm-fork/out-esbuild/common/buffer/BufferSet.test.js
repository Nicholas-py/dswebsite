"use strict";
var import_chai = require("chai");
var import_BufferSet = require("common/buffer/BufferSet");
var import_Buffer = require("common/buffer/Buffer");
var import_TestUtils = require("common/TestUtils.test");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("BufferSet", () => {
  let bufferSet;
  beforeEach(() => {
    bufferSet = new import_BufferSet.BufferSet(
      new import_TestUtils.MockOptionsService({ scrollback: 1e3 }),
      new import_TestUtils.MockBufferService(80, 24)
    );
  });
  describe("constructor", () => {
    it("should create two different buffers: alt and normal", () => {
      import_chai.assert.instanceOf(bufferSet.normal, import_Buffer.Buffer);
      import_chai.assert.instanceOf(bufferSet.alt, import_Buffer.Buffer);
      import_chai.assert.notEqual(bufferSet.normal, bufferSet.alt);
    });
  });
  describe("activateNormalBuffer", () => {
    beforeEach(() => {
      bufferSet.activateNormalBuffer();
    });
    it("should set the normal buffer as the currently active buffer", () => {
      import_chai.assert.equal(bufferSet.active, bufferSet.normal);
    });
  });
  describe("activateAltBuffer", () => {
    beforeEach(() => {
      bufferSet.activateAltBuffer();
    });
    it("should set the alt buffer as the currently active buffer", () => {
      import_chai.assert.equal(bufferSet.active, bufferSet.alt);
    });
  });
  describe("cursor handling when swapping buffers", () => {
    beforeEach(() => {
      bufferSet.normal.x = 0;
      bufferSet.normal.y = 0;
      bufferSet.alt.x = 0;
      bufferSet.alt.y = 0;
    });
    it("should keep the cursor stationary when activating alt buffer", () => {
      bufferSet.activateNormalBuffer();
      bufferSet.active.x = 30;
      bufferSet.active.y = 10;
      bufferSet.activateAltBuffer();
      import_chai.assert.equal(bufferSet.active.x, 30);
      import_chai.assert.equal(bufferSet.active.y, 10);
    });
    it("should keep the cursor stationary when activating normal buffer", () => {
      bufferSet.activateAltBuffer();
      bufferSet.active.x = 30;
      bufferSet.active.y = 10;
      bufferSet.activateNormalBuffer();
      import_chai.assert.equal(bufferSet.active.x, 30);
      import_chai.assert.equal(bufferSet.active.y, 10);
    });
  });
  describe("markers", () => {
    it("should clear the markers when the buffer is switched", () => {
      bufferSet.activateAltBuffer();
      bufferSet.alt.addMarker(1);
      import_chai.assert.equal(bufferSet.alt.markers.length, 1);
      bufferSet.activateNormalBuffer();
      import_chai.assert.equal(bufferSet.alt.markers.length, 0);
    });
  });
});
//# sourceMappingURL=BufferSet.test.js.map
