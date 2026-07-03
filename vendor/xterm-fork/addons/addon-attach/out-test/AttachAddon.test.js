"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const test_1 = require("@playwright/test");
const TestUtils_1 = require("../../../test/playwright/TestUtils");
let ctx;
test_1.default.beforeAll(async ({ browser }) => {
    ctx = await (0, TestUtils_1.createTestContext)(browser);
    await (0, TestUtils_1.openTerminal)(ctx);
});
test_1.default.afterAll(async () => await ctx.page.close());
test_1.default.describe('Search Tests', () => {
    test_1.default.beforeEach(async () => {
        await ctx.proxy.reset();
    });
    (0, test_1.default)('string', async function () {
        const port = 8080;
        const server = new WebSocket.Server({ port });
        server.on('connection', socket => socket.send('foo'));
        await ctx.page.evaluate(`window.term.loadAddon(new window.AttachAddon(new WebSocket('ws://localhost:${port}')))`);
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foo');
        server.close();
    });
    (0, test_1.default)('utf8', async function () {
        const port = 8080;
        const server = new WebSocket.Server({ port });
        const data = new Uint8Array([102, 111, 111]);
        server.on('connection', socket => socket.send(data));
        await ctx.page.evaluate(`window.term.loadAddon(new window.AttachAddon(new WebSocket('ws://localhost:${port}')))`);
        await (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foo');
        server.close();
    });
});
//# sourceMappingURL=AttachAddon.test.js.map