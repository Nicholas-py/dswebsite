"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const assert_1 = require("assert");
const fs_1 = require("fs");
const path_1 = require("path");
const TestUtils_1 = require("../../../test/playwright/TestUtils");
let ctx;
test_1.default.beforeAll(async ({ browser }) => {
    ctx = await (0, TestUtils_1.createTestContext)(browser);
    await (0, TestUtils_1.openTerminal)(ctx, { cols: 80, rows: 24 });
});
test_1.default.afterAll(async () => await ctx.page.close());
test_1.default.describe('Search Tests', () => {
    test_1.default.beforeEach(async () => {
        await ctx.page.evaluate(`
      window.term.reset()
      window.search?.dispose();
      window.search = new SearchAddon();
      window.term.loadAddon(window.search);
    `);
    });
    (0, test_1.default)('Simple Search', async () => {
        await ctx.proxy.write('dafhdjfldshafhldsahfkjhldhjkftestlhfdsakjfhdjhlfdsjkafhjdlk');
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('test')`), true);
        (0, assert_1.deepStrictEqual)(await ctx.proxy.getSelection(), 'test');
    });
    (0, test_1.default)('Scrolling Search', async () => {
        let dataString = '';
        for (let i = 0; i < 100; i++) {
            if (i === 52) {
                dataString += '$^1_3{}test$#';
            }
            dataString += makeData(50);
        }
        await ctx.proxy.write(dataString);
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('$^1_3{}test$#')`), true);
        (0, assert_1.deepStrictEqual)(await ctx.proxy.getSelection(), '$^1_3{}test$#');
    });
    (0, test_1.default)('Incremental Find Previous', async () => {
        await ctx.proxy.writeln(`package.jsonc\n`);
        await ctx.proxy.write('package.json pack package.lock');
        await ctx.page.evaluate(`window.search.findPrevious('pack', {incremental: true})`);
        let selectionPosition = (await ctx.proxy.getSelectionPosition());
        let line = await (await ctx.proxy.buffer.active.getLine(selectionPosition.start.y)).translateToString();
        (0, assert_1.deepStrictEqual)(line.substring(selectionPosition.start.x, selectionPosition.end.x + 8), 'package.lock');
        await ctx.page.evaluate(`window.search.findPrevious('package.j', {incremental: true})`);
        selectionPosition = (await ctx.proxy.getSelectionPosition());
        (0, assert_1.deepStrictEqual)(line.substring(selectionPosition.start.x, selectionPosition.end.x + 3), 'package.json');
        await ctx.page.evaluate(`window.search.findPrevious('package.jsonc', {incremental: true})`);
        selectionPosition = (await ctx.proxy.getSelectionPosition());
        line = await (await ctx.proxy.buffer.active.getLine(selectionPosition.start.y)).translateToString();
        (0, assert_1.deepStrictEqual)(line.substring(selectionPosition.start.x, selectionPosition.end.x), 'package.jsonc');
    });
    (0, test_1.default)('Incremental Find Next', async () => {
        await ctx.proxy.writeln(`package.lock pack package.json package.ups\n`);
        await ctx.proxy.write('package.jsonc');
        await ctx.page.evaluate(`window.search.findNext('pack', {incremental: true})`);
        let selectionPosition = (await ctx.proxy.getSelectionPosition());
        let line = await (await ctx.proxy.buffer.active.getLine(selectionPosition.start.y)).translateToString();
        (0, assert_1.deepStrictEqual)(line.substring(selectionPosition.start.x, selectionPosition.end.x + 8), 'package.lock');
        await ctx.page.evaluate(`window.search.findNext('package.j', {incremental: true})`);
        selectionPosition = (await ctx.proxy.getSelectionPosition());
        (0, assert_1.deepStrictEqual)(line.substring(selectionPosition.start.x, selectionPosition.end.x + 3), 'package.json');
        await ctx.page.evaluate(`window.search.findNext('package.jsonc', {incremental: true})`);
        selectionPosition = (await ctx.proxy.getSelectionPosition());
        line = await (await ctx.proxy.buffer.active.getLine(selectionPosition.start.y)).translateToString();
        (0, assert_1.deepStrictEqual)(line.substring(selectionPosition.start.x, selectionPosition.end.x), 'package.jsonc');
    });
    (0, test_1.default)('Simple Regex', async () => {
        await ctx.proxy.write('abc123defABCD');
        await ctx.page.evaluate(`window.search.findNext('[a-z]+', {regex: true})`);
        (0, assert_1.deepStrictEqual)(await ctx.proxy.getSelection(), 'abc');
        await ctx.page.evaluate(`window.search.findNext('[A-Z]+', {regex: true, caseSensitive: true})`);
        (0, assert_1.deepStrictEqual)(await ctx.proxy.getSelection(), 'ABCD');
    });
    (0, test_1.default)('Search for single result twice should not unselect it', async () => {
        await ctx.proxy.write('abc def');
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('abc')`), true);
        (0, assert_1.deepStrictEqual)(await ctx.proxy.getSelection(), 'abc');
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('abc')`), true);
        (0, assert_1.deepStrictEqual)(await ctx.proxy.getSelection(), 'abc');
    });
    (0, test_1.default)('Search for result bounding with wide unicode chars', async () => {
        await ctx.proxy.write('中文xx𝄞𝄞');
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('中')`), true);
        (0, assert_1.deepStrictEqual)(await ctx.proxy.getSelection(), '中');
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('xx')`), true);
        (0, assert_1.deepStrictEqual)(await ctx.proxy.getSelection(), 'xx');
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('𝄞')`), true);
        (0, assert_1.deepStrictEqual)(await ctx.proxy.getSelection(), '𝄞');
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('𝄞')`), true);
        (0, assert_1.deepStrictEqual)(await ctx.proxy.getSelectionPosition(), {
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
    test_1.default.describe('onDidChangeResults', async () => {
        test_1.default.describe('findNext', () => {
            (0, test_1.default)('should not fire unless the decorations option is set', async () => {
                await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await ctx.proxy.write('abc');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findNext('a')`), true);
                (0, assert_1.strictEqual)(await ctx.page.evaluate('window.calls.length'), 0);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findNext('b', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.strictEqual)(await ctx.page.evaluate('window.calls.length'), 1);
            });
            (0, test_1.default)('should fire with correct event values', async () => {
                await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await ctx.proxy.write('abc bc c');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findNext('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 }
                ]);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findNext('b', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 }
                ]);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findNext('d', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), false);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 0, resultIndex: -1 }
                ]);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findNext('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findNext('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findNext('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 0, resultIndex: -1 },
                    { resultCount: 3, resultIndex: 0 },
                    { resultCount: 3, resultIndex: 1 },
                    { resultCount: 3, resultIndex: 2 }
                ]);
            });
            (0, test_1.default)('should fire with correct event values (incremental)', async () => {
                await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await ctx.proxy.write('d abc aabc d');
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('a', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 0 }
                ]);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('ab', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 }
                ]);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('abc', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 }
                ]);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('abc', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 }
                ]);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('d', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 1 }
                ]);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('abcd', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), false);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 0, resultIndex: -1 }
                ]);
            });
            (0, test_1.default)('should fire with more than 1k matches', async () => {
                await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                const data = ('a bc'.repeat(10) + '\\n\\r').repeat(150);
                await ctx.proxy.write(data);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findNext('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 1000, resultIndex: 0 }
                ]);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findNext('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 1000, resultIndex: 0 },
                    { resultCount: 1000, resultIndex: 1 }
                ]);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findNext('bc', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 1000, resultIndex: 0 },
                    { resultCount: 1000, resultIndex: 1 },
                    { resultCount: 1000, resultIndex: 1 }
                ]);
            });
            (0, test_1.default)('should fire when writing to terminal', async () => {
                await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await ctx.proxy.write('abc bc c\\n\\r'.repeat(2));
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findNext('abc', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 2, resultIndex: 0 }
                ]);
                await ctx.proxy.write('abc bc c\\n\\r');
                await (0, TestUtils_1.timeout)(300);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 3, resultIndex: 0 }
                ]);
            });
        });
        test_1.default.describe('findPrevious', () => {
            (0, test_1.default)('should not fire unless the decorations option is set', async () => {
                await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await ctx.proxy.write('abc');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('a')`), true);
                (0, assert_1.strictEqual)(await ctx.page.evaluate('window.calls.length'), 0);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('b', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.strictEqual)(await ctx.page.evaluate('window.calls.length'), 1);
            });
            (0, test_1.default)('should fire with correct event values', async () => {
                await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await ctx.proxy.write('abc bc c');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 }
                ]);
                await ctx.page.evaluate(`window.term.clearSelection()`);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('b', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 }
                ]);
                await (0, TestUtils_1.timeout)(2000);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`debugger; window.search.findPrevious('d', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), false);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 0, resultIndex: -1 }
                ]);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 0, resultIndex: -1 },
                    { resultCount: 3, resultIndex: 2 },
                    { resultCount: 3, resultIndex: 1 },
                    { resultCount: 3, resultIndex: 0 }
                ]);
            });
            (0, test_1.default)('should fire with correct event values (incremental)', async () => {
                await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await ctx.proxy.write('d abc aabc d');
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('a', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 2 }
                ]);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('ab', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 2 },
                    { resultCount: 2, resultIndex: 1 }
                ]);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('abc', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 2 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 1 }
                ]);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('abc', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 2 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 0 }
                ]);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('d', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 2 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 }
                ]);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('abcd', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), false);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 2 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 0, resultIndex: -1 }
                ]);
            });
            (0, test_1.default)('should fire with more than 1k matches', async () => {
                await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                const data = ('a bc'.repeat(10) + '\\n\\r').repeat(150);
                await ctx.proxy.write(data);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 1000, resultIndex: -1 }
                ]);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 1000, resultIndex: -1 },
                    { resultCount: 1000, resultIndex: -1 }
                ]);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('bc', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 1000, resultIndex: -1 },
                    { resultCount: 1000, resultIndex: -1 },
                    { resultCount: 1000, resultIndex: -1 }
                ]);
            });
            (0, test_1.default)('should fire when writing to terminal', async () => {
                await ctx.page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await ctx.proxy.write('abc bc c\\n\\r'.repeat(2));
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('abc', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 2, resultIndex: 1 }
                ]);
                await ctx.proxy.write('abc bc c\\n\\r');
                await (0, TestUtils_1.timeout)(300);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 3, resultIndex: 1 }
                ]);
            });
        });
    });
    test_1.default.describe('Regression tests', () => {
        test_1.default.describe('#2444 wrapped line content not being found', () => {
            let fixture;
            test_1.default.beforeAll(async () => {
                fixture = (await new Promise(r => (0, fs_1.readFile)((0, path_1.resolve)(__dirname, '../fixtures/issue-2444'), (err, data) => r(data)))).toString();
                if (process.platform !== 'win32') {
                    fixture = fixture.replace(/\n/g, '\n\r');
                }
            });
            (0, test_1.default)('should find all occurrences using findNext', async () => {
                await ctx.proxy.write(fixture);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
                let selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 24, y: 53 }, end: { x: 30, y: 53 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 24, y: 76 }, end: { x: 30, y: 76 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 24, y: 96 }, end: { x: 30, y: 96 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 1, y: 114 }, end: { x: 7, y: 114 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 11, y: 115 }, end: { x: 17, y: 115 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 1, y: 126 }, end: { x: 7, y: 126 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 11, y: 127 }, end: { x: 17, y: 127 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 1, y: 135 }, end: { x: 7, y: 135 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 11, y: 136 }, end: { x: 17, y: 136 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 24, y: 53 }, end: { x: 30, y: 53 } });
            });
            (0, test_1.default)('should y all occurrences using findPrevious', async () => {
                await ctx.proxy.write(fixture);
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
                let selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 11, y: 136 }, end: { x: 17, y: 136 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 1, y: 135 }, end: { x: 7, y: 135 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 11, y: 127 }, end: { x: 17, y: 127 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 1, y: 126 }, end: { x: 7, y: 126 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 11, y: 115 }, end: { x: 17, y: 115 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 1, y: 114 }, end: { x: 7, y: 114 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 24, y: 96 }, end: { x: 30, y: 96 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 24, y: 76 }, end: { x: 30, y: 76 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 24, y: 53 }, end: { x: 30, y: 53 } });
                (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await ctx.proxy.getSelectionPosition();
                (0, assert_1.deepStrictEqual)(selectionPosition, { start: { x: 11, y: 136 }, end: { x: 17, y: 136 } });
            });
        });
    });
    test_1.default.describe('#3834 lines with null characters before search terms', () => {
        (0, test_1.default)('should find all matches on a line containing null characters', async () => {
            await ctx.page.evaluate(`
        window.calls = [];
        window.search.onDidChangeResults(e => window.calls.push(e));
      `);
            await ctx.proxy.write('\\x1b[CHi Hi');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.search.findPrevious('h', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
            (0, assert_1.deepStrictEqual)(await ctx.page.evaluate('window.calls'), [
                { resultCount: 2, resultIndex: 1 }
            ]);
        });
    });
});
function makeData(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
//# sourceMappingURL=SearchAddon.test.js.map