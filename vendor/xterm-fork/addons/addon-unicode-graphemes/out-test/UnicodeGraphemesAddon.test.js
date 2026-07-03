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
test_1.default.describe('UnicodeGraphemesAddon', () => {
    test_1.default.beforeEach(async () => {
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
    const ourVersion = '15-graphemes';
    (0, test_1.default)('wcwidth V15 emoji test', async () => {
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.term.unicode.versions`), ['6', '15', '15-graphemes']);
        await ctx.page.evaluate(`window.term.unicode.activeVersion = '${ourVersion}';`);
        (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.unicode.activeVersion`), ourVersion);
        (0, assert_1.strictEqual)(await evalWidth('🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣'), 20, '10 emoji - width 10 in V6; 20 in V11 or later');
        (0, assert_1.strictEqual)(await evalWidth('\u{1F476}\u{1F3FF}\u{1F476}'), 4, 'baby with emoji modifier fitzpatrick type-6; baby');
        (0, assert_1.strictEqual)(await evalWidth('\u{1F469}\u200d\u{1f469}\u200d\u{1f466}'), 2, 'woman+zwj+woman+zwj+boy');
        (0, assert_1.strictEqual)(await evalWidth('=\u{1F3CB}\u{FE0F}=\u{F3CB}\u{1F3FE}\u200D\u2640='), 7, 'person lifting weights (plain, emoji); woman lighting weights, medium dark');
        (0, assert_1.strictEqual)(await evalWidth('\u{1F469}\u{1F469}\u{200D}\u{1F393}\u{1F468}\u{1F3FF}\u{200D}\u{1F393}'), 6, 'woman; woman student; man student dark');
        (0, assert_1.strictEqual)(await evalWidth('\u{1f1f3}\u{1f1f4}/'), 3, 'regional indicator symbol letters N and O, cluster');
        (0, assert_1.strictEqual)(await evalWidth('\u{1f1f3}/\u{1f1f4}'), 3, 'regional indicator symbol letters N and O, separated');
        (0, assert_1.strictEqual)(await evalWidth('\u0061\u0301'), 1, 'letter a with acute accent');
        (0, assert_1.strictEqual)(await evalWidth('{\u1100\u1161\u11a8\u1100\u1161}'), 6, 'Korean Jamo');
        (0, assert_1.strictEqual)(await evalWidth('\uAC00=\uD685='), 6, 'Hangul syllables (pre-composed)');
        (0, assert_1.strictEqual)(await evalWidth('(\u26b0\ufe0e)'), 3, 'coffin with text presentation');
        (0, assert_1.strictEqual)(await evalWidth('(\u26b0\ufe0f)'), 4, 'coffin with emoji presentation');
        (0, assert_1.strictEqual)(await evalWidth('<E\u0301\ufe0fg\ufe0fa\ufe0fl\ufe0fi\ufe0f\ufe0ft\ufe0fe\u0301\ufe0f>'), 16, 'Égalité (using separate acute) emoij_presentation');
    });
});
//# sourceMappingURL=UnicodeGraphemesAddon.test.js.map