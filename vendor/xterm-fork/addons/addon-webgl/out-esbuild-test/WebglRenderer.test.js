"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_test = __toESM(require("@playwright/test"));
var import_SharedRendererTests = require("../../../test/playwright/SharedRendererTests");
var import_TestUtils = require("../../../test/playwright/TestUtils");
var import_os = require("os");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let ctx;
const ctxWrapper = { value: void 0 };
import_test.default.beforeAll(async ({ browser }) => {
  ctx = await (0, import_TestUtils.createTestContext)(browser);
  await (0, import_TestUtils.openTerminal)(ctx);
  ctxWrapper.value = ctx;
  await ctx.page.evaluate(`
    window.addon = new window.WebglAddon(true);
    window.term.loadAddon(window.addon);
  `);
});
import_test.default.afterAll(async () => await ctx.page.close());
import_test.default.describe("WebGL Renderer Integration Tests", async () => {
  if ((0, import_os.platform)() === "linux") {
    import_test.default.skip(({ browserName }) => browserName === "firefox");
  }
  (0, import_SharedRendererTests.injectSharedRendererTests)(ctxWrapper);
  (0, import_SharedRendererTests.injectSharedRendererTestsStandalone)(ctxWrapper, async () => {
    await ctx.page.evaluate(`
      window.addon = new window.WebglAddon(true);
      window.term.loadAddon(window.addon);
    `);
  });
});
//# sourceMappingURL=WebglRenderer.test.js.map
