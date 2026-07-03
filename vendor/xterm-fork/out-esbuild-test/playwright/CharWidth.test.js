"use strict";
var import_test = require("@playwright/test");
var import_TestUtils = require("./TestUtils");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let ctx;
import_test.test.beforeAll(async ({ browser }) => {
  ctx = await (0, import_TestUtils.createTestContext)(browser);
  await (0, import_TestUtils.openTerminal)(ctx);
});
import_test.test.afterAll(async () => await ctx.page.close());
import_test.test.beforeEach(async () => await ctx.proxy.reset());
import_test.test.describe("CharWidth Integration Tests", () => {
  import_test.test.describe("getStringCellWidth", () => {
    (0, import_test.test)("ASCII chars", async () => {
      await ctx.proxy.write("This is just ASCII text.#");
      await (0, import_TestUtils.pollFor)(ctx.page, () => sumWidths(0, 1, "#"), 25);
    });
    (0, import_test.test)("combining chars", async () => {
      await ctx.proxy.write("e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301#");
      await (0, import_TestUtils.pollFor)(ctx.page, () => sumWidths(0, 1, "#"), 10);
    });
    (0, import_test.test)("surrogate chars", async () => {
      await ctx.proxy.write("\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}\u{1D11E}#");
      await (0, import_TestUtils.pollFor)(ctx.page, () => sumWidths(0, 1, "#"), 28);
    });
    (0, import_test.test)("surrogate combining chars", async () => {
      await ctx.proxy.write("\u{13080}\u0301\u{13080}\u0301\u{13080}\u0301\u{13080}\u0301\u{13080}\u0301\u{13080}\u0301\u{13080}\u0301\u{13080}\u0301\u{13080}\u0301\u{13080}\u0301\u{13080}\u0301#");
      await (0, import_TestUtils.pollFor)(ctx.page, () => sumWidths(0, 1, "#"), 12);
    });
    (0, import_test.test)("fullwidth chars", async () => {
      await ctx.proxy.write("\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19\uFF10#");
      await (0, import_TestUtils.pollFor)(ctx.page, () => sumWidths(0, 1, "#"), 21);
    });
    (0, import_test.test)("fullwidth chars offset 1", async () => {
      await ctx.proxy.write("a\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19\uFF10#");
      await (0, import_TestUtils.pollFor)(ctx.page, () => sumWidths(0, 1, "#"), 22);
    });
  });
});
async function sumWidths(start, end, sentinel) {
  await ctx.page.evaluate(`
    (function() {
      window.result = 0;
      const buffer = window.term.buffer.active;
      for (let i = ${start}; i < ${end}; i++) {
        const line = buffer.getLine(i);
        let j = 0;
        while (true) {
          const cell = line.getCell(j++);
          if (!cell) {
            break;
          }
          window.result += cell.getWidth();
          if (cell.getChars() === '${sentinel}') {
            return;
          }
        }
      }
    })();
  `);
  return await ctx.page.evaluate(`window.result`);
}
//# sourceMappingURL=CharWidth.test.js.map
