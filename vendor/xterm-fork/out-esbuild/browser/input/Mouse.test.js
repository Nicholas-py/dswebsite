"use strict";
var import_chai = require("chai");
var import_Mouse = require("browser/input/Mouse");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const jsdom = require("jsdom");
const CHAR_WIDTH = 10;
const CHAR_HEIGHT = 20;
describe("Mouse getCoords", () => {
  let windowOverride;
  let document;
  beforeEach(() => {
    windowOverride = {
      getComputedStyle() {
        return {
          getPropertyValue: () => "0px"
        };
      }
    };
    document = new jsdom.JSDOM("").window.document;
  });
  it("should return the cell that was clicked", () => {
    let coords;
    coords = (0, import_Mouse.getCoords)(windowOverride, { clientX: CHAR_WIDTH / 2, clientY: CHAR_HEIGHT / 2 }, document.createElement("div"), 10, 10, true, CHAR_WIDTH, CHAR_HEIGHT);
    import_chai.assert.deepEqual(coords, [1, 1]);
    coords = (0, import_Mouse.getCoords)(windowOverride, { clientX: CHAR_WIDTH, clientY: CHAR_HEIGHT }, document.createElement("div"), 10, 10, true, CHAR_WIDTH, CHAR_HEIGHT);
    import_chai.assert.deepEqual(coords, [1, 1]);
    coords = (0, import_Mouse.getCoords)(windowOverride, { clientX: CHAR_WIDTH, clientY: CHAR_HEIGHT + 1 }, document.createElement("div"), 10, 10, true, CHAR_WIDTH, CHAR_HEIGHT);
    import_chai.assert.deepEqual(coords, [1, 2]);
    coords = (0, import_Mouse.getCoords)(windowOverride, { clientX: CHAR_WIDTH + 1, clientY: CHAR_HEIGHT }, document.createElement("div"), 10, 10, true, CHAR_WIDTH, CHAR_HEIGHT);
    import_chai.assert.deepEqual(coords, [2, 1]);
  });
  it("should ensure the coordinates are returned within the terminal bounds", () => {
    let coords;
    coords = (0, import_Mouse.getCoords)(windowOverride, { clientX: -1, clientY: -1 }, document.createElement("div"), 10, 10, true, CHAR_WIDTH, CHAR_HEIGHT);
    import_chai.assert.deepEqual(coords, [1, 1]);
    coords = (0, import_Mouse.getCoords)(windowOverride, { clientX: CHAR_WIDTH * 20, clientY: CHAR_HEIGHT * 20 }, document.createElement("div"), 10, 10, true, CHAR_WIDTH, CHAR_HEIGHT);
    import_chai.assert.deepEqual(coords, [10, 10], "coordinates should never come back as larger than the terminal");
  });
});
//# sourceMappingURL=Mouse.test.js.map
