"use strict";
var import_assert = require("assert");
var import_Terminal = require("headless/public/Terminal");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let term;
describe("Headless API Tests", function() {
  beforeEach(() => {
    term = new import_Terminal.Terminal({ allowProposedApi: true });
  });
  it("Default options", async () => {
    (0, import_assert.strictEqual)(term.cols, 80);
    (0, import_assert.strictEqual)(term.rows, 24);
  });
  it("Proposed API check", async () => {
    term = new import_Terminal.Terminal({ allowProposedApi: false });
    (0, import_assert.throws)(() => term.markers, (error) => error.message === "You must set the allowProposedApi option to true to use proposed API");
  });
  it("write", async () => {
    await writeSync("foo");
    await writeSync("bar");
    await writeSync("\u6587");
    lineEquals(0, "foobar\u6587");
  });
  it("write with callback", async () => {
    let result;
    await new Promise((r) => {
      term.write("foo", () => {
        result = "a";
      });
      term.write("bar", () => {
        result += "b";
      });
      term.write("\u6587", () => {
        result += "c";
        r();
      });
    });
    lineEquals(0, "foobar\u6587");
    (0, import_assert.strictEqual)(result, "abc");
  });
  it("write - bytes (UTF8)", async () => {
    await writeSync(new Uint8Array([102, 111, 111]));
    await writeSync(new Uint8Array([98, 97, 114]));
    await writeSync(new Uint8Array([230, 150, 135]));
    lineEquals(0, "foobar\u6587");
  });
  it("write - bytes (UTF8) with callback", async () => {
    let result;
    await new Promise((r) => {
      term.write(new Uint8Array([102, 111, 111]), () => {
        result = "A";
      });
      term.write(new Uint8Array([98, 97, 114]), () => {
        result += "B";
      });
      term.write(new Uint8Array([230, 150, 135]), () => {
        result += "C";
        r();
      });
    });
    lineEquals(0, "foobar\u6587");
    (0, import_assert.strictEqual)(result, "ABC");
  });
  it("writeln", async () => {
    await writelnSync("foo");
    await writelnSync("bar");
    await writelnSync("\u6587");
    lineEquals(0, "foo");
    lineEquals(1, "bar");
    lineEquals(2, "\u6587");
  });
  it("writeln with callback", async () => {
    let result;
    await new Promise((r) => {
      term.writeln("foo", () => {
        result = "1";
      });
      term.writeln("bar", () => {
        result += "2";
      });
      term.writeln("\u6587", () => {
        result += "3";
        r();
      });
    });
    lineEquals(0, "foo");
    lineEquals(1, "bar");
    lineEquals(2, "\u6587");
    (0, import_assert.strictEqual)(result, "123");
  });
  it("writeln - bytes (UTF8)", async () => {
    await writelnSync(new Uint8Array([102, 111, 111]));
    await writelnSync(new Uint8Array([98, 97, 114]));
    await writelnSync(new Uint8Array([230, 150, 135]));
    lineEquals(0, "foo");
    lineEquals(1, "bar");
    lineEquals(2, "\u6587");
  });
  it("clear", async () => {
    term = new import_Terminal.Terminal({ rows: 5, allowProposedApi: true });
    for (let i = 0; i < 10; i++) {
      await writeSync("\n\rtest" + i);
    }
    term.clear();
    (0, import_assert.strictEqual)(term.buffer.active.length, 5);
    lineEquals(0, "test9");
    for (let i = 1; i < 5; i++) {
      lineEquals(i, "");
    }
  });
  describe("options", () => {
    const termOptions = {
      cols: 80,
      rows: 24
    };
    beforeEach(async () => {
      term = new import_Terminal.Terminal(termOptions);
    });
    it("get options", () => {
      const options = term.options;
      (0, import_assert.strictEqual)(options.lineHeight, 1);
      (0, import_assert.strictEqual)(options.cursorWidth, 1);
    });
    it("set options", async () => {
      term.options.scrollback = 1;
      (0, import_assert.strictEqual)(term.options.scrollback, 1);
      term.options = {
        fontSize: 12,
        fontFamily: "Arial"
      };
      (0, import_assert.strictEqual)(term.options.fontSize, 12);
      (0, import_assert.strictEqual)(term.options.fontFamily, "Arial");
    });
  });
  describe("loadAddon", () => {
    it("constructor", async () => {
      term = new import_Terminal.Terminal({ cols: 5 });
      let cols = 0;
      term.loadAddon({
        activate: (t) => cols = t.cols,
        dispose: () => {
        }
      });
      (0, import_assert.strictEqual)(cols, 5);
    });
    it("dispose (addon)", async () => {
      let disposeCalled = false;
      const addon = {
        activate: () => {
        },
        dispose: () => disposeCalled = true
      };
      term.loadAddon(addon);
      (0, import_assert.strictEqual)(disposeCalled, false);
      addon.dispose();
      (0, import_assert.strictEqual)(disposeCalled, true);
    });
    it("dispose (terminal)", async () => {
      let disposeCalled = false;
      term.loadAddon({
        activate: () => {
        },
        dispose: () => disposeCalled = true
      });
      (0, import_assert.strictEqual)(disposeCalled, false);
      term.dispose();
      (0, import_assert.strictEqual)(disposeCalled, true);
    });
  });
  describe("Events", () => {
    it("onCursorMove", async () => {
      let callCount = 0;
      term.onCursorMove((e) => callCount++);
      await writeSync("foo");
      (0, import_assert.strictEqual)(callCount, 1);
      await writeSync("bar");
      (0, import_assert.strictEqual)(callCount, 2);
    });
    it("onData", async () => {
      const calls = [];
      term.onData((e) => calls.push(e));
      await writeSync("\x1B[5n");
      (0, import_assert.deepStrictEqual)(calls, ["\x1B[0n"]);
    });
    it("onLineFeed", async () => {
      let callCount = 0;
      term.onLineFeed(() => callCount++);
      await writelnSync("foo");
      (0, import_assert.strictEqual)(callCount, 1);
      await writelnSync("bar");
      (0, import_assert.strictEqual)(callCount, 2);
    });
    it("onScroll", async () => {
      term = new import_Terminal.Terminal({ rows: 5 });
      const calls = [];
      term.onScroll((e) => calls.push(e));
      for (let i = 0; i < 4; i++) {
        await writelnSync("foo");
      }
      (0, import_assert.deepStrictEqual)(calls, []);
      await writelnSync("bar");
      (0, import_assert.deepStrictEqual)(calls, [1]);
      await writelnSync("baz");
      (0, import_assert.deepStrictEqual)(calls, [1, 2]);
    });
    it("onResize", async () => {
      const calls = [];
      term.onResize((e) => calls.push([e.cols, e.rows]));
      (0, import_assert.deepStrictEqual)(calls, []);
      term.resize(10, 5);
      (0, import_assert.deepStrictEqual)(calls, [[10, 5]]);
      term.resize(20, 15);
      (0, import_assert.deepStrictEqual)(calls, [[10, 5], [20, 15]]);
    });
    it("onTitleChange", async () => {
      const calls = [];
      term.onTitleChange((e) => calls.push(e));
      (0, import_assert.deepStrictEqual)(calls, []);
      await writeSync("\x1B]2;foo\x9C");
      (0, import_assert.deepStrictEqual)(calls, ["foo"]);
    });
    it("onBell", async () => {
      const calls = [];
      term.onBell(() => calls.push(true));
      (0, import_assert.deepStrictEqual)(calls, []);
      await writeSync("\x07");
      (0, import_assert.deepStrictEqual)(calls, [true]);
    });
  });
  describe("buffer", () => {
    it("cursorX, cursorY", async () => {
      term = new import_Terminal.Terminal({ rows: 5, cols: 5, allowProposedApi: true });
      (0, import_assert.strictEqual)(term.buffer.active.cursorX, 0);
      (0, import_assert.strictEqual)(term.buffer.active.cursorY, 0);
      await writeSync("foo");
      (0, import_assert.strictEqual)(term.buffer.active.cursorX, 3);
      (0, import_assert.strictEqual)(term.buffer.active.cursorY, 0);
      await writeSync("\n");
      (0, import_assert.strictEqual)(term.buffer.active.cursorX, 3);
      (0, import_assert.strictEqual)(term.buffer.active.cursorY, 1);
      await writeSync("\r");
      (0, import_assert.strictEqual)(term.buffer.active.cursorX, 0);
      (0, import_assert.strictEqual)(term.buffer.active.cursorY, 1);
      await writeSync("abcde");
      (0, import_assert.strictEqual)(term.buffer.active.cursorX, 5);
      (0, import_assert.strictEqual)(term.buffer.active.cursorY, 1);
      await writeSync("\n\r\n\n\n\n\n");
      (0, import_assert.strictEqual)(term.buffer.active.cursorX, 0);
      (0, import_assert.strictEqual)(term.buffer.active.cursorY, 4);
    });
    it("viewportY", async () => {
      term = new import_Terminal.Terminal({ rows: 5, allowProposedApi: true });
      (0, import_assert.strictEqual)(term.buffer.active.viewportY, 0);
      await writeSync("\n\n\n\n");
      (0, import_assert.strictEqual)(term.buffer.active.viewportY, 0);
      await writeSync("\n");
      (0, import_assert.strictEqual)(term.buffer.active.viewportY, 1);
      await writeSync("\n\n\n\n");
      (0, import_assert.strictEqual)(term.buffer.active.viewportY, 5);
      term.scrollLines(-1);
      (0, import_assert.strictEqual)(term.buffer.active.viewportY, 4);
      term.scrollToTop();
      (0, import_assert.strictEqual)(term.buffer.active.viewportY, 0);
    });
    it("baseY", async () => {
      term = new import_Terminal.Terminal({ rows: 5, allowProposedApi: true });
      (0, import_assert.strictEqual)(term.buffer.active.baseY, 0);
      await writeSync("\n\n\n\n");
      (0, import_assert.strictEqual)(term.buffer.active.baseY, 0);
      await writeSync("\n");
      (0, import_assert.strictEqual)(term.buffer.active.baseY, 1);
      await writeSync("\n\n\n\n");
      (0, import_assert.strictEqual)(term.buffer.active.baseY, 5);
      term.scrollLines(-1);
      (0, import_assert.strictEqual)(term.buffer.active.baseY, 5);
      term.scrollToTop();
      (0, import_assert.strictEqual)(term.buffer.active.baseY, 5);
    });
    it("length", async () => {
      term = new import_Terminal.Terminal({ rows: 5, allowProposedApi: true });
      (0, import_assert.strictEqual)(term.buffer.active.length, 5);
      await writeSync("\n\n\n\n");
      (0, import_assert.strictEqual)(term.buffer.active.length, 5);
      await writeSync("\n");
      (0, import_assert.strictEqual)(term.buffer.active.length, 6);
      await writeSync("\n\n\n\n");
      (0, import_assert.strictEqual)(term.buffer.active.length, 10);
    });
    describe("getLine", () => {
      it("invalid index", async () => {
        term = new import_Terminal.Terminal({ rows: 5, allowProposedApi: true });
        (0, import_assert.strictEqual)(term.buffer.active.getLine(-1), void 0);
        (0, import_assert.strictEqual)(term.buffer.active.getLine(5), void 0);
      });
      it("isWrapped", async () => {
        term = new import_Terminal.Terminal({ cols: 5, allowProposedApi: true });
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).isWrapped, false);
        (0, import_assert.strictEqual)(term.buffer.active.getLine(1).isWrapped, false);
        await writeSync("abcde");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).isWrapped, false);
        (0, import_assert.strictEqual)(term.buffer.active.getLine(1).isWrapped, false);
        await writeSync("f");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).isWrapped, false);
        (0, import_assert.strictEqual)(term.buffer.active.getLine(1).isWrapped, true);
      });
      it("translateToString", async () => {
        term = new import_Terminal.Terminal({ cols: 5, allowProposedApi: true });
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).translateToString(), "     ");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).translateToString(true), "");
        await writeSync("foo");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).translateToString(), "foo  ");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).translateToString(true), "foo");
        await writeSync("bar");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).translateToString(), "fooba");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).translateToString(true), "fooba");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(1).translateToString(true), "r");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).translateToString(false, 1), "ooba");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).translateToString(false, 1, 3), "oo");
      });
      it("getCell", async () => {
        term = new import_Terminal.Terminal({ cols: 5, allowProposedApi: true });
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).getCell(-1), void 0);
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).getCell(5), void 0);
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).getCell(0).getChars(), "");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).getCell(0).getWidth(), 1);
        await writeSync("a\u6587");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).getCell(0).getChars(), "a");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).getCell(0).getWidth(), 1);
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).getCell(1).getChars(), "\u6587");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).getCell(1).getWidth(), 2);
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).getCell(2).getChars(), "");
        (0, import_assert.strictEqual)(term.buffer.active.getLine(0).getCell(2).getWidth(), 0);
      });
    });
    it("active, normal, alternate", async () => {
      term = new import_Terminal.Terminal({ cols: 5, allowProposedApi: true });
      (0, import_assert.strictEqual)(term.buffer.active.type, "normal");
      (0, import_assert.strictEqual)(term.buffer.normal.type, "normal");
      (0, import_assert.strictEqual)(term.buffer.alternate.type, "alternate");
      await writeSync("norm ");
      (0, import_assert.strictEqual)(term.buffer.active.getLine(0).translateToString(), "norm ");
      (0, import_assert.strictEqual)(term.buffer.normal.getLine(0).translateToString(), "norm ");
      (0, import_assert.strictEqual)(term.buffer.alternate.getLine(0), void 0);
      await writeSync("\x1B[?47h\r");
      (0, import_assert.strictEqual)(term.buffer.active.type, "alternate");
      (0, import_assert.strictEqual)(term.buffer.normal.type, "normal");
      (0, import_assert.strictEqual)(term.buffer.alternate.type, "alternate");
      (0, import_assert.strictEqual)(term.buffer.active.getLine(0).translateToString(), "     ");
      await writeSync("alt  ");
      (0, import_assert.strictEqual)(term.buffer.active.getLine(0).translateToString(), "alt  ");
      (0, import_assert.strictEqual)(term.buffer.normal.getLine(0).translateToString(), "norm ");
      (0, import_assert.strictEqual)(term.buffer.alternate.getLine(0).translateToString(), "alt  ");
      await writeSync("\x1B[?47l\r");
      (0, import_assert.strictEqual)(term.buffer.active.type, "normal");
      (0, import_assert.strictEqual)(term.buffer.normal.type, "normal");
      (0, import_assert.strictEqual)(term.buffer.alternate.type, "alternate");
      (0, import_assert.strictEqual)(term.buffer.active.getLine(0).translateToString(), "norm ");
      (0, import_assert.strictEqual)(term.buffer.normal.getLine(0).translateToString(), "norm ");
      (0, import_assert.strictEqual)(term.buffer.alternate.getLine(0), void 0);
    });
  });
  describe("modes", () => {
    it("defaults", () => {
      (0, import_assert.deepStrictEqual)(term.modes, {
        applicationCursorKeysMode: false,
        applicationKeypadMode: false,
        bracketedPasteMode: false,
        insertMode: false,
        mouseTrackingMode: "none",
        originMode: false,
        reverseWraparoundMode: false,
        sendFocusMode: false,
        wraparoundMode: true
      });
    });
    it("applicationCursorKeysMode", async () => {
      await writeSync("\x1B[?1h");
      (0, import_assert.strictEqual)(term.modes.applicationCursorKeysMode, true);
      await writeSync("\x1B[?1l");
      (0, import_assert.strictEqual)(term.modes.applicationCursorKeysMode, false);
    });
    it("applicationKeypadMode", async () => {
      await writeSync("\x1B[?66h");
      (0, import_assert.strictEqual)(term.modes.applicationKeypadMode, true);
      await writeSync("\x1B[?66l");
      (0, import_assert.strictEqual)(term.modes.applicationKeypadMode, false);
    });
    it("bracketedPasteMode", async () => {
      await writeSync("\x1B[?2004h");
      (0, import_assert.strictEqual)(term.modes.bracketedPasteMode, true);
      await writeSync("\x1B[?2004l");
      (0, import_assert.strictEqual)(term.modes.bracketedPasteMode, false);
    });
    it("insertMode", async () => {
      await writeSync("\x1B[4h");
      (0, import_assert.strictEqual)(term.modes.insertMode, true);
      await writeSync("\x1B[4l");
      (0, import_assert.strictEqual)(term.modes.insertMode, false);
    });
    it("mouseTrackingMode", async () => {
      await writeSync("\x1B[?9h");
      (0, import_assert.strictEqual)(term.modes.mouseTrackingMode, "x10");
      await writeSync("\x1B[?9l");
      (0, import_assert.strictEqual)(term.modes.mouseTrackingMode, "none");
      await writeSync("\x1B[?1000h");
      (0, import_assert.strictEqual)(term.modes.mouseTrackingMode, "vt200");
      await writeSync("\x1B[?1000l");
      (0, import_assert.strictEqual)(term.modes.mouseTrackingMode, "none");
      await writeSync("\x1B[?1002h");
      (0, import_assert.strictEqual)(term.modes.mouseTrackingMode, "drag");
      await writeSync("\x1B[?1002l");
      (0, import_assert.strictEqual)(term.modes.mouseTrackingMode, "none");
      await writeSync("\x1B[?1003h");
      (0, import_assert.strictEqual)(term.modes.mouseTrackingMode, "any");
      await writeSync("\x1B[?1003l");
      (0, import_assert.strictEqual)(term.modes.mouseTrackingMode, "none");
    });
    it("originMode", async () => {
      await writeSync("\x1B[?6h");
      (0, import_assert.strictEqual)(term.modes.originMode, true);
      await writeSync("\x1B[?6l");
      (0, import_assert.strictEqual)(term.modes.originMode, false);
    });
    it("reverseWraparoundMode", async () => {
      await writeSync("\x1B[?45h");
      (0, import_assert.strictEqual)(term.modes.reverseWraparoundMode, true);
      await writeSync("\x1B[?45l");
      (0, import_assert.strictEqual)(term.modes.reverseWraparoundMode, false);
    });
    it("sendFocusMode", async () => {
      await writeSync("\x1B[?1004h");
      (0, import_assert.strictEqual)(term.modes.sendFocusMode, true);
      await writeSync("\x1B[?1004l");
      (0, import_assert.strictEqual)(term.modes.sendFocusMode, false);
    });
    it("wraparoundMode", async () => {
      await writeSync("\x1B[?7h");
      (0, import_assert.strictEqual)(term.modes.wraparoundMode, true);
      await writeSync("\x1B[?7l");
      (0, import_assert.strictEqual)(term.modes.wraparoundMode, false);
    });
  });
  it("dispose", async () => {
    term.dispose();
    (0, import_assert.strictEqual)(term._core._store.isDisposed, true);
  });
});
function writeSync(text) {
  return new Promise((r) => term.write(text, r));
}
function writelnSync(text) {
  return new Promise((r) => term.writeln(text, r));
}
function lineEquals(index, text) {
  (0, import_assert.strictEqual)(term.buffer.active.getLine(index).translateToString(true), text);
}
//# sourceMappingURL=Terminal.test.js.map
