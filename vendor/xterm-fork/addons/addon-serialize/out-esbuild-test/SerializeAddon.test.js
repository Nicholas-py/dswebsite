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
var import_test = __toESM(require("@playwright/test"));
var import_assert = require("assert");
var import_TestUtils = require("../../../test/playwright/TestUtils");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const writeRawSync = (page, str) => (0, import_TestUtils.writeSync)(ctx.page, `' +` + JSON.stringify(str) + `+ '`);
const testNormalScreenEqual = async (page, str) => {
  await writeRawSync(ctx.page, str);
  const originalBuffer = await ctx.page.evaluate(`inspectBuffer(term.buffer.normal);`);
  const result = await ctx.page.evaluate(`window.serialize.serialize();`);
  await ctx.page.evaluate(`term.reset();`);
  await writeRawSync(ctx.page, result);
  const newBuffer = await ctx.page.evaluate(`inspectBuffer(term.buffer.normal);`);
  (0, import_assert.deepStrictEqual)(JSON.stringify(originalBuffer), JSON.stringify(newBuffer));
};
async function testSerializeEquals(writeContent, expectedSerialized) {
  await writeRawSync(ctx.page, writeContent);
  const result = await ctx.page.evaluate(`window.serialize.serialize();`);
  (0, import_assert.strictEqual)(result, expectedSerialized);
}
let ctx;
import_test.default.beforeAll(async ({ browser }) => {
  ctx = await (0, import_TestUtils.createTestContext)(browser);
  await (0, import_TestUtils.openTerminal)(ctx, { rows: 10, cols: 10 });
});
import_test.default.afterAll(async () => await ctx.page.close());
import_test.default.describe("SerializeAddon", () => {
  import_test.default.beforeEach(async () => {
    await ctx.page.evaluate(`
      window.term.reset()
      window.serialize?.dispose();
      window.serialize = new SerializeAddon();
      window.term.loadAddon(window.serialize);
      window.inspectBuffer = (buffer) => {
        const lines = [];
        for (let i = 0; i < buffer.length; i++) {
          // Do this intentionally to get content of underlining source
          const bufferLine = buffer.getLine(i)._line;
          lines.push(JSON.stringify(bufferLine));
        }
        return {
          x: buffer.cursorX,
          y: buffer.cursorY,
          data: lines
        };
      }
    `);
  });
  import_test.default.beforeEach(async () => {
    await ctx.proxy.reset();
  });
  (0, import_test.default)("produce different output when we call test util with different text", async function() {
    await writeRawSync(ctx.page, "12345");
    const buffer1 = await ctx.page.evaluate(`inspectBuffer(term.buffer.normal);`);
    await ctx.page.evaluate(`term.reset();`);
    await writeRawSync(ctx.page, "67890");
    const buffer2 = await ctx.page.evaluate(`inspectBuffer(term.buffer.normal);`);
    (0, import_assert.notDeepStrictEqual)(JSON.stringify(buffer1), JSON.stringify(buffer2));
  });
  (0, import_test.default)("produce different output when we call test util with different line wrap", async function() {
    await writeRawSync(ctx.page, "1234567890\r\n12345");
    const buffer3 = await ctx.page.evaluate(`inspectBuffer(term.buffer.normal);`);
    await ctx.page.evaluate(`term.reset();`);
    await writeRawSync(ctx.page, "123456789012345");
    const buffer4 = await ctx.page.evaluate(`inspectBuffer(term.buffer.normal);`);
    (0, import_assert.notDeepStrictEqual)(JSON.stringify(buffer3), JSON.stringify(buffer4));
  });
  (0, import_test.default)("empty content", async function() {
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), "");
  });
  (0, import_test.default)("unwrap wrapped line", async function() {
    const lines = ["123456789123456789"];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("does not unwrap non-wrapped line", async function() {
    const lines = [
      "123456789",
      "123456789"
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("preserve last empty lines", async function() {
    const cols = 10;
    const lines = [
      "",
      "",
      digitsString(cols),
      digitsString(cols),
      "",
      "",
      digitsString(cols),
      digitsString(cols),
      "",
      "",
      ""
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("digits content", async function() {
    const rows = 10;
    const cols = 10;
    const digitsLine = digitsString(cols);
    const lines = newArray(digitsLine, rows);
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("serialize with half of scrollback", async function() {
    const rows = 20;
    const scrollback = rows - 10;
    const halfScrollback = scrollback / 2;
    const cols = 10;
    const lines = newArray((index) => digitsString(cols, index), rows);
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize({ scrollback: ${halfScrollback} });`), lines.slice(halfScrollback, rows).join("\r\n"));
  });
  (0, import_test.default)("serialize 0 rows of scrollback", async function() {
    const rows = 20;
    const cols = 10;
    const lines = newArray((index) => digitsString(cols, index), rows);
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize({ scrollback: 0 });`), lines.slice(rows - 10, rows).join("\r\n"));
  });
  (0, import_test.default)("serialize exclude modes", async () => {
    await ctx.proxy.write("before\x1B[?1hafter");
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), "beforeafter\x1B[?1h");
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize({ excludeModes: true });`), "beforeafter");
  });
  (0, import_test.default)("serialize exclude alt buffer", async () => {
    await ctx.proxy.write("normal\x1B[?1049h\x1B[Halt");
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), "normal\x1B[?1049h\x1B[Halt");
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize({ excludeAltBuffer: true });`), "normal");
  });
  (0, import_test.default)("serialize all rows of content with color16", async function() {
    const cols = 10;
    const color16 = [
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      // Set foreground color
      90,
      91,
      92,
      93,
      94,
      95,
      96,
      97,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      // Set background color
      100,
      101,
      103,
      104,
      105,
      106,
      107
    ];
    const rows = color16.length;
    const lines = newArray(
      (index) => digitsString(cols, index, `\x1B[${color16[index % color16.length]}m`),
      rows
    );
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("serialize all rows of content with fg/bg flags", async function() {
    const cols = 10;
    const line = "+".repeat(cols);
    const lines = [
      sgr(FG_P16_GREEN) + line,
      // Workaround: If we clear all flags a the end, serialize will use \x1b[0m to clear instead of the sepcific disable sequence
      sgr(INVERSE) + line,
      sgr(BOLD) + line,
      sgr(UNDERLINED) + line,
      sgr(BLINK) + line,
      sgr(INVISIBLE) + line,
      sgr(STRIKETHROUGH) + line,
      sgr(NO_INVERSE) + line,
      sgr(NO_BOLD) + line,
      sgr(NO_UNDERLINED) + line,
      sgr(NO_BLINK) + line,
      sgr(NO_INVISIBLE) + line,
      sgr(NO_STRIKETHROUGH) + line
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("serialize all rows of content with color256", async function() {
    const rows = 32;
    const cols = 10;
    const lines = newArray(
      (index) => digitsString(cols, index, `\x1B[38;5;${16 + index}m`),
      rows
    );
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("serialize all rows of content with overline", async () => {
    const cols = 10;
    const line = "+".repeat(cols);
    const lines = [
      sgr(OVERLINED) + line,
      // Overlined
      sgr(UNDERLINED) + line,
      // Overlined, Underlined
      sgr(NORMAL) + line
      // Normal
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("serialize all rows of content with color16 and style separately", async function() {
    const cols = 10;
    const line = "+".repeat(cols);
    const lines = [
      sgr(FG_P16_RED) + line,
      // fg Red,
      sgr(UNDERLINED) + line,
      // fg Red, Underlined
      sgr(FG_P16_GREEN) + line,
      // fg Green, Underlined
      sgr(INVERSE) + line,
      // fg Green, Underlined, Inverse
      sgr(NO_INVERSE) + line,
      // fg Green, Underlined
      sgr(INVERSE) + line,
      // fg Green, Underlined, Inverse
      sgr(BG_P16_YELLOW) + line,
      // fg Green, bg Yellow, Underlined, Inverse
      sgr(FG_RESET) + line,
      // bg Yellow, Underlined, Inverse
      sgr(BG_RESET) + line,
      // Underlined, Inverse
      sgr(NORMAL) + line
      // Back to normal
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("serialize all rows of content with color16 and style together", async function() {
    const cols = 10;
    const line = "+".repeat(cols);
    const lines = [
      sgr(FG_P16_RED) + line,
      // fg Red
      sgr(FG_P16_GREEN, BG_P16_YELLOW) + line,
      // fg Green, bg Yellow
      sgr(UNDERLINED, ITALIC) + line,
      // fg Green, bg Yellow, Underlined, Italic
      sgr(NO_UNDERLINED, NO_ITALIC) + line,
      // fg Green, bg Yellow
      sgr(FG_RESET, ITALIC) + line,
      // bg Yellow, Italic
      sgr(BG_RESET) + line,
      // Italic
      sgr(NORMAL) + line,
      // Back to normal
      sgr(FG_P16_RED) + line,
      // fg Red
      sgr(FG_P16_GREEN, BG_P16_YELLOW) + line,
      // fg Green, bg Yellow
      sgr(UNDERLINED, ITALIC) + line,
      // fg Green, bg Yellow, Underlined, Italic
      sgr(NO_UNDERLINED, NO_ITALIC) + line,
      // fg Green, bg Yellow
      sgr(FG_RESET, ITALIC) + line,
      // bg Yellow, Italic
      sgr(BG_RESET) + line
      // Italic
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("serialize all rows of content with color256 and style separately", async function() {
    const cols = 10;
    const line = "+".repeat(cols);
    const lines = [
      sgr(FG_P256_RED) + line,
      // fg Red 256,
      sgr(UNDERLINED) + line,
      // fg Red 256, Underlined
      sgr(FG_P256_GREEN) + line,
      // fg Green 256, Underlined
      sgr(INVERSE) + line,
      // fg Green 256, Underlined, Inverse
      sgr(NO_INVERSE) + line,
      // fg Green 256, Underlined
      sgr(INVERSE) + line,
      // fg Green 256, Underlined, Inverse
      sgr(BG_P256_YELLOW) + line,
      // fg Green 256, bg Yellow 256, Underlined, Inverse
      sgr(FG_RESET) + line,
      // bg Yellow 256, Underlined, Inverse
      sgr(BG_RESET) + line,
      // Underlined, Inverse
      sgr(NORMAL) + line
      // Back to normal
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("serialize all rows of content with color256 and style together", async function() {
    const cols = 10;
    const line = "+".repeat(cols);
    const lines = [
      sgr(FG_P256_RED) + line,
      // fg Red 256
      sgr(FG_P256_GREEN, BG_P256_YELLOW) + line,
      // fg Green 256, bg Yellow 256
      sgr(UNDERLINED, ITALIC) + line,
      // fg Green 256, bg Yellow 256, Underlined, Italic
      sgr(NO_UNDERLINED, NO_ITALIC) + line,
      // fg Green 256, bg Yellow 256
      sgr(FG_RESET, ITALIC) + line,
      // bg Yellow 256, Italic
      sgr(BG_RESET) + line,
      // Italic
      sgr(NORMAL) + line,
      // Back to normal
      sgr(FG_P256_RED) + line,
      // fg Red 256
      sgr(FG_P256_GREEN, BG_P256_YELLOW) + line,
      // fg Green 256, bg Yellow 256
      sgr(UNDERLINED, ITALIC) + line,
      // fg Green 256, bg Yellow 256, Underlined, Italic
      sgr(NO_UNDERLINED, NO_ITALIC) + line,
      // fg Green 256, bg Yellow 256
      sgr(FG_RESET, ITALIC) + line,
      // bg Yellow 256, Italic
      sgr(BG_RESET) + line
      // Italic
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("serialize all rows of content with colorRGB and style separately", async function() {
    const cols = 10;
    const line = "+".repeat(cols);
    const lines = [
      sgr(FG_RGB_RED) + line,
      // fg Red RGB,
      sgr(UNDERLINED) + line,
      // fg Red RGB, Underlined
      sgr(FG_RGB_GREEN) + line,
      // fg Green RGB, Underlined
      sgr(INVERSE) + line,
      // fg Green RGB, Underlined, Inverse
      sgr(NO_INVERSE) + line,
      // fg Green RGB, Underlined
      sgr(INVERSE) + line,
      // fg Green RGB, Underlined, Inverse
      sgr(BG_RGB_YELLOW) + line,
      // fg Green RGB, bg Yellow RGB, Underlined, Inverse
      sgr(FG_RESET) + line,
      // bg Yellow RGB, Underlined, Inverse
      sgr(BG_RESET) + line,
      // Underlined, Inverse
      sgr(NORMAL) + line
      // Back to normal
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("serialize all rows of content with colorRGB and style together", async function() {
    const cols = 10;
    const line = "+".repeat(cols);
    const lines = [
      sgr(FG_RGB_RED) + line,
      // fg Red RGB
      sgr(FG_RGB_GREEN, BG_RGB_YELLOW) + line,
      // fg Green RGB, bg Yellow RGB
      sgr(UNDERLINED, ITALIC) + line,
      // fg Green RGB, bg Yellow RGB, Underlined, Italic
      sgr(NO_UNDERLINED, NO_ITALIC) + line,
      // fg Green RGB, bg Yellow RGB
      sgr(FG_RESET, ITALIC) + line,
      // bg Yellow RGB, Italic
      sgr(BG_RESET) + line,
      // Italic
      sgr(NORMAL) + line,
      // Back to normal
      sgr(FG_RGB_RED) + line,
      // fg Red RGB
      sgr(FG_RGB_GREEN, BG_RGB_YELLOW) + line,
      // fg Green RGB, bg Yellow RGB
      sgr(UNDERLINED, ITALIC) + line,
      // fg Green RGB, bg Yellow RGB, Underlined, Italic
      sgr(NO_UNDERLINED, NO_ITALIC) + line,
      // fg Green RGB, bg Yellow RGB
      sgr(FG_RESET, ITALIC) + line,
      // bg Yellow RGB, Italic
      sgr(BG_RESET) + line
      // Italic
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("serialize tabs correctly", async () => {
    const lines = [
      "a	b",
      "aa	c",
      "aaa	d"
    ];
    const expected = [
      "a\x1B[7Cb",
      "aa\x1B[6Cc",
      "aaa\x1B[5Cd"
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), expected.join("\r\n"));
  });
  (0, import_test.default)("serialize CJK correctly", async () => {
    const lines = [
      "\u4E2D\u6587\u4E2D\u6587",
      "12\u4E2D\u6587",
      "\u4E2D\u658712",
      // This line is going to be wrapped at last character
      // because it has line length of 11 (1+2*5).
      // We concat it back without the null cell currently.
      // But this may be incorrect.
      // see also #3097
      "1\u4E2D\u6587\u4E2D\u6587\u4E2D"
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), lines.join("\r\n"));
  });
  (0, import_test.default)("serialize CJK Mixed with tab correctly", async () => {
    const lines = [
      "\u4E2D\u6587	12"
      // CJK mixed with tab
    ];
    const expected = [
      "\u4E2D\u6587\x1B[4C12"
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.serialize.serialize();`), expected.join("\r\n"));
  });
  (0, import_test.default)("serialize with alt screen correctly", async () => {
    const SMCUP = "\x1B[?1049h";
    const CUP = "\x1B[H";
    const lines = [
      `1${SMCUP}${CUP}2`
    ];
    const expected = [
      `1${SMCUP}${CUP}2`
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.type`), "alternate");
    (0, import_assert.strictEqual)(JSON.stringify(await ctx.page.evaluate(`window.serialize.serialize();`)), JSON.stringify(expected.join("\r\n")));
  });
  (0, import_test.default)("serialize without alt screen correctly", async () => {
    const SMCUP = "\x1B[?1049h";
    const RMCUP = "\x1B[?1049l";
    const lines = [
      `1${SMCUP}2${RMCUP}`
    ];
    const expected = [
      `1`
    ];
    await ctx.proxy.write(lines.join("\r\n"));
    (0, import_assert.strictEqual)(await ctx.page.evaluate(`window.term.buffer.active.type`), "normal");
    (0, import_assert.strictEqual)(JSON.stringify(await ctx.page.evaluate(`window.serialize.serialize();`)), JSON.stringify(expected.join("\r\n")));
  });
  (0, import_test.default)("serialize with background", async () => {
    const CLEAR_RIGHT = (l) => `\x1B[${l}X`;
    const lines = [
      `1\x1B[44m${CLEAR_RIGHT(5)}`,
      `2${CLEAR_RIGHT(9)}`
    ];
    await testNormalScreenEqual(ctx.page, lines.join("\r\n"));
  });
  (0, import_test.default)("cause the BCE on scroll", async () => {
    const CLEAR_RIGHT = (l) => `\x1B[${l}X`;
    const padLines = newArray(
      (index) => digitsString(10, index),
      10
    );
    const lines = [
      ...padLines,
      `\x1B[44m${CLEAR_RIGHT(5)}1111111111111111`
    ];
    await testNormalScreenEqual(ctx.page, lines.join("\r\n"));
  });
  (0, import_test.default)("handle invalid wrap before scroll", async () => {
    const CLEAR_RIGHT = (l) => `\x1B[${l}X`;
    const MOVE_UP = (l) => `\x1B[${l}A`;
    const MOVE_DOWN = (l) => `\x1B[${l}B`;
    const MOVE_LEFT = (l) => `\x1B[${l}D`;
    const segments = [
      `123456789012345`,
      MOVE_UP(1),
      CLEAR_RIGHT(5),
      MOVE_DOWN(1),
      MOVE_LEFT(5),
      CLEAR_RIGHT(5),
      MOVE_UP(1),
      "1"
    ];
    await testNormalScreenEqual(ctx.page, segments.join(""));
  });
  (0, import_test.default)("handle invalid wrap after scroll", async () => {
    const CLEAR_RIGHT = (l) => `\x1B[${l}X`;
    const MOVE_UP = (l) => `\x1B[${l}A`;
    const MOVE_DOWN = (l) => `\x1B[${l}B`;
    const MOVE_LEFT = (l) => `\x1B[${l}D`;
    const padLines = newArray(
      (index) => digitsString(10, index),
      10
    );
    const lines = [
      padLines.join("\r\n"),
      "\r\n",
      `123456789012345`,
      MOVE_UP(1),
      CLEAR_RIGHT(5),
      MOVE_DOWN(1),
      MOVE_LEFT(5),
      CLEAR_RIGHT(5),
      MOVE_UP(1),
      "1"
    ];
    await testNormalScreenEqual(ctx.page, lines.join(""));
  });
  import_test.default.describe("handle modes", () => {
    (0, import_test.default)("applicationCursorKeysMode", async () => {
      await testSerializeEquals("test\x1B[?1h", "test\x1B[?1h");
      await testSerializeEquals("\x1B[?1l", "test");
    });
    (0, import_test.default)("applicationKeypadMode", async () => {
      await testSerializeEquals("test\x1B[?66h", "test\x1B[?66h");
      await testSerializeEquals("\x1B[?66l", "test");
    });
    (0, import_test.default)("bracketedPasteMode", async () => {
      await testSerializeEquals("test\x1B[?2004h", "test\x1B[?2004h");
      await testSerializeEquals("\x1B[?2004l", "test");
    });
    (0, import_test.default)("insertMode", async () => {
      await testSerializeEquals("test\x1B[4h", "test\x1B[4h");
      await testSerializeEquals("\x1B[4l", "test");
    });
    (0, import_test.default)("mouseTrackingMode", async () => {
      await testSerializeEquals("test\x1B[?9h", "test\x1B[?9h");
      await testSerializeEquals("\x1B[?9l", "test");
      await testSerializeEquals("\x1B[?1000h", "test\x1B[?1000h");
      await testSerializeEquals("\x1B[?1000l", "test");
      await testSerializeEquals("\x1B[?1002h", "test\x1B[?1002h");
      await testSerializeEquals("\x1B[?1002l", "test");
      await testSerializeEquals("\x1B[?1003h", "test\x1B[?1003h");
      await testSerializeEquals("\x1B[?1003l", "test");
    });
    (0, import_test.default)("originMode", async () => {
      await testSerializeEquals("test\x1B[?6h", "test\x1B[4D\x1B[?6h");
      await testSerializeEquals("\x1B[?6l", "test\x1B[4D");
    });
    (0, import_test.default)("reverseWraparoundMode", async () => {
      await testSerializeEquals("test\x1B[?45h", "test\x1B[?45h");
      await testSerializeEquals("\x1B[?45l", "test");
    });
    (0, import_test.default)("sendFocusMode", async () => {
      await testSerializeEquals("test\x1B[?1004h", "test\x1B[?1004h");
      await testSerializeEquals("\x1B[?1004l", "test");
    });
    (0, import_test.default)("wraparoundMode", async () => {
      await testSerializeEquals("test\x1B[?7l", "test\x1B[?7l");
      await testSerializeEquals("\x1B[?7h", "test");
    });
  });
});
function newArray(initial, count) {
  const array = new Array(count);
  for (let i = 0; i < array.length; i++) {
    if (typeof initial === "function") {
      array[i] = initial(i);
    } else {
      array[i] = initial;
    }
  }
  return array;
}
function digitsString(length, from = 0, sgr2 = "") {
  let s = sgr2;
  for (let i = 0; i < length; i++) {
    s += `${from++ % 10}`;
  }
  return s;
}
function sgr(...seq) {
  return `\x1B[${seq.join(";")}m`;
}
const NORMAL = "0";
const FG_P16_RED = "31";
const FG_P16_GREEN = "32";
const FG_P16_YELLOW = "33";
const FG_P256_RED = "38;5;196";
const FG_P256_GREEN = "38;5;46";
const FG_P256_YELLOW = "38;5;226";
const FG_RGB_RED = "38;2;255;0;0";
const FG_RGB_GREEN = "38;2;0;255;0";
const FG_RGB_YELLOW = "38;2;255;255;0";
const FG_RESET = "39";
const BG_P16_RED = "41";
const BG_P16_GREEN = "42";
const BG_P16_YELLOW = "43";
const BG_P256_RED = "48;5;196";
const BG_P256_GREEN = "48;5;46";
const BG_P256_YELLOW = "48;5;226";
const BG_RGB_RED = "48;2;255;0;0";
const BG_RGB_GREEN = "48;2;0;255;0";
const BG_RGB_YELLOW = "48;2;255;255;0";
const BG_RESET = "49";
const BOLD = "1";
const DIM = "2";
const ITALIC = "3";
const UNDERLINED = "4";
const BLINK = "5";
const INVERSE = "7";
const INVISIBLE = "8";
const STRIKETHROUGH = "9";
const OVERLINED = "53";
const NO_BOLD = "22";
const NO_DIM = "22";
const NO_ITALIC = "23";
const NO_UNDERLINED = "24";
const NO_BLINK = "25";
const NO_INVERSE = "27";
const NO_INVISIBLE = "28";
const NO_STRIKETHROUGH = "29";
const NO_OVERLINED = "55";
//# sourceMappingURL=SerializeAddon.test.js.map
