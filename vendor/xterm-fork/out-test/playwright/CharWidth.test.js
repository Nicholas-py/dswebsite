"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const TestUtils_1 = require("./TestUtils");
let ctx;
test_1.test.beforeAll(async ({ browser }) => {
    ctx = await (0, TestUtils_1.createTestContext)(browser);
    await (0, TestUtils_1.openTerminal)(ctx);
});
test_1.test.afterAll(async () => await ctx.page.close());
test_1.test.beforeEach(async () => await ctx.proxy.reset());
test_1.test.describe('CharWidth Integration Tests', () => {
    test_1.test.describe('getStringCellWidth', () => {
        (0, test_1.test)('ASCII chars', async () => {
            await ctx.proxy.write('This is just ASCII text.#');
            await (0, TestUtils_1.pollFor)(ctx.page, () => sumWidths(0, 1, '#'), 25);
        });
        (0, test_1.test)('combining chars', async () => {
            await ctx.proxy.write('e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301#');
            await (0, TestUtils_1.pollFor)(ctx.page, () => sumWidths(0, 1, '#'), 10);
        });
        (0, test_1.test)('surrogate chars', async () => {
            await ctx.proxy.write('𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞#');
            await (0, TestUtils_1.pollFor)(ctx.page, () => sumWidths(0, 1, '#'), 28);
        });
        (0, test_1.test)('surrogate combining chars', async () => {
            await ctx.proxy.write('𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301#');
            await (0, TestUtils_1.pollFor)(ctx.page, () => sumWidths(0, 1, '#'), 12);
        });
        (0, test_1.test)('fullwidth chars', async () => {
            await ctx.proxy.write('１２３４５６７８９０#');
            await (0, TestUtils_1.pollFor)(ctx.page, () => sumWidths(0, 1, '#'), 21);
        });
        (0, test_1.test)('fullwidth chars offset 1', async () => {
            await ctx.proxy.write('a１２３４５６７８９０#');
            await (0, TestUtils_1.pollFor)(ctx.page, () => sumWidths(0, 1, '#'), 22);
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