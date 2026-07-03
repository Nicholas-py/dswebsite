"use strict";
var import_TestUtils = require("browser/TestUtils.test");
var import_chai = require("chai");
var import_BufferLine = require("common/buffer/BufferLine");
var import_CellData = require("common/buffer/CellData");
var import_TestUtils2 = require("common/TestUtils.test");
/**
 * Copyright (c) 2016 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const INIT_COLS = 80;
const INIT_ROWS = 24;
const wcwidth = new import_TestUtils2.MockUnicodeService().wcwidth;
describe("Terminal", () => {
  let term;
  const termOptions = {
    cols: INIT_COLS,
    rows: INIT_ROWS
  };
  beforeEach(() => {
    term = new import_TestUtils.TestTerminal(termOptions);
    term.refresh = () => {
    };
    term.renderer = new import_TestUtils.MockRenderer();
    term.viewport = new import_TestUtils.MockViewport();
    term._compositionHelper = new import_TestUtils.MockCompositionHelper();
    term.element = {
      classList: {
        toggle: () => {
        },
        remove: () => {
        }
      }
    };
  });
  it("should not mutate the options parameter", () => {
    term.options.cols = 1e3;
    import_chai.assert.deepEqual(termOptions, {
      cols: INIT_COLS,
      rows: INIT_ROWS
    });
  });
  describe("events", () => {
    it("should fire the onData evnet", (done) => {
      term.onData(() => done());
      term.coreService.triggerDataEvent("fake");
    });
    it("should fire the onCursorMove event", () => {
      return new Promise(async (r) => {
        term.onCursorMove(() => r());
        await term.writeP("foo");
      });
    });
    it("should fire the onLineFeed event", () => {
      return new Promise(async (r) => {
        term.onLineFeed(() => r());
        await term.writeP("\n");
      });
    });
    it("should fire a scroll event when scrollback is created", () => {
      return new Promise(async (r) => {
        term.onScroll(() => r());
        await term.writeP("\n".repeat(INIT_ROWS));
      });
    });
    it("should fire a scroll event when scrollback is cleared", () => {
      return new Promise(async (r) => {
        await term.writeP("\n".repeat(INIT_ROWS));
        term.onScroll(() => r());
        term.clear();
      });
    });
    it("should fire a key event after a keypress DOM event", (done) => {
      term.onKey((e) => {
        import_chai.assert.equal(typeof e.key, "string");
        import_chai.assert.equal(e.domEvent instanceof Object, true);
        done();
      });
      const evKeyPress = {
        preventDefault: () => {
        },
        stopPropagation: () => {
        },
        type: "keypress",
        keyCode: 13
      };
      term.keyPress(evKeyPress);
    });
    it("should fire a key event after a keydown DOM event", (done) => {
      term.onKey((e) => {
        import_chai.assert.equal(typeof e.key, "string");
        import_chai.assert.equal(e.domEvent instanceof Object, true);
        done();
      });
      term.textarea = { value: "" };
      const evKeyDown = {
        preventDefault: () => {
        },
        stopPropagation: () => {
        },
        type: "keydown",
        keyCode: 13
      };
      term.keyDown(evKeyDown);
    });
    it("should fire the onResize event", (done) => {
      term.onResize((e) => {
        import_chai.assert.equal(typeof e.cols, "number");
        import_chai.assert.equal(typeof e.rows, "number");
        done();
      });
      term.resize(1, 1);
    });
    it("should fire the onScroll event", (done) => {
      term.onScroll((e) => {
        import_chai.assert.equal(typeof e, "number");
        done();
      });
      term.scroll(import_BufferLine.DEFAULT_ATTR_DATA.clone());
    });
    it("should fire the onTitleChange event", (done) => {
      term.onTitleChange((e) => {
        import_chai.assert.equal(e, "title");
        done();
      });
      term.write("\x1B]2;title\x07");
    });
    it("should fire the onBell event", (done) => {
      term.onBell((e) => {
        done();
      });
      term.write("\x07");
    });
  });
  describe("attachCustomKeyEventHandler", () => {
    const evKeyDown = {
      preventDefault: () => {
      },
      stopPropagation: () => {
      },
      type: "keydown",
      keyCode: 77
    };
    const evKeyPress = {
      preventDefault: () => {
      },
      stopPropagation: () => {
      },
      type: "keypress",
      keyCode: 77
    };
    beforeEach(() => {
      term.clearSelection = () => {
      };
    });
    it("should process the keydown/keypress event based on what the handler returns", () => {
      import_chai.assert.equal(term.keyDown(evKeyDown), true);
      import_chai.assert.equal(term.keyPress(evKeyPress), true);
      term.attachCustomKeyEventHandler((ev) => ev.keyCode === 77);
      import_chai.assert.equal(term.keyDown(evKeyDown), true);
      import_chai.assert.equal(term.keyPress(evKeyPress), true);
      term.attachCustomKeyEventHandler((ev) => ev.keyCode !== 77);
      import_chai.assert.equal(term.keyDown(evKeyDown), false);
      import_chai.assert.equal(term.keyPress(evKeyPress), false);
    });
    it("should alive after reset(ESC c Full Reset (RIS))", () => {
      term.attachCustomKeyEventHandler((ev) => ev.keyCode !== 77);
      import_chai.assert.equal(term.keyDown(evKeyDown), false);
      import_chai.assert.equal(term.keyPress(evKeyPress), false);
      term.reset();
      import_chai.assert.equal(term.keyDown(evKeyDown), false);
      import_chai.assert.equal(term.keyPress(evKeyPress), false);
    });
  });
  describe("clear", () => {
    it("should clear a buffer equal to rows", () => {
      const promptLine = term.buffer.lines.get(term.buffer.ybase + term.buffer.y);
      term.clear();
      import_chai.assert.equal(term.buffer.y, 0);
      import_chai.assert.equal(term.buffer.ybase, 0);
      import_chai.assert.equal(term.buffer.ydisp, 0);
      import_chai.assert.equal(term.buffer.lines.length, term.rows);
      import_chai.assert.deepEqual(term.buffer.lines.get(0), promptLine);
      for (let i = 1; i < term.rows; i++) {
        import_chai.assert.deepEqual(term.buffer.lines.get(i), term.buffer.getBlankLine(import_BufferLine.DEFAULT_ATTR_DATA));
      }
    });
    it("should clear a buffer larger than rows", async () => {
      for (let i = 0; i < term.rows * 2; i++) {
        await term.writeP("test\n");
      }
      const promptLine = term.buffer.lines.get(term.buffer.ybase + term.buffer.y);
      term.clear();
      import_chai.assert.equal(term.buffer.y, 0);
      import_chai.assert.equal(term.buffer.ybase, 0);
      import_chai.assert.equal(term.buffer.ydisp, 0);
      import_chai.assert.equal(term.buffer.lines.length, term.rows);
      import_chai.assert.deepEqual(term.buffer.lines.get(0), promptLine);
      for (let i = 1; i < term.rows; i++) {
        import_chai.assert.deepEqual(term.buffer.lines.get(i), term.buffer.getBlankLine(import_BufferLine.DEFAULT_ATTR_DATA));
      }
    });
    it("should not break the prompt when cleared twice", () => {
      const promptLine = term.buffer.lines.get(term.buffer.ybase + term.buffer.y);
      term.clear();
      term.clear();
      import_chai.assert.equal(term.buffer.y, 0);
      import_chai.assert.equal(term.buffer.ybase, 0);
      import_chai.assert.equal(term.buffer.ydisp, 0);
      import_chai.assert.equal(term.buffer.lines.length, term.rows);
      import_chai.assert.deepEqual(term.buffer.lines.get(0), promptLine);
      for (let i = 1; i < term.rows; i++) {
        import_chai.assert.deepEqual(term.buffer.lines.get(i), term.buffer.getBlankLine(import_BufferLine.DEFAULT_ATTR_DATA));
      }
    });
  });
  describe("paste", () => {
    it("should fire data event", (done) => {
      term.onData((e) => {
        import_chai.assert.equal(e, "foo");
        done();
      });
      term.paste("foo");
    });
    it("should sanitize \\n chars", (done) => {
      term.onData((e) => {
        import_chai.assert.equal(e, "\rfoo\rbar\r");
        done();
      });
      term.paste("\r\nfoo\nbar\r");
    });
    it("should respect bracketed paste mode", () => {
      return new Promise(async (r) => {
        term.onData((e) => {
          import_chai.assert.equal(e, "\x1B[200~foo\x1B[201~");
          r();
        });
        await term.writeP("\x1B[?2004h");
        term.paste("foo");
      });
    });
  });
  describe("scroll", () => {
    describe("scrollLines", () => {
      let startYDisp;
      beforeEach(async () => {
        for (let i = 0; i < INIT_ROWS * 2; i++) {
          await term.writeP("test\r\n");
        }
        startYDisp = INIT_ROWS + 1;
      });
      it("should scroll a single line", () => {
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
        term.scrollLines(-1);
        import_chai.assert.equal(term.buffer.ydisp, startYDisp - 1);
        term.scrollLines(1);
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
      });
      it("should scroll multiple lines", () => {
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
        term.scrollLines(-5);
        import_chai.assert.equal(term.buffer.ydisp, startYDisp - 5);
        term.scrollLines(5);
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
      });
      it("should not scroll beyond the bounds of the buffer", () => {
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
        term.scrollLines(1);
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
        for (let i = 0; i < startYDisp; i++) {
          term.scrollLines(-1);
        }
        import_chai.assert.equal(term.buffer.ydisp, 0);
        term.scrollLines(-1);
        import_chai.assert.equal(term.buffer.ydisp, 0);
      });
    });
    describe("scrollPages", () => {
      let startYDisp;
      beforeEach(async () => {
        for (let i = 0; i < term.rows * 3; i++) {
          await term.writeP("test\r\n");
        }
        startYDisp = term.rows * 2 + 1;
      });
      it("should scroll a single page", () => {
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
        term.scrollPages(-1);
        import_chai.assert.equal(term.buffer.ydisp, startYDisp - (term.rows - 1));
        term.scrollPages(1);
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
      });
      it("should scroll a multiple pages", () => {
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
        term.scrollPages(-2);
        import_chai.assert.equal(term.buffer.ydisp, startYDisp - (term.rows - 1) * 2);
        term.scrollPages(2);
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
      });
    });
    describe("scrollToTop", () => {
      beforeEach(async () => {
        for (let i = 0; i < term.rows * 3; i++) {
          await term.writeP("test\r\n");
        }
      });
      it("should scroll to the top", () => {
        import_chai.assert.notEqual(term.buffer.ydisp, 0);
        term.scrollToTop();
        import_chai.assert.equal(term.buffer.ydisp, 0);
      });
    });
    describe("scrollToBottom", () => {
      let startYDisp;
      beforeEach(async () => {
        for (let i = 0; i < term.rows * 3; i++) {
          await term.writeP("test\r\n");
        }
        startYDisp = term.rows * 2 + 1;
      });
      it("should scroll to the bottom", () => {
        term.scrollLines(-1);
        term.scrollToBottom();
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
        term.scrollPages(-1);
        term.scrollToBottom();
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
        term.scrollToTop();
        term.scrollToBottom();
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
      });
    });
    describe("scrollToLine", () => {
      let startYDisp;
      beforeEach(async () => {
        for (let i = 0; i < term.rows * 3; i++) {
          await term.writeP("test\r\n");
        }
        startYDisp = term.rows * 2 + 1;
      });
      it("should scroll to requested line", () => {
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
        term.scrollToLine(0);
        import_chai.assert.equal(term.buffer.ydisp, 0);
        term.scrollToLine(10);
        import_chai.assert.equal(term.buffer.ydisp, 10);
        term.scrollToLine(startYDisp);
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
        term.scrollToLine(20);
        import_chai.assert.equal(term.buffer.ydisp, 20);
      });
      it("should not scroll beyond boundary lines", () => {
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
        term.scrollToLine(-1);
        import_chai.assert.equal(term.buffer.ydisp, 0);
        term.scrollToLine(startYDisp + 1);
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
      });
    });
    describe("keyPress", () => {
      it("should scroll down, when a key is pressed and terminal is scrolled up", () => {
        const event = {
          type: "keydown",
          key: "a",
          keyCode: 65,
          preventDefault: () => {
          },
          stopPropagation: () => {
          }
        };
        term.buffer.ydisp = 0;
        term.buffer.ybase = 40;
        term.keyPress(event);
        import_chai.assert.equal(term.buffer.ydisp, term.buffer.ybase);
      });
      it("should not scroll down, when a custom keydown handler prevents the event", async () => {
        for (let i = 0; i < term.rows * 3; i++) {
          await term.writeP("test\r\n");
        }
        const startYDisp = term.rows * 2 + 1;
        term.attachCustomKeyEventHandler(() => {
          return false;
        });
        import_chai.assert.equal(term.buffer.ydisp, startYDisp);
        term.scrollLines(-1);
        import_chai.assert.equal(term.buffer.ydisp, startYDisp - 1);
        term.keyPress({ keyCode: 0 });
        import_chai.assert.equal(term.buffer.ydisp, startYDisp - 1);
      });
    });
    describe("scroll() function", () => {
      describe("when scrollback > 0", () => {
        it("should create a new line and scroll", () => {
          term.buffer.lines.get(0).setCell(0, import_CellData.CellData.fromCharData([0, "a", 0, "a".charCodeAt(0)]));
          term.buffer.lines.get(INIT_ROWS - 1).setCell(0, import_CellData.CellData.fromCharData([0, "b", 0, "b".charCodeAt(0)]));
          term.buffer.y = INIT_ROWS - 1;
          term.scroll(import_BufferLine.DEFAULT_ATTR_DATA.clone());
          import_chai.assert.equal(term.buffer.lines.length, INIT_ROWS + 1);
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(0, new import_CellData.CellData()).getChars(), "a");
          import_chai.assert.equal(term.buffer.lines.get(INIT_ROWS - 1).loadCell(0, new import_CellData.CellData()).getChars(), "b");
          import_chai.assert.equal(term.buffer.lines.get(INIT_ROWS).loadCell(0, new import_CellData.CellData()).getChars(), "");
        });
        it("should properly scroll inside a scroll region (scrollTop set)", () => {
          term.buffer.lines.get(0).setCell(0, import_CellData.CellData.fromCharData([0, "a", 0, "a".charCodeAt(0)]));
          term.buffer.lines.get(1).setCell(0, import_CellData.CellData.fromCharData([0, "b", 0, "b".charCodeAt(0)]));
          term.buffer.lines.get(2).setCell(0, import_CellData.CellData.fromCharData([0, "c", 0, "c".charCodeAt(0)]));
          term.buffer.y = INIT_ROWS - 1;
          term.buffer.scrollTop = 1;
          term.scroll(import_BufferLine.DEFAULT_ATTR_DATA.clone());
          import_chai.assert.equal(term.buffer.lines.length, INIT_ROWS);
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(0, new import_CellData.CellData()).getChars(), "a");
          import_chai.assert.equal(term.buffer.lines.get(1).loadCell(0, new import_CellData.CellData()).getChars(), "c");
        });
        it("should properly scroll inside a scroll region (scrollBottom set)", () => {
          term.buffer.lines.get(0).setCell(0, import_CellData.CellData.fromCharData([0, "a", 0, "a".charCodeAt(0)]));
          term.buffer.lines.get(1).setCell(0, import_CellData.CellData.fromCharData([0, "b", 0, "b".charCodeAt(0)]));
          term.buffer.lines.get(2).setCell(0, import_CellData.CellData.fromCharData([0, "c", 0, "c".charCodeAt(0)]));
          term.buffer.lines.get(3).setCell(0, import_CellData.CellData.fromCharData([0, "d", 0, "d".charCodeAt(0)]));
          term.buffer.lines.get(4).setCell(0, import_CellData.CellData.fromCharData([0, "e", 0, "e".charCodeAt(0)]));
          term.buffer.y = 3;
          term.buffer.scrollBottom = 3;
          term.scroll(import_BufferLine.DEFAULT_ATTR_DATA.clone());
          import_chai.assert.equal(term.buffer.lines.length, INIT_ROWS + 1);
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(0, new import_CellData.CellData()).getChars(), "a", "'a' should be pushed to the scrollback");
          import_chai.assert.equal(term.buffer.lines.get(1).loadCell(0, new import_CellData.CellData()).getChars(), "b");
          import_chai.assert.equal(term.buffer.lines.get(2).loadCell(0, new import_CellData.CellData()).getChars(), "c");
          import_chai.assert.equal(term.buffer.lines.get(3).loadCell(0, new import_CellData.CellData()).getChars(), "d");
          import_chai.assert.equal(term.buffer.lines.get(4).loadCell(0, new import_CellData.CellData()).getChars(), "", "a blank line should be added at scrollBottom's index");
          import_chai.assert.equal(term.buffer.lines.get(5).loadCell(0, new import_CellData.CellData()).getChars(), "e");
        });
        it("should properly scroll inside a scroll region (scrollTop and scrollBottom set)", () => {
          term.buffer.lines.get(0).setCell(0, import_CellData.CellData.fromCharData([0, "a", 0, "a".charCodeAt(0)]));
          term.buffer.lines.get(1).setCell(0, import_CellData.CellData.fromCharData([0, "b", 0, "b".charCodeAt(0)]));
          term.buffer.lines.get(2).setCell(0, import_CellData.CellData.fromCharData([0, "c", 0, "c".charCodeAt(0)]));
          term.buffer.lines.get(3).setCell(0, import_CellData.CellData.fromCharData([0, "d", 0, "d".charCodeAt(0)]));
          term.buffer.lines.get(4).setCell(0, import_CellData.CellData.fromCharData([0, "e", 0, "e".charCodeAt(0)]));
          term.buffer.y = INIT_ROWS - 1;
          term.buffer.scrollTop = 1;
          term.buffer.scrollBottom = 3;
          term.scroll(import_BufferLine.DEFAULT_ATTR_DATA.clone());
          import_chai.assert.equal(term.buffer.lines.length, INIT_ROWS);
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(0, new import_CellData.CellData()).getChars(), "a");
          import_chai.assert.equal(term.buffer.lines.get(1).loadCell(0, new import_CellData.CellData()).getChars(), "c", "'b' should be removed from the buffer");
          import_chai.assert.equal(term.buffer.lines.get(2).loadCell(0, new import_CellData.CellData()).getChars(), "d");
          import_chai.assert.equal(term.buffer.lines.get(3).loadCell(0, new import_CellData.CellData()).getChars(), "", "a blank line should be added at scrollBottom's index");
          import_chai.assert.equal(term.buffer.lines.get(4).loadCell(0, new import_CellData.CellData()).getChars(), "e");
        });
      });
      describe("when scrollback === 0", () => {
        beforeEach(() => {
          term.optionsService.options.scrollback = 0;
          import_chai.assert.equal(term.buffer.lines.maxLength, INIT_ROWS);
        });
        it("should create a new line and shift everything up", () => {
          term.buffer.lines.get(0).setCell(0, import_CellData.CellData.fromCharData([0, "a", 0, "a".charCodeAt(0)]));
          term.buffer.lines.get(1).setCell(0, import_CellData.CellData.fromCharData([0, "b", 0, "b".charCodeAt(0)]));
          term.buffer.lines.get(INIT_ROWS - 1).setCell(0, import_CellData.CellData.fromCharData([0, "c", 0, "c".charCodeAt(0)]));
          term.buffer.y = INIT_ROWS - 1;
          import_chai.assert.equal(term.buffer.lines.length, INIT_ROWS);
          term.scroll(import_BufferLine.DEFAULT_ATTR_DATA.clone());
          import_chai.assert.equal(term.buffer.lines.length, INIT_ROWS);
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(0, new import_CellData.CellData()).getChars(), "b");
          import_chai.assert.equal(term.buffer.lines.get(1).loadCell(0, new import_CellData.CellData()).getChars(), "");
          import_chai.assert.equal(term.buffer.lines.get(INIT_ROWS - 2).loadCell(0, new import_CellData.CellData()).getChars(), "c");
          import_chai.assert.equal(term.buffer.lines.get(INIT_ROWS - 1).loadCell(0, new import_CellData.CellData()).getChars(), "");
        });
        it("should properly scroll inside a scroll region (scrollTop set)", () => {
          term.buffer.lines.get(0).setCell(0, import_CellData.CellData.fromCharData([0, "a", 0, "a".charCodeAt(0)]));
          term.buffer.lines.get(1).setCell(0, import_CellData.CellData.fromCharData([0, "b", 0, "b".charCodeAt(0)]));
          term.buffer.lines.get(2).setCell(0, import_CellData.CellData.fromCharData([0, "c", 0, "c".charCodeAt(0)]));
          term.buffer.y = INIT_ROWS - 1;
          term.buffer.scrollTop = 1;
          term.scroll(import_BufferLine.DEFAULT_ATTR_DATA.clone());
          import_chai.assert.equal(term.buffer.lines.length, INIT_ROWS);
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(0, new import_CellData.CellData()).getChars(), "a");
          import_chai.assert.equal(term.buffer.lines.get(1).loadCell(0, new import_CellData.CellData()).getChars(), "c");
        });
        it("should properly scroll inside a scroll region (scrollBottom set)", () => {
          term.buffer.lines.get(0).setCell(0, import_CellData.CellData.fromCharData([0, "a", 0, "a".charCodeAt(0)]));
          term.buffer.lines.get(1).setCell(0, import_CellData.CellData.fromCharData([0, "b", 0, "b".charCodeAt(0)]));
          term.buffer.lines.get(2).setCell(0, import_CellData.CellData.fromCharData([0, "c", 0, "c".charCodeAt(0)]));
          term.buffer.lines.get(3).setCell(0, import_CellData.CellData.fromCharData([0, "d", 0, "d".charCodeAt(0)]));
          term.buffer.lines.get(4).setCell(0, import_CellData.CellData.fromCharData([0, "e", 0, "e".charCodeAt(0)]));
          term.buffer.y = 3;
          term.buffer.scrollBottom = 3;
          term.scroll(import_BufferLine.DEFAULT_ATTR_DATA.clone());
          import_chai.assert.equal(term.buffer.lines.length, INIT_ROWS);
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(0, new import_CellData.CellData()).getChars(), "b");
          import_chai.assert.equal(term.buffer.lines.get(1).loadCell(0, new import_CellData.CellData()).getChars(), "c");
          import_chai.assert.equal(term.buffer.lines.get(2).loadCell(0, new import_CellData.CellData()).getChars(), "d");
          import_chai.assert.equal(term.buffer.lines.get(3).loadCell(0, new import_CellData.CellData()).getChars(), "", "a blank line should be added at scrollBottom's index");
          import_chai.assert.equal(term.buffer.lines.get(4).loadCell(0, new import_CellData.CellData()).getChars(), "e");
        });
        it("should properly scroll inside a scroll region (scrollTop and scrollBottom set)", () => {
          term.buffer.lines.get(0).setCell(0, import_CellData.CellData.fromCharData([0, "a", 0, "a".charCodeAt(0)]));
          term.buffer.lines.get(1).setCell(0, import_CellData.CellData.fromCharData([0, "b", 0, "b".charCodeAt(0)]));
          term.buffer.lines.get(2).setCell(0, import_CellData.CellData.fromCharData([0, "c", 0, "c".charCodeAt(0)]));
          term.buffer.lines.get(3).setCell(0, import_CellData.CellData.fromCharData([0, "d", 0, "d".charCodeAt(0)]));
          term.buffer.lines.get(4).setCell(0, import_CellData.CellData.fromCharData([0, "e", 0, "e".charCodeAt(0)]));
          term.buffer.y = INIT_ROWS - 1;
          term.buffer.scrollTop = 1;
          term.buffer.scrollBottom = 3;
          term.scroll(import_BufferLine.DEFAULT_ATTR_DATA.clone());
          import_chai.assert.equal(term.buffer.lines.length, INIT_ROWS);
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(0, new import_CellData.CellData()).getChars(), "a");
          import_chai.assert.equal(term.buffer.lines.get(1).loadCell(0, new import_CellData.CellData()).getChars(), "c", "'b' should be removed from the buffer");
          import_chai.assert.equal(term.buffer.lines.get(2).loadCell(0, new import_CellData.CellData()).getChars(), "d");
          import_chai.assert.equal(term.buffer.lines.get(3).loadCell(0, new import_CellData.CellData()).getChars(), "", "a blank line should be added at scrollBottom's index");
          import_chai.assert.equal(term.buffer.lines.get(4).loadCell(0, new import_CellData.CellData()).getChars(), "e");
        });
      });
    });
  });
  describe("Third level shift", () => {
    let evKeyDown;
    let evKeyPress;
    beforeEach(() => {
      term.clearSelection = () => {
      };
      evKeyDown = {
        preventDefault: () => {
        },
        stopPropagation: () => {
        },
        type: "keydown",
        altKey: null,
        keyCode: null
      };
      evKeyPress = {
        preventDefault: () => {
        },
        stopPropagation: () => {
        },
        type: "keypress",
        altKey: null,
        charCode: null,
        keyCode: null
      };
    });
    describe("with macOptionIsMeta", () => {
      beforeEach(() => {
        term.options.macOptionIsMeta = true;
      });
      it("should interfere with the alt key on keyDown", () => {
        evKeyDown.altKey = true;
        evKeyDown.keyCode = 81;
        import_chai.assert.equal(term.keyDown(evKeyDown), false);
        evKeyDown.altKey = true;
        evKeyDown.keyCode = 192;
        import_chai.assert.equal(term.keyDown(evKeyDown), false);
      });
    });
    describe("On Mac OS", () => {
      let originalBrowser;
      beforeEach(() => {
        originalBrowser = term.browser;
        term.browser = { ...originalBrowser, isMac: true };
      });
      afterEach(() => term.browser = originalBrowser);
      it("should not interfere with the alt key on keyDown", () => {
        evKeyDown.altKey = true;
        evKeyDown.keyCode = 81;
        import_chai.assert.equal(term.keyDown(evKeyDown), true);
        evKeyDown.altKey = true;
        evKeyDown.keyCode = 192;
        term.keyDown(evKeyDown);
        import_chai.assert.equal(term.keyDown(evKeyDown), true);
      });
      it("should interfere with the alt + arrow keys", () => {
        evKeyDown.altKey = true;
        evKeyDown.keyCode = 37;
        import_chai.assert.equal(term.keyDown(evKeyDown), false);
        evKeyDown.altKey = true;
        evKeyDown.keyCode = 39;
        import_chai.assert.equal(term.keyDown(evKeyDown), false);
      });
      it("should emit key with alt + key on keyPress", (done) => {
        const keys = ["@", "@", "\\", "\\", "|", "|"];
        term.onKey((e) => {
          if (e.key) {
            const index = keys.indexOf(e.key);
            (0, import_chai.assert)(index !== -1, "Emitted wrong key: " + e.key);
            keys.splice(index, 1);
          }
          if (keys.length === 0) done();
        });
        evKeyPress.altKey = true;
        evKeyPress.charCode = null;
        evKeyPress.keyCode = 64;
        term.keyPress(evKeyPress);
        evKeyPress.charCode = 64;
        evKeyPress.keyCode = 0;
        term.keyPress(evKeyPress);
        evKeyPress.charCode = null;
        evKeyPress.keyCode = 92;
        term.keyPress(evKeyPress);
        evKeyPress.charCode = 92;
        evKeyPress.keyCode = 0;
        term.keyPress(evKeyPress);
        evKeyPress.charCode = null;
        evKeyPress.keyCode = 124;
        term.keyPress(evKeyPress);
        evKeyPress.charCode = 124;
        evKeyPress.keyCode = 0;
        term.keyPress(evKeyPress);
      });
    });
    describe("On MS Windows", () => {
      let originalBrowser;
      beforeEach(() => {
        originalBrowser = term.browser;
        term.browser = { ...originalBrowser, isWindows: true };
      });
      afterEach(() => term.browser = originalBrowser);
      it("should not interfere with the alt + ctrl key on keyDown", () => {
        evKeyPress.altKey = true;
        evKeyPress.ctrlKey = true;
        evKeyPress.keyCode = 81;
        import_chai.assert.equal(term.keyDown(evKeyPress), true);
        evKeyDown.altKey = true;
        evKeyDown.ctrlKey = true;
        evKeyDown.keyCode = 81;
        term.keyDown(evKeyDown);
        import_chai.assert.equal(term.keyDown(evKeyPress), true);
      });
      it("should interfere with the alt + ctrl + arrow keys", () => {
        evKeyDown.altKey = true;
        evKeyDown.ctrlKey = true;
        evKeyDown.keyCode = 37;
        import_chai.assert.equal(term.keyDown(evKeyDown), false);
        evKeyDown.keyCode = 39;
        term.keyDown(evKeyDown);
        import_chai.assert.equal(term.keyDown(evKeyDown), false);
      });
      it("should emit key with alt + ctrl + key on keyPress", (done) => {
        const keys = ["@", "@", "\\", "\\", "|", "|"];
        term.onKey((e) => {
          if (e.key) {
            const index = keys.indexOf(e.key);
            (0, import_chai.assert)(index !== -1, "Emitted wrong key: " + e.key);
            keys.splice(index, 1);
          }
          if (keys.length === 0) done();
        });
        evKeyPress.altKey = true;
        evKeyPress.ctrlKey = true;
        evKeyPress.charCode = null;
        evKeyPress.keyCode = 64;
        term.keyPress(evKeyPress);
        evKeyPress.charCode = 64;
        evKeyPress.keyCode = 0;
        term.keyPress(evKeyPress);
        evKeyPress.charCode = null;
        evKeyPress.keyCode = 92;
        term.keyPress(evKeyPress);
        evKeyPress.charCode = 92;
        evKeyPress.keyCode = 0;
        term.keyPress(evKeyPress);
        evKeyPress.charCode = null;
        evKeyPress.keyCode = 124;
        term.keyPress(evKeyPress);
        evKeyPress.charCode = 124;
        evKeyPress.keyCode = 0;
        term.keyPress(evKeyPress);
      });
    });
  });
  describe("unicode - surrogates", () => {
    for (let i = 56320; i <= 56560; i += 16) {
      const range = `0x${i.toString(16).toUpperCase()}-0x${(i + 15).toString(16).toUpperCase()}`;
      it(`${range}: 2 characters per cell`, async function() {
        const high = String.fromCharCode(55296);
        const cell = new import_CellData.CellData();
        for (let j = i; j <= i + 15; j++) {
          await term.writeP(high + String.fromCharCode(j));
          const tchar = term.buffer.lines.get(0).loadCell(0, cell);
          import_chai.assert.equal(tchar.getChars(), high + String.fromCharCode(j));
          import_chai.assert.equal(tchar.getChars().length, 2);
          import_chai.assert.equal(tchar.getWidth(), 1);
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(1, cell).getChars(), "");
          term.reset();
        }
      });
      it(`${range}: 2 characters at last cell`, async () => {
        const high = String.fromCharCode(55296);
        const cell = new import_CellData.CellData();
        term.buffer.x = term.cols - 1;
        for (let j = i; j <= i + 15; j++) {
          await term.writeP(high + String.fromCharCode(j));
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(term.buffer.x - 1, cell).getChars(), high + String.fromCharCode(j));
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(term.buffer.x - 1, cell).getChars().length, 2);
          import_chai.assert.equal(term.buffer.lines.get(1).loadCell(0, cell).getChars(), "");
          term.reset();
        }
      });
      it(`${range}: 2 characters per cell over line end with autowrap`, async function() {
        const high = String.fromCharCode(55296);
        const cell = new import_CellData.CellData();
        for (let j = i; j <= i + 15; j++) {
          term.buffer.x = term.cols - 1;
          await term.writeP("a" + high + String.fromCharCode(j));
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(term.cols - 1, cell).getChars(), "a");
          import_chai.assert.equal(term.buffer.lines.get(1).loadCell(0, cell).getChars(), high + String.fromCharCode(j));
          import_chai.assert.equal(term.buffer.lines.get(1).loadCell(0, cell).getChars().length, 2);
          import_chai.assert.equal(term.buffer.lines.get(1).loadCell(1, cell).getChars(), "");
          term.reset();
        }
      });
      it(`${range}: 2 characters per cell over line end without autowrap`, async function() {
        const high = String.fromCharCode(55296);
        const cell = new import_CellData.CellData();
        for (let j = i; j <= i + 15; j++) {
          term.buffer.x = term.cols - 1;
          await term.writeP("\x1B[?7l");
          const width = wcwidth((55296 - 55296) * 1024 + j - 56320 + 65536);
          if (width !== 1) {
            continue;
          }
          await term.writeP("a" + high + String.fromCharCode(j));
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(term.cols - 1, cell).getChars(), high + String.fromCharCode(j));
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(term.cols - 1, cell).getChars().length, 2);
          import_chai.assert.equal(term.buffer.lines.get(1).loadCell(1, cell).getChars(), "");
          term.reset();
        }
      });
      it(`${range}: splitted surrogates`, async function() {
        const high = String.fromCharCode(55296);
        const cell = new import_CellData.CellData();
        for (let j = i; j <= i + 15; j++) {
          await term.writeP(high + String.fromCharCode(j));
          const tchar = term.buffer.lines.get(0).loadCell(0, cell);
          import_chai.assert.equal(tchar.getChars(), high + String.fromCharCode(j));
          import_chai.assert.equal(tchar.getChars().length, 2);
          import_chai.assert.equal(tchar.getWidth(), 1);
          import_chai.assert.equal(term.buffer.lines.get(0).loadCell(1, cell).getChars(), "");
          term.reset();
        }
      });
    }
  });
  describe("unicode - combining characters", () => {
    const cell = new import_CellData.CellData();
    it("caf\xE9", async () => {
      await term.writeP("cafe\u0301");
      term.buffer.lines.get(0).loadCell(3, cell);
      import_chai.assert.equal(cell.getChars(), "e\u0301");
      import_chai.assert.equal(cell.getChars().length, 2);
      import_chai.assert.equal(cell.getWidth(), 1);
    });
    it("caf\xE9 - end of line", async () => {
      term.buffer.x = term.cols - 1 - 3;
      await term.writeP("cafe\u0301");
      term.buffer.lines.get(0).loadCell(term.cols - 1, cell);
      import_chai.assert.equal(cell.getChars(), "e\u0301");
      import_chai.assert.equal(cell.getChars().length, 2);
      import_chai.assert.equal(cell.getWidth(), 1);
      term.buffer.lines.get(0).loadCell(1, cell);
      import_chai.assert.equal(cell.getChars(), "");
      import_chai.assert.equal(cell.getChars().length, 0);
      import_chai.assert.equal(cell.getWidth(), 1);
    });
    it("multiple combined \xE9", async () => {
      await term.writeP(Array(100).join("e\u0301"));
      for (let i = 0; i < term.cols; ++i) {
        term.buffer.lines.get(0).loadCell(i, cell);
        import_chai.assert.equal(cell.getChars(), "e\u0301");
        import_chai.assert.equal(cell.getChars().length, 2);
        import_chai.assert.equal(cell.getWidth(), 1);
      }
      term.buffer.lines.get(1).loadCell(0, cell);
      import_chai.assert.equal(cell.getChars(), "e\u0301");
      import_chai.assert.equal(cell.getChars().length, 2);
      import_chai.assert.equal(cell.getWidth(), 1);
    });
    it("multiple surrogate with combined", async () => {
      await term.writeP(Array(100).join("\u{10000}\u0301"));
      for (let i = 0; i < term.cols; ++i) {
        term.buffer.lines.get(0).loadCell(i, cell);
        import_chai.assert.equal(cell.getChars(), "\u{10000}\u0301");
        import_chai.assert.equal(cell.getChars().length, 3);
        import_chai.assert.equal(cell.getWidth(), 1);
      }
      term.buffer.lines.get(1).loadCell(0, cell);
      import_chai.assert.equal(cell.getChars(), "\u{10000}\u0301");
      import_chai.assert.equal(cell.getChars().length, 3);
      import_chai.assert.equal(cell.getWidth(), 1);
    });
  });
  describe("unicode - fullwidth characters", () => {
    const cell = new import_CellData.CellData();
    it("cursor movement even", async () => {
      import_chai.assert.equal(term.buffer.x, 0);
      await term.writeP("\uFFE5");
      import_chai.assert.equal(term.buffer.x, 2);
    });
    it("cursor movement odd", async () => {
      term.buffer.x = 1;
      import_chai.assert.equal(term.buffer.x, 1);
      await term.writeP("\uFFE5");
      import_chai.assert.equal(term.buffer.x, 3);
    });
    it("line of \uFFE5 even", async () => {
      await term.writeP(Array(50).join("\uFFE5"));
      for (let i = 0; i < term.cols; ++i) {
        term.buffer.lines.get(0).loadCell(i, cell);
        if (i % 2) {
          import_chai.assert.equal(cell.getChars(), "");
          import_chai.assert.equal(cell.getChars().length, 0);
          import_chai.assert.equal(cell.getWidth(), 0);
        } else {
          import_chai.assert.equal(cell.getChars(), "\uFFE5");
          import_chai.assert.equal(cell.getChars().length, 1);
          import_chai.assert.equal(cell.getWidth(), 2);
        }
      }
      term.buffer.lines.get(1).loadCell(0, cell);
      import_chai.assert.equal(cell.getChars(), "\uFFE5");
      import_chai.assert.equal(cell.getChars().length, 1);
      import_chai.assert.equal(cell.getWidth(), 2);
    });
    it("line of \uFFE5 odd", async () => {
      term.buffer.x = 1;
      await term.writeP(Array(50).join("\uFFE5"));
      for (let i = 1; i < term.cols - 1; ++i) {
        term.buffer.lines.get(0).loadCell(i, cell);
        if (!(i % 2)) {
          import_chai.assert.equal(cell.getChars(), "");
          import_chai.assert.equal(cell.getChars().length, 0);
          import_chai.assert.equal(cell.getWidth(), 0);
        } else {
          import_chai.assert.equal(cell.getChars(), "\uFFE5");
          import_chai.assert.equal(cell.getChars().length, 1);
          import_chai.assert.equal(cell.getWidth(), 2);
        }
      }
      term.buffer.lines.get(0).loadCell(term.cols - 1, cell);
      import_chai.assert.equal(cell.getChars(), "");
      import_chai.assert.equal(cell.getChars().length, 0);
      import_chai.assert.equal(cell.getWidth(), 1);
      term.buffer.lines.get(1).loadCell(0, cell);
      import_chai.assert.equal(cell.getChars(), "\uFFE5");
      import_chai.assert.equal(cell.getChars().length, 1);
      import_chai.assert.equal(cell.getWidth(), 2);
    });
    it("line of \uFFE5 with combining odd", async () => {
      term.buffer.x = 1;
      await term.writeP(Array(50).join("\uFFE5\u0301"));
      for (let i = 1; i < term.cols - 1; ++i) {
        term.buffer.lines.get(0).loadCell(i, cell);
        if (!(i % 2)) {
          import_chai.assert.equal(cell.getChars(), "");
          import_chai.assert.equal(cell.getChars().length, 0);
          import_chai.assert.equal(cell.getWidth(), 0);
        } else {
          import_chai.assert.equal(cell.getChars(), "\uFFE5\u0301");
          import_chai.assert.equal(cell.getChars().length, 2);
          import_chai.assert.equal(cell.getWidth(), 2);
        }
      }
      term.buffer.lines.get(0).loadCell(term.cols - 1, cell);
      import_chai.assert.equal(cell.getChars(), "");
      import_chai.assert.equal(cell.getChars().length, 0);
      import_chai.assert.equal(cell.getWidth(), 1);
      term.buffer.lines.get(1).loadCell(0, cell);
      import_chai.assert.equal(cell.getChars(), "\uFFE5\u0301");
      import_chai.assert.equal(cell.getChars().length, 2);
      import_chai.assert.equal(cell.getWidth(), 2);
    });
    it("line of \uFFE5 with combining even", async () => {
      await term.writeP(Array(50).join("\uFFE5\u0301"));
      for (let i = 0; i < term.cols; ++i) {
        term.buffer.lines.get(0).loadCell(i, cell);
        if (i % 2) {
          import_chai.assert.equal(cell.getChars(), "");
          import_chai.assert.equal(cell.getChars().length, 0);
          import_chai.assert.equal(cell.getWidth(), 0);
        } else {
          import_chai.assert.equal(cell.getChars(), "\uFFE5\u0301");
          import_chai.assert.equal(cell.getChars().length, 2);
          import_chai.assert.equal(cell.getWidth(), 2);
        }
      }
      term.buffer.lines.get(1).loadCell(0, cell);
      import_chai.assert.equal(cell.getChars(), "\uFFE5\u0301");
      import_chai.assert.equal(cell.getChars().length, 2);
      import_chai.assert.equal(cell.getWidth(), 2);
    });
    it("line of surrogate fullwidth with combining odd", async () => {
      term.buffer.x = 1;
      await term.writeP(Array(50).join("\u{20E6D}\u0301"));
      for (let i = 1; i < term.cols - 1; ++i) {
        term.buffer.lines.get(0).loadCell(i, cell);
        if (!(i % 2)) {
          import_chai.assert.equal(cell.getChars(), "");
          import_chai.assert.equal(cell.getChars().length, 0);
          import_chai.assert.equal(cell.getWidth(), 0);
        } else {
          import_chai.assert.equal(cell.getChars(), "\u{20E6D}\u0301");
          import_chai.assert.equal(cell.getChars().length, 3);
          import_chai.assert.equal(cell.getWidth(), 2);
        }
      }
      term.buffer.lines.get(0).loadCell(term.cols - 1, cell);
      import_chai.assert.equal(cell.getChars(), "");
      import_chai.assert.equal(cell.getChars().length, 0);
      import_chai.assert.equal(cell.getWidth(), 1);
      term.buffer.lines.get(1).loadCell(0, cell);
      import_chai.assert.equal(cell.getChars(), "\u{20E6D}\u0301");
      import_chai.assert.equal(cell.getChars().length, 3);
      import_chai.assert.equal(cell.getWidth(), 2);
    });
    it("line of surrogate fullwidth with combining even", async () => {
      await term.writeP(Array(50).join("\u{20E6D}\u0301"));
      for (let i = 0; i < term.cols; ++i) {
        term.buffer.lines.get(0).loadCell(i, cell);
        if (i % 2) {
          import_chai.assert.equal(cell.getChars(), "");
          import_chai.assert.equal(cell.getChars().length, 0);
          import_chai.assert.equal(cell.getWidth(), 0);
        } else {
          import_chai.assert.equal(cell.getChars(), "\u{20E6D}\u0301");
          import_chai.assert.equal(cell.getChars().length, 3);
          import_chai.assert.equal(cell.getWidth(), 2);
        }
      }
      term.buffer.lines.get(1).loadCell(0, cell);
      import_chai.assert.equal(cell.getChars(), "\u{20E6D}\u0301");
      import_chai.assert.equal(cell.getChars().length, 3);
      import_chai.assert.equal(cell.getWidth(), 2);
    });
  });
  describe("insert mode", () => {
    const cell = new import_CellData.CellData();
    it("halfwidth - all", async () => {
      await term.writeP(Array(9).join("0123456789").slice(-80));
      term.buffer.x = 10;
      term.buffer.y = 0;
      term.write("\x1B[4h");
      await term.writeP("abcde");
      import_chai.assert.equal(term.buffer.lines.get(0).length, term.cols);
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(10, cell).getChars(), "a");
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(14, cell).getChars(), "e");
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(15, cell).getChars(), "0");
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(79, cell).getChars(), "4");
    });
    it("fullwidth - insert", async () => {
      await term.writeP(Array(9).join("0123456789").slice(-80));
      term.buffer.x = 10;
      term.buffer.y = 0;
      term.write("\x1B[4h");
      await term.writeP("\uFFE5\uFFE5\uFFE5");
      import_chai.assert.equal(term.buffer.lines.get(0).length, term.cols);
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(10, cell).getChars(), "\uFFE5");
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(11, cell).getChars(), "");
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(14, cell).getChars(), "\uFFE5");
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(15, cell).getChars(), "");
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(79, cell).getChars(), "3");
    });
    it("fullwidth - right border", async () => {
      await term.writeP(Array(41).join("\uFFE5"));
      term.buffer.x = 10;
      term.buffer.y = 0;
      term.write("\x1B[4h");
      await term.writeP("a");
      import_chai.assert.equal(term.buffer.lines.get(0).length, term.cols);
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(10, cell).getChars(), "a");
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(11, cell).getChars(), "\uFFE5");
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(79, cell).getChars(), "");
      await term.writeP("b");
      import_chai.assert.equal(term.buffer.lines.get(0).length, term.cols);
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(11, cell).getChars(), "b");
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(12, cell).getChars(), "\uFFE5");
      import_chai.assert.equal(term.buffer.lines.get(0).loadCell(79, cell).getChars(), "");
    });
  });
  describe("Windows Pty", () => {
    it("should mark lines as wrapped when the line ends in a non-null character after a LF", async () => {
      const data = [
        "aaaaaaaaaa\n\r",
        // cannot wrap as it's the first
        "aaaaaaaaa\n\r",
        // wrapped (windows mode only)
        "aaaaaaaaa"
        // not wrapped
      ];
      const normalTerminal = new import_TestUtils.TestTerminal({ rows: 5, cols: 10, windowsPty: {} });
      await normalTerminal.writeP(data.join(""));
      import_chai.assert.equal(normalTerminal.buffer.lines.get(0).isWrapped, false);
      import_chai.assert.equal(normalTerminal.buffer.lines.get(1).isWrapped, false);
      import_chai.assert.equal(normalTerminal.buffer.lines.get(2).isWrapped, false);
      const windowsModeTerminal = new import_TestUtils.TestTerminal({ rows: 5, cols: 10, windowsPty: { backend: "conpty", buildNumber: 19e3 } });
      await windowsModeTerminal.writeP(data.join(""));
      import_chai.assert.equal(windowsModeTerminal.buffer.lines.get(0).isWrapped, false);
      import_chai.assert.equal(windowsModeTerminal.buffer.lines.get(1).isWrapped, true, "This line should wrap in Windows mode as the previous line ends in a non-null character");
      import_chai.assert.equal(windowsModeTerminal.buffer.lines.get(2).isWrapped, false);
    });
    it("should mark lines as wrapped when the line ends in a non-null character after a CUP", async () => {
      const data = [
        "aaaaaaaaaa\x1B[2;1H",
        // cannot wrap as it's the first
        "aaaaaaaaa\x1B[3;1H",
        // wrapped (windows mode only)
        "aaaaaaaaa"
        // not wrapped
      ];
      const normalTerminal = new import_TestUtils.TestTerminal({ rows: 5, cols: 10, windowsPty: {} });
      await normalTerminal.writeP(data.join(""));
      import_chai.assert.equal(normalTerminal.buffer.lines.get(0).isWrapped, false);
      import_chai.assert.equal(normalTerminal.buffer.lines.get(1).isWrapped, false);
      import_chai.assert.equal(normalTerminal.buffer.lines.get(2).isWrapped, false);
      const windowsModeTerminal = new import_TestUtils.TestTerminal({ rows: 5, cols: 10, windowsPty: { backend: "conpty", buildNumber: 19e3 } });
      await windowsModeTerminal.writeP(data.join(""));
      import_chai.assert.equal(windowsModeTerminal.buffer.lines.get(0).isWrapped, false);
      import_chai.assert.equal(windowsModeTerminal.buffer.lines.get(1).isWrapped, true, "This line should wrap in Windows mode as the previous line ends in a non-null character");
      import_chai.assert.equal(windowsModeTerminal.buffer.lines.get(2).isWrapped, false);
    });
  });
  describe("Windows Mode", () => {
    it("should mark lines as wrapped when the line ends in a non-null character after a LF", async () => {
      const data = [
        "aaaaaaaaaa\n\r",
        // cannot wrap as it's the first
        "aaaaaaaaa\n\r",
        // wrapped (windows mode only)
        "aaaaaaaaa"
        // not wrapped
      ];
      const normalTerminal = new import_TestUtils.TestTerminal({ rows: 5, cols: 10, windowsMode: false });
      await normalTerminal.writeP(data.join(""));
      import_chai.assert.equal(normalTerminal.buffer.lines.get(0).isWrapped, false);
      import_chai.assert.equal(normalTerminal.buffer.lines.get(1).isWrapped, false);
      import_chai.assert.equal(normalTerminal.buffer.lines.get(2).isWrapped, false);
      const windowsModeTerminal = new import_TestUtils.TestTerminal({ rows: 5, cols: 10, windowsMode: true });
      await windowsModeTerminal.writeP(data.join(""));
      import_chai.assert.equal(windowsModeTerminal.buffer.lines.get(0).isWrapped, false);
      import_chai.assert.equal(windowsModeTerminal.buffer.lines.get(1).isWrapped, true, "This line should wrap in Windows mode as the previous line ends in a non-null character");
      import_chai.assert.equal(windowsModeTerminal.buffer.lines.get(2).isWrapped, false);
    });
    it("should mark lines as wrapped when the line ends in a non-null character after a CUP", async () => {
      const data = [
        "aaaaaaaaaa\x1B[2;1H",
        // cannot wrap as it's the first
        "aaaaaaaaa\x1B[3;1H",
        // wrapped (windows mode only)
        "aaaaaaaaa"
        // not wrapped
      ];
      const normalTerminal = new import_TestUtils.TestTerminal({ rows: 5, cols: 10, windowsMode: false });
      await normalTerminal.writeP(data.join(""));
      import_chai.assert.equal(normalTerminal.buffer.lines.get(0).isWrapped, false);
      import_chai.assert.equal(normalTerminal.buffer.lines.get(1).isWrapped, false);
      import_chai.assert.equal(normalTerminal.buffer.lines.get(2).isWrapped, false);
      const windowsModeTerminal = new import_TestUtils.TestTerminal({ rows: 5, cols: 10, windowsMode: true });
      await windowsModeTerminal.writeP(data.join(""));
      import_chai.assert.equal(windowsModeTerminal.buffer.lines.get(0).isWrapped, false);
      import_chai.assert.equal(windowsModeTerminal.buffer.lines.get(1).isWrapped, true, "This line should wrap in Windows mode as the previous line ends in a non-null character");
      import_chai.assert.equal(windowsModeTerminal.buffer.lines.get(2).isWrapped, false);
    });
  });
  it("convertEol setting", async () => {
    const termNotConverting = new import_TestUtils.TestTerminal({ cols: 15, rows: 10 });
    await termNotConverting.writeP("Hello\nWorld");
    import_chai.assert.equal(termNotConverting.buffer.lines.get(0).translateToString(false), "Hello          ");
    import_chai.assert.equal(termNotConverting.buffer.lines.get(1).translateToString(false), "     World     ");
    import_chai.assert.equal(termNotConverting.buffer.lines.get(0).translateToString(true), "Hello");
    import_chai.assert.equal(termNotConverting.buffer.lines.get(1).translateToString(true), "     World");
    const termConverting = new import_TestUtils.TestTerminal({ cols: 15, rows: 10, convertEol: true });
    await termConverting.writeP("Hello\nWorld");
    import_chai.assert.equal(termConverting.buffer.lines.get(0).translateToString(false), "Hello          ");
    import_chai.assert.equal(termConverting.buffer.lines.get(1).translateToString(false), "World          ");
    import_chai.assert.equal(termConverting.buffer.lines.get(0).translateToString(true), "Hello");
    import_chai.assert.equal(termConverting.buffer.lines.get(1).translateToString(true), "World");
  });
  describe("marker lifecycle", () => {
    let markers;
    let disposeStack;
    let term2;
    beforeEach(async () => {
      term2 = new import_TestUtils.TestTerminal({});
      markers = [];
      disposeStack = [];
      term2.optionsService.options.scrollback = 1;
      term2.resize(10, 5);
      markers.push(term2.buffers.active.addMarker(term2.buffers.active.y));
      await term2.writeP("\x1B[r0\r\n");
      markers.push(term2.buffers.active.addMarker(term2.buffers.active.y));
      await term2.writeP("1\r\n");
      markers.push(term2.buffers.active.addMarker(term2.buffers.active.y));
      await term2.writeP("2\r\n");
      markers.push(term2.buffers.active.addMarker(term2.buffers.active.y));
      await term2.writeP("3\r\n");
      markers.push(term2.buffers.active.addMarker(term2.buffers.active.y));
      await term2.writeP("4");
      for (let i = 0; i < markers.length; ++i) {
        const marker = markers[i];
        marker.onDispose(() => disposeStack.push(marker));
      }
    });
    it("initial", () => {
      import_chai.assert.deepEqual(markers.map((m) => m.line), [0, 1, 2, 3, 4]);
    });
    it("should dispose on normal trim off the top", async () => {
      await term2.writeP("\n");
      import_chai.assert.deepEqual(disposeStack, []);
      await term2.writeP("\n");
      import_chai.assert.deepEqual(disposeStack, [markers[0]]);
      await term2.writeP("\n");
      import_chai.assert.deepEqual(disposeStack, [markers[0], markers[1]]);
      import_chai.assert.deepEqual(disposeStack.map((el) => el.isDisposed), [true, true]);
      import_chai.assert.deepEqual(disposeStack.map((el) => el.line), [-1, -1]);
    });
    it("should dispose on DL", async () => {
      await term2.writeP("\x1B[3;1H");
      await term2.writeP("\x1B[2M");
      import_chai.assert.deepEqual(disposeStack, [markers[2], markers[3]]);
    });
    it("should dispose on IL", async () => {
      await term2.writeP("\x1B[3;1H");
      await term2.writeP("\x1B[2L");
      import_chai.assert.deepEqual(disposeStack, [markers[4], markers[3]]);
      import_chai.assert.deepEqual(markers.map((el) => el.line), [0, 1, 4, -1, -1]);
    });
    it("should dispose on resize", () => {
      term2.resize(10, 2);
      import_chai.assert.deepEqual(disposeStack, [markers[0], markers[1]]);
      import_chai.assert.deepEqual(markers.map((el) => el.line), [-1, -1, 0, 1, 2]);
    });
  });
  describe("options", () => {
    beforeEach(async () => {
      term = new import_TestUtils.TestTerminal({});
    });
    it("get options", () => {
      import_chai.assert.equal(term.options.cols, 80);
      import_chai.assert.equal(term.options.rows, 24);
    });
    it("set options", async () => {
      term.options.cols = 40;
      import_chai.assert.equal(term.options.cols, 40);
      term.options.rows = 20;
      import_chai.assert.equal(term.options.rows, 20);
    });
  });
});
//# sourceMappingURL=Terminal.test.js.map
