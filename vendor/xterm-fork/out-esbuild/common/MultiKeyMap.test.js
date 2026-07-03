"use strict";
var import_chai = require("chai");
var import_MultiKeyMap = require("common/MultiKeyMap");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const strictEqual = import_chai.assert.strictEqual;
describe("TwoKeyMap", () => {
  let map;
  beforeEach(() => {
    map = new import_MultiKeyMap.TwoKeyMap();
  });
  it("set, get", () => {
    strictEqual(map.get(1, 2), void 0);
    map.set(1, 2, "foo");
    strictEqual(map.get(1, 2), "foo");
    map.set(1, 3, "bar");
    strictEqual(map.get(1, 2), "foo");
    strictEqual(map.get(1, 3), "bar");
    map.set(2, 2, "foo2");
    map.set(2, 3, "bar2");
    strictEqual(map.get(1, 2), "foo");
    strictEqual(map.get(1, 3), "bar");
    strictEqual(map.get(2, 2), "foo2");
    strictEqual(map.get(2, 3), "bar2");
  });
  it("clear", () => {
    strictEqual(map.get(1, 2), void 0);
    map.set(1, 2, "foo");
    strictEqual(map.get(1, 2), "foo");
    map.clear();
    strictEqual(map.get(1, 2), void 0);
  });
});
describe("FourKeyMap", () => {
  let map;
  beforeEach(() => {
    map = new import_MultiKeyMap.FourKeyMap();
  });
  it("set, get", () => {
    strictEqual(map.get(1, 2, 3, 4), void 0);
    map.set(1, 2, 3, 4, "foo");
    strictEqual(map.get(1, 2, 3, 4), "foo");
    map.set(1, 3, 3, 4, "bar");
    strictEqual(map.get(1, 2, 3, 4), "foo");
    strictEqual(map.get(1, 3, 3, 4), "bar");
    map.set(2, 2, 3, 4, "foo2");
    map.set(2, 3, 3, 4, "bar2");
    strictEqual(map.get(1, 2, 3, 4), "foo");
    strictEqual(map.get(1, 3, 3, 4), "bar");
    strictEqual(map.get(2, 2, 3, 4), "foo2");
    strictEqual(map.get(2, 3, 3, 4), "bar2");
  });
  it("clear", () => {
    strictEqual(map.get(1, 2, 3, 4), void 0);
    map.set(1, 2, 3, 4, "foo");
    strictEqual(map.get(1, 2, 3, 4), "foo");
    map.clear();
    strictEqual(map.get(1, 2, 3, 4), void 0);
  });
});
//# sourceMappingURL=MultiKeyMap.test.js.map
