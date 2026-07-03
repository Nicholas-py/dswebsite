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
var import_assert = require("assert");
var import_TestUtils = require("../../../test/playwright/TestUtils");
/**
 * Copyright (c) 2023 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let ctx;
import_test.default.beforeAll(async ({ browser }, testInfo) => {
  ctx = await (0, import_TestUtils.createTestContext)(browser);
  await (0, import_TestUtils.openTerminal)(ctx);
});
import_test.default.afterAll(async () => {
  await ctx.page.close();
});
import_test.default.describe("ClipboardAddon", () => {
  import_test.default.beforeEach(async ({}, testInfo) => {
    if (ctx.browser.browserType().name() !== "chromium") {
      testInfo.skip();
      return;
    }
    if (ctx.browser.browserType().name() === "chromium") {
      await ctx.page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    }
    await ctx.page.evaluate(`
      window.term.reset()
      window.clipboard?.dispose();
      window.clipboard = new ClipboardAddon();
      window.term.loadAddon(window.clipboard);
    `);
  });
  import_test.default.beforeEach(async () => {
    await ctx.proxy.reset();
  });
  const testDataEncoded = "aGVsbG8gd29ybGQ=";
  const testDataDecoded = "hello world";
  import_test.default.describe("write data", async function() {
    (0, import_test.default)("simple string", async () => {
      await ctx.proxy.write(`\x1B]52;c;${testDataEncoded}\x07`);
      (0, import_assert.deepEqual)(await ctx.page.evaluate(() => window.navigator.clipboard.readText()), testDataDecoded);
    });
    (0, import_test.default)("invalid base64 string", async () => {
      await ctx.proxy.write(`\x1B]52;c;${testDataEncoded}invalid\x07`);
      (0, import_assert.deepEqual)(await ctx.page.evaluate(() => window.navigator.clipboard.readText()), "");
    });
    (0, import_test.default)("empty string", async () => {
      await ctx.proxy.write(`\x1B]52;c;${testDataEncoded}\x07`);
      await ctx.proxy.write(`\x1B]52;c;\x07`);
      (0, import_assert.deepEqual)(await ctx.page.evaluate(() => window.navigator.clipboard.readText()), "");
    });
  });
  import_test.default.describe("read data", async function() {
    (0, import_test.default)("simple string", async () => {
      await ctx.page.evaluate(`
        window.data = [];
        window.term.onData(e => data.push(e));
      `);
      await ctx.page.evaluate(() => window.navigator.clipboard.writeText("hello world"));
      await ctx.proxy.write(`\x1B]52;c;?\x07`);
      (0, import_assert.deepEqual)(await ctx.page.evaluate("window.data"), [`\x1B]52;c;${testDataEncoded}\x07`]);
    });
    (0, import_test.default)("clear clipboard", async () => {
      await ctx.proxy.write(`\x1B]52;c;!\x07`);
      await ctx.proxy.write(`\x1B]52;c;?\x07`);
      (0, import_assert.deepEqual)(await ctx.page.evaluate(() => window.navigator.clipboard.readText()), "");
    });
  });
});
//# sourceMappingURL=ClipboardAddon.test.js.map
