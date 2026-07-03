"use strict";
var import_chai = require("chai");
var import_UnicodeService = require("common/services/UnicodeService");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class DummyProvider {
  constructor() {
    this.version = "123";
  }
  wcwidth(n) {
    return 2;
  }
  charProperties(codepoint) {
    return import_UnicodeService.UnicodeService.createPropertyValue(0, this.wcwidth(codepoint));
  }
}
describe("unicode provider", () => {
  let us;
  beforeEach(() => {
    us = new import_UnicodeService.UnicodeService();
  });
  it("default to V6", () => {
    import_chai.assert.equal(us.activeVersion, "6");
    import_chai.assert.deepEqual(us.versions, ["6"]);
    import_chai.assert.doesNotThrow(() => {
      us.activeVersion = "6";
    }, `unknown Unicode version "6"`);
    import_chai.assert.equal(us.getStringCellWidth("hello"), 5);
  });
  it("activate should throw for unknown version", () => {
    import_chai.assert.throws(() => {
      us.activeVersion = "55";
    }, 'unknown Unicode version "55"');
  });
  it("should notify about version change", () => {
    const notes = [];
    us.onChange((version) => notes.push(version));
    const dummyProvider = new DummyProvider();
    us.register(dummyProvider);
    us.activeVersion = dummyProvider.version;
    import_chai.assert.deepEqual(notes, [dummyProvider.version]);
  });
  it("correctly changes provider impl", () => {
    import_chai.assert.equal(us.getStringCellWidth("hello"), 5);
    const dummyProvider = new DummyProvider();
    us.register(dummyProvider);
    us.activeVersion = dummyProvider.version;
    import_chai.assert.equal(us.getStringCellWidth("hello"), 2 * 5);
  });
  it("wcwidth V6 emoji test", () => {
    const widthV6 = us.getStringCellWidth("\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}");
    import_chai.assert.equal(widthV6, 10);
  });
});
//# sourceMappingURL=UnicodeService.test.js.map
