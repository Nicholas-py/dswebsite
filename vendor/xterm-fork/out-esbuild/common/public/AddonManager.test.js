"use strict";
var import_chai = require("chai");
var import_AddonManager = require("./AddonManager");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class TestAddonManager extends import_AddonManager.AddonManager {
  get addons() {
    return this._addons;
  }
}
describe("AddonManager", () => {
  let manager;
  beforeEach(() => {
    manager = new TestAddonManager();
  });
  describe("loadAddon", () => {
    it("should call addon constructor", () => {
      let called = false;
      class Addon {
        activate(terminal) {
          import_chai.assert.equal(terminal, "foo", "The first constructor arg should be Terminal");
          called = true;
        }
        dispose() {
        }
      }
      manager.loadAddon("foo", new Addon());
      import_chai.assert.equal(called, true);
    });
  });
  describe("dispose", () => {
    it("should dispose all loaded addons", () => {
      let called = 0;
      class Addon {
        activate() {
        }
        dispose() {
          called++;
        }
      }
      manager.loadAddon(null, new Addon());
      manager.loadAddon(null, new Addon());
      manager.loadAddon(null, new Addon());
      import_chai.assert.equal(manager.addons.length, 3);
      manager.dispose();
      import_chai.assert.equal(called, 3);
      import_chai.assert.equal(manager.addons.length, 0);
    });
  });
});
//# sourceMappingURL=AddonManager.test.js.map
