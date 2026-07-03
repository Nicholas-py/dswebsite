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
import_test.default.describe("UnicodeGraphemesAddon", () => {
  import_test.default.beforeEach(async () => {
    await ctx.page.evaluate(`
      window.term.reset()
      window.unicode?.dispose();
      window.unicode = new UnicodeGraphemesAddon();
      window.term.loadAddon(window.unicode);
    `);
  });
  async function evalWidth(str) {
    return ctx.page.evaluate(`window.term._core.unicodeService.getStringCellWidth('${str}')`);
  }
  const ourVersion = "15-graphemes";
  (0, import_test.default)("wcwidth V15 emoji test", async () => {
    (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.term.unicode.versions`), ["6", "15", "15-graphemes"]);
    await ctx.page.evaluate(`window.term.unicode.activeVersion = '${ourVersion}';`);
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.term.unicode.activeVersion`), ourVersion);
    (0, import_assert.strictEqual)(
      await evalWidth("\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}\u{1F923}"),
      20,
      "10 emoji - width 10 in V6; 20 in V11 or later"
    );
    (0, import_assert.strictEqual)(
      await evalWidth("\u{1F476}\u{1F3FF}\u{1F476}"),
      4,
      "baby with emoji modifier fitzpatrick type-6; baby"
    );
    (0, import_assert.strictEqual)(
      await evalWidth("\u{1F469}\u200D\u{1F469}\u200D\u{1F466}"),
      2,
      "woman+zwj+woman+zwj+boy"
    );
    (0, import_assert.strictEqual)(
      await evalWidth("=\u{1F3CB}\uFE0F=\uF3CB\u{1F3FE}\u200D\u2640="),
      7,
      "person lifting weights (plain, emoji); woman lighting weights, medium dark"
    );
    (0, import_assert.strictEqual)(
      await evalWidth("\u{1F469}\u{1F469}\u200D\u{1F393}\u{1F468}\u{1F3FF}\u200D\u{1F393}"),
      6,
      "woman; woman student; man student dark"
    );
    (0, import_assert.strictEqual)(
      await evalWidth("\u{1F1F3}\u{1F1F4}/"),
      3,
      "regional indicator symbol letters N and O, cluster"
    );
    (0, import_assert.strictEqual)(
      await evalWidth("\u{1F1F3}/\u{1F1F4}"),
      3,
      "regional indicator symbol letters N and O, separated"
    );
    (0, import_assert.strictEqual)(
      await evalWidth("a\u0301"),
      1,
      "letter a with acute accent"
    );
    (0, import_assert.strictEqual)(
      await evalWidth("{\u1100\u1161\u11A8\u1100\u1161}"),
      6,
      "Korean Jamo"
    );
    (0, import_assert.strictEqual)(
      await evalWidth("\uAC00=\uD685="),
      6,
      "Hangul syllables (pre-composed)"
    );
    (0, import_assert.strictEqual)(
      await evalWidth("(\u26B0\uFE0E)"),
      3,
      "coffin with text presentation"
    );
    (0, import_assert.strictEqual)(
      await evalWidth("(\u26B0\uFE0F)"),
      4,
      "coffin with emoji presentation"
    );
    (0, import_assert.strictEqual)(
      await evalWidth("<E\u0301\uFE0Fg\uFE0Fa\uFE0Fl\uFE0Fi\uFE0F\uFE0Ft\uFE0Fe\u0301\uFE0F>"),
      16,
      "\xC9galit\xE9 (using separate acute) emoij_presentation"
    );
  });
});
//# sourceMappingURL=UnicodeGraphemesAddon.test.js.map
