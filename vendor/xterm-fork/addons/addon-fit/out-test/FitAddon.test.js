"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const assert_1 = require("assert");
const TestUtils_1 = require("../../../test/playwright/TestUtils");
let ctx;
test_1.default.beforeAll(async ({ browser }) => {
    ctx = await (0, TestUtils_1.createTestContext)(browser);
    ctx.page.setViewportSize({ width: 1024, height: 768 });
    await (0, TestUtils_1.openTerminal)(ctx);
});
test_1.default.afterAll(async () => await ctx.page.close());
test_1.default.describe('FitAddon', () => {
    test_1.default.beforeEach(async function () {
        await ctx.page.evaluate(`document.querySelector('#terminal-container').style.display=''`);
        await ctx.page.evaluate(`
      window.term.reset()
      window.fit?.dispose();
      window.fit = new FitAddon();
      window.term.loadAddon(window.fit);
    `);
    });
    (0, test_1.default)('no terminal', async function () {
        await ctx.page.evaluate(`window.fit2 = new FitAddon();`);
        (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.fit2.proposeDimensions()`), undefined);
        await ctx.page.evaluate(`window.fit2.dispose();`);
    });
    test_1.default.describe('proposeDimensions', () => {
        (0, test_1.default)('default', async function () {
            await setDimensions();
            const dimensions = await ctx.page.evaluate(`window.fit.proposeDimensions()`);
            (0, assert_1.ok)(dimensions.cols > 85);
            (0, assert_1.ok)(dimensions.cols < 88);
            (0, assert_1.ok)(dimensions.rows > 24);
            (0, assert_1.ok)(dimensions.rows < 29);
        });
        (0, test_1.default)('width', async function () {
            await setDimensions(1008);
            const dimensions = await ctx.page.evaluate(`window.fit.proposeDimensions()`);
            (0, assert_1.ok)(dimensions.cols > 108);
            (0, assert_1.ok)(dimensions.cols < 111);
            (0, assert_1.ok)(dimensions.rows > 24);
            (0, assert_1.ok)(dimensions.rows < 29);
        });
        (0, test_1.default)('small', async function () {
            await setDimensions(1, 1);
            (0, assert_1.deepEqual)(await ctx.page.evaluate(`window.fit.proposeDimensions()`), {
                cols: 2,
                rows: 1
            });
        });
        (0, test_1.default)('hidden', async function () {
            await ctx.proxy.dispose();
            await ctx.page.evaluate(`document.querySelector('#terminal-container').style.display='none'`);
            await ctx.page.evaluate(`window.term = new Terminal()`);
            await ctx.page.evaluate(`window.term.open(document.querySelector('#terminal-container'))`);
            await setDimensions();
            const dimensions = await ctx.page.evaluate(`window.fit.proposeDimensions()`);
            if (dimensions) {
                (0, assert_1.ok)(dimensions.cols > 85);
                (0, assert_1.ok)(dimensions.cols < 88);
                (0, assert_1.ok)(dimensions.rows > 24);
                (0, assert_1.ok)(dimensions.rows < 29);
            }
        });
    });
    test_1.default.describe('fit', () => {
        (0, test_1.default)('default', async function () {
            await setDimensions();
            await ctx.page.evaluate(`window.fit.fit()`);
            const cols = await ctx.proxy.cols;
            const rows = await ctx.proxy.rows;
            (0, assert_1.ok)(cols > 85);
            (0, assert_1.ok)(cols < 88);
            (0, assert_1.ok)(rows > 24);
            (0, assert_1.ok)(rows < 29);
        });
        (0, test_1.default)('width', async function () {
            await setDimensions(1008);
            await ctx.page.evaluate(`window.fit.fit()`);
            const cols = await ctx.proxy.cols;
            const rows = await ctx.proxy.rows;
            (0, assert_1.ok)(cols > 108);
            (0, assert_1.ok)(cols < 111);
            (0, assert_1.ok)(rows > 24);
            (0, assert_1.ok)(rows < 29);
        });
        (0, test_1.default)('small', async function () {
            await setDimensions(1, 1);
            await ctx.page.evaluate(`window.fit.fit()`);
            (0, assert_1.strictEqual)(await ctx.proxy.cols, 2);
            (0, assert_1.strictEqual)(await ctx.proxy.rows, 1);
        });
    });
});
async function setDimensions(width = 800, height = 450) {
    await ctx.page.evaluate(`
    document.querySelector('#terminal-container').style.width='${width}px';
    document.querySelector('#terminal-container').style.height='${height}px';
    document.querySelector('#terminal-container').style.display='';
  `);
    await (0, TestUtils_1.timeout)(500);
}
//# sourceMappingURL=FitAddon.test.js.map