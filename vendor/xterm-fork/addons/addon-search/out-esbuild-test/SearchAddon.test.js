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
var import_fs = require("fs");
var import_path = require("path");
var import_TestUtils = require("../../../test/playwright/TestUtils");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let ctx;
import_test.default.beforeAll(async ({ browser }) => {
  ctx = await (0, import_TestUtils.createTestContext)(browser);
  await (0, import_TestUtils.openTerminal)(ctx, { cols: 80, rows: 24 });
});
import_test.default.afterAll(async () => await ctx.page.close());
import_test.default.describe("Search Tests", () => {
  import_test.default.beforeEach(async () => {
    await ctx.page.evaluate(`
      window.term.reset()
      window.search?.dispose();
      window.search = new SearchAddon();
      window.term.loadAddon(window.search);
    `);
  });
  (0, import_test.default)("Simple Search", async () => {
    await ctx.proxy.write("dafhdjfldshafhldsahfkjhldhjkftestlhfdsakjfhdjhlfdsjkafhjdlk");
    (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('test')`), true);
    (0, import_assert.deepStrictEqual)(await ctx.proxy.getSelection(), "test");
  });
  (0, import_test.default)("Scrolling Search", async () => {
    let dataString = "";
    for (let i = 0; i < 100; i++) {
      if (i === 52) {
        dataString += "$^1_3{}test$#";
      }
      dataString += makeData(50);
    }
    await ctx.proxy.write(dataString);
    (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('$^1_3{}test$#')`), true);
    (0, import_assert.deepStrictEqual)(await ctx.proxy.getSelection(), "$^1_3{}test$#");
  });
  (0, import_test.default)("Incremental Find Previous", async () => {
    await ctx.proxy.writeln(`package.jsonc
`);
    await ctx.proxy.write("package.json pack package.lock");
    await ctx.page.evaluate(`window.search.findPrevious('pack', {incremental: true})`);
    let selectionPosition = await ctx.proxy.getSelectionPosition();
    let line = await (await ctx.proxy.buffer.active.getLine(selectionPosition.start.y)).translateToString();
    (0, import_assert.deepStrictEqual)(line.substring(selectionPosition.start.x, selectionPosition.end.x + 8), "package.lock");
    await ctx.page.evaluate(`window.search.findPrevious('package.j', {incremental: true})`);
    selectionPosition = await ctx.proxy.getSelectionPosition();
    (0, import_assert.deepStrictEqual)(line.substring(selectionPosition.start.x, selectionPosition.end.x + 3), "package.json");
    await ctx.page.evaluate(`window.search.findPrevious('package.jsonc', {incremental: true})`);
    selectionPosition = await ctx.proxy.getSelectionPosition();
    line = await (await ctx.proxy.buffer.active.getLine(selectionPosition.start.y)).translateToString();
    (0, import_assert.deepStrictEqual)(line.substring(selectionPosition.start.x, selectionPosition.end.x), "package.jsonc");
  });
  (0, import_test.default)("Incremental Find Next", async () => {
    await ctx.proxy.writeln(`package.lock pack package.json package.ups
`);
    await ctx.proxy.write("package.jsonc");
    await ctx.page.evaluate(`window.search.findNext('pack', {incremental: true})`);
    let selectionPosition = await ctx.proxy.getSelectionPosition();
    let line = await (await ctx.proxy.buffer.active.getLine(selectionPosition.start.y)).translateToString();
    (0, import_assert.deepStrictEqual)(line.substring(selectionPosition.start.x, selectionPosition.end.x + 8), "package.lock");
    await ctx.page.evaluate(`window.search.findNext('package.j', {incremental: true})`);
    selectionPosition = await ctx.proxy.getSelectionPosition();
    (0, import_assert.deepStrictEqual)(line.substring(selectionPosition.start.x, selectionPosition.end.x + 3), "package.json");
    await ctx.page.evaluate(`window.search.findNext('package.jsonc', {incremental: true})`);
    selectionPosition = await ctx.proxy.getSelectionPosition();
    line = await (await ctx.proxy.buffer.active.getLine(selectionPosition.start.y)).translateToString();
    (0, import_assert.deepStrictEqual)(line.substring(selectionPosition.start.x, selectionPosition.end.x), "package.jsonc");
  });
  (0, import_test.default)("Simple Regex", async () => {
    await ctx.proxy.write("abc123defABCD");
    await ctx.page.evaluate(`window.search.findNext('[a-z]+', {regex: true})`);
    (0, import_assert.deepStrictEqual)(await ctx.proxy.getSelection(), "abc");
    await ctx.page.evaluate(`window.search.findNext('[A-Z]+', {regex: true, caseSensitive: true})`);
    (0, import_assert.deepStrictEqual)(await ctx.proxy.getSelection(), "ABCD");
  });
  (0, import_test.default)("Search for single result twice should not unselect it", async () => {
    await ctx.proxy.write("abc def");
    (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('abc')`), true);
    (0, import_assert.deepStrictEqual)(await ctx.proxy.getSelection(), "abc");
    (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('abc')`), true);
    (0, import_assert.deepStrictEqual)(await ctx.proxy.getSelection(), "abc");
  });
  (0, import_test.default)("Search for result bounding with wide unicode chars", async () => {
    await ctx.proxy.write("\u4E2D\u6587xx\u{1D11E}\u{1D11E}");
    (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('\u4E2D')`), true);
    (0, import_assert.deepStrictEqual)(await ctx.proxy.getSelection(), "\u4E2D");
    (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('xx')`), true);
    (0, import_assert.deepStrictEqual)(await ctx.proxy.getSelection(), "xx");
    (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('\u{1D11E}')`), true);
    (0, import_assert.deepStrictEqual)(await ctx.proxy.getSelection(), "\u{1D11E}");
    (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('\u{1D11E}')`), true);
    (0, import_assert.deepStrictEqual)(await ctx.proxy.getSelectionPosition(), {
      start: {
        x: 7,
        y: 0
      },
      end: {
        x: 8,
        y: 0
      }
    });
  });
  import_test.default.describe("onDidChangeResults", async () => {
    import_test.default.describe("findNext", () => {
      (0, import_test.default)("should not fire unless the decorations option is set", async () => {
        await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
        await ctx.proxy.write("abc");
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findNext('a')`), true);
        (0, import_assert.strictEqual)(await ctx.page.evaluate("window.calls.length"), 0);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findNext('b', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.strictEqual)(await ctx.page.evaluate("window.calls.length"), 1);
      });
      (0, import_test.default)("should fire with correct event values", async () => {
        await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
        await ctx.proxy.write("abc bc c");
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findNext('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 1, resultIndex: 0 }
        ]);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findNext('b', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 1, resultIndex: 0 },
          { resultCount: 2, resultIndex: 0 }
        ]);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findNext('d', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), false);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 1, resultIndex: 0 },
          { resultCount: 2, resultIndex: 0 },
          { resultCount: 0, resultIndex: -1 }
        ]);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findNext('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findNext('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findNext('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 1, resultIndex: 0 },
          { resultCount: 2, resultIndex: 0 },
          { resultCount: 0, resultIndex: -1 },
          { resultCount: 3, resultIndex: 0 },
          { resultCount: 3, resultIndex: 1 },
          { resultCount: 3, resultIndex: 2 }
        ]);
      });
      (0, import_test.default)("should fire with correct event values (incremental)", async () => {
        await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
        await ctx.proxy.write("d abc aabc d");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('a', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 3, resultIndex: 0 }
        ]);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('ab', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 3, resultIndex: 0 },
          { resultCount: 2, resultIndex: 0 }
        ]);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('abc', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 3, resultIndex: 0 },
          { resultCount: 2, resultIndex: 0 },
          { resultCount: 2, resultIndex: 0 }
        ]);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('abc', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 3, resultIndex: 0 },
          { resultCount: 2, resultIndex: 0 },
          { resultCount: 2, resultIndex: 0 },
          { resultCount: 2, resultIndex: 1 }
        ]);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('d', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 3, resultIndex: 0 },
          { resultCount: 2, resultIndex: 0 },
          { resultCount: 2, resultIndex: 0 },
          { resultCount: 2, resultIndex: 1 },
          { resultCount: 2, resultIndex: 1 }
        ]);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('abcd', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), false);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 3, resultIndex: 0 },
          { resultCount: 2, resultIndex: 0 },
          { resultCount: 2, resultIndex: 0 },
          { resultCount: 2, resultIndex: 1 },
          { resultCount: 2, resultIndex: 1 },
          { resultCount: 0, resultIndex: -1 }
        ]);
      });
      (0, import_test.default)("should fire with more than 1k matches", async () => {
        await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
        const data = ("a bc".repeat(10) + "\\n\\r").repeat(150);
        await ctx.proxy.write(data);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findNext('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 1e3, resultIndex: 0 }
        ]);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findNext('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 1e3, resultIndex: 0 },
          { resultCount: 1e3, resultIndex: 1 }
        ]);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findNext('bc', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 1e3, resultIndex: 0 },
          { resultCount: 1e3, resultIndex: 1 },
          { resultCount: 1e3, resultIndex: 1 }
        ]);
      });
      (0, import_test.default)("should fire when writing to terminal", async () => {
        await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
        await ctx.proxy.write("abc bc c\\n\\r".repeat(2));
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findNext('abc', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 2, resultIndex: 0 }
        ]);
        await ctx.proxy.write("abc bc c\\n\\r");
        await (0, import_TestUtils.timeout)(300);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 2, resultIndex: 0 },
          { resultCount: 3, resultIndex: 0 }
        ]);
      });
    });
    import_test.default.describe("findPrevious", () => {
      (0, import_test.default)("should not fire unless the decorations option is set", async () => {
        await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
        await ctx.proxy.write("abc");
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('a')`), true);
        (0, import_assert.strictEqual)(await ctx.page.evaluate("window.calls.length"), 0);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('b', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.strictEqual)(await ctx.page.evaluate("window.calls.length"), 1);
      });
      (0, import_test.default)("should fire with correct event values", async () => {
        await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
        await ctx.proxy.write("abc bc c");
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 1, resultIndex: 0 }
        ]);
        await ctx.page.evaluate(`window.term.clearSelection()`);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('b', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 1, resultIndex: 0 },
          { resultCount: 2, resultIndex: 1 }
        ]);
        await (0, import_TestUtils.timeout)(2e3);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`debugger; window.search.findPrevious('d', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), false);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 1, resultIndex: 0 },
          { resultCount: 2, resultIndex: 1 },
          { resultCount: 0, resultIndex: -1 }
        ]);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 1, resultIndex: 0 },
          { resultCount: 2, resultIndex: 1 },
          { resultCount: 0, resultIndex: -1 },
          { resultCount: 3, resultIndex: 2 },
          { resultCount: 3, resultIndex: 1 },
          { resultCount: 3, resultIndex: 0 }
        ]);
      });
      (0, import_test.default)("should fire with correct event values (incremental)", async () => {
        await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
        await ctx.proxy.write("d abc aabc d");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('a', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 3, resultIndex: 2 }
        ]);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('ab', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 3, resultIndex: 2 },
          { resultCount: 2, resultIndex: 1 }
        ]);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('abc', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 3, resultIndex: 2 },
          { resultCount: 2, resultIndex: 1 },
          { resultCount: 2, resultIndex: 1 }
        ]);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('abc', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 3, resultIndex: 2 },
          { resultCount: 2, resultIndex: 1 },
          { resultCount: 2, resultIndex: 1 },
          { resultCount: 2, resultIndex: 0 }
        ]);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('d', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 3, resultIndex: 2 },
          { resultCount: 2, resultIndex: 1 },
          { resultCount: 2, resultIndex: 1 },
          { resultCount: 2, resultIndex: 0 },
          { resultCount: 2, resultIndex: 1 }
        ]);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('abcd', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), false);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 3, resultIndex: 2 },
          { resultCount: 2, resultIndex: 1 },
          { resultCount: 2, resultIndex: 1 },
          { resultCount: 2, resultIndex: 0 },
          { resultCount: 2, resultIndex: 1 },
          { resultCount: 0, resultIndex: -1 }
        ]);
      });
      (0, import_test.default)("should fire with more than 1k matches", async () => {
        await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
        const data = ("a bc".repeat(10) + "\\n\\r").repeat(150);
        await ctx.proxy.write(data);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 1e3, resultIndex: -1 }
        ]);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 1e3, resultIndex: -1 },
          { resultCount: 1e3, resultIndex: -1 }
        ]);
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('bc', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 1e3, resultIndex: -1 },
          { resultCount: 1e3, resultIndex: -1 },
          { resultCount: 1e3, resultIndex: -1 }
        ]);
      });
      (0, import_test.default)("should fire when writing to terminal", async () => {
        await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
        await ctx.proxy.write("abc bc c\\n\\r".repeat(2));
        (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('abc', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 2, resultIndex: 1 }
        ]);
        await ctx.proxy.write("abc bc c\\n\\r");
        await (0, import_TestUtils.timeout)(300);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
          { resultCount: 2, resultIndex: 1 },
          { resultCount: 3, resultIndex: 1 }
        ]);
      });
    });
  });
  import_test.default.describe("Regression tests", () => {
    import_test.default.describe("#2444 wrapped line content not being found", () => {
      let fixture;
      import_test.default.beforeAll(async () => {
        fixture = (await new Promise((r) => (0, import_fs.readFile)((0, import_path.resolve)(__dirname, "../fixtures/issue-2444"), (err, data) => r(data)))).toString();
        if (process.platform !== "win32") {
          fixture = fixture.replace(/\n/g, "\n\r");
        }
      });
      (0, import_test.default)("should find all occurrences using findNext", async () => {
        await ctx.proxy.write(fixture);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
        let selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 24, y: 53 }, end: { x: 30, y: 53 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 24, y: 76 }, end: { x: 30, y: 76 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 24, y: 96 }, end: { x: 30, y: 96 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 1, y: 114 }, end: { x: 7, y: 114 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 11, y: 115 }, end: { x: 17, y: 115 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 1, y: 126 }, end: { x: 7, y: 126 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 11, y: 127 }, end: { x: 17, y: 127 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 1, y: 135 }, end: { x: 7, y: 135 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 11, y: 136 }, end: { x: 17, y: 136 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 24, y: 53 }, end: { x: 30, y: 53 } });
      });
      (0, import_test.default)("should y all occurrences using findPrevious", async () => {
        await ctx.proxy.write(fixture);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
        let selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 11, y: 136 }, end: { x: 17, y: 136 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 1, y: 135 }, end: { x: 7, y: 135 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 11, y: 127 }, end: { x: 17, y: 127 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 1, y: 126 }, end: { x: 7, y: 126 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 11, y: 115 }, end: { x: 17, y: 115 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 1, y: 114 }, end: { x: 7, y: 114 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 24, y: 96 }, end: { x: 30, y: 96 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 24, y: 76 }, end: { x: 30, y: 76 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 24, y: 53 }, end: { x: 30, y: 53 } });
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
        selectionPosition = await ctx.proxy.getSelectionPosition();
        (0, import_assert.deepStrictEqual)(selectionPosition, { start: { x: 11, y: 136 }, end: { x: 17, y: 136 } });
      });
    });
  });
  import_test.default.describe("#3834 lines with null characters before search terms", () => {
    (0, import_test.default)("should find all matches on a line containing null characters", async () => {
      await ctx.page.evaluate(`
        window.calls = [];
        window.search.onDidChangeResults(e => window.calls.push(e));
      `);
      await ctx.proxy.write("\\x1b[CHi Hi");
      (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('h', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
      (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window.calls"), [
        { resultCount: 2, resultIndex: 1 }
      ]);
    });
  });
});
function makeData(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
//# sourceMappingURL=SearchAddon.test.js.map
