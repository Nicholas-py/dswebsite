"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const assert_1 = require("assert");
const TestUtils_1 = require("../../../test/playwright/TestUtils");
let ctx;
test_1.default.beforeAll(async ({ browser }) => {
    ctx = await (0, TestUtils_1.createTestContext)(browser);
    await (0, TestUtils_1.openTerminal)(ctx);
});
test_1.default.afterAll(async () => await ctx.page.close());
test_1.default.describe('Unicode11Addon', () => {
    test_1.default.beforeEach(async () => {
        await ctx.page.evaluate(`
      window.term.reset()
      window.unicode11?.dispose();
      window.unicode11 = new Unicode11Addon();
      window.term.loadAddon(window.unicode11);
    `);
    });
    (0, test_1.default)('wcwidth V11 emoji test', async () => {
        (0, assert_1.deepStrictEqual)((await ctx.page.evaluate(`window.term.unicode.versions`)).includes('11'), true);
        await ctx.page.evaluate(`window.term.unicode.activeVersion = '11';`);
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.term.unicode.activeVersion`), '11');
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.term._core.unicodeService.getStringCellWidth('🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣')`), 20);
    });
});
//# sourceMappingURL=Unicode11Addon.test.js.map