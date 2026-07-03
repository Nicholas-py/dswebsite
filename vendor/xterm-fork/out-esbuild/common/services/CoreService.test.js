"use strict";
var import_CoreService = require("common/services/CoreService");
var import_TestUtils = require("common/TestUtils.test");
var import_chai = require("chai");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("CoreService", () => {
  let coreService;
  beforeEach(() => {
    coreService = new import_CoreService.CoreService(
      new import_TestUtils.MockBufferService(80, 30),
      new import_TestUtils.MockLogService(),
      new import_TestUtils.MockOptionsService()
    );
  });
  describe("reset", () => {
    it("should not affect isCursorInitialized", () => {
      coreService.isCursorInitialized = true;
      coreService.reset();
      import_chai.assert.equal(coreService.isCursorInitialized, true);
      coreService.isCursorInitialized = false;
      coreService.reset();
      import_chai.assert.equal(coreService.isCursorInitialized, false);
    });
  });
});
//# sourceMappingURL=CoreService.test.js.map
