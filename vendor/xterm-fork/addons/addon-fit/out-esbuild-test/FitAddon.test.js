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
  ctx.page.setViewportSize({ width: 1024, height: 768 });
  await (0, import_TestUtils.openTerminal)(ctx);
});
import_test.default.afterAll(async () => await ctx.page.close());
import_test.default.describe("FitAddon", () => {
  import_test.default.beforeEach(async function() {
    await ctx.page.evaluate(`document.querySelector('#terminal-container').style.display=''`);
    await ctx.page.evaluate(`
      window.term.reset()
      window.fit?.dispose();
      window.fit = new FitAddon();
      window.term.loadAddon(window.fit);
    `);
  });
  (0, import_test.default)("no terminal", async function() {
    await ctx.page.evaluate(`window.fit2 = new FitAddon();`);
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.fit2.proposeDimensions()`), void 0);
    await ctx.page.evaluate(`window.fit2.dispose();`);
  });
  import_test.default.describe("proposeDimensions", () => {
    (0, import_test.default)("default", async function() {
      await setDimensions();
      const dimensions = await ctx.page.evaluate(`window.fit.proposeDimensions()`);
      (0, import_assert.ok)(dimensions.cols > 85);
      (0, import_assert.ok)(dimensions.cols < 88);
      (0, import_assert.ok)(dimensions.rows > 24);
      (0, import_assert.ok)(dimensions.rows < 29);
    });
    (0, import_test.default)("width", async function() {
      await setDimensions(1008);
      const dimensions = await ctx.page.evaluate(`window.fit.proposeDimensions()`);
      (0, import_assert.ok)(dimensions.cols > 108);
      (0, import_assert.ok)(dimensions.cols < 111);
      (0, import_assert.ok)(dimensions.rows > 24);
      (0, import_assert.ok)(dimensions.rows < 29);
    });
    (0, import_test.default)("small", async function() {
      await setDimensions(1, 1);
      (0, import_assert.deepEqual)(await ctx.page.evaluate(`window.fit.proposeDimensions()`), {
        cols: 2,
        rows: 1
      });
    });
    (0, import_test.default)("hidden", async function() {
      await ctx.proxy.dispose();
      await ctx.page.evaluate(`document.querySelector('#terminal-container').style.display='none'`);
      await ctx.page.evaluate(`window.term = new Terminal()`);
      await ctx.page.evaluate(`window.term.open(document.querySelector('#terminal-container'))`);
      await setDimensions();
      const dimensions = await ctx.page.evaluate(`window.fit.proposeDimensions()`);
      if (dimensions) {
        (0, import_assert.ok)(dimensions.cols > 85);
        (0, import_assert.ok)(dimensions.cols < 88);
        (0, import_assert.ok)(dimensions.rows > 24);
        (0, import_assert.ok)(dimensions.rows < 29);
      }
    });
  });
  import_test.default.describe("fit", () => {
    (0, import_test.default)("default", async function() {
      await setDimensions();
      await ctx.page.evaluate(`window.fit.fit()`);
      const cols = await ctx.proxy.cols;
      const rows = await ctx.proxy.rows;
      (0, import_assert.ok)(cols > 85);
      (0, import_assert.ok)(cols < 88);
      (0, import_assert.ok)(rows > 24);
      (0, import_assert.ok)(rows < 29);
    });
    (0, import_test.default)("width", async function() {
      await setDimensions(1008);
      await ctx.page.evaluate(`window.fit.fit()`);
      const cols = await ctx.proxy.cols;
      const rows = await ctx.proxy.rows;
      (0, import_assert.ok)(cols > 108);
      (0, import_assert.ok)(cols < 111);
      (0, import_assert.ok)(rows > 24);
      (0, import_assert.ok)(rows < 29);
    });
    (0, import_test.default)("small", async function() {
      await setDimensions(1, 1);
      await ctx.page.evaluate(`window.fit.fit()`);
      (0, import_assert.strictEqual)(await ctx.proxy.cols, 2);
      (0, import_assert.strictEqual)(await ctx.proxy.rows, 1);
    });
  });
});
async function setDimensions(width = 800, height = 450) {
  await ctx.page.evaluate(`
    document.querySelector('#terminal-container').style.width='${width}px';
    document.querySelector('#terminal-container').style.height='${height}px';
    document.querySelector('#terminal-container').style.display='';
  `);
  await (0, import_TestUtils.timeout)(500);
}
//# sourceMappingURL=FitAddon.test.js.map
