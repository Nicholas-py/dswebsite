"use strict";
var import_test = require("@playwright/test");
var import_TestUtils = require("./TestUtils");
var import_SharedRendererTests = require("./SharedRendererTests");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let ctx;
const ctxWrapper = {
  value: void 0,
  skipDomExceptions: true
};
import_test.test.beforeAll(async ({ browser }) => {
  ctx = await (0, import_TestUtils.createTestContext)(browser);
  ctxWrapper.value = ctx;
  await (0, import_TestUtils.openTerminal)(ctx);
});
import_test.test.afterAll(async () => await ctx.page.close());
import_test.test.describe("DOM Renderer Integration Tests", () => {
  (0, import_SharedRendererTests.injectSharedRendererTests)(ctxWrapper);
  (0, import_SharedRendererTests.injectSharedRendererTestsStandalone)(ctxWrapper, () => {
  });
});
//# sourceMappingURL=Renderer.test.js.map
