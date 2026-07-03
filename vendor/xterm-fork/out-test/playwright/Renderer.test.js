"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const TestUtils_1 = require("./TestUtils");
const SharedRendererTests_1 = require("./SharedRendererTests");
let ctx;
const ctxWrapper = {
    value: undefined,
    skipDomExceptions: true
};
test_1.test.beforeAll(async ({ browser }) => {
    ctx = await (0, TestUtils_1.createTestContext)(browser);
    ctxWrapper.value = ctx;
    await (0, TestUtils_1.openTerminal)(ctx);
});
test_1.test.afterAll(async () => await ctx.page.close());
test_1.test.describe('DOM Renderer Integration Tests', () => {
    (0, SharedRendererTests_1.injectSharedRendererTests)(ctxWrapper);
    (0, SharedRendererTests_1.injectSharedRendererTestsStandalone)(ctxWrapper, () => { });
});
//# sourceMappingURL=Renderer.test.js.map