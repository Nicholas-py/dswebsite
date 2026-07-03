"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var ImageAddon_test_exports = {};
module.exports = __toCommonJS(ImageAddon_test_exports);
var import_test = __toESM(require("@playwright/test"));
var import_fs = require("fs");
var import_sixel = require("sixel");
var import_TestUtils = require("../../../test/playwright/TestUtils");
var import_assert = require("assert");
/**
 * Copyright (c) 2020 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const TESTDATA = (() => {
  const data8 = (0, import_fs.readFileSync)("./addons/addon-image/fixture/palette.blob");
  const data32 = new Uint32Array(data8.buffer);
  const palette = /* @__PURE__ */ new Set();
  for (let i = 0; i < data32.length; ++i) palette.add(data32[i]);
  const sixel = (0, import_sixel.sixelEncode)(data8, 640, 80, [...palette]);
  return {
    width: 640,
    height: 80,
    bytes: data8,
    palette: [...palette],
    sixel
  };
})();
const SIXEL_SEQ_0 = (0, import_sixel.introducer)(0) + TESTDATA.sixel + import_sixel.FINALIZER;
const TESTDATA_IIP = [
  [(0, import_fs.readFileSync)("./addons/addon-image/fixture/iip/palette.iip", { encoding: "utf-8" }), [640, 80]],
  [(0, import_fs.readFileSync)("./addons/addon-image/fixture/iip/spinfox.iip", { encoding: "utf-8" }), [148, 148]],
  [(0, import_fs.readFileSync)("./addons/addon-image/fixture/iip/w3c_gif.iip", { encoding: "utf-8" }), [72, 48]],
  [(0, import_fs.readFileSync)("./addons/addon-image/fixture/iip/w3c_jpg.iip", { encoding: "utf-8" }), [72, 48]],
  [(0, import_fs.readFileSync)("./addons/addon-image/fixture/iip/w3c_png.iip", { encoding: "utf-8" }), [72, 48]]
];
let ctx;
import_test.default.beforeAll(async ({ browser }) => {
  ctx = await (0, import_TestUtils.createTestContext)(browser);
  await (0, import_TestUtils.openTerminal)(ctx, { cols: 80, rows: 24 });
});
import_test.default.afterAll(async () => await ctx.page.close());
import_test.default.describe("ImageAddon", () => {
  import_test.default.beforeEach(async ({}, testInfo) => {
    if (ctx.browser.browserType().name() === "webkit") {
      testInfo.skip();
      return;
    }
    await ctx.page.evaluate(`
      window.term.reset()
      window.imageAddon?.dispose();
      window.imageAddon = new ImageAddon({ sixelPaletteLimit: 512 });
      window.term.loadAddon(window.imageAddon);
    `);
  });
  (0, import_test.default)("test for private accessors", async () => {
    const accessors = [
      "_core",
      "_core._renderService",
      "_core._inputHandler",
      "_core._inputHandler._parser",
      "_core._inputHandler._curAttrData",
      "_core._inputHandler._dirtyRowTracker",
      "_core._themeService.colors",
      "_core._coreBrowserService"
    ];
    for (const prop of accessors) {
      (0, import_assert.strictEqual)(
        await ctx.page.evaluate("(() => { const v = window.term." + prop + "; return v !== undefined && v !== null; })()"),
        true,
        `problem at ${prop}`
      );
    }
    (0, import_assert.strictEqual)(await ctx.page.evaluate("window.term._core.buffer.lines.get(0)._data instanceof Uint32Array"), true);
    (0, import_assert.strictEqual)(await ctx.page.evaluate("window.term._core.buffer.lines.get(0)._extendedAttrs instanceof Object"), true);
    (0, import_assert.strictEqual)(await ctx.page.evaluate("window.term._core._inputHandler._curAttrData.constructor.name"), "_AttributeData");
    (0, import_assert.strictEqual)(await ctx.page.evaluate("window.term._core._inputHandler._parser.constructor.name"), "EscapeSequenceParser");
  });
  import_test.default.describe("ctor options", () => {
    (0, import_test.default)("empty settings should load defaults", async () => {
      const DEFAULT_OPTIONS = {
        enableSizeReports: true,
        pixelLimit: 16777216,
        sixelSupport: true,
        sixelScrolling: true,
        sixelPaletteLimit: 512,
        // set to 512 to get example image working
        sixelSizeLimit: 25e6,
        storageLimit: 128,
        showPlaceholder: true,
        iipSupport: true,
        iipSizeLimit: 2e7
      };
      (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.imageAddon._opts`), DEFAULT_OPTIONS);
    });
    (0, import_test.default)("custom settings should overload defaults", async () => {
      const customSettings = {
        enableSizeReports: false,
        pixelLimit: 5,
        sixelSupport: false,
        sixelScrolling: false,
        sixelPaletteLimit: 1024,
        sixelSizeLimit: 1e3,
        storageLimit: 10,
        showPlaceholder: false,
        iipSupport: false,
        iipSizeLimit: 1e3
      };
      await ctx.page.evaluate((opts) => {
        window.imageAddonCustom = new ImageAddon(opts.opts);
        window.term.loadAddon(window.imageAddonCustom);
      }, { opts: customSettings });
      (0, import_assert.deepStrictEqual)(await ctx.page.evaluate(`window.imageAddonCustom._opts`), customSettings);
    });
  });
  import_test.default.describe("scrolling & cursor modes", () => {
    (0, import_test.default)("testdata default (scrolling with VT240 cursor pos)", async () => {
      const dim = await getDimensions();
      await ctx.proxy.write(SIXEL_SEQ_0);
      (0, import_assert.deepStrictEqual)(await getCursor(), [0, Math.floor(TESTDATA.height / dim.cellHeight)]);
      await ctx.proxy.write("#".repeat(10) + SIXEL_SEQ_0);
      (0, import_assert.deepStrictEqual)(await getCursor(), [10, Math.floor(TESTDATA.height / dim.cellHeight) * 2]);
    });
    (0, import_test.default)("write testdata noScrolling", async () => {
      await ctx.proxy.write("\x1B[?80h" + SIXEL_SEQ_0);
      (0, import_assert.deepStrictEqual)(await getCursor(), [0, 0]);
      await ctx.proxy.write(SIXEL_SEQ_0);
      (0, import_assert.deepStrictEqual)(await getCursor(), [0, 0]);
    });
    (0, import_test.default)("testdata cursor always at VT240 pos", async () => {
      const dim = await getDimensions();
      await ctx.proxy.write(SIXEL_SEQ_0);
      (0, import_assert.deepStrictEqual)(await getCursor(), [0, Math.floor(TESTDATA.height / dim.cellHeight)]);
      await ctx.proxy.write("#".repeat(10) + SIXEL_SEQ_0);
      (0, import_assert.deepStrictEqual)(await getCursor(), [10, Math.floor(TESTDATA.height / dim.cellHeight) * 2]);
      await ctx.proxy.write("#".repeat(30) + SIXEL_SEQ_0);
      (0, import_assert.deepStrictEqual)(await getCursor(), [10 + 30, Math.floor(TESTDATA.height / dim.cellHeight) * 3]);
    });
  });
  import_test.default.describe("image lifecycle & eviction", () => {
    (0, import_test.default)("delete image once scrolled off", async () => {
      await ctx.proxy.write(SIXEL_SEQ_0);
      (0, import_TestUtils.pollFor)(ctx.page, "window.imageAddon._storage._images.size", 1);
      await ctx.page.evaluate(
        (scrollback) => new Promise((res) => window.term.write("\n".repeat(scrollback), res)),
        await getScrollbackPlusRows() - 1
      );
      await (0, import_TestUtils.timeout)(100);
      (0, import_TestUtils.pollFor)(ctx.page, "window.imageAddon._storage._images.size", 1);
      await ctx.page.evaluate(() => new Promise((res) => window.term.write("\n", res)));
      (0, import_TestUtils.pollFor)(ctx.page, "window.imageAddon._storage._images.size", 0);
    });
    (0, import_test.default)("get storageUsage", async () => {
      (0, import_assert.strictEqual)(await ctx.page.evaluate("window.imageAddon.storageUsage"), 0);
      await ctx.proxy.write(SIXEL_SEQ_0);
      (0, import_assert.ok)(Math.abs(await ctx.page.evaluate("window.imageAddon.storageUsage") - 640 * 80 * 4 / 1e6) < 0.05);
    });
    (0, import_test.default)("get/set storageLimit", async () => {
      (0, import_assert.strictEqual)(await ctx.page.evaluate("window.imageAddon.storageLimit"), 128);
      (0, import_assert.strictEqual)(await ctx.page.evaluate("window.imageAddon.storageLimit = 1"), 1);
      (0, import_assert.strictEqual)(await ctx.page.evaluate("window.imageAddon.storageLimit"), 1);
    });
    (0, import_test.default)("remove images by storage limit pressure", async () => {
      (0, import_assert.strictEqual)(await ctx.page.evaluate("window.imageAddon.storageLimit = 1"), 1);
      await ctx.proxy.write(SIXEL_SEQ_0);
      await ctx.proxy.write(SIXEL_SEQ_0);
      await ctx.proxy.write(SIXEL_SEQ_0);
      await ctx.proxy.write(SIXEL_SEQ_0);
      await (0, import_TestUtils.timeout)(100);
      const usage = await ctx.page.evaluate("window.imageAddon.storageUsage");
      await ctx.proxy.write(SIXEL_SEQ_0);
      await ctx.proxy.write(SIXEL_SEQ_0);
      await ctx.proxy.write(SIXEL_SEQ_0);
      await ctx.proxy.write(SIXEL_SEQ_0);
      await (0, import_TestUtils.timeout)(100);
      (0, import_assert.strictEqual)(await ctx.page.evaluate("window.imageAddon.storageUsage"), usage);
      (0, import_assert.strictEqual)(usage < 1, true);
    });
    (0, import_test.default)("set storageLimit removes images synchronously", async () => {
      await ctx.proxy.write(SIXEL_SEQ_0 + SIXEL_SEQ_0 + SIXEL_SEQ_0);
      const usage = await ctx.page.evaluate("window.imageAddon.storageUsage");
      const newUsage = await ctx.page.evaluate("window.imageAddon.storageLimit = 0.5; window.imageAddon.storageUsage");
      (0, import_assert.strictEqual)(newUsage < usage, true);
      (0, import_assert.strictEqual)(newUsage < 0.5, true);
    });
    (0, import_test.default)("clear alternate images on buffer change", async () => {
      (0, import_assert.strictEqual)(await ctx.page.evaluate("window.imageAddon.storageUsage"), 0);
      await ctx.proxy.write("\x1B[?1049h" + SIXEL_SEQ_0);
      (0, import_assert.ok)(Math.abs(await ctx.page.evaluate("window.imageAddon.storageUsage") - 640 * 80 * 4 / 1e6) < 0.05);
      await ctx.proxy.write("\x1B[?1049l");
      (0, import_assert.strictEqual)(await ctx.page.evaluate("window.imageAddon.storageUsage"), 0);
    });
    (0, import_test.default)("evict tiles by in-place overwrites (only full overwrite tested)", async () => {
      await (0, import_TestUtils.timeout)(50);
      await ctx.proxy.write("\x1B[H" + SIXEL_SEQ_0 + "\x1B[100;100H");
      await (0, import_TestUtils.timeout)(50);
      let usage = await ctx.page.evaluate("window.imageAddon.storageUsage");
      while (usage === 0) {
        await (0, import_TestUtils.timeout)(50);
        usage = await ctx.page.evaluate("window.imageAddon.storageUsage");
      }
      await ctx.proxy.write("\x1B[H" + SIXEL_SEQ_0 + "\x1B[100;100H");
      await (0, import_TestUtils.timeout)(200);
      (0, import_assert.strictEqual)(await ctx.page.evaluate("window.imageAddon.storageUsage"), usage);
    });
    (0, import_test.default)("manual eviction on alternate buffer must not miss images", async () => {
      await ctx.proxy.write("\x1B[?1049h");
      await ctx.proxy.write(SIXEL_SEQ_0 + SIXEL_SEQ_0 + SIXEL_SEQ_0 + SIXEL_SEQ_0 + SIXEL_SEQ_0 + SIXEL_SEQ_0);
      await (0, import_TestUtils.timeout)(100);
      const usage = await ctx.page.evaluate("window.imageAddon.storageUsage");
      await ctx.proxy.write(SIXEL_SEQ_0 + SIXEL_SEQ_0 + SIXEL_SEQ_0 + SIXEL_SEQ_0 + SIXEL_SEQ_0 + SIXEL_SEQ_0);
      await ctx.proxy.write(SIXEL_SEQ_0 + SIXEL_SEQ_0 + SIXEL_SEQ_0 + SIXEL_SEQ_0 + SIXEL_SEQ_0 + SIXEL_SEQ_0);
      await (0, import_TestUtils.timeout)(100);
      const newUsage = await ctx.page.evaluate("window.imageAddon.storageUsage");
      (0, import_assert.strictEqual)(newUsage, usage);
    });
  });
  import_test.default.describe("IIP support - testimages", () => {
    (0, import_test.default)("palette.png", async () => {
      await ctx.proxy.write(TESTDATA_IIP[0][0]);
      (0, import_assert.deepStrictEqual)(await getOrigSize(1), TESTDATA_IIP[0][1]);
    });
    (0, import_test.default)("spinfox.png", async () => {
      await ctx.proxy.write(TESTDATA_IIP[1][0]);
      (0, import_assert.deepStrictEqual)(await getOrigSize(1), TESTDATA_IIP[1][1]);
    });
    (0, import_test.default)("w3c gif", async () => {
      await ctx.proxy.write(TESTDATA_IIP[2][0]);
      (0, import_assert.deepStrictEqual)(await getOrigSize(1), TESTDATA_IIP[2][1]);
    });
    (0, import_test.default)("w3c jpeg", async () => {
      await ctx.proxy.write(TESTDATA_IIP[3][0]);
      (0, import_assert.deepStrictEqual)(await getOrigSize(1), TESTDATA_IIP[3][1]);
    });
    (0, import_test.default)("w3c png", async () => {
      await ctx.proxy.write(TESTDATA_IIP[4][0]);
      (0, import_assert.deepStrictEqual)(await getOrigSize(1), TESTDATA_IIP[4][1]);
    });
  });
});
async function getDimensions() {
  const dimensions = await ctx.page.evaluate(`term._core._renderService.dimensions`);
  return {
    cellWidth: Math.round(dimensions.css.cell.width),
    cellHeight: Math.round(dimensions.css.cell.height),
    width: Math.round(dimensions.css.canvas.width),
    height: Math.round(dimensions.css.canvas.height)
  };
}
async function getCursor() {
  return ctx.page.evaluate("[window.term.buffer.active.cursorX, window.term.buffer.active.cursorY]");
}
async function getImageStorageLength() {
  return ctx.page.evaluate("window.imageAddon._storage._images.size");
}
async function getScrollbackPlusRows() {
  return ctx.page.evaluate("window.term.options.scrollback + window.term.rows");
}
async function getOrigSize(id) {
  return ctx.page.evaluate(`[
    window.imageAddon._storage._images.get(${id}).orig.width,
    window.imageAddon._storage._images.get(${id}).orig.height
  ]`);
}
//# sourceMappingURL=ImageAddon.test.js.map
