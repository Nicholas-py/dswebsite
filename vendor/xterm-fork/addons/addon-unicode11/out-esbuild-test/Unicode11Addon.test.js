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
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let ctx;
import_test.default.beforeAll(async ({ browser }) => {
  ctx = await (0, import_TestUtils.createTestContext)(browser);
  await (0, import_TestUtils.openTerminal)(ctx);
});
import_test.default.afterAll(async () => await ctx.page.close());
import_test.default.describe("Unicode11Addon", () => {
  import_test.default.beforeEach(async () => {
    await ctx.page.evaluate(`
      window.term.reset()
      window.unicode11?.dispose();
      window.unicode11 = new Unicode11Addon();
      window.term.loadAddon(window.unicode11);
    `);
  });
  (0, import_test.default)("wcwidth V11 emoji test", async () => {
    (0, import_assert.deepStrictEqual)((await ctx.page.evaluate(`window.term.unicode.versions`)).includes("11"), true);
    await ctx.page.evaluate(`window.term.unicode.activeVersion = '11';`);
    (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.term.unicode.activeVersion`), "11");
    (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.term._core.unicodeService.getStringCellWidth('\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}')`), 20);
  });
});
//# sourceMappingURL=Unicode11Addon.test.js.map
