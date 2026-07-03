"use strict";
var import_chai = require("chai");
var import_TypedArrayUtils = require("common/TypedArrayUtils");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function deepEquals(a, b) {
  import_chai.assert.equal(a.length, b.length);
  for (let i = 0; i < a.length; ++i) {
    import_chai.assert.equal(a[i], b[i]);
  }
}
describe("typed array convenience functions", () => {
  it("concat", () => {
    const a = new Uint8Array([1, 2, 3, 4, 5]);
    const b = new Uint8Array([6, 7, 8, 9, 0]);
    const merged = (0, import_TypedArrayUtils.concat)(a, b);
    deepEquals(merged, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
  });
});
//# sourceMappingURL=TypedArrayUtils.test.js.map
