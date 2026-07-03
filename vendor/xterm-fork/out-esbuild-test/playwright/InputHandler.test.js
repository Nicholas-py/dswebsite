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
import_test.test.describe("InputHandler Integration Tests", () => {
  import_test.test.describe("CSI", () => {
    import_test.test.beforeEach(async () => await ctx.proxy.reset());
    (0, import_test.test)("CSI Ps @ - ICH: Insert Ps (Blank) Character(s) (default = 1)", async () => {
      await ctx.page.evaluate(`
        // Default
        window.term.write('foo\\x1b[3D\\x1b[@\\n\\r')
        // Explicit
        window.term.write('bar\\x1b[3D\\x1b[4@')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(2), [" foo", "    bar"]);
    });
    import_test.test.skip("CSI Ps SP @ - SL: Shift left Ps columns(s) (default = 1), ECMA-48", async () => {
    });
    (0, import_test.test)("CSI Ps A - CUU: Cursor Up Ps Times (default = 1)", async () => {
      await ctx.page.evaluate(`
        // Default
        window.term.write('\\n\\n\\n\\n\x1B[Aa')
        // Explicit
        window.term.write('\x1B[2Ab')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(4), ["", " b", "", "a"]);
    });
    (0, import_test.test)("CSI Ps B - CUD: Cursor Down Ps Times (default = 1)", async () => {
      await ctx.page.evaluate(`
        // Default
        window.term.write('\x1B[Ba')
        // Explicit
        window.term.write('\x1B[2Bb')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(4), ["", "a", "", " b"]);
    });
    (0, import_test.test)("CSI Ps C - CUF: Cursor Forward Ps Times (default = 1)", async () => {
      await ctx.page.evaluate(`
        // Default
        window.term.write('\x1B[Ca')
        // Explicit
        window.term.write('\x1B[2Cb')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(1), [" a  b"]);
    });
    (0, import_test.test)("CSI Ps D - CUB: Cursor Backward Ps Times (default = 1)", async () => {
      await ctx.page.evaluate(`
        // Default
        window.term.write('foo\x1B[Da')
        // Explicit
        window.term.write('\x1B[2Db')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(1), ["fba"]);
    });
    (0, import_test.test)("CSI Ps E - CNL: Cursor Next Line Ps Times (default = 1)", async () => {
      await ctx.page.evaluate(`
        // Default
        window.term.write('\x1B[Ea')
        // Explicit
        window.term.write('\x1B[2Eb')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(4), ["", "a", "", "b"]);
    });
    (0, import_test.test)("CSI Ps F - CPL: Cursor Preceding Line Ps Times (default = 1)", async () => {
      await ctx.page.evaluate(`
        // Default
        window.term.write('\\n\\n\\n\\n\x1B[Fa')
        // Explicit
        window.term.write('\x1B[2Fb')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(5), ["", "b", "", "a", ""]);
    });
    (0, import_test.test)("CSI Ps G - CHA: Cursor Character Absolute [column] (default = [row,1])", async () => {
      await ctx.page.evaluate(`
        // Default
        window.term.write('foo\x1B[Ga')
        // Explicit
        window.term.write('\x1B[10Gb')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(1), ["aoo      b"]);
    });
    (0, import_test.test)("CSI Ps ; Ps H - CUP: Cursor Position [row;column] (default = [1,1])", async () => {
      await ctx.page.evaluate(`
        // Default
        window.term.write('foo\x1B[Ha')
        // Explicit
        window.term.write('\x1B[3;3Hb')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(3), ["aoo", "", "  b"]);
    });
    (0, import_test.test)("CSI Ps I - CHT: Cursor Forward Tabulation Ps tab stops (default = 1)", async () => {
      await ctx.page.evaluate(`
        // Default
        window.term.write('\x1B[Ia')
        // Explicit
        window.term.write('\\n\\r\x1B[2Ib')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(2), ["        a", "                b"]);
    });
    (0, import_test.test)("CSI Ps J - ED: Erase in Display, VT100", async () => {
      const fixture = "abc\\n\\rdef\\n\\rghi\x1B[2;2H";
      await ctx.page.evaluate(`
        // Default: Erase Below
        window.term.resize(5, 5);
        window.term.write('${fixture}\x1B[J')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(3), ["abc", "d", ""]);
      await ctx.page.evaluate(`
        // 0: Erase Below
        window.term.reset()
        window.term.write('${fixture}\x1B[0J')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(3), ["abc", "d", ""]);
      await ctx.page.evaluate(`
        // 1: Erase Above
        window.term.reset()
        window.term.write('${fixture}\x1B[1J')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(3), ["", "  f", "ghi"]);
      await ctx.page.evaluate(`
        // 2: Erase Saved Lines (scrollback)
        window.term.reset()
        window.term.write('1\\n2\\n3\\n4\\n5${fixture}\x1B[3J')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => ctx.page.evaluate(`window.term.buffer.active.length`), 5);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(5), ["   4", "    5", "abc", "def", "ghi"]);
    });
    (0, import_test.test)("CSI ? Ps J - DECSED: Erase in Display, VT220", async () => {
      const fixture = "abc\\n\\rdef\\n\\rghi\x1B[2;2H";
      await ctx.page.evaluate(`
        // Default: Erase Below
        window.term.resize(5, 5);
        window.term.write('${fixture}\x1B[?J')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(3), ["abc", "d", ""]);
      await ctx.page.evaluate(`
        // 0: Erase Below
        window.term.reset()
        window.term.write('${fixture}\x1B[?0J')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(3), ["abc", "d", ""]);
      await ctx.page.evaluate(`
        // 1: Erase Above
        window.term.reset()
        window.term.write('${fixture}\x1B[?1J')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(3), ["", "  f", "ghi"]);
      await ctx.page.evaluate(`
        // 2: Erase Saved Lines (scrollback)
        window.term.reset()
        window.term.write('1\\n2\\n3\\n4\\n5${fixture}\x1B[?3J')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => ctx.page.evaluate(`window.term.buffer.active.length`), 5);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(5), ["   4", "    5", "abc", "def", "ghi"]);
    });
    import_test.test.skip("CSI Ps K - EL: Erase in Line, VT100", async () => {
    });
    import_test.test.skip("CSI ? Ps K - DECSEL: Erase in Line, VT220", async () => {
    });
    (0, import_test.test)("CSI Ps L - IL: Insert Ps Line(s) (default = 1)", async () => {
      await ctx.page.evaluate(`
        // Default
        window.term.write('foo\x1B[La')
        // Explicit
        window.term.write('\x1B[2Lb')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(4), ["b", "", "a", "foo"]);
    });
    (0, import_test.test)("CSI Ps M - DL: Delete Ps Line(s) (default = 1)", async () => {
      await ctx.page.evaluate(`
        // Default
        window.term.write('a\\nb\x1B[1F\x1B[M')
        // Explicit
        window.term.write('\x1B[1Ed\\ne\\nf\x1B[2F\x1B[2M')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(5), [" b", "  f", "", "", ""]);
    });
    (0, import_test.test)("CSI Ps P - DCH: Delete Ps Character(s) (default = 1)", async () => {
      await ctx.page.evaluate(`
        // Default
        window.term.write('abc\x1B[1;1H\x1B[P')
        // Explicit
        window.term.write('\\n\\rdef\x1B[2;1H\x1B[2P')
      `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(2), ["bc", "f"]);
    });
    import_test.test.skip("CSI Pm # P - XTPUSHCOLORS: Push current dynamic- and ANSI-palette colors onto stack, xterm", async () => {
    });
    import_test.test.skip("CSI Pm # Q - XTPOPCOLORS: Pop stack to set dynamic- and ANSI-palette colors, xterm", async () => {
    });
    import_test.test.skip("CSI # R - XTREPORTCOLORS: Report the current entry on the palette stack, and the number of palettes stored on the stack, using the same form as XTPOPCOLOR (default = 0), xterm", async () => {
    });
    import_test.test.skip("CSI Ps S - SU: Scroll up Ps lines (default = 1), VT420, ECMA-48", async () => {
    });
    import_test.test.skip("CSI ? Pi ; Pa ; Pv S - XTSMGRAPHICS: Set or request graphics attribute, xterm", async () => {
    });
    import_test.test.skip("CSI Ps T - SD: Scroll down Ps lines (default = 1), VT420", async () => {
    });
    import_test.test.skip("CSI Ps ; Ps ; Ps ; Ps ; Ps T - XTHIMOUSE: Initiate highlight mouse tracking (XTHIMOUSE), xterm", async () => {
    });
    import_test.test.skip("CSI > Pm T - XTRMTITLE: Reset title mode features to default value, xterm", async () => {
    });
    import_test.test.skip("CSI Ps X - ECH: Erase Ps Character(s) (default = 1)", async () => {
    });
    import_test.test.skip("CSI Ps Z - CBT: Cursor Backward Tabulation Ps tab stops (default = 1)", async () => {
    });
    import_test.test.skip("CSI Ps ^ - SD: Scroll down Ps lines (default = 1) (SD), ECMA-48", async () => {
    });
    import_test.test.skip("CSI Ps ` - HPA: Character Position Absolute [column] (default = [row,1])", async () => {
    });
    import_test.test.skip("CSI Ps a - ", async () => {
    });
    (0, import_test.test)("CSI Ps b - REP: Repeat preceding character, ECMA48", async () => {
      await ctx.page.evaluate(`
          window.term.resize(10, 10);
          window.term.write('#\x1B[b');
          window.term.writeln('');
          window.term.write('#\x1B[0b');
          window.term.writeln('');
          window.term.write('#\x1B[1b');
          window.term.writeln('');
          window.term.write('#\x1B[5b');
          `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(4), ["##", "##", "##", "######"]);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getCursor(), { col: 6, row: 3 });
      await ctx.page.evaluate(`
          window.term.reset();
          window.term.write('\uFFE5\x1B[8b');
          `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(1), ["\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5"]);
      await ctx.page.evaluate(`
          window.term.reset();
          window.term.write('e\u0301\x1B[2b');
          `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(1), ["e\u0301e\u0301e\u0301"]);
      await ctx.page.evaluate(`
          window.term.reset();
          window.term.write('#\x1B[15b');
          `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(2), ["##########", "######"]);
      await ctx.page.evaluate(`
          window.term.reset();
          window.term.write('\x1B[?7l');  // disable wrap around
          window.term.write('#\x1B[15b');
          `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(2), ["##########", ""]);
      await ctx.page.evaluate(`
          window.term.reset();
          window.term.write('\x1B[?7h');  // re-enable wrap around
          window.term.write('#\\n\x1B[3b');
          window.term.write('#\\r\x1B[3b');
          window.term.writeln('');
          window.term.write('abcdefg\x1B[3D\x1B[10b#\x1B[3b');
          `);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getLinesAsArray(3), ["#", " #", "abcd####"]);
    });
    import_test.test.skip("CSI Ps c - ", async () => {
    });
    import_test.test.skip("CSI = Ps c - ", async () => {
    });
    import_test.test.skip("CSI > Ps c - ", async () => {
    });
    import_test.test.skip("CSI Ps d - ", async () => {
    });
    import_test.test.skip("CSI Ps e - ", async () => {
    });
    import_test.test.skip("CSI Ps ; Ps f - ", async () => {
    });
    import_test.test.skip("CSI Ps g - ", async () => {
    });
    import_test.test.skip("CSI Ps h - ", async () => {
    });
    import_test.test.describe("CSI ? Pm h - DECSET: Private Mode Set", () => {
      import_test.test.skip("Ps = 1 - Application Cursor Keys (DECCKM), VT100", async () => {
      });
      import_test.test.skip("Ps = 2 - Designate USASCII for character sets G0-G3 (DECANM), VT100, and set VT100 mode", async () => {
      });
      import_test.test.skip("Ps = 3 - 132 Column Mode (DECCOLM), VT100", async () => {
      });
      import_test.test.skip("Ps = 4 - Smooth (Slow) Scroll (DECSCLM), VT100", async () => {
      });
      import_test.test.skip("Ps = 5 - Reverse Video (DECSCNM), VT100", async () => {
      });
      import_test.test.skip("Ps = 6 - Origin Mode (DECOM), VT100", async () => {
      });
      import_test.test.skip("Ps = 7 - Auto-Wrap Mode (DECAWM), VT100", async () => {
      });
      import_test.test.skip("Ps = 8 - Auto-Repeat Keys (DECARM), VT100", async () => {
      });
      import_test.test.skip("Ps = 9 - Send Mouse X & Y on button press", async () => {
      });
      import_test.test.skip("Ps = 1 0 - Show toolbar (rxvt)", async () => {
      });
      import_test.test.skip("Ps = 1 2 - Start blinking cursor (AT&T 610)", async () => {
      });
      import_test.test.skip("Ps = 1 3 - Start blinking cursor (set only via resource or menu)", async () => {
      });
      import_test.test.skip("Ps = 1 4 - Enable XOR of blinking cursor control sequence and menu", async () => {
      });
      import_test.test.skip("Ps = 1 8 - Print Form Feed (DECPFF), VT220", async () => {
      });
      import_test.test.skip("Ps = 1 9 - Set print extent to full screen (DECPEX), VT220", async () => {
      });
      import_test.test.skip("Ps = 2 5 - Show cursor (DECTCEM), VT220", async () => {
      });
      import_test.test.skip("Ps = 3 0 - Show scrollbar (rxvt)", async () => {
      });
      import_test.test.skip("Ps = 3 5 - Enable font-shifting functions (rxvt)", async () => {
      });
      import_test.test.skip("Ps = 3 8 - Enter Tektronix mode (DECTEK), VT240, xterm", async () => {
      });
      import_test.test.skip("Ps = 4 0 - Allow 80 \u21D2  132 mode, xterm", async () => {
      });
      import_test.test.skip("Ps = 4 1 - more(1) fix (see curses resource)", async () => {
      });
      import_test.test.skip("Ps = 4 2 - Enable National Replacement Character sets (DECNRCM), VT220", async () => {
      });
      import_test.test.skip("Ps = 4 3 - Enable Graphic Expanded Print Mode (DECGEPM), VT340", async () => {
      });
      import_test.test.skip("Ps = 4 4 - Turn on margin bell, xterm", async () => {
      });
      import_test.test.skip("Ps = 4 4 - Enable Graphic Print Color Mode (DECGPCM), VT340", async () => {
      });
      import_test.test.skip("Ps = 4 5 - Reverse-wraparound mode (XTREVWRAP), xterm", async () => {
      });
      import_test.test.skip("Ps = 4 5 - Enable Graphic Print Color Syntax (DECGPCS), VT340", async () => {
      });
      import_test.test.skip("Ps = 4 6 - Start logging (XTLOGGING), xterm", async () => {
      });
      import_test.test.skip("Ps = 4 6 - Graphic Print Background Mode, VT340", async () => {
      });
      import_test.test.skip("Ps = 4 7 - Use Alternate Screen Buffer, xterm", async () => {
      });
      import_test.test.skip("Ps = 4 7 - Enable Graphic Rotated Print Mode (DECGRPM), VT340", async () => {
      });
      import_test.test.skip("Ps = 6 6 - Application keypad mode (DECNKM), VT320", async () => {
      });
      import_test.test.skip("Ps = 6 7 - Backarrow key sends backspace (DECBKM), VT340, VT420", async () => {
      });
      import_test.test.skip("Ps = 6 9 - Enable left and right margin mode (DECLRMM), VT420 and up", async () => {
      });
      import_test.test.skip("Ps = 8 0 - Enable Sixel Display Mode (DECSDM), VT330, VT340, VT382", async () => {
      });
      import_test.test.skip("Ps = 9 5 - Do not clear screen when DECCOLM is set/reset (DECNCSM), VT510 and up", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 0 - Send Mouse X & Y on button press and release", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 1 - Use Hilite Mouse Tracking, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 2 - Use Cell Motion Mouse Tracking, xterm", async () => {
      });
      (0, import_test.test)("Ps = 1 0 0 3 - Set Use All Motion (any event) Mouse Tracking", async () => {
        const coords = await ctx.page.evaluate(`
          (function() {
            const rect = window.term.element.getBoundingClientRect();
            return { left: rect.left, top: rect.top, bottom: rect.bottom, right: rect.right };
          })();
        `);
        await ctx.page.mouse.click((coords.left + coords.right) / 2, (coords.top + coords.bottom) / 2);
        await ctx.page.mouse.down();
        await ctx.page.mouse.move((coords.left + coords.right) / 2, (coords.top + coords.bottom) / 4);
        (0, import_assert.ok)(await ctx.page.evaluate(`window.term.getSelection().length`) > 0, "mouse events are off so there should be a selection");
        await ctx.page.mouse.up();
        await ctx.page.mouse.click((coords.left + coords.right) / 2, (coords.top + coords.bottom) / 2);
        await (0, import_TestUtils.pollFor)(ctx.page, () => ctx.page.evaluate(`window.term.getSelection().length`), 0);
        await ctx.page.evaluate(`window.term.write('\x1B[?1003h')`);
        await ctx.page.mouse.click((coords.left + coords.right) / 2, (coords.top + coords.bottom) / 2);
        await ctx.page.mouse.down();
        await ctx.page.mouse.move((coords.left + coords.right) / 2, (coords.top + coords.bottom) / 4);
        await (0, import_TestUtils.pollFor)(ctx.page, () => ctx.page.evaluate(`window.term.getSelection().length`), 0);
        await ctx.page.mouse.up();
      });
      import_test.test.skip("Ps = 1 0 0 4 - Send FocusIn/FocusOut events, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 5 - Enable UTF-8 Mouse Mode, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 6 - Enable SGR Mouse Mode, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 7 - Enable Alternate Scroll Mode, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 1 0 - Scroll to bottom on tty output (rxvt)", async () => {
      });
      import_test.test.skip("Ps = 1 0 1 1 - Scroll to bottom on key press (rxvt)", async () => {
      });
      import_test.test.skip("Ps = 1 0 1 5 - Enable urxvt Mouse Mode", async () => {
      });
      import_test.test.skip("Ps = 1 0 1 6 - Enable SGR Mouse PixelMode, xterm", async () => {
      });
      import_test.test.skip('Ps = 1 0 3 4 - Interpret "meta" key, xterm', async () => {
      });
      import_test.test.skip("Ps = 1 0 3 5 - Enable special modifiers for Alt and NumLock keys, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 3 6 - Send ESC   when Meta modifies a key, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 3 7 - Send DEL from the editing-keypad Delete key, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 3 9 - Send ESC  when Alt modifies a key, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 0 - Keep selection even if not highlighted, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 1 - Use the CLIPBOARD selection, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 2 - Enable Urgency window manager hint when Control-G is received, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 3 - Enable raising of the window when Control-G is received, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 4 - Reuse the most recent data copied to CLIPBOARD, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 5 - XTREVWRAP2: Extended Reverse-wraparound mode, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 6 - Enable switching to/from Alternate Screen Buffer, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 7 - Use Alternate Screen Buffer, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 8 - Save cursor as in DECSC, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 9 - Save cursor as in DECSC, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 5 0 - Set terminfo/termcap function-key mode, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 5 1 - Set Sun function-key mode, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 5 2 - Set HP function-key mode, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 5 3 - Set SCO function-key mode, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 6 0 - Set legacy keyboard emulation, i.e, X11R6, xterm", async () => {
      });
      import_test.test.skip("Ps = 1 0 6 1 - Set VT220 keyboard emulation, xterm", async () => {
      });
      import_test.test.skip("Ps = 2 0 0 1 - Enable readline mouse button-1, xterm", async () => {
      });
      import_test.test.skip("Ps = 2 0 0 2 - Enable readline mouse button-2, xterm", async () => {
      });
      import_test.test.skip("Ps = 2 0 0 3 - Enable readline mouse button-3, xterm", async () => {
      });
      (0, import_test.test)("Pm = 2 0 0 4, Set bracketed paste mode", async () => {
        if (ctx.browser.browserType().name() !== "chromium") {
          import_test.test.skip();
          return;
        }
        await (0, import_TestUtils.pollFor)(ctx.page, () => simulatePaste("foo"), "foo");
        await ctx.page.evaluate(`window.term.write('\x1B[?2004h')`);
        await (0, import_TestUtils.pollFor)(ctx.page, () => simulatePaste("bar"), "\x1B[200~bar\x1B[201~");
        await ctx.page.evaluate(`window.term.write('\x1B[?2004l')`);
        await (0, import_TestUtils.pollFor)(ctx.page, () => simulatePaste("baz"), "baz");
      });
      import_test.test.skip("Ps = 2 0 0 5 - Enable readline character-quoting, xterm", async () => {
      });
      import_test.test.skip("Ps = 2 0 0 6 - Enable readline newline pasting, xterm", async () => {
      });
    });
    import_test.test.skip("CSI Ps i - MC: Media Copy", async () => {
    });
    import_test.test.skip("CSI ? Ps i - MC: Media Copy, DEC-specified", async () => {
    });
    import_test.test.skip("CSI Pm l - RM: Reset Mode", async () => {
    });
    import_test.test.describe("CSI ? Pm l - DECRST: DEC Private Mode Reset", async () => {
      import_test.test.skip("Ps = 1 - Normal Cursor Keys (DECCKM), VT100.", async () => {
      });
      import_test.test.skip("Ps = 2 - Designate VT52 mode (DECANM), VT100.", async () => {
      });
      import_test.test.skip("Ps = 3 - 80 Column Mode (DECCOLM), VT100.", async () => {
      });
      import_test.test.skip("Ps = 4 - Jump (Fast) Scroll (DECSCLM), VT100.", async () => {
      });
      import_test.test.skip("Ps = 5 - Normal Video (DECSCNM), VT100.", async () => {
      });
      import_test.test.skip("Ps = 6 - Normal Cursor Mode (DECOM), VT100.", async () => {
      });
      import_test.test.skip("Ps = 7 - No Auto-Wrap Mode (DECAWM), VT100.", async () => {
      });
      import_test.test.skip("Ps = 8 - No Auto-Repeat Keys (DECARM), VT100.", async () => {
      });
      import_test.test.skip("Ps = 9 - Don't send Mouse X & Y on button press, xterm.", async () => {
      });
      import_test.test.skip("Ps = 1 0 - Hide toolbar (rxvt).", async () => {
      });
      import_test.test.skip("Ps = 1 2 - Stop blinking cursor (AT&T 610).", async () => {
      });
      import_test.test.skip("Ps = 1 3 - Disable blinking cursor (reset only via resource or menu).", async () => {
      });
      import_test.test.skip("Ps = 1 4 - Disable XOR of blinking cursor control sequence and menu.", async () => {
      });
      import_test.test.skip("Ps = 1 8 - Don't Print Form Feed (DECPFF), VT220.", async () => {
      });
      import_test.test.skip("Ps = 1 9 - Limit print to scrolling region (DECPEX), VT220.", async () => {
      });
      import_test.test.skip("Ps = 2 5 - Hide cursor (DECTCEM), VT220.", async () => {
      });
      import_test.test.skip("Ps = 3 0 - Don't show scrollbar (rxvt).", async () => {
      });
      import_test.test.skip("Ps = 3 5 - Disable font-shifting functions (rxvt).", async () => {
      });
      import_test.test.skip("Ps = 4 0 - Disallow 80 \u21D2  132 mode, xterm.", async () => {
      });
      import_test.test.skip("Ps = 4 1 - No more(1) fix (see curses resource).", async () => {
      });
      import_test.test.skip("Ps = 4 2 - Disable National Replacement Character sets (DECNRCM), VT220.", async () => {
      });
      import_test.test.skip("Ps = 4 3 - Disable Graphic Expanded Print Mode (DECGEPM), VT340.", async () => {
      });
      import_test.test.skip("Ps = 4 4 - Turn off margin bell, xterm.", async () => {
      });
      import_test.test.skip("Ps = 4 4 - Disable Graphic Print Color Mode (DECGPCM), VT340.", async () => {
      });
      import_test.test.skip("Ps = 4 5 - No Reverse-wraparound mode (XTREVWRAP), xterm.", async () => {
      });
      import_test.test.skip("Ps = 4 5 - Disable Graphic Print Color Syntax (DECGPCS), VT340.", async () => {
      });
      import_test.test.skip("Ps = 4 6 - Stop logging (XTLOGGING), xterm.  This is normally disabled by a compile-time option.", async () => {
      });
      import_test.test.skip("Ps = 4 7 - Use Normal Screen Buffer, xterm.", async () => {
      });
      import_test.test.skip("Ps = 4 7 - Disable Graphic Rotated Print Mode (DECGRPM), VT340.", async () => {
      });
      import_test.test.skip("Ps = 6 6 - Numeric keypad mode (DECNKM), VT320.", async () => {
      });
      import_test.test.skip('Ps = 6 7 - Backarrow key sends delete (DECBKM), VT340, VT420.  This sets the backarrowKey resource to "false".', async () => {
      });
      import_test.test.skip("Ps = 6 9 - Disable left and right margin mode (DECLRMM), VT420 and up.", async () => {
      });
      import_test.test.skip('Ps = 8 0 - Disable Sixel Display Mode (DECSDM), VT330, VT340, VT382.  Turns on "Sixel Scrolling".  See the section Sixel Graphics and mode 8 4 5 2 .', async () => {
      });
      import_test.test.skip("Ps = 9 5 - Clear screen when DECCOLM is set/reset (DECNCSM), VT510 and up.", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 0 - Don't send Mouse X & Y on button press and release.  See the section Mouse Tracking.", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 1 - Don't use Hilite Mouse Tracking, xterm.", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 2 - Don't use Cell Motion Mouse Tracking, xterm.  See the section Button-event tracking.", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 3 - Don't use All Motion Mouse Tracking, xterm. See the section Any-event tracking.", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 4 - Don't send FocusIn/FocusOut events, xterm.", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 5 - Disable UTF-8 Mouse Mode, xterm.", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 6 - Disable SGR Mouse Mode, xterm.", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 7 - Disable Alternate Scroll Mode, xterm.  This corresponds to the alternateScroll resource.", async () => {
      });
      import_test.test.skip(`Ps = 1 0 1 0 - Don't scroll to bottom on tty output (rxvt).  This sets the scrollTtyOutput resource to "false".`, async () => {
      });
      import_test.test.skip(`Ps = 1 0 1 1 - Don't scroll to bottom on key press (rxvt). This sets the scrollKey resource to "false".`, async () => {
      });
      import_test.test.skip("Ps = 1 0 1 5 - Disable urxvt Mouse Mode.", async () => {
      });
      import_test.test.skip("Ps = 1 0 1 6 - Disable SGR Mouse Pixel-Mode, xterm.", async () => {
      });
      import_test.test.skip(`Ps = 1 0 3 4 - Don't interpret "meta" key, xterm.  This disables the eightBitInput resource.`, async () => {
      });
      import_test.test.skip("Ps = 1 0 3 5 - Disable special modifiers for Alt and NumLock keys, xterm.  This disables the numLock resource.", async () => {
      });
      import_test.test.skip("Ps = 1 0 3 6 - Don't send ESC  when Meta modifies a key, xterm.  This disables the metaSendsEscape resource.", async () => {
      });
      import_test.test.skip("Ps = 1 0 3 7 - Send VT220 Remove from the editing-keypad Delete key, xterm.", async () => {
      });
      import_test.test.skip("Ps = 1 0 3 9 - Don't send ESC when Alt modifies a key, xterm.  This disables the altSendsEscape resource.", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 0 - Do not keep selection when not highlighted, xterm.  This disables the keepSelection resource.", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 1 - Use the PRIMARY selection, xterm.  This disables the selectToClipboard resource.", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 2 - Disable Urgency window manager hint when Control-G is received, xterm.  This disables the bellIsUrgent resource.", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 3 - Disable raising of the window when Control- G is received, xterm.  This disables the popOnBell resource.", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 5 - No Extended Reverse-wraparound mode (XTREVWRAP2), xterm.", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 6 - Disable switching to/from Alternate Screen Buffer, xterm.  This works for terminfo-based systems, updating the titeInhibit resource.  If currently using the Alternate Screen Buffer, xterm switches to the Normal Screen Buffer.", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 7 - Use Normal Screen Buffer, xterm.  Clear the screen first if in the Alternate Screen Buffer.  This may be disabled by the titeInhibit resource.", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 8 - Restore cursor as in DECRC, xterm.  This may be disabled by the titeInhibit resource.", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 9 - Use Normal Screen Buffer and restore cursor as in DECRC, xterm.  This may be disabled by the titeInhibit resource.  This combines the effects of the 1 0 4 7  and 1 0 4 8  modes.  Use this with terminfo-based applications rather than the 4 7  mode.", async () => {
      });
      import_test.test.skip("Ps = 1 0 5 0 - Reset terminfo/termcap function-key mode, xterm.", async () => {
      });
      import_test.test.skip("Ps = 1 0 5 1 - Reset Sun function-key mode, xterm.", async () => {
      });
      import_test.test.skip("Ps = 1 0 5 2 - Reset HP function-key mode, xterm.", async () => {
      });
      import_test.test.skip("Ps = 1 0 5 3 - Reset SCO function-key mode, xterm.", async () => {
      });
      import_test.test.skip("Ps = 1 0 6 0 - Reset legacy keyboard emulation, i.e, X11R6, xterm.", async () => {
      });
      import_test.test.skip("Ps = 1 0 6 1 - Reset keyboard emulation to Sun/PC style, xterm.", async () => {
      });
      import_test.test.skip("Ps = 2 0 0 1 - Disable readline mouse button-1, xterm.", async () => {
      });
      import_test.test.skip("Ps = 2 0 0 2 - Disable readline mouse button-2, xterm.", async () => {
      });
      import_test.test.skip("Ps = 2 0 0 3 - Disable readline mouse button-3, xterm.", async () => {
      });
      import_test.test.skip("Ps = 2 0 0 4 - Reset bracketed paste mode, xterm.", async () => {
      });
      import_test.test.skip("Ps = 2 0 0 5 - Disable readline character-quoting, xterm.", async () => {
      });
      import_test.test.skip("Ps = 2 0 0 6 - Disable readline newline pasting, xterm.", async () => {
      });
    });
    import_test.test.describe("CSI Pm m - SGR: Character Attributes", () => {
      import_test.test.skip("Ps = 0 -  Normal (default), VT100.", async () => {
      });
      import_test.test.skip("Ps = 1 -  Bold, VT100.", async () => {
      });
      import_test.test.skip("Ps = 2 -  Faint, decreased intensity, ECMA-48 2nd.", async () => {
      });
      import_test.test.skip("Ps = 3 -  Italicized, ECMA-48 2nd.", async () => {
      });
      import_test.test.skip("Ps = 4 -  Underlined, VT100.", async () => {
      });
      import_test.test.skip("Ps = 5 -  Blink, VT100. This appears as Bold in X11R6 xterm.", async () => {
      });
      import_test.test.skip("Ps = 7 -  Inverse, VT100.", async () => {
      });
      import_test.test.skip("Ps = 8 -  Invisible, i.e., hidden, ECMA-48 2nd, VT300.", async () => {
      });
      import_test.test.skip("Ps = 9 -  Crossed-out characters, ECMA-48 3rd.", async () => {
      });
      import_test.test.skip("Ps = 2 1 -  Doubly-underlined, ECMA-48 3rd.", async () => {
      });
      import_test.test.skip("Ps = 2 2 -  Normal (neither bold nor faint), ECMA-48 3rd.", async () => {
      });
      import_test.test.skip("Ps = 2 3 -  Not italicized, ECMA-48 3rd.", async () => {
      });
      import_test.test.skip("Ps = 2 4 -  Not underlined, ECMA-48 3rd.", async () => {
      });
      import_test.test.skip("Ps = 2 5 -  Steady (not blinking), ECMA-48 3rd.", async () => {
      });
      import_test.test.skip("Ps = 2 7 -  Positive (not inverse), ECMA-48 3rd.", async () => {
      });
      import_test.test.skip("Ps = 2 8 -  Visible, i.e., not hidden, ECMA-48 3rd, VT300.", async () => {
      });
      import_test.test.skip("Ps = 2 9 -  Not crossed-out, ECMA-48 3rd.", async () => {
      });
      import_test.test.skip("Ps = 3 0 -  Set foreground color to Black.", async () => {
      });
      import_test.test.skip("Ps = 3 1 -  Set foreground color to Red.", async () => {
      });
      import_test.test.skip("Ps = 3 2 -  Set foreground color to Green.", async () => {
      });
      import_test.test.skip("Ps = 3 3 -  Set foreground color to Yellow.", async () => {
      });
      import_test.test.skip("Ps = 3 4 -  Set foreground color to Blue.", async () => {
      });
      import_test.test.skip("Ps = 3 5 -  Set foreground color to Magenta.", async () => {
      });
      import_test.test.skip("Ps = 3 6 -  Set foreground color to Cyan.", async () => {
      });
      import_test.test.skip("Ps = 3 7 -  Set foreground color to White.", async () => {
      });
      import_test.test.skip("Ps = 3 9 -  Set foreground color to default, ECMA-48 3rd.", async () => {
      });
      import_test.test.skip("Ps = 4 0 -  Set background color to Black.", async () => {
      });
      import_test.test.skip("Ps = 4 1 -  Set background color to Red.", async () => {
      });
      import_test.test.skip("Ps = 4 2 -  Set background color to Green.", async () => {
      });
      import_test.test.skip("Ps = 4 3 -  Set background color to Yellow.", async () => {
      });
      import_test.test.skip("Ps = 4 4 -  Set background color to Blue.", async () => {
      });
      import_test.test.skip("Ps = 4 5 -  Set background color to Magenta.", async () => {
      });
      import_test.test.skip("Ps = 4 6 -  Set background color to Cyan.", async () => {
      });
      import_test.test.skip("Ps = 4 7 -  Set background color to White.", async () => {
      });
      import_test.test.skip("Ps = 4 9 -  Set background color to default, ECMA-48 3rd.", async () => {
      });
      import_test.test.skip("Ps = 9 0 -  Set foreground color to Black.", async () => {
      });
      import_test.test.skip("Ps = 9 1 -  Set foreground color to Red.", async () => {
      });
      import_test.test.skip("Ps = 9 2 -  Set foreground color to Green.", async () => {
      });
      import_test.test.skip("Ps = 9 3 -  Set foreground color to Yellow.", async () => {
      });
      import_test.test.skip("Ps = 9 4 -  Set foreground color to Blue.", async () => {
      });
      import_test.test.skip("Ps = 9 5 -  Set foreground color to Magenta.", async () => {
      });
      import_test.test.skip("Ps = 9 6 -  Set foreground color to Cyan.", async () => {
      });
      import_test.test.skip("Ps = 9 7 -  Set foreground color to White.", async () => {
      });
      import_test.test.skip("Ps = 1 0 0 -  Set background color to Black.", async () => {
      });
      import_test.test.skip("Ps = 1 0 1 -  Set background color to Red.", async () => {
      });
      import_test.test.skip("Ps = 1 0 2 -  Set background color to Green.", async () => {
      });
      import_test.test.skip("Ps = 1 0 3 -  Set background color to Yellow.", async () => {
      });
      import_test.test.skip("Ps = 1 0 4 -  Set background color to Blue.", async () => {
      });
      import_test.test.skip("Ps = 1 0 5 -  Set background color to Magenta.", async () => {
      });
      import_test.test.skip("Ps = 1 0 6 -  Set background color to Cyan.", async () => {
      });
      import_test.test.skip("Ps = 1 0 7 -  Set background color to White.", async () => {
      });
      import_test.test.skip("Ps = 3 8 : 2 : Pi : Pr : Pg : Pb-  Set foreground color using RGB values", async () => {
      });
      import_test.test.skip("Ps = 3 8 : 5 : Ps-  Set foreground color to Ps, using indexed color", async () => {
      });
      import_test.test.skip("Ps = 4 8 : 2 : Pi : Pr : Pg : Pb-  Set background color using RGB values", async () => {
      });
      import_test.test.skip("Ps = 4 8 : 5 : Ps-  Set background color to Ps, using indexed color", async () => {
      });
      import_test.test.skip("Ps = 3 8 ; 2 ; Pr ; Pg ; Pb-  Set foreground color using RGB values", async () => {
      });
      import_test.test.skip("Ps = 4 8 ; 2 ; Pr ; Pg ; Pb-  Set background color using RGB values", async () => {
      });
    });
    import_test.test.skip("CSI > Pp [; Pv] m - XTMODKEYS: Set/reset key modifier options, xterm", () => {
    });
    import_test.test.skip("CSI ? Pp m - XTQMODKEYS: Query key modifier options, xterm", () => {
    });
    import_test.test.describe("CSI Ps n - DSR: Device Status Report", () => {
      (0, import_test.test)("Status Report - CSI 5 n", async () => {
        await ctx.page.evaluate(`
          window.term.onData(e => window.result = e);
          window.term.write('\\x1b[5n');
        `);
        await (0, import_TestUtils.pollFor)(ctx.page, () => ctx.page.evaluate(`window.result`), "\x1B[0n");
      });
      (0, import_test.test)("Report Cursor Position (CPR) - CSI 6 n", async () => {
        await ctx.page.evaluate(`window.term.write('\\n\\nfoo')`);
        await (0, import_TestUtils.pollFor)(ctx.page, () => ctx.page.evaluate(`
          [window.term.buffer.active.cursorY, window.term.buffer.active.cursorX]
        `), [2, 3]);
        await ctx.page.evaluate(`
          window.term.onData(e => window.result = e);
          window.term.write('\\x1b[6n');
        `);
        await (0, import_TestUtils.pollFor)(ctx.page, () => ctx.page.evaluate(`window.result`), "\x1B[3;4R");
      });
      (0, import_test.test)("Report Cursor Position (DECXCPR) - CSI ? 6 n", async () => {
        await ctx.page.evaluate(`window.term.write('\\n\\nfoo')`);
        await (0, import_TestUtils.pollFor)(ctx.page, () => ctx.page.evaluate(`
          [window.term.buffer.active.cursorY, window.term.buffer.active.cursorX]
        `), [2, 3]);
        await ctx.page.evaluate(`
          window.term.onData(e => window.result = e);
          window.term.write('\\x1b[?6n');
        `);
        await (0, import_TestUtils.pollFor)(ctx.page, () => ctx.page.evaluate(`window.result`), "\x1B[?3;4R");
      });
    });
    import_test.test.skip("CSI > Ps n - Disable key modifier options, xterm", () => {
    });
    import_test.test.describe.skip("CSI ? Ps n - DSR: Device Status Report (DEC-specific).", () => {
    });
    import_test.test.skip("CSI > Ps p - XTSMPOINTER: Set resource value pointerMode, xterm", () => {
    });
    import_test.test.skip("CSI ! p - DECSTR: Soft terminal reset, VT220 and up.", () => {
    });
    import_test.test.skip('CSI Pl ; Pc " p - DECSCL: Set conformance level, VT220 and up.', () => {
    });
    import_test.test.skip("CSI Ps $ p - DECRQM: Request ANSI mode", () => {
    });
    import_test.test.skip("CSI ? Ps $ p - Request DEC private mode (DECRQM).", () => {
    });
    import_test.test.skip("CSI [Pm] # p - Push video attributes onto stack (XTPUSHSGR), xterm.  This is an alias for CSI # { , used to work around language limitations of C#.", async () => {
    });
    import_test.test.skip("CSI > Ps q - Report xterm name and version (XTVERSION).", async () => {
    });
    import_test.test.skip("CSI Ps q - Load LEDs (DECLL), VT100.", async () => {
    });
    import_test.test.skip("CSI Ps SP q - Set cursor style (DECSCUSR), VT520.", async () => {
    });
    import_test.test.skip('CSI Ps " q - Select character protection attribute (DECSCA), VT220.', async () => {
    });
    import_test.test.skip("CSI # q - Pop video attributes from stack (XTPOPSGR), xterm.", async () => {
    });
    import_test.test.skip("CSI Ps ; Ps r - Set Scrolling Region [top;bottom] (default = full size of window) (DECSTBM), VT100.", async () => {
    });
    import_test.test.skip("CSI ? Pm r - Restore DEC Private Mode Values (XTRESTORE), xterm.", async () => {
    });
    import_test.test.skip("CSI Pt ; Pl ; Pb ; Pr ; Pm $ r - Change Attributes in Rectangular Area (DECCARA), VT400 and up.", async () => {
    });
    import_test.test.skip("CSI s - Save cursor, available only when DECLRMM is disabled (SCOSC, also ANSI.SYS).", async () => {
    });
    import_test.test.skip("CSI Pl ; Pr s - Set left and right margins (DECSLRM), VT420 and up.", async () => {
    });
    import_test.test.skip("CSI > Ps s - Set/reset shift-escape options (XTSHIFTESCAPE), xterm.", async () => {
    });
    import_test.test.skip("CSI ? Pm s - Save DEC Private Mode Values (XTSAVE), xterm.  Ps values are the same as for DECSET.", async () => {
    });
    import_test.test.skip("CSI > Pm t - This xterm control sets one or more features of the title modes (XTSMTITLE), xterm.", async () => {
    });
    import_test.test.skip("CSI Ps SP t - Set warning-bell volume (DECSWBV), VT520.", async () => {
    });
    import_test.test.skip("CSI Pt ; Pl ; Pb ; Pr ; Pm $ t - Reverse Attributes in Rectangular Area (DECRARA), VT400 and up.", async () => {
    });
    import_test.test.skip("CSI u - Restore cursor (SCORC, also ANSI.SYS).", async () => {
    });
    import_test.test.skip("CSI Ps SP u - Set margin-bell volume (DECSMBV), VT520.", async () => {
    });
    import_test.test.skip("CSI Pt ; Pl ; Pb ; Pr ; Pp ; Pt ; Pl ; Pp $ v - Copy Rectangular Area (DECCRA), VT400 and up.", async () => {
    });
    import_test.test.skip("CSI Ps $ w - Request presentation state report (DECRQPSR), VT320 and up.", async () => {
    });
    import_test.test.skip("CSI Pt ; Pl ; Pb ; Pr ' w - Enable Filter Rectangle (DECEFR), VT420 and up.", async () => {
    });
    import_test.test.skip("CSI Ps x - Request Terminal Parameters (DECREQTPARM).", async () => {
    });
    import_test.test.skip("CSI Ps * x - Select Attribute Change Extent (DECSACE), VT420 and up.", async () => {
    });
    import_test.test.skip("CSI Pc ; Pt ; Pl ; Pb ; Pr $ x - Fill Rectangular Area (DECFRA), VT420 and up.", async () => {
    });
    import_test.test.skip("CSI Ps # y - Select checksum extension (XTCHECKSUM), xterm.", async () => {
    });
    import_test.test.skip("CSI Pi ; Pg ; Pt ; Pl ; Pb ; Pr * y - Request Checksum of Rectangular Area (DECRQCRA), VT420 and up.", async () => {
    });
    import_test.test.skip("CSI Ps ; Pu ' z - Enable Locator Reporting (DECELR).", async () => {
    });
    import_test.test.skip("CSI Pt ; Pl ; Pb ; Pr $ z - Erase Rectangular Area (DECERA), VT400 and up.", async () => {
    });
    import_test.test.skip("CSI Pm ' { - Select Locator Events (DECSLE).", async () => {
    });
    import_test.test.skip("CSI [Pm] # { Push video attributes onto stack (XTPUSHSGR), xterm.", async () => {
    });
    import_test.test.skip("CSI Pt ; Pl ; Pb ; Pr $ { - Selective Erase Rectangular Area (DECSERA), VT400 and up.", async () => {
    });
    import_test.test.skip("CSI Pt ; Pl ; Pb ; Pr # | - Report selected graphic rendition (XTREPORTSGR), xterm.", async () => {
    });
    import_test.test.skip("CSI Ps $ | - Select columns per page (DECSCPP), VT340.", async () => {
    });
    import_test.test.skip("CSI Ps ' | - Request Locator Position (DECRQLP).", async () => {
    });
    import_test.test.skip("CSI Ps * | - Select number of lines per screen (DECSNLS), VT420 and up.", async () => {
    });
    import_test.test.skip("CSI # } - Pop video attributes from stack (XTPOPSGR), xterm.", async () => {
    });
    import_test.test.skip("CSI Ps ' } - Insert Ps Column(s) (default = 1) (DECIC), VT420 and up.", async () => {
    });
    import_test.test.skip("CSI Ps $ } - Select active status display (DECSASD), VT320 and up.", async () => {
    });
    import_test.test.skip("CSI Ps ' ~ - Delete Ps Column(s) (default = 1) (DECDC), VT420 and up.", async () => {
    });
    import_test.test.skip("CSI Ps $ ~ - Select status line type (DECSSDT), VT320 and up.", async () => {
    });
    import_test.test.describe("CSI Ps ; Ps ; Ps t - Window Options", () => {
      (0, import_test.test)("should be disabled by default", async () => {
        await ctx.page.evaluate(`(() => {
            window._stack = [];
            const _h = window.term.onData(data => window._stack.push(data));
            window.term.write('\x1B[14t');
            window.term.write('\x1B[16t');
            window.term.write('\x1B[18t');
            window.term.write('\x1B[20t');
            window.term.write('\x1B[21t');
            return new Promise((r) => window.term.write('', () => { _h.dispose(); r(); }));
          })()`);
        await (0, import_TestUtils.pollFor)(ctx.page, async () => await ctx.page.evaluate(`(() => _stack)()`), []);
      });
      (0, import_test.test)("14 - GetWinSizePixels", async () => {
        await ctx.page.evaluate(`window.term.options.windowOptions = { getWinSizePixels: true }; `);
        await ctx.page.evaluate(`(() => {
            window._stack = [];
            const _h = window.term.onData(data => window._stack.push(data));
            window.term.write('\x1B[14t');
            return new Promise((r) => window.term.write('', () => { _h.dispose(); r(); }));
          })()`);
        const d = await getDimensions();
        await (0, import_TestUtils.pollFor)(ctx.page, async () => await ctx.page.evaluate(`(() => _stack)()`), [`\x1B[4;${d.height};${d.width}t`]);
      });
      (0, import_test.test)("16 - GetCellSizePixels", async () => {
        await ctx.page.evaluate(`window.term.options.windowOptions = { getCellSizePixels: true }; `);
        await ctx.page.evaluate(`(() => {
            window._stack = [];
            const _h = window.term.onData(data => window._stack.push(data));
            window.term.write('\x1B[16t');
            return new Promise((r) => window.term.write('', () => { _h.dispose(); r(); }));
          })()`);
        const d = await getDimensions();
        await (0, import_TestUtils.pollFor)(ctx.page, async () => await ctx.page.evaluate(`(() => _stack)()`), [`\x1B[6;${d.cellHeight};${d.cellWidth}t`]);
      });
    });
  });
  import_test.test.describe("OSC", () => {
    import_test.test.describe("OSC 4", () => {
      import_test.test.beforeAll(async () => {
        await ctx.page.evaluate("(() => {window._recordedData = []; window._h = term.onData(d => window._recordedData.push(d));})()");
      });
      import_test.test.afterAll(async () => {
        await ctx.page.evaluate("window._h.dispose()");
      });
      import_test.test.beforeEach(async () => {
        await ctx.page.evaluate("window._recordedData.length = 0;");
      });
      (0, import_test.test)("query single color", async () => {
        await ctx.proxy.write("\x1B]4;0;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]4;0;rgb:2e2e/3434/3636\x1B\\"]);
        await ctx.proxy.write("\x1B]4;77;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]4;0;rgb:2e2e/3434/3636\x1B\\", "\x1B]4;77;rgb:5f5f/d7d7/5f5f\x1B\\"]);
      });
      (0, import_test.test)("query multiple colors", async () => {
        await ctx.proxy.write("\x1B]4;0;?;77;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]4;0;rgb:2e2e/3434/3636\x1B\\", "\x1B]4;77;rgb:5f5f/d7d7/5f5f\x1B\\"]);
      });
      (0, import_test.test)("set & query single color", async () => {
        await ctx.proxy.write("\x1B]4;0;?\x07");
        const restore = await ctx.page.evaluate("window._recordedData");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), restore);
        await ctx.proxy.write("\x1B]4;0;rgb:01/02/03\x07\x1B]4;0;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), [restore[0], "\x1B]4;0;rgb:0101/0202/0303\x1B\\"]);
        await ctx.proxy.write(restore[0] + "\x1B]4;0;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), [restore[0], "\x1B]4;0;rgb:0101/0202/0303\x1B\\", restore[0]]);
      });
      (0, import_test.test)("query & set colors mixed", async () => {
        await ctx.proxy.write("\x1B]4;0;?;77;?\x07");
        const restore = await ctx.page.evaluate("window._recordedData");
        await ctx.page.evaluate("window._recordedData.length = 0;");
        await ctx.proxy.write("\x1B]4;0;rgb:01/02/03;43;?;77;#aabbcc\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]4;43;rgb:0000/d7d7/afaf\x1B\\"]);
        await ctx.page.evaluate("window._recordedData.length = 0;");
        await ctx.proxy.write("\x1B]4;0;?;77;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]4;0;rgb:0101/0202/0303\x1B\\", "\x1B]4;77;rgb:aaaa/bbbb/cccc\x1B\\"]);
        await ctx.page.evaluate("window._recordedData.length = 0;");
        await ctx.proxy.write(restore[0] + restore[1] + "\x1B]4;0;?;77;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), restore);
      });
    });
    import_test.test.describe("OSC 4 & 104", () => {
      import_test.test.beforeAll(async () => {
        await ctx.page.evaluate("(() => {window._recordedData = []; window._h = term.onData(d => window._recordedData.push(d));})()");
      });
      import_test.test.afterAll(async () => {
        await ctx.page.evaluate("window._h.dispose()");
      });
      import_test.test.beforeEach(async () => {
        await ctx.page.evaluate("window._recordedData.length = 0;");
      });
      (0, import_test.test)("change & restore single color", async () => {
        for (const i of [0, 43, 77, 255]) {
          await ctx.proxy.write(`\x1B]4;${i};?\x07`);
          const restore = await ctx.page.evaluate("window._recordedData");
          await ctx.proxy.write(`\x1B]4;${i};rgb:01/02/03\x07\x1B]4;${i};?\x07`);
          (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), [restore[0], `\x1B]4;${i};rgb:0101/0202/0303\x1B\\`]);
          await ctx.proxy.write(`\x1B]104;${i}\x07\x1B]4;${i};?\x07`);
          (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), [restore[0], `\x1B]4;${i};rgb:0101/0202/0303\x1B\\`, restore[0]]);
          await ctx.page.evaluate("window._recordedData.length = 0;");
        }
      });
      (0, import_test.test)("restore multiple at once", async () => {
        await ctx.proxy.write(`\x1B]4;0;?;43;?;77;?\x07`);
        const restore = await ctx.page.evaluate("window._recordedData");
        await ctx.page.evaluate("window._recordedData.length = 0;");
        await ctx.proxy.write(`\x1B]4;0;rgb:01/02/03;43;#aabbcc;77;#123456\x07`);
        await ctx.proxy.write(`\x1B]104;0;43;77\x07\x1B]4;0;?;43;?;77;?\x07`);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), restore);
      });
      (0, import_test.test)("restore full table", async () => {
        await ctx.proxy.write(`\x1B]4;0;?;43;?;77;?\x07`);
        const restore = await ctx.page.evaluate("window._recordedData");
        await ctx.page.evaluate("window._recordedData.length = 0;");
        await ctx.proxy.write(`\x1B]4;0;rgb:01/02/03;43;#aabbcc;77;#123456\x07`);
        await ctx.proxy.write(`\x1B]104\x07\x1B]4;0;?;43;?;77;?\x07`);
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), restore);
      });
    });
    import_test.test.describe("OSC 10 & 11 + 110 | 111 | 112", () => {
      import_test.test.beforeAll(async () => {
        await ctx.page.evaluate("(() => {window._recordedData = []; window._h = term.onData(d => window._recordedData.push(d));})()");
      });
      import_test.test.afterAll(async () => {
        await ctx.page.evaluate("window._h.dispose()");
      });
      import_test.test.beforeEach(async () => {
        await ctx.page.evaluate("window._recordedData.length = 0;");
      });
      (0, import_test.test)("query FG color", async () => {
        await ctx.proxy.write("\x1B]10;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]10;rgb:ffff/ffff/ffff\x1B\\"]);
      });
      (0, import_test.test)("query BG color", async () => {
        await ctx.proxy.write("\x1B]11;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]11;rgb:0000/0000/0000\x1B\\"]);
      });
      (0, import_test.test)("query FG & BG color in one call", async () => {
        await ctx.proxy.write("\x1B]10;?;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]10;rgb:ffff/ffff/ffff\x1B\\", "\x1B]11;rgb:0000/0000/0000\x1B\\"]);
      });
      (0, import_test.test)("set & query FG", async () => {
        await ctx.proxy.write("\x1B]10;rgb:1/2/3\x07\x1B]10;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]10;rgb:1111/2222/3333\x1B\\"]);
        await ctx.proxy.write("\x1B]10;#ffffff\x07\x1B]10;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]10;rgb:1111/2222/3333\x1B\\", "\x1B]10;rgb:ffff/ffff/ffff\x1B\\"]);
      });
      (0, import_test.test)("set & query BG", async () => {
        await ctx.proxy.write("\x1B]11;rgb:1/2/3\x07\x1B]11;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]11;rgb:1111/2222/3333\x1B\\"]);
        await ctx.proxy.write("\x1B]11;#000000\x07\x1B]11;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]11;rgb:1111/2222/3333\x1B\\", "\x1B]11;rgb:0000/0000/0000\x1B\\"]);
      });
      (0, import_test.test)("set & query cursor color", async () => {
        await ctx.proxy.write("\x1B]12;rgb:1/2/3\x07\x1B]12;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]12;rgb:1111/2222/3333\x1B\\"]);
        await ctx.proxy.write("\x1B]12;#ffffff\x07\x1B]12;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]12;rgb:1111/2222/3333\x1B\\", "\x1B]12;rgb:ffff/ffff/ffff\x1B\\"]);
      });
      (0, import_test.test)("set & query FG & BG color in one call", async () => {
        await ctx.proxy.write("\x1B]10;#123456;rgb:aa/bb/cc\x07\x1B]10;?;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]10;rgb:1212/3434/5656\x1B\\", "\x1B]11;rgb:aaaa/bbbb/cccc\x1B\\"]);
        await ctx.proxy.write("\x1B]10;#ffffff;#000000\x07");
      });
      (0, import_test.test)("OSC 110: restore FG color", async () => {
        await ctx.proxy.write("\x1B]10;rgb:1/2/3\x07\x1B]10;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]10;rgb:1111/2222/3333\x1B\\"]);
        await ctx.page.evaluate("window._recordedData.length = 0;");
        await ctx.proxy.write("\x1B]110\x07\x1B]10;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]10;rgb:ffff/ffff/ffff\x1B\\"]);
      });
      (0, import_test.test)("OSC 111: restore BG color", async () => {
        await ctx.proxy.write("\x1B]11;rgb:1/2/3\x07\x1B]11;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]11;rgb:1111/2222/3333\x1B\\"]);
        await ctx.page.evaluate("window._recordedData.length = 0;");
        await ctx.proxy.write("\x1B]111\x07\x1B]11;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]11;rgb:0000/0000/0000\x1B\\"]);
      });
      (0, import_test.test)("OSC 112: restore cursor color", async () => {
        await ctx.proxy.write("\x1B]12;rgb:1/2/3\x07\x1B]12;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]12;rgb:1111/2222/3333\x1B\\"]);
        await ctx.page.evaluate("window._recordedData.length = 0;");
        await ctx.proxy.write("\x1B]112\x07\x1B]12;?\x07");
        (0, import_assert.deepStrictEqual)(await ctx.page.evaluate("window._recordedData"), ["\x1B]12;rgb:ffff/ffff/ffff\x1B\\"]);
      });
    });
  });
  import_test.test.describe("ESC", () => {
    import_test.test.describe("DECRC: Save cursor, ESC 7", () => {
      (0, import_test.test)("should save the absolute cursor position so resizing restores to the correct position", async () => {
        await ctx.page.evaluate(`
          window.term.resize(10, 2);
          window.term.write('1\\n\\r2\\n\\r3\\n\\r4\\n\\r5');
          window.term.write('\\x1b7\\x1b[?47h');
          `);
        await ctx.page.evaluate(`
          window.term.resize(10, 4);
          window.term.write('\\x1b[?47l\\x1b8');
          `);
        await (0, import_TestUtils.pollFor)(ctx.page, () => getCursor(), { col: 1, row: 3 });
      });
    });
  });
});
async function getLinesAsArray(count, start = 0) {
  let text = "";
  for (let i = start; i < start + count; i++) {
    text += `window.term.buffer.active.getLine(${i}).translateToString(true),`;
  }
  return await ctx.page.evaluate(`[${text}]`);
}
async function simulatePaste(text) {
  const id = Math.floor(Math.random() * 1e6);
  await ctx.page.evaluate(`
            (function() {
              window.term.onData(e => window.result_${id} = e);
              const clipboardData = new DataTransfer();
              clipboardData.setData('text/plain', '${text}');
              window.term.textarea.dispatchEvent(new ClipboardEvent('paste', { clipboardData }));
            })();
          `);
  return await ctx.page.evaluate(`window.result_${id} `);
}
async function getCursor() {
  return ctx.page.evaluate(`
  (function() {
    return {col: term.buffer.active.cursorX, row: term.buffer.active.cursorY};
  })();
  `);
}
async function getDimensions() {
  const dim = await ctx.page.evaluate(`term._core._renderService.dimensions`);
  return {
    cellWidth: dim.css.cell.width.toFixed(0),
    cellHeight: dim.css.cell.height.toFixed(0),
    width: dim.css.canvas.width.toFixed(0),
    height: dim.css.canvas.height.toFixed(0)
  };
}
//# sourceMappingURL=InputHandler.test.js.map
