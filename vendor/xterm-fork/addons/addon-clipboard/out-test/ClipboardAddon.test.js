"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const assert_1 = require("assert");
const TestUtils_1 = require("../../../test/playwright/TestUtils");
let ctx;
test_1.default.beforeAll(async ({ browser }, testInfo) => {
    ctx = await (0, TestUtils_1.createTestContext)(browser);
    await (0, TestUtils_1.openTerminal)(ctx);
});
test_1.default.afterAll(async () => {
    await ctx.page.close();
});
test_1.default.describe('ClipboardAddon', () => {
    test_1.default.beforeEach(async ({}, testInfo) => {
        if (ctx.browser.browserType().name() !== 'chromium') {
            testInfo.skip();
            return;
        }
        if (ctx.browser.browserType().name() === 'chromium') {
            await ctx.page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
        }
        await ctx.page.evaluate(`
      window.term.reset()
      window.clipboard?.dispose();
      window.clipboard = new ClipboardAddon();
      window.term.loadAddon(window.clipboard);
    `);
    });
    test_1.default.beforeEach(async () => {
        await ctx.proxy.reset();
    });
    const testDataEncoded = 'aGVsbG8gd29ybGQ=';
    const testDataDecoded = 'hello world';
    test_1.default.describe('write data', async function () {
        (0, test_1.default)('simple string', async () => {
            await ctx.proxy.write(`\x1b]52;c;${testDataEncoded}\x07`);
            (0, assert_1.deepEqual)(await ctx.page.evaluate(() => window.navigator.clipboard.readText()), testDataDecoded);
        });
        (0, test_1.default)('invalid base64 string', async () => {
            await ctx.proxy.write(`\x1b]52;c;${testDataEncoded}invalid\x07`);
            (0, assert_1.deepEqual)(await ctx.page.evaluate(() => window.navigator.clipboard.readText()), '');
        });
        (0, test_1.default)('empty string', async () => {
            await ctx.proxy.write(`\x1b]52;c;${testDataEncoded}\x07`);
            await ctx.proxy.write(`\x1b]52;c;\x07`);
            (0, assert_1.deepEqual)(await ctx.page.evaluate(() => window.navigator.clipboard.readText()), '');
        });
    });
    test_1.default.describe('read data', async function () {
        (0, test_1.default)('simple string', async () => {
            await ctx.page.evaluate(`
        window.data = [];
        window.term.onData(e => data.push(e));
      `);
            await ctx.page.evaluate(() => window.navigator.clipboard.writeText('hello world'));
            await ctx.proxy.write(`\x1b]52;c;?\x07`);
            (0, assert_1.deepEqual)(await ctx.page.evaluate('window.data'), [`\x1b]52;c;${testDataEncoded}\x07`]);
        });
        (0, test_1.default)('clear clipboard', async () => {
            await ctx.proxy.write(`\x1b]52;c;!\x07`);
            await ctx.proxy.write(`\x1b]52;c;?\x07`);
            (0, assert_1.deepEqual)(await ctx.page.evaluate(() => window.navigator.clipboard.readText()), '');
        });
    });
});
//# sourceMappingURL=ClipboardAddon.test.js.map