"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var SharedRendererTests_exports = {};
__export(SharedRendererTests_exports, {
  injectSharedRendererTests: () => injectSharedRendererTests,
  injectSharedRendererTestsStandalone: () => injectSharedRendererTestsStandalone
});
module.exports = __toCommonJS(SharedRendererTests_exports);
var import_png_codec = require("@lunapaint/png-codec");
var import_test = require("@playwright/test");
var import_TestUtils = require("./TestUtils");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function injectSharedRendererTests(ctx) {
  import_test.test.beforeEach(async () => {
    await ctx.value.proxy.reset();
    ctx.value.page.evaluate(`
      window.term.options.minimumContrastRatio = 1;
      window.term.options.allowTransparency = false;
      window.term.options.theme = undefined;
    `);
    frameDetails = void 0;
  });
  import_test.test.describe("colors", () => {
    (0, import_test.test)("foreground 0-15", async () => {
      const theme = {
        black: "#010203",
        red: "#040506",
        green: "#070809",
        yellow: "#0a0b0c",
        blue: "#0d0e0f",
        magenta: "#101112",
        cyan: "#131415",
        white: "#161718"
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      await ctx.value.proxy.write(`\x1B[30m\u25A0\x1B[31m\u25A0\x1B[32m\u25A0\x1B[33m\u25A0\x1B[34m\u25A0\x1B[35m\u25A0\x1B[36m\u25A0\x1B[37m\u25A0`);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [1, 2, 3, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [4, 5, 6, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [7, 8, 9, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 1), [10, 11, 12, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 1), [13, 14, 15, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 1), [16, 17, 18, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 1), [19, 20, 21, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 1), [22, 23, 24, 255]);
    });
  });
  (0, import_test.test)("foreground 0-7 drawBoldTextInBrightColors", async () => {
    const theme = {
      brightBlack: "#010203",
      brightRed: "#040506",
      brightGreen: "#070809",
      brightYellow: "#0a0b0c",
      brightBlue: "#0d0e0f",
      brightMagenta: "#101112",
      brightCyan: "#131415",
      brightWhite: "#161718"
    };
    await ctx.value.page.evaluate(`
      window.term.options.theme = ${JSON.stringify(theme)};
      window.term.options.drawBoldTextInBrightColors = true;
    `);
    await ctx.value.proxy.write(`\x1B[1;30m\u25A0\x1B[1;31m\u25A0\x1B[1;32m\u25A0\x1B[1;33m\u25A0\x1B[1;34m\u25A0\x1B[1;35m\u25A0\x1B[1;36m\u25A0\x1B[1;37m\u25A0`);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [1, 2, 3, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [4, 5, 6, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [7, 8, 9, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 1), [10, 11, 12, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 1), [13, 14, 15, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 1), [16, 17, 18, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 1), [19, 20, 21, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 1), [22, 23, 24, 255]);
  });
  (0, import_test.test)("background 0-15", async () => {
    const theme = {
      black: "#010203",
      red: "#040506",
      green: "#070809",
      yellow: "#0a0b0c",
      blue: "#0d0e0f",
      magenta: "#101112",
      cyan: "#131415",
      white: "#161718"
    };
    await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
    await ctx.value.proxy.write(`\x1B[40m \x1B[41m \x1B[42m \x1B[43m \x1B[44m \x1B[45m \x1B[46m \x1B[47m `);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [1, 2, 3, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [4, 5, 6, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [7, 8, 9, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 1), [10, 11, 12, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 1), [13, 14, 15, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 1), [16, 17, 18, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 1), [19, 20, 21, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 1), [22, 23, 24, 255]);
  });
  (0, import_test.test)("foreground 0-15 inverse", async () => {
    const theme = {
      black: "#010203",
      red: "#040506",
      green: "#070809",
      yellow: "#0a0b0c",
      blue: "#0d0e0f",
      magenta: "#101112",
      cyan: "#131415",
      white: "#161718"
    };
    await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
    await ctx.value.proxy.write(`\x1B[7;30m \x1B[7;31m \x1B[7;32m \x1B[7;33m \x1B[7;34m \x1B[7;35m \x1B[7;36m \x1B[7;37m `);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [1, 2, 3, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [4, 5, 6, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [7, 8, 9, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 1), [10, 11, 12, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 1), [13, 14, 15, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 1), [16, 17, 18, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 1), [19, 20, 21, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 1), [22, 23, 24, 255]);
  });
  (0, import_test.test)("background 0-15 inverse", async () => {
    const theme = {
      black: "#010203",
      red: "#040506",
      green: "#070809",
      yellow: "#0a0b0c",
      blue: "#0d0e0f",
      magenta: "#101112",
      cyan: "#131415",
      white: "#161718"
    };
    await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
    await ctx.value.proxy.write(`\x1B[7;40m\u25A0\x1B[7;41m\u25A0\x1B[7;42m\u25A0\x1B[7;43m\u25A0\x1B[7;44m\u25A0\x1B[7;45m\u25A0\x1B[7;46m\u25A0\x1B[7;47m\u25A0`);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [1, 2, 3, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [4, 5, 6, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [7, 8, 9, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 1), [10, 11, 12, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 1), [13, 14, 15, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 1), [16, 17, 18, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 1), [19, 20, 21, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 1), [22, 23, 24, 255]);
  });
  (0, import_test.test)("foreground 0-15 invisible", async () => {
    const theme = {
      black: "#010203",
      red: "#040506",
      green: "#070809",
      yellow: "#0a0b0c",
      blue: "#0d0e0f",
      magenta: "#101112",
      cyan: "#131415",
      white: "#161718"
    };
    await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
    await ctx.value.proxy.write(`\x1B[8;30m \x1B[8;31m \x1B[8;32m \x1B[8;33m \x1B[8;34m \x1B[8;35m \x1B[8;36m \x1B[8;37m `);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [0, 0, 0, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [0, 0, 0, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [0, 0, 0, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 1), [0, 0, 0, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 1), [0, 0, 0, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 1), [0, 0, 0, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 1), [0, 0, 0, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 1), [0, 0, 0, 255]);
  });
  (0, import_test.test)("background 0-15 invisible", async () => {
    const theme = {
      black: "#010203",
      red: "#040506",
      green: "#070809",
      yellow: "#0a0b0c",
      blue: "#0d0e0f",
      magenta: "#101112",
      cyan: "#131415",
      white: "#161718"
    };
    await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
    await ctx.value.proxy.write(`\x1B[8;40m\u25A0\x1B[8;41m\u25A0\x1B[8;42m\u25A0\x1B[8;43m\u25A0\x1B[8;44m\u25A0\x1B[8;45m\u25A0\x1B[8;46m\u25A0\x1B[8;47m\u25A0`);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [1, 2, 3, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [4, 5, 6, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [7, 8, 9, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 1), [10, 11, 12, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 1), [13, 14, 15, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 1), [16, 17, 18, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 1), [19, 20, 21, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 1), [22, 23, 24, 255]);
  });
  (0, import_test.test)("foreground 0-15 bright", async () => {
    const theme = {
      brightBlack: "#010203",
      brightRed: "#040506",
      brightGreen: "#070809",
      brightYellow: "#0a0b0c",
      brightBlue: "#0d0e0f",
      brightMagenta: "#101112",
      brightCyan: "#131415",
      brightWhite: "#161718"
    };
    await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
    await ctx.value.proxy.write(`\x1B[90m\u25A0\x1B[91m\u25A0\x1B[92m\u25A0\x1B[93m\u25A0\x1B[94m\u25A0\x1B[95m\u25A0\x1B[96m\u25A0\x1B[97m\u25A0`);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [1, 2, 3, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [4, 5, 6, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [7, 8, 9, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 1), [10, 11, 12, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 1), [13, 14, 15, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 1), [16, 17, 18, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 1), [19, 20, 21, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 1), [22, 23, 24, 255]);
  });
  (0, import_test.test)("background 0-15 bright", async () => {
    const theme = {
      brightBlack: "#010203",
      brightRed: "#040506",
      brightGreen: "#070809",
      brightYellow: "#0a0b0c",
      brightBlue: "#0d0e0f",
      brightMagenta: "#101112",
      brightCyan: "#131415",
      brightWhite: "#161718"
    };
    await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
    await ctx.value.proxy.write(`\x1B[100m \x1B[101m \x1B[102m \x1B[103m \x1B[104m \x1B[105m \x1B[106m \x1B[107m `);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [1, 2, 3, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [4, 5, 6, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [7, 8, 9, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 1), [10, 11, 12, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 1), [13, 14, 15, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 1), [16, 17, 18, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 1), [19, 20, 21, 255]);
    await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 1), [22, 23, 24, 255]);
  });
  (0, import_test.test)("foreground 16-255", async () => {
    let data = "";
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        data += `\x1B[38;5;${16 + y * 16 + x}m\u25A0\x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        const cssColor = COLORS_16_TO_255[y * 16 + x];
        const r = parseInt(cssColor.slice(1, 3), 16);
        const g = parseInt(cssColor.slice(3, 5), 16);
        const b = parseInt(cssColor.slice(5, 7), 16);
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [r, g, b, 255]);
      }
    }
  });
  (0, import_test.test)("background 16-255", async () => {
    let data = "";
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        data += `\x1B[48;5;${16 + y * 16 + x}m \x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        const cssColor = COLORS_16_TO_255[y * 16 + x];
        const r = parseInt(cssColor.slice(1, 3), 16);
        const g = parseInt(cssColor.slice(3, 5), 16);
        const b = parseInt(cssColor.slice(5, 7), 16);
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [r, g, b, 255]);
      }
    }
  });
  (0, import_test.test)("foreground 16-255 inverse", async () => {
    let data = "";
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        data += `\x1B[7;38;5;${16 + y * 16 + x}m \x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        const cssColor = COLORS_16_TO_255[y * 16 + x];
        const r = parseInt(cssColor.slice(1, 3), 16);
        const g = parseInt(cssColor.slice(3, 5), 16);
        const b = parseInt(cssColor.slice(5, 7), 16);
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [r, g, b, 255]);
      }
    }
  });
  (0, import_test.test)("background 16-255 inverse", async () => {
    let data = "";
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        data += `\x1B[7;48;5;${16 + y * 16 + x}m\u25A0\x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        const cssColor = COLORS_16_TO_255[y * 16 + x];
        const r = parseInt(cssColor.slice(1, 3), 16);
        const g = parseInt(cssColor.slice(3, 5), 16);
        const b = parseInt(cssColor.slice(5, 7), 16);
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [r, g, b, 255]);
      }
    }
  });
  (0, import_test.test)("foreground 16-255 invisible", async () => {
    let data = "";
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        data += `\x1B[8;38;5;${16 + y * 16 + x}m \x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [0, 0, 0, 255]);
      }
    }
  });
  (0, import_test.test)("background 16-255 invisible", async () => {
    let data = "";
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        data += `\x1B[8;48;5;${16 + y * 16 + x}m\u25A0\x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        const cssColor = COLORS_16_TO_255[y * 16 + x];
        const r = parseInt(cssColor.slice(1, 3), 16);
        const g = parseInt(cssColor.slice(3, 5), 16);
        const b = parseInt(cssColor.slice(5, 7), 16);
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [r, g, b, 255]);
      }
    }
  });
  (0, import_test.test)("foreground 16-255 dim", async () => {
    let data = "";
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        data += `\x1B[2;38;5;${16 + y * 16 + x}m\u25A0\x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        const cssColor = COLORS_16_TO_255[y * 16 + x];
        const r = parseInt(cssColor.slice(1, 3), 16);
        const g = parseInt(cssColor.slice(3, 5), 16);
        const b = parseInt(cssColor.slice(5, 7), 16);
        await (0, import_TestUtils.pollFor)(ctx.value.page, async () => {
          const c = await getCellColor(ctx.value, x + 1, y + 1);
          return (c[0] === 0 || c[0] !== r) && (c[1] === 0 || c[1] !== g) && (c[2] === 0 || c[2] !== b);
        }, true);
      }
    }
  });
  (0, import_test.test)("background 16-255 dim", async () => {
    let data = "";
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        data += `\x1B[2;48;5;${16 + y * 16 + x}m \x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 240 / 16; y++) {
      for (let x = 0; x < 16; x++) {
        const cssColor = COLORS_16_TO_255[y * 16 + x];
        const r = parseInt(cssColor.slice(1, 3), 16);
        const g = parseInt(cssColor.slice(3, 5), 16);
        const b = parseInt(cssColor.slice(5, 7), 16);
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [r, g, b, 255]);
      }
    }
  });
  (0, import_test.test)("foreground true color red", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[38;2;${i};0;0m\u25A0\x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [i, 0, 0, 255]);
      }
    }
  });
  (0, import_test.test)("background true color red", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[48;2;${i};0;0m \x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [i, 0, 0, 255]);
      }
    }
  });
  (0, import_test.test)("foreground true color green", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[38;2;0;${i};0m\u25A0\x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [0, i, 0, 255]);
      }
    }
  });
  (0, import_test.test)("background true color green", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[48;2;0;${i};0m \x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [0, i, 0, 255]);
      }
    }
  });
  (0, import_test.test)("foreground true color blue", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[38;2;0;0;${i}m\u25A0\x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [0, 0, i, 255]);
      }
    }
  });
  (0, import_test.test)("background true color blue", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[48;2;0;0;${i}m \x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [0, 0, i, 255]);
      }
    }
  });
  (0, import_test.test)("foreground true color grey", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[38;2;${i};${i};${i}m\u25A0\x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [i, i, i, 255]);
      }
    }
  });
  (0, import_test.test)("background true color grey", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[48;2;${i};${i};${i}m \x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [i, i, i, 255]);
      }
    }
  });
  (0, import_test.test)("foreground true color red inverse", async function() {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[7;38;2;${i};0;0m \x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [i, 0, 0, 255]);
      }
    }
  });
  (0, import_test.test)("background true color red inverse", async function() {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[7;48;2;${i};0;0m\u25A0\x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [i, 0, 0, 255]);
      }
    }
  });
  (0, import_test.test)("foreground true color green inverse", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[7;38;2;0;${i};0m \x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [0, i, 0, 255]);
      }
    }
  });
  (0, import_test.test)("background true color green inverse", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[7;48;2;0;${i};0m\u25A0\x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [0, i, 0, 255]);
      }
    }
  });
  (0, import_test.test)("foreground true color blue inverse", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[7;38;2;0;0;${i}m \x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [0, 0, i, 255]);
      }
    }
  });
  (0, import_test.test)("background true color blue inverse", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[7;48;2;0;0;${i}m\u25A0\x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [0, 0, i, 255]);
      }
    }
  });
  (0, import_test.test)("foreground true color grey inverse", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[7;38;2;${i};${i};${i}m \x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [i, i, i, 255]);
      }
    }
  });
  (0, import_test.test)("background true color grey inverse", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[7;48;2;${i};${i};${i}m\u25A0\x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [i, i, i, 255]);
      }
    }
  });
  (0, import_test.test)("foreground true color grey invisible", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[8;38;2;${i};${i};${i}m \x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [0, 0, 0, 255]);
      }
    }
  });
  (0, import_test.test)("background true color grey invisible", async () => {
    let data = "";
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        data += `\x1B[8;48;2;${i};${i};${i}m\u25A0\x1B[0m`;
      }
      data += "\r\n";
    }
    await ctx.value.proxy.write(data);
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = y * 16 + x;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, x + 1, y + 1), [i, i, i, 255]);
      }
    }
  });
  import_test.test.describe("minimumContrastRatio", async () => {
    (0, import_test.test)("should adjust 0-15 colors on black background", async () => {
      const theme = {
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec"
      };
      await ctx.value.page.evaluate(`
        window.term.options.theme = ${JSON.stringify(theme)};
        window.term.options.minimumContrastRatio = 1;
      `);
      await ctx.value.proxy.write(
        `\x1B[30m\u25A0\x1B[31m\u25A0\x1B[32m\u25A0\x1B[33m\u25A0\x1B[34m\u25A0\x1B[35m\u25A0\x1B[36m\u25A0\x1B[37m\u25A0\r
\x1B[90m\u25A0\x1B[91m\u25A0\x1B[92m\u25A0\x1B[93m\u25A0\x1B[94m\u25A0\x1B[95m\u25A0\x1B[96m\u25A0\x1B[97m\u25A0`
      );
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [46, 52, 54, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [204, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [78, 154, 6, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 1), [196, 160, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 1), [52, 101, 164, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 1), [117, 80, 123, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 1), [6, 152, 154, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 1), [211, 215, 207, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 2), [85, 87, 83, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 2), [239, 41, 41, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 2), [138, 226, 52, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 2), [252, 233, 79, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 2), [114, 159, 207, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 2), [173, 127, 168, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 2), [52, 226, 226, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 2), [238, 238, 236, 255]);
      await ctx.value.page.evaluate(`window.term.options.minimumContrastRatio = 10;`);
      frameDetails = void 0;
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [176, 180, 180, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [238, 158, 158, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [152, 198, 110, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 1), [208, 179, 49, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 1), [161, 183, 215, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 1), [191, 174, 194, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 1), [110, 197, 198, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 1), [211, 215, 207, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 2), [183, 185, 183, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 2), [249, 156, 156, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 2), [138, 226, 52, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 2), [252, 233, 79, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 2), [154, 186, 221, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 2), [203, 173, 199, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 2), [52, 226, 226, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 2), [238, 238, 236, 255]);
    });
    (0, import_test.test)("should adjust 0-15 colors on white background", async () => {
      const theme = {
        background: "#ffffff",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec"
      };
      await ctx.value.page.evaluate(`
        window.term.options.theme = ${JSON.stringify(theme)};
        window.term.options.minimumContrastRatio = 1;
      `);
      await ctx.value.proxy.write(
        `\x1B[30m\u25A0\x1B[31m\u25A0\x1B[32m\u25A0\x1B[33m\u25A0\x1B[34m\u25A0\x1B[35m\u25A0\x1B[36m\u25A0\x1B[37m\u25A0\r
\x1B[90m\u25A0\x1B[91m\u25A0\x1B[92m\u25A0\x1B[93m\u25A0\x1B[94m\u25A0\x1B[95m\u25A0\x1B[96m\u25A0\x1B[97m\u25A0`
      );
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [46, 52, 54, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [204, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [78, 154, 6, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 1), [196, 160, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 1), [52, 101, 164, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 1), [117, 80, 123, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 1), [6, 152, 154, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 1), [211, 215, 207, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 2), [85, 87, 83, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 2), [239, 41, 41, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 2), [138, 226, 52, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 2), [252, 233, 79, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 2), [114, 159, 207, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 2), [173, 127, 168, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 2), [52, 226, 226, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 2), [238, 238, 236, 255]);
      await ctx.value.page.evaluate(`window.term.options.minimumContrastRatio = 10;`);
      frameDetails = void 0;
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [46, 52, 54, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [132, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [36, 72, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 1), [72, 59, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 1), [32, 64, 106, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 1), [75, 51, 80, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 1), [0, 71, 72, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 1), [64, 64, 63, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 2), [61, 63, 59, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 2), [125, 19, 19, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 2), [40, 67, 13, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 4, 2), [67, 63, 19, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 5, 2), [45, 65, 87, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 6, 2), [81, 57, 78, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 7, 2), [13, 67, 67, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 8, 2), [64, 64, 64, 255]);
    });
    (0, import_test.test)("should enforce half the contrast for dim cells", async () => {
      const theme = {
        background: "#ffffff",
        black: "#2e3436",
        red: "#cc0000",
        green: "#4e9a06",
        yellow: "#c4a000",
        blue: "#3465a4",
        magenta: "#75507b",
        cyan: "#06989a",
        white: "#d3d7cf",
        brightBlack: "#555753",
        brightRed: "#ef2929",
        brightGreen: "#8ae234",
        brightYellow: "#fce94f",
        brightBlue: "#729fcf",
        brightMagenta: "#ad7fa8",
        brightCyan: "#34e2e2",
        brightWhite: "#eeeeec"
      };
      await ctx.value.page.evaluate(`
        window.term.options.theme = ${JSON.stringify(theme)};
        window.term.options.minimumContrastRatio = 1;
      `);
      await ctx.value.proxy.write(
        `\x1B[2m\x1B[30m\u25A0\x1B[31m\u25A0\x1B[32m\u25A0\x1B[33m\u25A0\x1B[34m\u25A0\x1B[35m\u25A0\x1B[36m\u25A0\x1B[37m\u25A0\r
\x1B[90m\u25A0\x1B[91m\u25A0\x1B[92m\u25A0\x1B[93m\u25A0\x1B[94m\u25A0\x1B[95m\u25A0\x1B[96m\u25A0\x1B[97m\u25A0`
      );
      const marginOfError = 1;
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 1, 1), [Math.floor((255 + 46) / 2), Math.floor((255 + 52) / 2), Math.floor((255 + 54) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 2, 1), [Math.floor((255 + 204) / 2), Math.floor((255 + 0) / 2), Math.floor((255 + 0) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 3, 1), [Math.floor((255 + 78) / 2), Math.floor((255 + 154) / 2), Math.floor((255 + 6) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 4, 1), [Math.floor((255 + 196) / 2), Math.floor((255 + 160) / 2), Math.floor((255 + 0) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 5, 1), [Math.floor((255 + 52) / 2), Math.floor((255 + 101) / 2), Math.floor((255 + 164) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 6, 1), [Math.floor((255 + 117) / 2), Math.floor((255 + 80) / 2), Math.floor((255 + 123) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 7, 1), [Math.floor((255 + 6) / 2), Math.floor((255 + 152) / 2), Math.floor((255 + 154) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 8, 1), [Math.floor((255 + 211) / 2), Math.floor((255 + 215) / 2), Math.floor((255 + 207) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 1, 2), [Math.floor((255 + 85) / 2), Math.floor((255 + 87) / 2), Math.floor((255 + 83) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 2, 2), [Math.floor((255 + 239) / 2), Math.floor((255 + 41) / 2), Math.floor((255 + 41) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 3, 2), [Math.floor((255 + 138) / 2), Math.floor((255 + 226) / 2), Math.floor((255 + 52) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 4, 2), [Math.floor((255 + 252) / 2), Math.floor((255 + 233) / 2), Math.floor((255 + 79) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 5, 2), [Math.floor((255 + 114) / 2), Math.floor((255 + 159) / 2), Math.floor((255 + 207) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 6, 2), [Math.floor((255 + 173) / 2), Math.floor((255 + 127) / 2), Math.floor((255 + 168) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 7, 2), [Math.floor((255 + 52) / 2), Math.floor((255 + 226) / 2), Math.floor((255 + 226) / 2), 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 8, 2), [Math.floor((255 + 238) / 2), Math.floor((255 + 238) / 2), Math.floor((255 + 236) / 2), 255]);
      await ctx.value.page.evaluate(`window.term.options.minimumContrastRatio = 10;`);
      frameDetails = void 0;
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 1, 1), [150, 153, 154, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 2, 1), [229, 127, 127, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 3, 1), [63, 124, 4, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 4, 1), [127, 104, 0, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 5, 1), [153, 178, 209, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 6, 1), [186, 167, 189, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 7, 1), [4, 122, 124, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 8, 1), [110, 112, 108, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 1, 2), [170, 171, 169, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 2, 2), [215, 36, 36, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 3, 2), [72, 117, 25, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 4, 2), [117, 109, 36, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 5, 2), [72, 103, 135, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 6, 2), [125, 91, 121, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 7, 2), [25, 117, 117, 255]);
      await (0, import_TestUtils.pollForApproximate)(ctx.value.page, marginOfError, () => getCellColor(ctx.value, 8, 2), [111, 111, 110, 255]);
    });
  });
  (ctx.skipCanvasExceptions ? import_test.test.describe.skip : import_test.test.describe)("selectionBackground", async () => {
    (0, import_test.test)("should resolve the inverse foreground color based on the original background color, not the selection", async () => {
      const theme = {
        foreground: "#FF0000",
        background: "#00FF00",
        selectionBackground: "#0000FF"
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      await ctx.value.proxy.write(` \u25A0\x1B[7m\u25A0\x1B[0m`);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [0, 255, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [255, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [0, 255, 0, 255]);
      await ctx.value.proxy.selectAll();
      frameDetails = void 0;
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [0, 0, 255, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [255, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [0, 255, 0, 255]);
    });
  });
  (ctx.skipCanvasExceptions ? import_test.test.describe.skip : import_test.test.describe)("selectionInactiveBackground", async () => {
    (0, import_test.test)("should render the the inactive selection when not focused", async () => {
      const theme = {
        selectionBackground: "#FF000080",
        selectionInactiveBackground: "#0000FF80"
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      await ctx.value.proxy.focus();
      await ctx.value.proxy.writeln("_ ");
      await ctx.value.proxy.write("_ ");
      await ctx.value.proxy.selectAll();
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [128, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [128, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 2), [128, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 2), [128, 0, 0, 255]);
      await ctx.value.page.evaluate(`document.activeElement.blur()`);
      frameDetails = void 0;
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [0, 0, 128, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [0, 0, 128, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 2), [0, 0, 128, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 2), [0, 0, 128, 255]);
    });
  });
  (ctx.skipCanvasExceptions || ctx.skipDomExceptions ? import_test.test.describe.skip : import_test.test.describe)("selection blending", () => {
    (0, import_test.test)("background", async () => {
      const theme = {
        red: "#CC0000",
        selectionBackground: "#FFFFFF"
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      await ctx.value.proxy.focus();
      await ctx.value.proxy.writeln("\x1B[41m red bg\x1B[0m");
      await ctx.value.proxy.writeln("\x1B[7m inverse\x1B[0m");
      await ctx.value.proxy.writeln("\x1B[31;7m red fg inverse\x1B[0m");
      await ctx.value.proxy.writeln("\x1B[48:2:0:204:0:0m red truecolor bg\x1B[0m");
      await ctx.value.proxy.selectAll();
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [230, 128, 128, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 2), [255, 255, 255, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 3), [230, 128, 128, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 4), [230, 128, 128, 255]);
    });
    (0, import_test.test)("powerline decorative symbols", async () => {
      const theme = {
        red: "#CC0000",
        green: "#00CC00",
        selectionBackground: "#FFFFFF"
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      await ctx.value.proxy.focus();
      await ctx.value.proxy.writeln("\uE0B4 plain\x1B[0m");
      await ctx.value.proxy.writeln("\x1B[31;42m\uE0B4 red fg green bg\x1B[0m");
      await ctx.value.proxy.writeln("\x1B[32;41m\uE0B4 green fg red bg\x1B[0m");
      await ctx.value.proxy.writeln("\x1B[31;42;7m\uE0B4 red fg green bg inverse\x1B[0m");
      await ctx.value.proxy.writeln("\x1B[32;41;7m\uE0B4 green fg red bg inverse\x1B[0m");
      await ctx.value.proxy.selectAll();
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [255, 255, 255, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 2), [230, 128, 128, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 3), [128, 230, 128, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 4), [128, 230, 128, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 5), [230, 128, 128, 255]);
    });
  });
  import_test.test.describe("allowTransparency", async () => {
    import_test.test.beforeEach(() => ctx.value.page.evaluate(`term.options.allowTransparency = true`));
    (0, import_test.test)("transparent background inverse", async () => {
      const theme = {
        background: "#ff000080"
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      const data = `\x1B[7m\u25A0\x1B[0m`;
      await ctx.value.proxy.write(data);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [255, 0, 0, 255]);
    });
  });
  (ctx.skipCanvasExceptions ? import_test.test.describe.skip : import_test.test.describe)("selectionForeground", () => {
    (0, import_test.test)("transparent background inverse", async () => {
      const theme = {
        selectionForeground: "#ff0000"
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      const data = `\x1B[7m\u25A0\x1B[0m`;
      await ctx.value.proxy.write(data);
      await ctx.value.proxy.selectAll();
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [255, 0, 0, 255]);
    });
  });
  import_test.test.describe("decoration color overrides", async () => {
    (0, import_test.test)("foregroundColor", async () => {
      await ctx.value.page.evaluate(`
        const marker = window.term.registerMarker(-window.term.buffer.active.cursorY);
        window.term.registerDecoration({
          marker,
          foregroundColor: '#ff0000',
          backgroundColor: '#0000ff'
        });
      `);
      const data = `\u25A0`;
      await ctx.value.proxy.write(data);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [255, 0, 0, 255]);
    });
    (0, import_test.test)("foregroundColor should ignore inverse", async () => {
      await ctx.value.page.evaluate(`
        const marker = window.term.registerMarker(-window.term.buffer.active.cursorY);
        window.term.registerDecoration({
          marker,
          foregroundColor: '#ff0000',
          backgroundColor: '#0000ff'
        });
      `);
      const data = `\x1B[7m\u25A0\x1B[0m`;
      await ctx.value.proxy.write(data);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [255, 0, 0, 255]);
    });
    (0, import_test.test)("foregroundColor should ignore inverse (only fg on decoration)", async () => {
      await ctx.value.page.evaluate(`
        const marker = window.term.registerMarker(-window.term.buffer.active.cursorY);
        window.term.registerDecoration({
          marker,
          width: 2,
          foregroundColor: '#ff0000'
        });
      `);
      const data = `\x1B[7m\u25A0 \x1B[0m`;
      await ctx.value.proxy.write(data);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [255, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [255, 255, 255, 255]);
    });
    (0, import_test.test)("backgroundColor", async () => {
      await ctx.value.page.evaluate(`
        const marker = window.term.registerMarker(-window.term.buffer.active.cursorY);
        window.term.registerDecoration({
          marker,
          foregroundColor: '#ff0000',
          backgroundColor: '#0000ff'
        });
      `);
      const data = ` `;
      await ctx.value.proxy.write(data);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [0, 0, 255, 255]);
    });
    (0, import_test.test)("backgroundColor should ignore inverse", async () => {
      await ctx.value.page.evaluate(`
        const marker = window.term.registerMarker(-window.term.buffer.active.cursorY);
        window.term.registerDecoration({
          marker,
          foregroundColor: '#ff0000',
          backgroundColor: '#0000ff'
        });
      `);
      const data = `\x1B[7m \x1B[0m`;
      await ctx.value.proxy.write(data);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [0, 0, 255, 255]);
    });
    (ctx.skipCanvasExceptions ? import_test.test.skip : import_test.test)("backgroundColor should ignore inverse (only bg on decoration)", async () => {
      const data = `\x1B[7m\u25A0 \x1B[0m`;
      await ctx.value.proxy.write(data);
      await ctx.value.page.evaluate(`
        const marker = window.term.registerMarker(-window.term.buffer.active.cursorY);
        window.term.registerDecoration({
          marker,
          width: 2,
          backgroundColor: '#0000ff'
        });
      `);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [0, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [0, 0, 255, 255]);
    });
  });
  import_test.test.describe("regression tests", () => {
    (ctx.skipCanvasExceptions ? import_test.test.skip : import_test.test)("#4736: inactive selection background should replace regular cell background color", async () => {
      const theme = {
        selectionBackground: "#FF0000",
        selectionInactiveBackground: "#0000FF"
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      await ctx.value.proxy.writeln(" ");
      await ctx.value.proxy.writeln(" O ");
      await ctx.value.proxy.writeln(" ");
      await ctx.value.proxy.focus();
      await ctx.value.proxy.selectAll();
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [255, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [255, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 2), [255, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 3), [255, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 3), [255, 0, 0, 255]);
      await ctx.value.proxy.blur();
      frameDetails = void 0;
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [0, 0, 255, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [0, 0, 255, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 2), [0, 0, 255, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 3), [0, 0, 255, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 3), [0, 0, 255, 255]);
    });
    (0, import_test.test)("#4758: multiple invisible text characters without SGR change should not be rendered", async () => {
      await ctx.value.proxy.writeln(`\u25A0\x1B[8m\u25A0\u25A0`);
      await ctx.value.proxy.refresh(0, await ctx.value.proxy.rows - 1);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [255, 255, 255, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [0, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [0, 0, 0, 255]);
    });
    (ctx.skipDomExceptions ? import_test.test.skip : import_test.test)("#4759: minimum contrast ratio should be respected on inverse text", async () => {
      const theme = {
        foreground: "#aaaaaa",
        background: "#333333"
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      await ctx.value.proxy.write(`\x1B[7m\u25A0\u25A0`);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [51, 51, 51, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [51, 51, 51, 255]);
      await ctx.value.page.evaluate(`window.term.options.minimumContrastRatio = 10;`);
      frameDetails = void 0;
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [0, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [0, 0, 0, 255]);
    });
    (ctx.skipCanvasExceptions ? import_test.test.skip : import_test.test)("#4759: minimum contrast ratio should be respected on selected inverse text", async () => {
      const theme = {
        foreground: "#777777",
        background: "#555555",
        selectionBackground: "#666666"
        // Slightly more contrast needed for selection
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      await ctx.value.proxy.write(`\x1B[7m\u25A0\u25A0`);
      await ctx.value.proxy.selectAll();
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [85, 85, 85, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [85, 85, 85, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [102, 102, 102, 255]);
      await ctx.value.page.evaluate(`window.term.options.minimumContrastRatio = 10;`);
      await ctx.value.proxy.selectAll();
      frameDetails = void 0;
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [255, 255, 255, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 2, 1), [255, 255, 255, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 3, 1), [102, 102, 102, 255]);
    });
    (0, import_test.test)("#4773: block cursor should render when the cell is selected", async () => {
      const theme = {
        cursor: "#0000FF",
        selectionBackground: "#FF0000"
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      await ctx.value.proxy.focus();
      await ctx.value.proxy.selectAll();
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [0, 0, 255, 255]);
    });
    (0, import_test.test)("#4799: cursor should be in the correct position", async () => {
      const theme = {
        cursor: "#0000FF"
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      for (let index = 0; index < 160; index++) {
        await ctx.value.proxy.writeln(``);
      }
      await ctx.value.proxy.focus();
      await ctx.value.proxy.write("\x1B[A");
      await ctx.value.proxy.write("\x1B[A");
      await ctx.value.proxy.scrollLines(-2);
      const rows = await ctx.value.proxy.rows;
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, rows), [0, 0, 255, 255]);
      await ctx.value.proxy.blur();
      frameDetails = void 0;
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, rows), [0, 0, 0, 255]);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, rows, 1 /* FIRST */), [0, 0, 255, 255]);
    });
    (0, import_test.test)("#4917 The selection should not be displayed if it is not within the scope of the viewport.", async () => {
      const theme = {
        selectionBackground: "#FF0000"
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      for (let index = 0; index < 160; index++) {
        await ctx.value.proxy.writeln(``);
      }
      await ctx.value.proxy.scrollToBottom();
      const rows = await ctx.value.proxy.buffer.active.length;
      await ctx.value.proxy.selectLines(rows - 1, rows - 1);
      await ctx.value.proxy.scrollLines(-2);
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [0, 0, 0, 255]);
    });
    (0, import_test.test)("#5241 cursor with alpha should blend color with background color", async () => {
      const theme = {
        cursor: "#FF000080"
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      await ctx.value.proxy.focus();
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [128, 0, 0, 255]);
    });
    (0, import_test.test)("#5241 cursorAccent with alpha should blend color with background color", async () => {
      const theme = {
        cursorAccent: "#FF000080"
      };
      await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
      await ctx.value.proxy.focus();
      await ctx.value.proxy.write("\u25A0");
      await ctx.value.proxy.write("\x1B[1D");
      await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [128, 0, 0, 255]);
    });
  });
}
var CellColorPosition = /* @__PURE__ */ ((CellColorPosition2) => {
  CellColorPosition2[CellColorPosition2["CENTER"] = 0] = "CENTER";
  CellColorPosition2[CellColorPosition2["FIRST"] = 1] = "FIRST";
  return CellColorPosition2;
})(CellColorPosition || {});
function injectSharedRendererTestsStandalone(ctx, setupCb) {
  import_test.test.describe("standalone tests", () => {
    import_test.test.beforeEach(async () => {
      await (0, import_TestUtils.openTerminal)(ctx.value);
      await ctx.value.page.evaluate(`
        window.term.options.minimumContrastRatio = 1;
        window.term.options.allowTransparency = false;
        window.term.options.theme = undefined;
      `);
      await setupCb();
      frameDetails = void 0;
    });
    import_test.test.describe("regression tests", () => {
      (0, import_test.test)("#4790: cursor should not be displayed before focusing", async () => {
        const theme = {
          cursor: "#0000FF"
        };
        await ctx.value.page.evaluate(`window.term.options.theme = ${JSON.stringify(theme)};`);
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [0, 0, 0, 255]);
        await ctx.value.proxy.focus();
        frameDetails = void 0;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [0, 0, 255, 255]);
        await ctx.value.proxy.blur();
        frameDetails = void 0;
        await (0, import_TestUtils.pollFor)(ctx.value.page, () => getCellColor(ctx.value, 1, 1), [0, 0, 0, 255]);
      });
    });
  });
}
function getCellColor(ctx, col, row, position = 0 /* CENTER */) {
  if (!frameDetails) {
    return getFrameDetails(ctx).then((frameDetails2) => getCellColorInner(frameDetails2, col, row));
  }
  switch (position) {
    case 0 /* CENTER */:
      return getCellColorInner(frameDetails, col, row);
    case 1 /* FIRST */:
      return getCellColorFirstPoint(frameDetails, col, row);
  }
}
let frameDetails = void 0;
async function getFrameDetails(ctx) {
  const screenshotOptions = process.env.DEBUG ? { path: "out-esbuild-test/playwright/screenshot.png" } : void 0;
  const buffer = await ctx.page.locator("#terminal-container .xterm-screen").screenshot(screenshotOptions);
  frameDetails = {
    cols: await ctx.proxy.cols,
    rows: await ctx.proxy.rows,
    decoded: (await (0, import_png_codec.decodePng)(buffer, { force32: true })).image
  };
  return frameDetails;
}
function getCellColorInner(frameDetails2, col, row) {
  const cellSize = {
    width: frameDetails2.decoded.width / frameDetails2.cols,
    height: frameDetails2.decoded.height / frameDetails2.rows
  };
  const x = Math.floor((col - 1 + 0.5) * cellSize.width);
  const y = Math.floor((row - 1 + 0.5) * cellSize.height);
  const i = (y * frameDetails2.decoded.width + x) * 4;
  return Array.from(frameDetails2.decoded.data.slice(i, i + 4));
}
function getCellColorFirstPoint(frameDetails2, col, row) {
  const cellSize = {
    width: frameDetails2.decoded.width / frameDetails2.cols,
    height: frameDetails2.decoded.height / frameDetails2.rows
  };
  const x = Math.floor((col - 1) * cellSize.width);
  const y = Math.floor((row - 1) * cellSize.height);
  const i = (y * frameDetails2.decoded.width + x) * 4;
  return Array.from(frameDetails2.decoded.data.slice(i, i + 4));
}
const COLORS_16_TO_255 = [
  "#000000",
  "#00005f",
  "#000087",
  "#0000af",
  "#0000d7",
  "#0000ff",
  "#005f00",
  "#005f5f",
  "#005f87",
  "#005faf",
  "#005fd7",
  "#005fff",
  "#008700",
  "#00875f",
  "#008787",
  "#0087af",
  "#0087d7",
  "#0087ff",
  "#00af00",
  "#00af5f",
  "#00af87",
  "#00afaf",
  "#00afd7",
  "#00afff",
  "#00d700",
  "#00d75f",
  "#00d787",
  "#00d7af",
  "#00d7d7",
  "#00d7ff",
  "#00ff00",
  "#00ff5f",
  "#00ff87",
  "#00ffaf",
  "#00ffd7",
  "#00ffff",
  "#5f0000",
  "#5f005f",
  "#5f0087",
  "#5f00af",
  "#5f00d7",
  "#5f00ff",
  "#5f5f00",
  "#5f5f5f",
  "#5f5f87",
  "#5f5faf",
  "#5f5fd7",
  "#5f5fff",
  "#5f8700",
  "#5f875f",
  "#5f8787",
  "#5f87af",
  "#5f87d7",
  "#5f87ff",
  "#5faf00",
  "#5faf5f",
  "#5faf87",
  "#5fafaf",
  "#5fafd7",
  "#5fafff",
  "#5fd700",
  "#5fd75f",
  "#5fd787",
  "#5fd7af",
  "#5fd7d7",
  "#5fd7ff",
  "#5fff00",
  "#5fff5f",
  "#5fff87",
  "#5fffaf",
  "#5fffd7",
  "#5fffff",
  "#870000",
  "#87005f",
  "#870087",
  "#8700af",
  "#8700d7",
  "#8700ff",
  "#875f00",
  "#875f5f",
  "#875f87",
  "#875faf",
  "#875fd7",
  "#875fff",
  "#878700",
  "#87875f",
  "#878787",
  "#8787af",
  "#8787d7",
  "#8787ff",
  "#87af00",
  "#87af5f",
  "#87af87",
  "#87afaf",
  "#87afd7",
  "#87afff",
  "#87d700",
  "#87d75f",
  "#87d787",
  "#87d7af",
  "#87d7d7",
  "#87d7ff",
  "#87ff00",
  "#87ff5f",
  "#87ff87",
  "#87ffaf",
  "#87ffd7",
  "#87ffff",
  "#af0000",
  "#af005f",
  "#af0087",
  "#af00af",
  "#af00d7",
  "#af00ff",
  "#af5f00",
  "#af5f5f",
  "#af5f87",
  "#af5faf",
  "#af5fd7",
  "#af5fff",
  "#af8700",
  "#af875f",
  "#af8787",
  "#af87af",
  "#af87d7",
  "#af87ff",
  "#afaf00",
  "#afaf5f",
  "#afaf87",
  "#afafaf",
  "#afafd7",
  "#afafff",
  "#afd700",
  "#afd75f",
  "#afd787",
  "#afd7af",
  "#afd7d7",
  "#afd7ff",
  "#afff00",
  "#afff5f",
  "#afff87",
  "#afffaf",
  "#afffd7",
  "#afffff",
  "#d70000",
  "#d7005f",
  "#d70087",
  "#d700af",
  "#d700d7",
  "#d700ff",
  "#d75f00",
  "#d75f5f",
  "#d75f87",
  "#d75faf",
  "#d75fd7",
  "#d75fff",
  "#d78700",
  "#d7875f",
  "#d78787",
  "#d787af",
  "#d787d7",
  "#d787ff",
  "#d7af00",
  "#d7af5f",
  "#d7af87",
  "#d7afaf",
  "#d7afd7",
  "#d7afff",
  "#d7d700",
  "#d7d75f",
  "#d7d787",
  "#d7d7af",
  "#d7d7d7",
  "#d7d7ff",
  "#d7ff00",
  "#d7ff5f",
  "#d7ff87",
  "#d7ffaf",
  "#d7ffd7",
  "#d7ffff",
  "#ff0000",
  "#ff005f",
  "#ff0087",
  "#ff00af",
  "#ff00d7",
  "#ff00ff",
  "#ff5f00",
  "#ff5f5f",
  "#ff5f87",
  "#ff5faf",
  "#ff5fd7",
  "#ff5fff",
  "#ff8700",
  "#ff875f",
  "#ff8787",
  "#ff87af",
  "#ff87d7",
  "#ff87ff",
  "#ffaf00",
  "#ffaf5f",
  "#ffaf87",
  "#ffafaf",
  "#ffafd7",
  "#ffafff",
  "#ffd700",
  "#ffd75f",
  "#ffd787",
  "#ffd7af",
  "#ffd7d7",
  "#ffd7ff",
  "#ffff00",
  "#ffff5f",
  "#ffff87",
  "#ffffaf",
  "#ffffd7",
  "#ffffff",
  "#080808",
  "#121212",
  "#1c1c1c",
  "#262626",
  "#303030",
  "#3a3a3a",
  "#444444",
  "#4e4e4e",
  "#585858",
  "#626262",
  "#6c6c6c",
  "#767676",
  "#808080",
  "#8a8a8a",
  "#949494",
  "#9e9e9e",
  "#a8a8a8",
  "#b2b2b2",
  "#bcbcbc",
  "#c6c6c6",
  "#d0d0d0",
  "#dadada",
  "#e4e4e4",
  "#eeeeee"
];
//# sourceMappingURL=SharedRendererTests.js.map
