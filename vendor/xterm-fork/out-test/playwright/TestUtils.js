"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalProxy = void 0;
exports.createTestContext = createTestContext;
exports.openTerminal = openTerminal;
exports.pollFor = pollFor;
exports.pollForApproximate = pollForApproximate;
exports.writeSync = writeSync;
exports.timeout = timeout;
exports.getBrowserType = getBrowserType;
exports.launchBrowser = launchBrowser;
const assert_1 = require("assert");
const playwright = require("@playwright/test");
async function createTestContext(browser) {
    const page = await browser.newPage();
    page.on('console', e => console.log(`[${browser.browserType().name()}:${e.type()}]`, e));
    page.on('pageerror', e => console.error(`[${browser.browserType().name()}]`, e));
    await page.goto('/test');
    const proxy = new TerminalProxy(page);
    proxy.initPage();
    return {
        browser,
        page,
        termHandle: await page.evaluateHandle('window.term'),
        proxy
    };
}
class EventEmitter {
    _listeners = new Set();
    _event;
    _disposed = false;
    get event() {
        if (!this._event) {
            this._event = (listener) => {
                this._listeners.add(listener);
                const disposable = {
                    dispose: () => {
                        if (!this._disposed) {
                            this._listeners.delete(listener);
                        }
                    }
                };
                return disposable;
            };
        }
        return this._event;
    }
    fire(arg1, arg2) {
        const queue = [];
        for (const l of this._listeners.values()) {
            queue.push(l);
        }
        for (let i = 0; i < queue.length; i++) {
            queue[i].call(undefined, arg1, arg2);
        }
    }
    dispose() {
        this.clearListeners();
        this._disposed = true;
    }
    clearListeners() {
        if (this._listeners) {
            this._listeners.clear();
        }
    }
}
class TerminalProxy {
    _page;
    constructor(_page) {
        this._page = _page;
    }
    async initPage() {
        await this._page.exposeFunction('onBell', () => this._onBell.fire());
        await this._page.exposeFunction('onBinary', (e) => this._onBinary.fire(e));
        await this._page.exposeFunction('onCursorMove', () => this._onCursorMove.fire());
        await this._page.exposeFunction('onData', (e) => this._onData.fire(e));
        await this._page.exposeFunction('onKey', (e) => this._onKey.fire(e));
        await this._page.exposeFunction('onLineFeed', () => this._onLineFeed.fire());
        await this._page.exposeFunction('onRender', (e) => this._onRender.fire(e));
        await this._page.exposeFunction('onResize', (e) => this._onResize.fire(e));
        await this._page.exposeFunction('onScroll', (e) => this._onScroll.fire(e));
        await this._page.exposeFunction('onSelectionChange', () => this._onSelectionChange.fire());
        await this._page.exposeFunction('onTitleChange', (e) => this._onTitleChange.fire(e));
        await this._page.exposeFunction('onWriteParsed', () => this._onWriteParsed.fire());
    }
    async initTerm() {
        this._onBell.dispose();
        this._onBinary.dispose();
        this._onCursorMove.dispose();
        this._onData.dispose();
        this._onKey.dispose();
        this._onLineFeed.dispose();
        this._onRender.dispose();
        this._onResize.dispose();
        this._onScroll.dispose();
        this._onSelectionChange.dispose();
        this._onTitleChange.dispose();
        this._onWriteParsed.dispose();
        this._onBell = new EventEmitter();
        this._onBinary = new EventEmitter();
        this._onCursorMove = new EventEmitter();
        this._onData = new EventEmitter();
        this._onKey = new EventEmitter();
        this._onLineFeed = new EventEmitter();
        this._onRender = new EventEmitter();
        this._onResize = new EventEmitter();
        this._onScroll = new EventEmitter();
        this._onSelectionChange = new EventEmitter();
        this._onTitleChange = new EventEmitter();
        this._onWriteParsed = new EventEmitter();
        await this.evaluate(([term]) => term.onBell(window.onBell));
        await this.evaluate(([term]) => term.onBinary(window.onBinary));
        await this.evaluate(([term]) => term.onCursorMove(window.onCursorMove));
        await this.evaluate(([term]) => term.onData(window.onData));
        await this.evaluate(([term]) => term.onKey(window.onKey));
        await this.evaluate(([term]) => term.onLineFeed(window.onLineFeed));
        await this.evaluate(([term]) => term.onRender(window.onRender));
        await this.evaluate(([term]) => term.onResize(window.onResize));
        await this.evaluate(([term]) => term.onScroll(window.onScroll));
        await this.evaluate(([term]) => term.onSelectionChange(window.onSelectionChange));
        await this.evaluate(([term]) => term.onTitleChange(window.onTitleChange));
        await this.evaluate(([term]) => term.onWriteParsed(window.onWriteParsed));
    }
    _onBell = new EventEmitter();
    get onBell() { return this._onBell.event; }
    _onBinary = new EventEmitter();
    get onBinary() { return this._onBinary.event; }
    _onCursorMove = new EventEmitter();
    get onCursorMove() { return this._onCursorMove.event; }
    _onData = new EventEmitter();
    get onData() { return this._onData.event; }
    _onKey = new EventEmitter();
    get onKey() { return this._onKey.event; }
    _onLineFeed = new EventEmitter();
    get onLineFeed() { return this._onLineFeed.event; }
    _onRender = new EventEmitter();
    get onRender() { return this._onRender.event; }
    _onResize = new EventEmitter();
    get onResize() { return this._onResize.event; }
    _onScroll = new EventEmitter();
    get onScroll() { return this._onScroll.event; }
    _onSelectionChange = new EventEmitter();
    get onSelectionChange() { return this._onSelectionChange.event; }
    _onTitleChange = new EventEmitter();
    get onTitleChange() { return this._onTitleChange.event; }
    _onWriteParsed = new EventEmitter();
    get onWriteParsed() { return this._onWriteParsed.event; }
    get cols() { return this.evaluate(([term]) => term.cols); }
    get rows() { return this.evaluate(([term]) => term.rows); }
    get modes() { return this.evaluate(([term]) => term.modes); }
    get buffer() { return new TerminalBufferNamespaceProxy(this._page, this); }
    get core() { return new TerminalCoreProxy(this._page, this); }
    async dispose() { return this.evaluate(([term]) => term.dispose()); }
    async reset() { return this.evaluate(([term]) => term.reset()); }
    async clear() { return this.evaluate(([term]) => term.clear()); }
    async focus() { return this.evaluate(([term]) => term.focus()); }
    async blur() { return this.evaluate(([term]) => term.blur()); }
    async hasSelection() { return this.evaluate(([term]) => term.hasSelection()); }
    async getSelection() { return this.evaluate(([term]) => term.getSelection()); }
    async getSelectionPosition() { return this.evaluate(([term]) => term.getSelectionPosition()); }
    async selectAll() { return this.evaluate(([term]) => term.selectAll()); }
    async selectLines(start, end) { return this._page.evaluate(([term, start, end]) => term.selectLines(start, end), [await this.getHandle(), start, end]); }
    async clearSelection() { return this.evaluate(([term]) => term.clearSelection()); }
    async select(column, row, length) { return this._page.evaluate(([term, column, row, length]) => term.select(column, row, length), [await this.getHandle(), column, row, length]); }
    async paste(data) { return this._page.evaluate(([term, data]) => term.paste(data), [await this.getHandle(), data]); }
    async refresh(start, end) { return this._page.evaluate(([term, start, end]) => term.refresh(start, end), [await this.getHandle(), start, end]); }
    async getOption(key) { return this._page.evaluate(([term, key]) => term.options[key], [await this.getHandle(), key]); }
    async setOption(key, value) { return this._page.evaluate(([term, key, value]) => term.options[key] = value, [await this.getHandle(), key, value]); }
    async setOptions(value) {
        return this._page.evaluate(([term, value]) => {
            term.options = value;
        }, [await this.getHandle(), value]);
    }
    async scrollToTop() { return this.evaluate(([term]) => term.scrollToTop()); }
    async scrollToBottom() { return this.evaluate(([term]) => term.scrollToBottom()); }
    async scrollPages(pageCount) { return this._page.evaluate(([term, pageCount]) => term.scrollPages(pageCount), [await this.getHandle(), pageCount]); }
    async scrollToLine(line) { return this._page.evaluate(([term, line]) => term.scrollToLine(line), [await this.getHandle(), line]); }
    async scrollLines(amount) { return this._page.evaluate(([term, amount]) => term.scrollLines(amount), [await this.getHandle(), amount]); }
    async write(data) {
        return this._page.evaluate(([term, data]) => {
            return new Promise(r => term.write(typeof data === 'string' ? data : new Uint8Array(data), r));
        }, [await this.getHandle(), typeof data === 'string' ? data : Array.from(data)]);
    }
    async writeln(data) {
        return this._page.evaluate(([term, data]) => {
            return new Promise(r => term.writeln(typeof data === 'string' ? data : new Uint8Array(data), r));
        }, [await this.getHandle(), typeof data === 'string' ? data : Array.from(data)]);
    }
    async input(data, wasUserInput = true) { return this.evaluate(([term]) => term.input(data, wasUserInput)); }
    async resize(cols, rows) { return this._page.evaluate(([term, cols, rows]) => term.resize(cols, rows), [await this.getHandle(), cols, rows]); }
    async registerMarker(y) { return this._page.evaluate(([term, y]) => term.registerMarker(y), [await this.getHandle(), y]); }
    async registerDecoration(decorationOptions) { return this._page.evaluate(([term, decorationOptions]) => term.registerDecoration(decorationOptions), [await this.getHandle(), decorationOptions]); }
    async clearTextureAtlas() { return this.evaluate(([term]) => term.clearTextureAtlas()); }
    async evaluate(pageFunction) {
        return this._page.evaluate(pageFunction, [await this.getHandle()]);
    }
    async evaluateHandle(pageFunction) {
        return this._page.evaluateHandle(pageFunction, [await this.getHandle()]);
    }
    async getHandle() {
        return this._page.evaluateHandle('window.term');
    }
}
exports.TerminalProxy = TerminalProxy;
class TerminalBufferNamespaceProxy {
    _page;
    _proxy;
    _onBufferChange = new EventEmitter();
    onBufferChange = this._onBufferChange.event;
    constructor(_page, _proxy) {
        this._page = _page;
        this._proxy = _proxy;
    }
    get active() { return new TerminalBufferProxy(this._page, this._proxy, this._proxy.evaluateHandle(([term]) => term.buffer.active)); }
    get normal() { return new TerminalBufferProxy(this._page, this._proxy, this._proxy.evaluateHandle(([term]) => term.buffer.normal)); }
    get alternate() { return new TerminalBufferProxy(this._page, this._proxy, this._proxy.evaluateHandle(([term]) => term.buffer.alternate)); }
}
class TerminalBufferProxy {
    _page;
    _proxy;
    _handle;
    constructor(_page, _proxy, _handle) {
        this._page = _page;
        this._proxy = _proxy;
        this._handle = _handle;
    }
    get type() { return this.evaluate(([buffer]) => buffer.type); }
    get cursorY() { return this.evaluate(([buffer]) => buffer.cursorY); }
    get cursorX() { return this.evaluate(([buffer]) => buffer.cursorX); }
    get viewportY() { return this.evaluate(([buffer]) => buffer.viewportY); }
    get baseY() { return this.evaluate(([buffer]) => buffer.baseY); }
    get length() { return this.evaluate(([buffer]) => buffer.length); }
    async getLine(y) {
        const lineHandle = await this._page.evaluateHandle(([buffer, y]) => buffer.getLine(y), [await this._handle, y]);
        const value = await lineHandle.jsonValue();
        if (value) {
            return new TerminalBufferLine(this._page, lineHandle);
        }
        return undefined;
    }
    async evaluate(pageFunction) {
        return this._page.evaluate(pageFunction, [await this._handle]);
    }
}
class TerminalBufferLine {
    _page;
    _handle;
    constructor(_page, _handle) {
        this._page = _page;
        this._handle = _handle;
    }
    get length() { return this.evaluate(([bufferLine]) => bufferLine.length); }
    get isWrapped() { return this.evaluate(([bufferLine]) => bufferLine.isWrapped); }
    translateToString(trimRight, startColumn, endColumn) {
        return this._page.evaluate(([bufferLine, trimRight, startColumn, endColumn]) => {
            return bufferLine.translateToString(trimRight, startColumn, endColumn);
        }, [this._handle, trimRight, startColumn, endColumn]);
    }
    async getCell(x) {
        const cellHandle = await this._page.evaluateHandle(([bufferLine, x]) => bufferLine.getCell(x), [this._handle, x]);
        const value = await cellHandle.jsonValue();
        if (value) {
            return new TerminalBufferCell(this._page, cellHandle);
        }
        return undefined;
    }
    async evaluate(pageFunction) {
        return this._page.evaluate(pageFunction, [this._handle]);
    }
}
class TerminalBufferCell {
    _page;
    _handle;
    constructor(_page, _handle) {
        this._page = _page;
        this._handle = _handle;
    }
    getWidth() { return this.evaluate(([line]) => line.getWidth()); }
    getChars() { return this.evaluate(([line]) => line.getChars()); }
    async evaluate(pageFunction) {
        return this._page.evaluate(pageFunction, [this._handle]);
    }
}
class TerminalCoreProxy {
    _page;
    _proxy;
    constructor(_page, _proxy) {
        this._page = _page;
        this._proxy = _proxy;
    }
    get isDisposed() { return this.evaluate(([core]) => core._isDisposed); }
    get renderDimensions() { return this.evaluate(([core]) => core._renderService.dimensions); }
    async triggerBinaryEvent(data) {
        return this._page.evaluate(([core, data]) => core.coreService.triggerBinaryEvent(data), [await this._getCoreHandle(), data]);
    }
    async _getCoreHandle() {
        return this._proxy.evaluateHandle(([term]) => term._core);
    }
    async evaluate(pageFunction) {
        return this._page.evaluate(pageFunction, [await this._getCoreHandle()]);
    }
}
async function openTerminal(ctx, options = {}, testOptions = { loadUnicodeGraphemesAddon: true }) {
    await ctx.page.evaluate(`
  if ('term' in window) {
    try {
      window.term.dispose();
    } catch {}
  }
  `);
    (0, assert_1.strictEqual)(await ctx.page.evaluate(`document.querySelector('#terminal-container').children.length`), 0, 'there must be no terminals on the page');
    await ctx.page.evaluate(`
    window.term = new window.Terminal(${JSON.stringify({ allowProposedApi: true, ...options })});
    window.term.open(document.querySelector('#terminal-container'));
  `);
    if (testOptions.loadUnicodeGraphemesAddon) {
        await ctx.page.evaluate(`
      window.unicode = new UnicodeGraphemesAddon();
      window.term.loadAddon(window.unicode);
      window.term.unicode.activeVersion = '15-graphemes';
    `);
    }
    await ctx.page.waitForSelector('.xterm-rows');
    ctx.termHandle = await ctx.page.evaluateHandle('window.term');
    await ctx.proxy.initTerm();
}
async function pollFor(page, evalOrFn, val, preFn, options) {
    if (!options) {
        options = {};
    }
    options.stack ??= new Error().stack;
    if (preFn) {
        await preFn();
    }
    const result = typeof evalOrFn === 'string' ? await page.evaluate(evalOrFn) : await evalOrFn();
    if (process.env.DEBUG) {
        console.log('pollFor\n  actual: ', JSON.stringify(result), '  expected: ', JSON.stringify(val));
    }
    let equalityCheck;
    if (options.equalityFn) {
        equalityCheck = options.equalityFn(result, val);
    }
    else {
        equalityCheck = true;
        try {
            (0, assert_1.deepStrictEqual)(result, val);
        }
        catch (e) {
            equalityCheck = false;
        }
    }
    if (!equalityCheck) {
        if (options.maxDuration === undefined) {
            options.maxDuration = 2000;
        }
        if (options.maxDuration <= 0) {
            (0, assert_1.deepStrictEqual)(result, val, ([
                `pollFor max duration exceeded.`,
                (`Last comparison: ` +
                    `${typeof result === 'object' ? JSON.stringify(result) : result} (actual) !== ` +
                    `${typeof val === 'object' ? JSON.stringify(val) : val} (expected)`),
                `Stack: ${options.stack}`
            ].join('\n')));
        }
        return new Promise(r => {
            setTimeout(() => r(pollFor(page, evalOrFn, val, preFn, {
                ...options,
                maxDuration: options.maxDuration - 10,
                stack: options.stack
            })), 10);
        });
    }
}
async function pollForApproximate(page, marginOfError, evalOrFn, val, preFn, maxDuration, stack) {
    await pollFor(page, evalOrFn, val, preFn, {
        maxDuration,
        stack,
        equalityFn: (a, b) => {
            if (a === b) {
                return true;
            }
            if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
                let success = true;
                for (let i = 0; i < a.length; i++) {
                    if (Math.abs(a[i] - b[i]) > marginOfError) {
                        success = false;
                        break;
                    }
                }
                if (success) {
                    return true;
                }
            }
            return false;
        }
    });
}
async function writeSync(page, data) {
    await page.evaluate(`
    window.ready = false;
    window.term.write('${data}', () => window.ready = true);
  `);
    await pollFor(page, 'window.ready', true);
}
async function timeout(ms) {
    return new Promise(r => setTimeout(r, ms));
}
function getBrowserType() {
    let browserType = playwright['chromium'];
    const index = process.argv.indexOf('--browser');
    if (index !== -1 && process.argv.length > index + 1 && typeof process.argv[index + 1] === 'string') {
        const string = process.argv[index + 1];
        if (string === 'firefox' || string === 'webkit') {
            browserType = playwright[string];
        }
    }
    return browserType;
}
function launchBrowser(opts) {
    const browserType = getBrowserType();
    const options = {
        ...opts,
        headless: process.argv.includes('--headless')
    };
    const index = process.argv.indexOf('--executablePath');
    if (index > 0 && process.argv.length > index + 1 && typeof process.argv[index + 1] === 'string') {
        options.executablePath = process.argv[index + 1];
    }
    return browserType.launch(options);
}
//# sourceMappingURL=TestUtils.js.map