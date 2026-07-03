"use strict";
var import_test = require("@playwright/test");
var import_assert = require("assert");
var import_TestUtils = require("./TestUtils");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let ctx;
import_test.test.beforeAll(async ({ browser }) => {
  ctx = await (0, import_TestUtils.createTestContext)(browser);
  await (0, import_TestUtils.openTerminal)(ctx);
});
import_test.test.afterAll(async () => await ctx.page.close());
import_test.test.describe("Parser Integration Tests", () => {
  import_test.test.beforeEach(async () => await ctx.proxy.reset());
  import_test.test.afterEach(async () => {
    await ctx.page.evaluate(() => {
      window.disposable?.dispose();
      window.disposable = void 0;
      window.disposables?.forEach((e) => e.dispose());
      window.disposables = void 0;
    });
  });
  import_test.test.describe("registerCsiHandler", () => {
    (0, import_test.test)("should call custom CSI handler with js array params", async () => {
      await ctx.proxy.evaluate(([term]) => {
        window.customCsiHandlerParams = [];
        window.disposable = term.parser.registerCsiHandler({ final: "m" }, (params) => {
          window.customCsiHandlerParams.push(params);
          return false;
        });
      });
      await ctx.proxy.write("\x1B[38;5;123mparams\x1B[38:2::50:100:150msubparams");
      (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(() => window.customCsiHandlerParams), [
        [38, 5, 123],
        [38, [2, -1, 50, 100, 150]]
      ]);
    });
    (0, import_test.test)("async", async () => {
      await ctx.proxy.evaluate(([term]) => {
        window.customCsiHandlerCallStack = [];
        window.customCsiHandlerParams = [];
        window.disposables = [
          term.parser.registerCsiHandler({ intermediates: "+", final: "Z" }, (params) => {
            window.customCsiHandlerCallStack.push("A");
            window.customCsiHandlerParams.push(params);
            return false;
          }),
          term.parser.registerCsiHandler({ intermediates: "+", final: "Z" }, (params) => {
            return new Promise((res) => setTimeout(res, 50)).then(() => {
              window.customCsiHandlerCallStack.push("B");
              window.customCsiHandlerParams.push(params);
              return false;
            });
          }),
          term.parser.registerCsiHandler({ intermediates: "+", final: "Z" }, (params) => {
            window.customCsiHandlerCallStack.push("C");
            window.customCsiHandlerParams.push(params);
            return false;
          })
        ];
      });
      await ctx.proxy.write("\x1B[1;2+Z");
      (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(() => window.customCsiHandlerCallStack), [
        "C",
        "B",
        "A"
      ]);
      (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(() => window.customCsiHandlerParams), [
        [1, 2],
        [1, 2],
        [1, 2]
      ]);
    });
  });
  import_test.test.describe("registerDcsHandler", () => {
    (0, import_test.test)("should respects return value", async () => {
      await ctx.proxy.evaluate(([term]) => {
        window.customDcsHandlerCallStack = [];
        window.disposables = [
          term.parser.registerDcsHandler({ intermediates: "+", final: "p" }, (data, params) => {
            window.customDcsHandlerCallStack.push(["A", params, data]);
            return false;
          }),
          term.parser.registerDcsHandler({ intermediates: "+", final: "p" }, (data, params) => {
            window.customDcsHandlerCallStack.push(["B", params, data]);
            return true;
          }),
          term.parser.registerDcsHandler({ intermediates: "+", final: "p" }, (data, params) => {
            window.customDcsHandlerCallStack.push(["C", params, data]);
            return false;
          })
        ];
      });
      await ctx.proxy.write("\x1BP1;2+psome data\x1B\\");
      (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(() => window.customDcsHandlerCallStack), [
        ["C", [1, 2], "some data"],
        ["B", [1, 2], "some data"]
      ]);
    });
    (0, import_test.test)("async", async () => {
      await ctx.proxy.evaluate(([term]) => {
        window.customDcsHandlerCallStack = [];
        window.disposables = [
          term.parser.registerDcsHandler({ intermediates: "+", final: "q" }, (data, params) => {
            window.customDcsHandlerCallStack.push(["A", params, data]);
            return false;
          }),
          term.parser.registerDcsHandler({ intermediates: "+", final: "q" }, (data, params) => {
            return new Promise((res) => setTimeout(res, 50)).then(() => {
              window.customDcsHandlerCallStack.push(["B", params, data]);
              return false;
            });
          }),
          term.parser.registerDcsHandler({ intermediates: "+", final: "q" }, (data, params) => {
            window.customDcsHandlerCallStack.push(["C", params, data]);
            return false;
          })
        ];
      });
      await ctx.proxy.write("\x1BP1;2+qsome data\x1B\\");
      (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(() => window.customDcsHandlerCallStack), [
        ["C", [1, 2], "some data"],
        ["B", [1, 2], "some data"],
        ["A", [1, 2], "some data"]
      ]);
    });
  });
  import_test.test.describe("registerEscHandler", () => {
    (0, import_test.test)("should respects return value", async () => {
      await ctx.proxy.evaluate(([term]) => {
        window.customEscHandlerCallStack = [];
        window.disposables = [
          term.parser.registerEscHandler({ intermediates: "(", final: "B" }, () => {
            window.customEscHandlerCallStack.push("A");
            return false;
          }),
          term.parser.registerEscHandler({ intermediates: "(", final: "B" }, () => {
            window.customEscHandlerCallStack.push("B");
            return true;
          }),
          term.parser.registerEscHandler({ intermediates: "(", final: "B" }, () => {
            window.customEscHandlerCallStack.push("C");
            return false;
          })
        ];
      });
      await ctx.proxy.write("\x1B(B");
      (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(() => window.customEscHandlerCallStack), ["C", "B"]);
    });
    (0, import_test.test)("async", async () => {
      await ctx.proxy.evaluate(([term]) => {
        window.customEscHandlerCallStack = [];
        window.disposables = [
          term.parser.registerEscHandler({ intermediates: "(", final: "Z" }, () => {
            window.customEscHandlerCallStack.push("A");
            return false;
          }),
          term.parser.registerEscHandler({ intermediates: "(", final: "Z" }, () => {
            return new Promise((res) => setTimeout(res, 50)).then(() => {
              window.customEscHandlerCallStack.push("B");
              return false;
            });
          }),
          term.parser.registerEscHandler({ intermediates: "(", final: "Z" }, () => {
            window.customEscHandlerCallStack.push("C");
            return false;
          })
        ];
      });
      await ctx.proxy.write("\x1B(Z");
      (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(() => window.customEscHandlerCallStack), ["C", "B", "A"]);
    });
  });
  import_test.test.describe("registerOscHandler", () => {
    (0, import_test.test)("should respects return value", async () => {
      await ctx.proxy.evaluate(([term]) => {
        window.customOscHandlerCallStack = [];
        window.disposables = [
          term.parser.registerOscHandler(1234, (data) => {
            window.customOscHandlerCallStack.push(["A", data]);
            return false;
          }),
          term.parser.registerOscHandler(1234, (data) => {
            window.customOscHandlerCallStack.push(["B", data]);
            return true;
          }),
          term.parser.registerOscHandler(1234, (data) => {
            window.customOscHandlerCallStack.push(["C", data]);
            return false;
          })
        ];
      });
      await ctx.proxy.write("\x1B]1234;some data\x07");
      (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(() => window.customOscHandlerCallStack), [
        ["C", "some data"],
        ["B", "some data"]
      ]);
    });
    (0, import_test.test)("async", async () => {
      await ctx.proxy.evaluate(([term]) => {
        window.customOscHandlerCallStack = [];
        window.disposables = [
          term.parser.registerOscHandler(666, (data) => {
            window.customOscHandlerCallStack.push(["A", data]);
            return false;
          }),
          term.parser.registerOscHandler(666, (data) => {
            return new Promise((res) => setTimeout(res, 50)).then(() => {
              window.customOscHandlerCallStack.push(["B", data]);
              return false;
            });
          }),
          term.parser.registerOscHandler(666, (data) => {
            window.customOscHandlerCallStack.push(["C", data]);
            return false;
          })
        ];
      });
      await ctx.proxy.write("\x1B]666;some data\x07");
      (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(() => window.customOscHandlerCallStack), [
        ["C", "some data"],
        ["B", "some data"],
        ["A", "some data"]
      ]);
    });
  });
});
//# sourceMappingURL=Parser.test.js.map
