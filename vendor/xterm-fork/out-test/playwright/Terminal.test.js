"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const assert_1 = require("assert");
const TestUtils_1 = require("./TestUtils");
let ctx;
test_1.test.beforeAll(async ({ browser }) => {
    ctx = await (0, TestUtils_1.createTestContext)(browser);
    await (0, TestUtils_1.openTerminal)(ctx);
});
test_1.test.afterAll(async () => await ctx.page.close());
test_1.test.describe('API Integration Tests', () => {
    (0, test_1.test)('Default options', async () => {
        (0, assert_1.strictEqual)(await ctx.proxy.cols, 80);
        (0, assert_1.strictEqual)(await ctx.proxy.rows, 24);
    });
    (0, test_1.test)('Proposed API check', async () => {
        await (0, TestUtils_1.openTerminal)(ctx, { allowProposedApi: false }, { loadUnicodeGraphemesAddon: false });
        await ctx.page.evaluate(`
      try {
        window.term.markers;
      } catch (e) {
        window.throwMessage = e.message;
      }
    `);
        await (0, TestUtils_1.pollFor)(ctx.page, 'window.throwMessage', 'You must set the allowProposedApi option to true to use proposed API');
    });
    (0, test_1.test)('write', async () => {
        await (0, TestUtils_1.openTerminal)(ctx);
        await ctx.page.evaluate(`
      window.term.write('foo');
      window.term.write('bar');
      window.term.write('文');
    `);
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foobar文');
    });
    (0, test_1.test)('write with callback', async () => {
        await (0, TestUtils_1.openTerminal)(ctx);
        await ctx.page.evaluate(`
      window.term.write('foo', () => { window.__x = 'a'; });
      window.term.write('bar', () => { window.__x += 'b'; });
      window.term.write('文', () => { window.__x += 'c'; });
    `);
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foobar文');
        await (0, TestUtils_1.pollFor)(ctx.page, `window.__x`, 'abc');
    });
    (0, test_1.test)('write - bytes (UTF8)', async () => {
        await (0, TestUtils_1.openTerminal)(ctx);
        await ctx.page.evaluate(`
      window.term.write(new Uint8Array([102, 111, 111])); // foo
      window.term.write(new Uint8Array([98, 97, 114])); // bar
      window.term.write(new Uint8Array([230, 150, 135])); // 文
    `);
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foobar文');
    });
    (0, test_1.test)('write - bytes (UTF8) with callback', async () => {
        await (0, TestUtils_1.openTerminal)(ctx);
        await ctx.page.evaluate(`
      window.term.write(new Uint8Array([102, 111, 111]), () => { window.__x = 'A'; }); // foo
      window.term.write(new Uint8Array([98, 97, 114]), () => { window.__x += 'B'; }); // bar
      window.term.write(new Uint8Array([230, 150, 135]), () => { window.__x += 'C'; }); // 文
    `);
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foobar文');
        await (0, TestUtils_1.pollFor)(ctx.page, `window.__x`, 'ABC');
    });
    (0, test_1.test)('writeln', async () => {
        await (0, TestUtils_1.openTerminal)(ctx);
        await ctx.page.evaluate(`
      window.term.writeln('foo');
      window.term.writeln('bar');
      window.term.writeln('文');
    `);
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foo');
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(1).translateToString(true)`, 'bar');
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(2).translateToString(true)`, '文');
    });
    (0, test_1.test)('writeln with callback', async () => {
        await (0, TestUtils_1.openTerminal)(ctx);
        await ctx.page.evaluate(`
      window.term.writeln('foo', () => { window.__x = '1'; });
      window.term.writeln('bar', () => { window.__x += '2'; });
      window.term.writeln('文', () => { window.__x += '3'; });
    `);
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foo');
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(1).translateToString(true)`, 'bar');
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(2).translateToString(true)`, '文');
        await (0, TestUtils_1.pollFor)(ctx.page, `window.__x`, '123');
    });
    (0, test_1.test)('writeln - bytes (UTF8)', async () => {
        await (0, TestUtils_1.openTerminal)(ctx);
        await ctx.page.evaluate(`
      window.term.writeln(new Uint8Array([102, 111, 111]));
      window.term.writeln(new Uint8Array([98, 97, 114]));
      window.term.writeln(new Uint8Array([230, 150, 135]));
    `);
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foo');
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(1).translateToString(true)`, 'bar');
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(2).translateToString(true)`, '文');
    });
    (0, test_1.test)('paste', async () => {
        await (0, TestUtils_1.openTerminal)(ctx);
        const calls = [];
        ctx.proxy.onData(e => calls.push(e));
        await ctx.proxy.paste('foo');
        await ctx.proxy.paste('\r\nfoo\nbar\r');
        await ctx.proxy.write('\x1b[?2004h');
        await ctx.proxy.paste('foo');
        await ctx.page.evaluate(`window.term.options.ignoreBracketedPasteMode = true;`);
        await ctx.proxy.paste('check_mode');
        (0, assert_1.deepStrictEqual)(calls, ['foo', '\rfoo\rbar\r', '\x1b[200~foo\x1b[201~', 'check_mode']);
    });
    (0, test_1.test)('clear', async () => {
        await (0, TestUtils_1.openTerminal)(ctx, { rows: 5 });
        await ctx.page.evaluate(`
      window.term.write('test0');
      window.parsed = 0;
      for (let i = 1; i < 10; i++) {
        window.term.write('\\n\\rtest' + i, () => window.parsed++);
      }
    `);
        await (0, TestUtils_1.pollFor)(ctx.page, `window.parsed`, 9);
        await ctx.page.evaluate(`window.term.clear()`);
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.length`, 5);
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'test9');
        for (let i = 1; i < 5; i++) {
            await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(${i}).translateToString(true)`, '');
        }
    });
    test_1.test.describe('options', () => {
        (0, test_1.test)('getter', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.options.cols`), 80);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.options.rows`), 24);
        });
        (0, test_1.test)('setter', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            try {
                await ctx.page.evaluate('window.term.options.cols = 40');
                test_1.test.fail();
            }
            catch { }
            try {
                await ctx.page.evaluate('window.term.options.rows = 20');
                test_1.test.fail();
            }
            catch { }
            await ctx.page.evaluate('window.term.options.scrollback = 1');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.options.scrollback`), 1);
            await ctx.page.evaluate(`
        window.term.options = {
          fontSize: 30,
          fontFamily: 'Arial'
        };
      `);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.options.fontSize`), 30);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.options.fontFamily`), 'Arial');
        });
        (0, test_1.test)('object.keys return the correct number of options', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            (0, assert_1.notStrictEqual)(await ctx.page.evaluate(`Object.keys(window.term.options).length`), 0);
        });
    });
    test_1.test.describe('renderer', () => {
        (0, test_1.test)('foreground', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.proxy.write('\x1b[30m0\x1b[31m1\x1b[32m2\x1b[33m3\x1b[34m4\x1b[35m5\x1b[36m6\x1b[37m7');
            await (0, TestUtils_1.pollFor)(ctx.page, `document.querySelectorAll('.xterm-rows > :nth-child(1) > *').length`, 9);
            (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`
        [
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(1)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(2)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(3)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(4)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(5)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(6)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(7)').className
        ]
      `), [
                'xterm-fg-0',
                'xterm-fg-1',
                'xterm-fg-2',
                'xterm-fg-3',
                'xterm-fg-4',
                'xterm-fg-5',
                'xterm-fg-6'
            ]);
        });
        (0, test_1.test)('background', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.proxy.write('\x1b[40m0\x1b[41m1\x1b[42m2\x1b[43m3\x1b[44m4\x1b[45m5\x1b[46m6\x1b[47m7');
            await (0, TestUtils_1.pollFor)(ctx.page, `document.querySelectorAll('.xterm-rows > :nth-child(1) > *').length`, 9);
            (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`
        [
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(1)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(2)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(3)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(4)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(5)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(6)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(7)').className
        ]
      `), [
                'xterm-bg-0',
                'xterm-bg-1',
                'xterm-bg-2',
                'xterm-bg-3',
                'xterm-bg-4',
                'xterm-bg-5',
                'xterm-bg-6'
            ]);
        });
    });
    (0, test_1.test)('selection', async () => {
        await (0, TestUtils_1.openTerminal)(ctx, { rows: 5, cols: 5 });
        await ctx.proxy.write(`\n\nfoo\n\n\rbar\n\n\rbaz`);
        (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.hasSelection()`), false);
        (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.getSelection()`), '');
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.term.getSelectionPosition()`), undefined);
        await ctx.page.evaluate(`window.term.selectAll()`);
        (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.hasSelection()`), true);
        if (process.platform === 'win32') {
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.getSelection()`), '\r\n\r\nfoo\r\n\r\nbar\r\n\r\nbaz');
        }
        else {
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.getSelection()`), '\n\nfoo\n\nbar\n\nbaz');
        }
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.term.getSelectionPosition()`), { start: { x: 0, y: 0 }, end: { x: 5, y: 6 } });
        await ctx.page.evaluate(`window.term.clearSelection()`);
        (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.hasSelection()`), false);
        (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.getSelection()`), '');
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.term.getSelectionPosition()`), undefined);
        await ctx.page.evaluate(`window.term.select(1, 2, 2)`);
        (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.hasSelection()`), true);
        (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.getSelection()`), 'oo');
        (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.term.getSelectionPosition()`), { start: { x: 1, y: 2 }, end: { x: 3, y: 2 } });
    });
    (0, test_1.test)('focus, blur', async () => {
        await (0, TestUtils_1.openTerminal)(ctx);
        (0, assert_1.strictEqual)(await ctx.page.evaluate(`document.activeElement.className`), '');
        await ctx.page.evaluate(`window.term.focus()`);
        (0, assert_1.strictEqual)(await ctx.page.evaluate(`document.activeElement.className`), 'xterm-helper-textarea');
        await ctx.page.evaluate(`window.term.blur()`);
        (0, assert_1.strictEqual)(await ctx.page.evaluate(`document.activeElement.className`), '');
    });
    test_1.test.describe('loadAddon', () => {
        (0, test_1.test)('constructor', async () => {
            await (0, TestUtils_1.openTerminal)(ctx, { cols: 5 });
            await ctx.page.evaluate(`
        window.cols = 0;
        window.term.loadAddon({
          activate: (t) => window.cols = t.cols,
          dispose: () => {}
        });
      `);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.cols`), 5);
        });
        (0, test_1.test)('dispose (addon)', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.page.evaluate(`
        window.disposeCalled = false
        window.addon = {
          activate: () => {},
          dispose: () => window.disposeCalled = true
        };
        window.term.loadAddon(window.addon);
      `);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.disposeCalled`), false);
            await ctx.page.evaluate(`window.addon.dispose()`);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.disposeCalled`), true);
        });
        (0, test_1.test)('dispose (terminal)', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.page.evaluate(`
        window.disposeCalled = false
        window.term.loadAddon({
          activate: () => {},
          dispose: () => window.disposeCalled = true
        });
      `);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.disposeCalled`), false);
            await ctx.page.evaluate(`window.term.dispose()`);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.disposeCalled`), true);
        });
    });
    test_1.test.describe('Events', () => {
        (0, test_1.test)('onCursorMove', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.page.evaluate(`
        window.callCount = 0;
        window.term.onCursorMove(e => window.callCount++);
        window.term.write('foo');
      `);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.callCount`, 1);
            await ctx.page.evaluate(`window.term.write('bar')`);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.callCount`, 2);
        });
        (0, test_1.test)('onData', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.page.evaluate(`
        window.calls = [];
        window.term.onData(e => calls.push(e));
      `);
            await ctx.page.type('.xterm-helper-textarea', 'foo');
            (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.calls`), ['f', 'o', 'o']);
        });
        (0, test_1.test)('onKey', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.page.evaluate(`
        window.calls = [];
        window.term.onKey(e => calls.push(e.key));
      `);
            await ctx.page.type('.xterm-helper-textarea', 'foo');
            (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.calls`), ['f', 'o', 'o']);
        });
        (0, test_1.test)('onLineFeed', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.page.evaluate(`
        window.callCount = 0;
        window.term.onLineFeed(() => callCount++);
        window.term.writeln('foo');
      `);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.callCount`, 1);
            await ctx.page.evaluate(`window.term.writeln('bar')`);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.callCount`, 2);
        });
        (0, test_1.test)('onScroll', async () => {
            await (0, TestUtils_1.openTerminal)(ctx, { rows: 5 });
            await ctx.page.evaluate(`
        window.calls = [];
        window.term.onScroll(e => window.calls.push(e));
        for (let i = 0; i < 4; i++) {
          window.term.writeln('foo');
        }
      `);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, []);
            await ctx.page.evaluate(`window.term.writeln('bar')`);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [1]);
            await ctx.page.evaluate(`window.term.writeln('baz')`);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [1, 2]);
        });
        (0, test_1.test)('onSelectionChange', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.page.evaluate(`
        window.callCount = 0;
        window.term.onSelectionChange(() => window.callCount++);
      `);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.callCount`, 0);
            await ctx.page.evaluate(`window.term.selectAll()`);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.callCount`, 1);
            await ctx.page.evaluate(`window.term.clearSelection()`);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.callCount`, 2);
        });
        (0, test_1.test)('onRender', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await (0, TestUtils_1.timeout)(20);
            await ctx.page.evaluate(`
        window.calls = [];
        window.term.onRender(e => window.calls.push([e.start, e.end]));
      `);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, []);
            await ctx.page.evaluate(`window.term.write('foo')`);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [[0, 0]]);
            await ctx.page.evaluate(`window.term.write('bar\\n\\nbaz')`);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [[0, 0], [0, 2]]);
        });
        (0, test_1.test)('onResize', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await (0, TestUtils_1.timeout)(20);
            await ctx.page.evaluate(`
        window.calls = [];
        window.term.onResize(e => window.calls.push([e.cols, e.rows]));
      `);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, []);
            await ctx.page.evaluate(`window.term.resize(10, 5)`);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [[10, 5]]);
            await ctx.page.evaluate(`window.term.resize(20, 15)`);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [[10, 5], [20, 15]]);
        });
        (0, test_1.test)('onTitleChange', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.page.evaluate(`
        window.calls = [];
        window.term.onTitleChange(e => window.calls.push(e));
      `);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, []);
            await ctx.page.evaluate(`window.term.write('\x1b]2;foo\x9c')`);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['foo']);
        });
        (0, test_1.test)('onBell', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.page.evaluate(`
        window.calls = [];
        window.term.onBell(() => window.calls.push(true));
      `);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, []);
            await ctx.page.evaluate(`window.term.write('\x07')`);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [true]);
        });
    });
    test_1.test.describe('buffer', () => {
        (0, test_1.test)('cursorX, cursorY', async () => {
            await (0, TestUtils_1.openTerminal)(ctx, { rows: 5, cols: 5 });
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.cursorX`), 0);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.cursorY`), 0);
            await ctx.proxy.write('foo');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.cursorX`), 3);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.cursorY`), 0);
            await ctx.proxy.write('\n');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.cursorX`), 3);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.cursorY`), 1);
            await ctx.proxy.write('\r');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.cursorX`), 0);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.cursorY`), 1);
            await ctx.proxy.write('abcde');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.cursorX`), 5);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.cursorY`), 1);
            await ctx.proxy.write('\n\r\n\n\n\n\n');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.cursorX`), 0);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.cursorY`), 4);
        });
        (0, test_1.test)('viewportY', async () => {
            await (0, TestUtils_1.openTerminal)(ctx, { rows: 5 });
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.viewportY`), 0);
            await ctx.proxy.write('\n\n\n\n');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.viewportY`), 0);
            await ctx.proxy.write('\n');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.viewportY`), 1);
            await ctx.proxy.write('\n\n\n\n');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.viewportY`), 5);
            await ctx.page.evaluate(`window.term.scrollLines(-1)`);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.viewportY`), 4);
            await ctx.page.evaluate(`window.term.scrollToTop()`);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.viewportY`), 0);
        });
        (0, test_1.test)('baseY', async () => {
            await (0, TestUtils_1.openTerminal)(ctx, { rows: 5 });
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.baseY`), 0);
            await ctx.proxy.write('\n\n\n\n');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.baseY`), 0);
            await ctx.proxy.write('\n');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.baseY`), 1);
            await ctx.proxy.write('\n\n\n\n');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.baseY`), 5);
            await ctx.page.evaluate(`window.term.scrollLines(-1)`);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.baseY`), 5);
            await ctx.page.evaluate(`window.term.scrollToTop()`);
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.baseY`), 5);
        });
        (0, test_1.test)('length', async () => {
            await (0, TestUtils_1.openTerminal)(ctx, { rows: 5 });
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.length`), 5);
            await ctx.proxy.write('\n\n\n\n');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.length`), 5);
            await ctx.proxy.write('\n');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.length`), 6);
            await ctx.proxy.write('\n\n\n\n');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.length`), 10);
        });
        test_1.test.describe('getLine', () => {
            (0, test_1.test)('invalid index', async () => {
                await (0, TestUtils_1.openTerminal)(ctx, { rows: 5 });
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(-1)`), undefined);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(5)`), undefined);
            });
            (0, test_1.test)('isWrapped', async () => {
                await (0, TestUtils_1.openTerminal)(ctx, { cols: 5 });
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).isWrapped`), false);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(1).isWrapped`), false);
                await ctx.proxy.write('abcde');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).isWrapped`), false);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(1).isWrapped`), false);
                await ctx.proxy.write('f');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).isWrapped`), false);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(1).isWrapped`), true);
            });
            (0, test_1.test)('translateToString', async () => {
                await (0, TestUtils_1.openTerminal)(ctx, { cols: 5 });
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString()`), '     ');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString(true)`), '');
                await ctx.proxy.write('foo');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString()`), 'foo  ');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString(true)`), 'foo');
                await ctx.proxy.write('bar');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString()`), 'fooba');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString(true)`), 'fooba');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(1).translateToString(true)`), 'r');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString(false, 1)`), 'ooba');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString(false, 1, 3)`), 'oo');
            });
            (0, test_1.test)('getCell', async () => {
                await (0, TestUtils_1.openTerminal)(ctx, { cols: 5 });
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(-1)`), undefined);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(5)`), undefined);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(0).getChars()`), '');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(0).getWidth()`), 1);
                await ctx.proxy.write('a文');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(0).getChars()`), 'a');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(0).getWidth()`), 1);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(1).getChars()`), '文');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(1).getWidth()`), 2);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(2).getChars()`), '');
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(2).getWidth()`), 0);
            });
            (0, test_1.test)('clearMarkers', async () => {
                await (0, TestUtils_1.openTerminal)(ctx, { cols: 5 });
                await ctx.page.evaluate(`
          window.disposeStack = [];
          `);
                await ctx.proxy.write('\n\n\n\n');
                await ctx.proxy.write('\n\n\n\n');
                await ctx.proxy.write('\n\n\n\n');
                await ctx.proxy.write('\n\n\n\n');
                await ctx.page.evaluate(`window.term.registerMarker(1)`);
                await ctx.page.evaluate(`window.term.registerMarker(2)`);
                await ctx.page.evaluate(`window.term.scrollLines(10)`);
                await ctx.page.evaluate(`window.term.registerMarker(3)`);
                await ctx.page.evaluate(`window.term.registerMarker(4)`);
                await ctx.page.evaluate(`
          for (let i = 0; i < window.term.markers.length; ++i) {
              const marker = window.term.markers[i];
              marker.onDispose(() => window.disposeStack.push(marker));
          }`);
                await ctx.page.evaluate(`window.term.clear()`);
                (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.disposeStack.length`), 4);
            });
        });
        (0, test_1.test)('active, normal, alternate', async () => {
            await (0, TestUtils_1.openTerminal)(ctx, { cols: 5 });
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.type`), 'normal');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.normal.type`), 'normal');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.alternate.type`), 'alternate');
            await ctx.proxy.write('norm ');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString()`), 'norm ');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.normal.getLine(0).translateToString()`), 'norm ');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.alternate.getLine(0)`), undefined);
            await ctx.proxy.write('\x1b[?47h\r');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.type`), 'alternate');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.normal.type`), 'normal');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.alternate.type`), 'alternate');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString()`), '     ');
            await ctx.proxy.write('alt  ');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString()`), 'alt  ');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.normal.getLine(0).translateToString()`), 'norm ');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.alternate.getLine(0).translateToString()`), 'alt  ');
            await ctx.proxy.write('\x1b[?47l\r');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.type`), 'normal');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.normal.type`), 'normal');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.alternate.type`), 'alternate');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString()`), 'norm ');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.normal.getLine(0).translateToString()`), 'norm ');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.buffer.alternate.getLine(0)`), undefined);
        });
    });
    test_1.test.describe('modes', () => {
        test_1.test.beforeEach(() => (0, TestUtils_1.openTerminal)(ctx));
        (0, test_1.test)('defaults', async () => {
            (0, assert_1.deepStrictEqual)(await ctx.page.evaluate(`window.term.modes`), {
                applicationCursorKeysMode: false,
                applicationKeypadMode: false,
                bracketedPasteMode: false,
                insertMode: false,
                mouseTrackingMode: 'none',
                originMode: false,
                reverseWraparoundMode: false,
                sendFocusMode: false,
                wraparoundMode: true
            });
        });
        (0, test_1.test)('applicationCursorKeysMode', async () => {
            await ctx.proxy.write('\x1b[?1h');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.applicationCursorKeysMode`), true);
            await ctx.proxy.write('\x1b[?1l');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.applicationCursorKeysMode`), false);
        });
        (0, test_1.test)('applicationKeypadMode', async () => {
            await ctx.proxy.write('\x1b[?66h');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.applicationKeypadMode`), true);
            await ctx.proxy.write('\x1b[?66l');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.applicationKeypadMode`), false);
        });
        (0, test_1.test)('bracketedPasteMode', async () => {
            await ctx.proxy.write('\x1b[?2004h');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.bracketedPasteMode`), true);
            await ctx.proxy.write('\x1b[?2004l');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.bracketedPasteMode`), false);
        });
        (0, test_1.test)('insertMode', async () => {
            await ctx.proxy.write('\x1b[4h');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.insertMode`), true);
            await ctx.proxy.write('\x1b[4l');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.insertMode`), false);
        });
        (0, test_1.test)('mouseTrackingMode', async () => {
            await ctx.proxy.write('\x1b[?9h');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'x10');
            await ctx.proxy.write('\x1b[?9l');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'none');
            await ctx.proxy.write('\x1b[?1000h');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'vt200');
            await ctx.proxy.write('\x1b[?1000l');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'none');
            await ctx.proxy.write('\x1b[?1002h');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'drag');
            await ctx.proxy.write('\x1b[?1002l');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'none');
            await ctx.proxy.write('\x1b[?1003h');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'any');
            await ctx.proxy.write('\x1b[?1003l');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'none');
        });
        (0, test_1.test)('originMode', async () => {
            await ctx.proxy.write('\x1b[?6h');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.originMode`), true);
            await ctx.proxy.write('\x1b[?6l');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.originMode`), false);
        });
        (0, test_1.test)('reverseWraparoundMode', async () => {
            await ctx.proxy.write('\x1b[?45h');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.reverseWraparoundMode`), true);
            await ctx.proxy.write('\x1b[?45l');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.reverseWraparoundMode`), false);
        });
        (0, test_1.test)('sendFocusMode', async () => {
            await ctx.proxy.write('\x1b[?1004h');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.sendFocusMode`), true);
            await ctx.proxy.write('\x1b[?1004l');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.sendFocusMode`), false);
        });
        (0, test_1.test)('wraparoundMode', async () => {
            await ctx.proxy.write('\x1b[?7h');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.wraparoundMode`), true);
            await ctx.proxy.write('\x1b[?7l');
            (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term.modes.wraparoundMode`), false);
        });
    });
    (0, test_1.test)('dispose', async () => {
        await ctx.page.evaluate(`
      if ('term' in window) {
        try {
          window.term.dispose();
        } catch {}
      }
      window.term = new Terminal();
      window.term.dispose();
    `);
        (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term._core._store._isDisposed`), true);
    });
    (0, test_1.test)('dispose (opened)', async () => {
        await (0, TestUtils_1.openTerminal)(ctx);
        await ctx.page.evaluate(`
      if ('term' in window) {
        try {
          window.term.dispose();
        } catch {}
      }
    `);
        (0, assert_1.strictEqual)(await ctx.page.evaluate(`window.term._core._store._isDisposed`), true);
    });
    (0, test_1.test)('render when visible after hidden', async () => {
        await (0, TestUtils_1.openTerminal)(ctx);
        await ctx.page.evaluate(`
      if ('term' in window) {
        try {
          window.term.dispose();
        } catch {}
      }
    `);
        await ctx.page.evaluate(`document.querySelector('#terminal-container').style.display='none'`);
        await ctx.page.evaluate(`window.term = new Terminal()`);
        await ctx.page.evaluate(`window.term.open(document.querySelector('#terminal-container'))`);
        await ctx.page.evaluate(`document.querySelector('#terminal-container').style.display=''`);
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term._core._renderService.dimensions.css.cell.width > 0`, true);
    });
    test_1.test.describe('registerDecoration', () => {
        test_1.test.describe('bufferDecorations', () => {
            (0, test_1.test)('should register decorations and render them when terminal open is called', async () => {
                await (0, TestUtils_1.openTerminal)(ctx);
                await ctx.page.evaluate(`window.marker1 = window.term.registerMarker(1)`);
                await ctx.page.evaluate(`window.marker2 = window.term.registerMarker(2)`);
                await ctx.page.evaluate(`window.term.registerDecoration({ marker: window.marker1 })`);
                await ctx.page.evaluate(`window.term.registerDecoration({ marker: window.marker2 })`);
                await (0, TestUtils_1.pollFor)(ctx.page, `document.querySelectorAll('.xterm-screen .xterm-decoration').length`, 2);
            });
            (0, test_1.test)('should return undefined when the marker has already been disposed of', async () => {
                await (0, TestUtils_1.openTerminal)(ctx);
                await ctx.page.evaluate(`window.marker = window.term.registerMarker(1)`);
                await ctx.page.evaluate(`window.marker.dispose()`);
                await (0, TestUtils_1.pollFor)(ctx.page, `window.decoration = window.term.registerDecoration({ marker: window.marker });`, undefined);
            });
            (0, test_1.test)('should throw when a negative x offset is provided', async () => {
                await (0, TestUtils_1.openTerminal)(ctx);
                await ctx.page.evaluate(`window.marker = window.term.registerMarker(1)`);
                await ctx.page.evaluate(`
        try {
          window.decoration = window.term.registerDecoration({ marker: window.marker, x: -2 });
        } catch (e) {
          window.throwMessage = e.message;
        }
      `);
                await (0, TestUtils_1.pollFor)(ctx.page, 'window.throwMessage', 'This API only accepts positive integers');
            });
        });
        test_1.test.describe('overviewRulerDecorations', () => {
            (0, test_1.test)('should not add an overview ruler when width is not set', async () => {
                await (0, TestUtils_1.openTerminal)(ctx);
                await ctx.page.evaluate(`window.marker1 = window.term.registerMarker(1)`);
                await ctx.page.evaluate(`window.marker2 = window.term.registerMarker(2)`);
                await ctx.page.evaluate(`window.term.registerDecoration({ marker: window.marker1, overviewRulerOptions: { color: 'red', position: 'full' } })`);
                await ctx.page.evaluate(`window.term.registerDecoration({ marker: window.marker2, overviewRulerOptions: { color: 'blue', position: 'full' } })`);
                await (0, TestUtils_1.pollFor)(ctx.page, `document.querySelectorAll('.xterm-decoration-overview-ruler').length`, 0);
            });
            (0, test_1.test)('should add an overview ruler when width is set', async () => {
                await (0, TestUtils_1.openTerminal)(ctx, { overviewRuler: { width: 15 } });
                await ctx.page.evaluate(`window.marker1 = window.term.registerMarker(1)`);
                await ctx.page.evaluate(`window.marker2 = window.term.registerMarker(2)`);
                await ctx.page.evaluate(`window.term.registerDecoration({ marker: window.marker1, overviewRulerOptions: { color: 'red', position: 'full' } })`);
                await ctx.page.evaluate(`window.term.registerDecoration({ marker: window.marker2, overviewRulerOptions: { color: 'blue', position: 'full' } })`);
                await (0, TestUtils_1.pollFor)(ctx.page, `document.querySelectorAll('.xterm-decoration-overview-ruler').length`, 1);
            });
        });
    });
    test_1.test.describe('registerLinkProvider', () => {
        (0, test_1.test)('should fire provideLinks when hovering cells', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.proxy.focus();
            await ctx.page.evaluate(`
        window.calls = [];
        window.disposable = window.term.registerLinkProvider({
          provideLinks: (position, cb) => {
            calls.push(position);
            cb(undefined);
          }
        });
      `);
            const dims = await getDimensions();
            await moveMouseCell(dims, 1, 1);
            await moveMouseCell(dims, 2, 2);
            await moveMouseCell(dims, 10, 4);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [1, 2, 4]);
            await ctx.page.evaluate(`window.disposable.dispose()`);
        });
        (0, test_1.test)('should fire hover and leave events on the link', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.page.evaluate('window.term.focus()');
            await ctx.proxy.write('foo bar baz');
            await (0, TestUtils_1.pollFor)(ctx.page, `document.querySelector('.xterm-rows').textContent`, 'foo bar baz ');
            await ctx.page.evaluate(`
        window.calls = [];
        window.disposable = window.term.registerLinkProvider({
          provideLinks: (position, cb) => {
            window.calls.push('provide ' + position);
            if (position === 1) {
              window.calls.push('match');
              cb([{
                range: { start: { x: 5, y: 1 }, end: { x: 7, y: 1 } },
                text: 'bar',
                activate: () => window.calls.push('activate'),
                hover: () => window.calls.push('hover'),
                leave: () => window.calls.push('leave')
              }]);
            }
          }
        });
      `);
            const dims = await getDimensions();
            await moveMouseCell(dims, 5, 1);
            await (0, TestUtils_1.timeout)(100);
            await moveMouseCell(dims, 4, 1);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'match', 'hover', 'leave']);
            await moveMouseCell(dims, 7, 1);
            await (0, TestUtils_1.timeout)(100);
            await moveMouseCell(dims, 8, 1);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'match', 'hover', 'leave', 'hover', 'leave']);
            await ctx.page.evaluate(`window.disposable.dispose()`);
        });
        (0, test_1.test)('should work fine when hover and leave callbacks are not provided', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.page.evaluate('window.term.focus()');
            await ctx.proxy.write('foo bar baz');
            await (0, TestUtils_1.pollFor)(ctx.page, `document.querySelector('.xterm-rows').textContent`, 'foo bar baz ');
            await ctx.page.evaluate(`
        window.calls = [];
        window.disposable = window.term.registerLinkProvider({
          provideLinks: (position, cb) => {
            window.calls.push('provide ' + position);
            if (position === 1) {
              window.calls.push('match 1');
              cb([{
                range: { start: { x: 5, y: 1 }, end: { x: 7, y: 1 } },
                text: 'bar',
                activate: () => window.calls.push('activate')
              }]);
            } else if (position === 2) {
              window.calls.push('match 2');
              cb([{
                range: { start: { x: 5, y: 2 }, end: { x: 7, y: 2 } },
                text: 'bar',
                activate: () => window.calls.push('activate')
              }]);
            }
          }
        });
      `);
            const dims = await getDimensions();
            await moveMouseCell(dims, 5, 1);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'match 1']);
            await moveMouseCell(dims, 4, 2);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'match 1', 'provide 2', 'match 2']);
            await moveMouseCell(dims, 7, 1);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'match 1', 'provide 2', 'match 2', 'provide 1', 'match 1']);
            await moveMouseCell(dims, 6, 2);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'match 1', 'provide 2', 'match 2', 'provide 1', 'match 1', 'provide 2', 'match 2']);
            await ctx.page.evaluate(`window.disposable.dispose()`);
        });
        (0, test_1.test)('should fire activate events when clicking the link', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.page.evaluate('window.term.focus()');
            await ctx.proxy.write('a b c');
            await (0, TestUtils_1.pollFor)(ctx.page, `document.querySelector('.xterm-rows').textContent`, 'a b c ');
            await ctx.page.evaluate(`
        window.calls = [];
        window.disposable = window.term.registerLinkProvider({
          provideLinks: (y, cb) => {
            window.calls.push('provide ' + y);
            cb([{
              range: { start: { x: 1, y }, end: { x: 80, y } },
              text: window.term.buffer.active.getLine(y - 1).translateToString(),
              activate: (_, text) => window.calls.push('activate ' + y),
              hover: () => window.calls.push('hover ' + y),
              leave: () => window.calls.push('leave ' + y)
            }]);
          }
        });
      `);
            const dims = await getDimensions();
            await moveMouseCell(dims, 3, 1);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1']);
            await ctx.page.mouse.down();
            await ctx.page.mouse.up();
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1', 'activate 1']);
            await moveMouseCell(dims, 1, 2);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1', 'activate 1', 'leave 1', 'provide 2', 'hover 2']);
            await ctx.page.mouse.down();
            await ctx.page.mouse.up();
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1', 'activate 1', 'leave 1', 'provide 2', 'hover 2', 'activate 2']);
            await moveMouseCell(dims, 5, 1);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1', 'activate 1', 'leave 1', 'provide 2', 'hover 2', 'activate 2', 'leave 2', 'provide 1', 'hover 1']);
            await ctx.page.mouse.down();
            await ctx.page.mouse.up();
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1', 'activate 1', 'leave 1', 'provide 2', 'hover 2', 'activate 2', 'leave 2', 'provide 1', 'hover 1', 'activate 1']);
            await ctx.page.evaluate(`window.disposable.dispose()`);
        });
        (0, test_1.test)('should work when multiple links are provided on the same line', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.page.evaluate('window.term.focus()');
            await ctx.proxy.write('foo bar baz');
            await (0, TestUtils_1.pollFor)(ctx.page, `document.querySelector('.xterm-rows').textContent`, 'foo bar baz ');
            await ctx.page.evaluate(`
        window.calls = [];
        window.disposable = window.term.registerLinkProvider({
          provideLinks: (position, cb) => {
            window.calls.push('provide ' + position);
            if (position === 1) {
              cb([{
                range: { start: { x: 1, y: 1 }, end: { x: 3, y: 1 } },
                text: '',
                activate: () => window.calls.push('activate'),
                hover: () => window.calls.push('hover 1-3'),
                leave: () => window.calls.push('leave 1-3')
              }, {
                range: { start: { x: 5, y: 1 }, end: { x: 7, y: 1 } },
                text: '',
                activate: () => window.calls.push('activate'),
                hover: () => window.calls.push('hover 5-7'),
                leave: () => window.calls.push('leave 5-7')
              }, {
                range: { start: { x: 9, y: 1 }, end: { x: 11, y: 1 } },
                text: '',
                activate: () => window.calls.push('activate'),
                hover: () => window.calls.push('hover 9-11'),
                leave: () => window.calls.push('leave 9-11')
              }]);
            }
          }
        });
      `);
            const dims = await getDimensions();
            await moveMouseCell(dims, 2, 1);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3']);
            await moveMouseCell(dims, 6, 1);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3', 'leave 1-3', 'hover 5-7']);
            await moveMouseCell(dims, 6, 2);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3', 'leave 1-3', 'hover 5-7', 'leave 5-7', 'provide 2']);
            await moveMouseCell(dims, 10, 1);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3', 'leave 1-3', 'hover 5-7', 'leave 5-7', 'provide 2', 'provide 1', 'hover 9-11']);
            await ctx.page.evaluate(`window.disposable.dispose()`);
        });
        (0, test_1.test)('should dispose links when hovering away', async () => {
            await (0, TestUtils_1.openTerminal)(ctx);
            await ctx.page.evaluate('window.term.focus()');
            await ctx.proxy.write('foo bar baz');
            await (0, TestUtils_1.pollFor)(ctx.page, `document.querySelector('.xterm-rows').textContent`, 'foo bar baz ');
            await ctx.page.evaluate(`
        window.calls = [];
        window.disposable = window.term.registerLinkProvider({
          provideLinks: (position, cb) => {
            window.calls.push('provide ' + position);
            if (position === 1) {
              cb([{
                range: { start: { x: 1, y: 1 }, end: { x: 3, y: 1 } },
                text: '',
                activate: () => window.calls.push('activate'),
                dispose: () => window.calls.push('dispose 1-3'),
                hover: () => window.calls.push('hover 1-3'),
                leave: () => window.calls.push('leave 1-3')
              }, {
                range: { start: { x: 5, y: 1 }, end: { x: 7, y: 1 } },
                text: '',
                activate: () => window.calls.push('activate'),
                dispose: () => window.calls.push('dispose 5-7'),
                hover: () => window.calls.push('hover 5-7'),
                leave: () => window.calls.push('leave 5-7')
              }, {
                range: { start: { x: 9, y: 1 }, end: { x: 11, y: 1 } },
                text: '',
                activate: () => window.calls.push('activate'),
                dispose: () => window.calls.push('dispose 9-11'),
                hover: () => window.calls.push('hover 9-11'),
                leave: () => window.calls.push('leave 9-11')
              }]);
            }
          }
        });
      `);
            const dims = await getDimensions();
            await moveMouseCell(dims, 2, 1);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3']);
            await moveMouseCell(dims, 6, 1);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3', 'leave 1-3', 'hover 5-7']);
            await moveMouseCell(dims, 6, 2);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3', 'leave 1-3', 'hover 5-7', 'leave 5-7', 'dispose 1-3', 'dispose 5-7', 'dispose 9-11', 'provide 2']);
            await moveMouseCell(dims, 10, 1);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3', 'leave 1-3', 'hover 5-7', 'leave 5-7', 'dispose 1-3', 'dispose 5-7', 'dispose 9-11', 'provide 2', 'provide 1', 'hover 9-11']);
            await moveMouseCell(dims, 10, 2);
            await (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3', 'leave 1-3', 'hover 5-7', 'leave 5-7', 'dispose 1-3', 'dispose 5-7', 'dispose 9-11', 'provide 2', 'provide 1', 'hover 9-11', 'leave 9-11', 'dispose 1-3', 'dispose 5-7', 'dispose 9-11', 'provide 2']);
            await ctx.page.evaluate(`window.disposable.dispose()`);
        });
    });
});
async function getDimensions() {
    return await ctx.page.evaluate(`
    (function() {
      const rect = document.querySelector('.xterm-rows').getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        renderDimensions: window.term._core._renderService.dimensions
      };
    })();
  `);
}
async function getCellCoordinates(dimensions, col, row) {
    return {
        x: dimensions.left + dimensions.renderDimensions.device.cell.width * (col - 0.5),
        y: dimensions.top + dimensions.renderDimensions.device.cell.height * (row - 0.5)
    };
}
async function moveMouseCell(dimensions, col, row) {
    const coords = await getCellCoordinates(dimensions, col, row);
    await ctx.page.mouse.move(coords.x, coords.y);
}
//# sourceMappingURL=Terminal.test.js.map