"use strict";
var import_chai = require("chai");
var import_ColorContrastCache = require("browser/ColorContrastCache");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("ColorContrastCache", () => {
  let cache;
  beforeEach(() => {
    cache = new import_ColorContrastCache.ColorContrastCache();
  });
  it("should save and get color values", () => {
    import_chai.assert.strictEqual(cache.getColor(1, 0), void 0);
    cache.setColor(1, 1, null);
    import_chai.assert.strictEqual(cache.getColor(1, 1), null);
    cache.setColor(1, 2, { css: "#030303", rgba: 50529279 });
    import_chai.assert.deepEqual(cache.getColor(1, 2), { css: "#030303", rgba: 50529279 });
  });
  it("should save and get css values", () => {
    import_chai.assert.strictEqual(cache.getCss(1, 0), void 0);
    cache.setCss(1, 1, null);
    import_chai.assert.strictEqual(cache.getCss(1, 1), null);
    cache.setCss(1, 2, "#030303");
    import_chai.assert.deepEqual(cache.getCss(1, 2), "#030303");
  });
  it("should clear all values on clear", () => {
    cache.setColor(1, 1, null);
    cache.setColor(1, 2, { css: "#030303", rgba: 50529279 });
    cache.setCss(1, 1, null);
    cache.setCss(1, 2, "#030303");
    cache.clear();
    import_chai.assert.strictEqual(cache.getColor(1, 1), void 0);
    import_chai.assert.strictEqual(cache.getColor(1, 2), void 0);
    import_chai.assert.strictEqual(cache.getCss(1, 1), void 0);
    import_chai.assert.strictEqual(cache.getCss(1, 2), void 0);
  });
});
//# sourceMappingURL=ColorContrastCache.test.js.map
