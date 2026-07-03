"use strict";
var import_chai = require("chai");
var import_XParseColor = require("common/input/XParseColor");
/**
 * Copyright (c) 2021 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("XParseColor", () => {
  describe("parseColor", () => {
    it("rgb:<r>/<g>/<b> scheme in 4/8/12/16 bit", () => {
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("rgb:0/0/0"), [0, 0, 0]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("rgb:f/f/f"), [255, 255, 255]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("rgb:1/2/3"), [17, 34, 51]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("rgb:00/00/00"), [0, 0, 0]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("rgb:ff/ff/ff"), [255, 255, 255]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("rgb:11/22/33"), [17, 34, 51]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("rgb:000/000/000"), [0, 0, 0]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("rgb:fff/fff/fff"), [255, 255, 255]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("rgb:111/222/333"), [17, 34, 51]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("rgb:0000/0000/0000"), [0, 0, 0]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("rgb:ffff/ffff/ffff"), [255, 255, 255]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("rgb:1111/2222/3333"), [17, 34, 51]);
    });
    it("#RGB scheme in 4/8/12/16 bit", () => {
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("#000"), [0, 0, 0]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("#fff"), [240, 240, 240]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("#123"), [16, 32, 48]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("#000000"), [0, 0, 0]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("#ffffff"), [255, 255, 255]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("#112233"), [17, 34, 51]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("#000000000"), [0, 0, 0]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("#fffffffff"), [255, 255, 255]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("#111222333"), [17, 34, 51]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("#000000000000"), [0, 0, 0]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("#ffffffffffff"), [255, 255, 255]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("#111122223333"), [17, 34, 51]);
    });
    it("supports upper case", () => {
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("RGB:0/A/F"), [0, 170, 255]);
      import_chai.assert.deepEqual((0, import_XParseColor.parseColor)("#FFF"), [240, 240, 240]);
    });
    it("does not parse illegal combinations", () => {
      import_chai.assert.equal((0, import_XParseColor.parseColor)("rgb:0/11/222"), void 0);
      import_chai.assert.equal((0, import_XParseColor.parseColor)("rgbi:00/11/22"), void 0);
      import_chai.assert.equal((0, import_XParseColor.parseColor)("#aabbbcc"), void 0);
      import_chai.assert.equal((0, import_XParseColor.parseColor)("#aabbgg"), void 0);
      import_chai.assert.equal((0, import_XParseColor.parseColor)("rgb:aa/bb/gg"), void 0);
    });
  });
  describe("toXColorRgb", () => {
    it("rgb:<r>/<g>/<b> scheme in 4/8/12/16 bit", () => {
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:0/0/0"), 4), "rgb:0/0/0");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:f/f/f"), 4), "rgb:f/f/f");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:1/2/3"), 4), "rgb:1/2/3");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:00/00/00"), 8), "rgb:00/00/00");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:ff/ff/ff"), 8), "rgb:ff/ff/ff");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:11/22/33"), 8), "rgb:11/22/33");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:000/000/000"), 12), "rgb:000/000/000");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:fff/fff/fff"), 12), "rgb:fff/fff/fff");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:111/222/333"), 12), "rgb:111/222/333");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:0000/0000/0000"), 16), "rgb:0000/0000/0000");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:ffff/ffff/ffff"), 16), "rgb:ffff/ffff/ffff");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:1111/2222/3333"), 16), "rgb:1111/2222/3333");
    });
    it("defaults to 16 bit output", () => {
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:1/2/3")), "rgb:1111/2222/3333");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:11/22/33")), "rgb:1111/2222/3333");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:111/222/333")), "rgb:1111/2222/3333");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:123/123/123")), "rgb:1212/1212/1212");
    });
    it("reduces colors to 8 bit resolution", () => {
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:123/123/123"), 12), "rgb:121/121/121");
      import_chai.assert.equal((0, import_XParseColor.toRgbString)((0, import_XParseColor.parseColor)("rgb:1234/1234/1234"), 16), "rgb:1212/1212/1212");
    });
  });
});
//# sourceMappingURL=XParseColor.test.js.map
