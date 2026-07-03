"use strict";
var import_test = require("@playwright/test");
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
const width = 1280;
const height = 960;
const fontSize = 6;
const cols = 260;
const rows = 50;
const noShift = process.platform === "darwin" ? false : true;
async function resetMouseModes() {
  await ctx.proxy.write("\x1B[?9l\x1B[?1000l\x1B[?1001l\x1B[?1002l\x1B[?1003l");
  await ctx.proxy.write("\x1B[?1005l\x1B[?1006l\x1B[?1015l");
}
async function getReports(encoding) {
  const reports = await ctx.page.evaluate(`window.calls`);
  await ctx.page.evaluate(`window.calls = [];`);
  return reports.map((report) => parseReport(encoding, report));
}
async function cellPos(col, row) {
  const coords = await ctx.page.evaluate(`
    (function() {
      const rect = window.term.element.getBoundingClientRect();
      const dim = term._core._renderService.dimensions;
      return {left: rect.left, top: rect.top, bottom: rect.bottom, right: rect.right, width: dim.css.cell.width, height: dim.css.cell.height};
    })();
  `);
  return [col * coords.width + coords.left + 2, row * coords.height + coords.top + 2];
}
async function mouseMove(col, row) {
  const [xPixels, yPixels] = await cellPos(col, row);
  await ctx.page.mouse.move(xPixels, yPixels);
}
async function mouseDown(button) {
  await ctx.page.mouse.down({ button });
}
async function mouseUp(button) {
  await ctx.page.mouse.up({ button });
}
const buttons = {
  "<none>": -1,
  left: 0,
  middle: 1,
  right: 2,
  released: 3,
  wheelUp: 4,
  wheelDown: 5,
  wheelLeft: 6,
  wheelRight: 7,
  aux8: 8,
  aux9: 9,
  aux10: 10,
  aux11: 11,
  aux12: 12,
  aux13: 13,
  aux14: 14,
  aux15: 15
};
const reverseButtons = {};
for (const el in buttons) {
  reverseButtons[buttons[el]] = el;
}
function evalButtonCode(code) {
  if (code > 255) {
    return { button: "invalid", action: "invalid", modifier: {} };
  }
  const modifier = { shift: !!(code & 4), meta: !!(code & 8), control: !!(code & 16) };
  const move = code & 32;
  let button = code & 3;
  if (code & 128) {
    button |= 8;
  }
  if (code & 64) {
    button |= 4;
  }
  let actionS = "press";
  let buttonS = reverseButtons[button];
  if (button === 3) {
    buttonS = "<none>";
    actionS = "release";
  }
  if (move) {
    actionS = "move";
  } else if (4 <= button && button <= 7) {
    buttonS = "wheel";
    actionS = button === 4 ? "up" : button === 5 ? "down" : button === 6 ? "left" : "right";
  }
  return { button: buttonS, action: actionS, modifier };
}
function parseReport(encoding, msg) {
  let sReport;
  let buttonCode;
  let row;
  let col;
  const report = String.fromCharCode.apply(null, msg);
  if (!report || report[0] !== "\x1B") {
    return report;
  }
  switch (encoding) {
    case "DEFAULT":
      return {
        state: evalButtonCode(report.charCodeAt(3) - 32),
        col: report.charCodeAt(4) - 32,
        row: report.charCodeAt(5) - 32
      };
    case "SGR":
      sReport = report.slice(3, -1);
      [buttonCode, col, row] = sReport.split(";").map((el) => parseInt(el));
      const state = evalButtonCode(buttonCode);
      if (report[report.length - 1] === "m") {
        state.action = "release";
      }
      return { state, row, col };
    default:
      return {
        state: evalButtonCode(report.charCodeAt(3) - 32),
        col: report.charCodeAt(4) - 32,
        row: report.charCodeAt(5) - 32
      };
  }
}
import_test.test.describe("Mouse Tracking Tests", () => {
  import_test.test.beforeAll(async () => {
    await ctx.page.setViewportSize({ width, height });
    await ctx.page.evaluate(`
      window.term.onData(e => window.calls.push( Array.from(e).map(el => el.charCodeAt(0)) ));
      window.term.onBinary(e => window.calls.push( Array.from(e).map(el => el.charCodeAt(0)) ));
    `);
  });
  import_test.test.beforeEach(async () => {
    await ctx.page.evaluate(`
      window.calls = [];
      window.term.options.fontSize = ${fontSize};
    `);
    await ctx.proxy.resize(cols, rows);
  });
  import_test.test.describe("DECSET 9 (X10)", async () => {
    (0, import_test.test)("default encoding", async () => {
      if (ctx.browser.browserType().name() === "webkit") {
        import_test.test.skip();
        return;
      }
      const encoding = "DEFAULT";
      await resetMouseModes();
      await mouseMove(0, 0);
      await ctx.proxy.write("\x1B[?9h");
      await mouseDown("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 1, row: 1, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }]);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), []);
      await mouseMove(50, 10);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), []);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 51, row: 11, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }]);
      await mouseMove(223 - 1, rows - 1);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 223, row: rows, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }]);
      await mouseMove(257, rows - 1);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), []);
      await mouseMove(43, 24);
      await getReports(encoding);
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await mouseDown("right");
      await mouseMove(44, 24);
      await mouseUp("right");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: "press", button: "right", modifier: { control: false, shift: false, meta: false } } }]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Control");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Alt");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Shift");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Shift");
      if (noShift) {
        await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), []);
      } else {
        await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
          { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }
        ]);
      }
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Control");
      await ctx.page.keyboard.down("Alt");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }]);
    });
    (0, import_test.test)("SGR encoding", async () => {
      if (ctx.browser.browserType().name() === "webkit") {
        import_test.test.skip();
        return;
      }
      const encoding = "SGR";
      await resetMouseModes();
      await mouseMove(0, 0);
      await ctx.proxy.write("\x1B[?9h\x1B[?1006h");
      await mouseDown("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 1, row: 1, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }]);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), []);
      await mouseMove(50, 10);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), []);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 51, row: 11, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }]);
      await mouseMove(cols - 1, rows - 1);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: cols, row: rows, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await mouseDown("right");
      await mouseMove(44, 24);
      await mouseUp("right");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: "press", button: "right", modifier: { control: false, shift: false, meta: false } } }]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Control");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Alt");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Shift");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Shift");
      if (noShift) {
        await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), []);
      } else {
        await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
          { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }
        ]);
      }
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Control");
      await ctx.page.keyboard.down("Alt");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }]);
    });
  });
  import_test.test.describe("DECSET 1000 (VT200 mouse)", () => {
    (0, import_test.test)("default encoding", async () => {
      if (ctx.browser.browserType().name() === "webkit") {
        import_test.test.skip();
        return;
      }
      const encoding = "DEFAULT";
      await resetMouseModes();
      await mouseMove(0, 0);
      await ctx.proxy.write("\x1B[?1000h");
      await mouseDown("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 1, row: 1, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 1, row: 1, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(50, 10);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), []);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 51, row: 11, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 51, row: 11, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(223 - 1, rows - 1);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 223, row: rows, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 223, row: rows, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await mouseDown("right");
      await mouseMove(44, 24);
      await mouseUp("right");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "right", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Control");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: true, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: true, shift: false, meta: false } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: true, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Alt");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: true } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: false, shift: false, meta: true } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Control");
      await ctx.page.keyboard.down("Alt");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: true, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: true, shift: false, meta: true } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: true, shift: false, meta: true } } }
      ]);
    });
    (0, import_test.test)("SGR encoding", async () => {
      if (ctx.browser.browserType().name() === "webkit") {
        import_test.test.skip();
        return;
      }
      const encoding = "SGR";
      await resetMouseModes();
      await mouseMove(0, 0);
      await ctx.proxy.write("\x1B[?1000h\x1B[?1006h");
      await mouseDown("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 1, row: 1, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 1, row: 1, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(50, 10);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), []);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 51, row: 11, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 51, row: 11, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(cols - 1, rows - 1);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: cols, row: rows, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: cols, row: rows, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await mouseDown("right");
      await mouseMove(44, 24);
      await mouseUp("right");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "right", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "right", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Control");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: true, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "left", modifier: { control: true, shift: false, meta: false } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: true, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Alt");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: true } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: false, shift: false, meta: true } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Control");
      await ctx.page.keyboard.down("Alt");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: true, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "release", button: "left", modifier: { control: true, shift: false, meta: true } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: true, shift: false, meta: true } } }
      ]);
    });
  });
  import_test.test.describe("DECSET 1002 (xterm with drag)", () => {
    (0, import_test.test)("default encoding", async () => {
      if (ctx.browser.browserType().name() === "webkit") {
        import_test.test.skip();
        return;
      }
      const encoding = "DEFAULT";
      await resetMouseModes();
      await mouseMove(0, 0);
      await ctx.proxy.write("\x1B[?1002h");
      await mouseDown("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 1, row: 1, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 1, row: 1, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(50, 10);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), []);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 51, row: 11, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 51, row: 11, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(223 - 1, rows - 1);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 223, row: rows, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 223, row: rows, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await mouseDown("right");
      await mouseMove(44, 24);
      await mouseUp("right");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "right", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "move", button: "right", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Control");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: true, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: true, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: true, shift: false, meta: false } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: true, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Alt");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: false, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: true } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: false, shift: false, meta: true } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Control");
      await ctx.page.keyboard.down("Alt");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: true, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: true, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: true, shift: false, meta: true } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: true, shift: false, meta: true } } }
      ]);
    });
    (0, import_test.test)("SGR encoding", async () => {
      if (ctx.browser.browserType().name() === "webkit") {
        import_test.test.skip();
        return;
      }
      const encoding = "SGR";
      await resetMouseModes();
      await mouseMove(0, 0);
      await ctx.proxy.write("\x1B[?1002h\x1B[?1006h");
      await mouseDown("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 1, row: 1, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 1, row: 1, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(50, 10);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), []);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 51, row: 11, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 51, row: 11, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(cols - 1, rows - 1);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: cols, row: rows, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: cols, row: rows, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await mouseDown("right");
      await mouseMove(44, 24);
      await mouseUp("right");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "right", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "move", button: "right", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "right", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Control");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: true, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: true, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "left", modifier: { control: true, shift: false, meta: false } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: true, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Alt");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: false, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: true } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: false, shift: false, meta: true } } }
      ]);
      await mouseMove(43, 24);
      await getReports(encoding);
      await ctx.page.keyboard.down("Control");
      await ctx.page.keyboard.down("Alt");
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: true, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: true, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "release", button: "left", modifier: { control: true, shift: false, meta: true } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: true, shift: false, meta: true } } }
      ]);
    });
  });
  import_test.test.describe("DECSET 1003 (xterm any event)", () => {
    (0, import_test.test)("default encoding", async () => {
      if (ctx.browser.browserType().name() === "webkit") {
        import_test.test.skip();
        return;
      }
      const encoding = "DEFAULT";
      await resetMouseModes();
      await mouseMove(0, 0);
      await ctx.proxy.write("\x1B[?1003h");
      await mouseDown("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 1, row: 1, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 1, row: 1, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(50, 10);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 51, row: 11, state: { action: "move", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 51, row: 11, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 51, row: 11, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(223 - 1, rows - 1);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 223, row: rows, state: { action: "move", button: "<none>", modifier: { control: false, shift: false, meta: false } } },
        { col: 223, row: rows, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 223, row: rows, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "move", button: "<none>", modifier: { control: false, shift: false, meta: false } } },
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await mouseDown("right");
      await mouseMove(44, 24);
      await mouseUp("right");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "move", button: "<none>", modifier: { control: false, shift: false, meta: false } } },
        { col: 44, row: 25, state: { action: "press", button: "right", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "move", button: "right", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await ctx.page.keyboard.down("Control");
      await mouseMove(43, 24);
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "move", button: "<none>", modifier: { control: true, shift: false, meta: false } } },
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: true, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: true, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: true, shift: false, meta: false } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: true, shift: false, meta: false } } }
      ]);
      await ctx.page.keyboard.down("Alt");
      await mouseMove(43, 24);
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "move", button: "<none>", modifier: { control: false, shift: false, meta: true } } },
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: false, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: false, shift: false, meta: true } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: false, shift: false, meta: true } } }
      ]);
      await ctx.page.keyboard.down("Control");
      await ctx.page.keyboard.down("Alt");
      await mouseMove(43, 24);
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "move", button: "<none>", modifier: { control: true, shift: false, meta: true } } },
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: true, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: true, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "release", button: "<none>", modifier: { control: true, shift: false, meta: true } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: true, shift: false, meta: true } } }
      ]);
    });
    (0, import_test.test)("SGR encoding", async () => {
      if (ctx.browser.browserType().name() === "webkit") {
        import_test.test.skip();
        return;
      }
      const encoding = "SGR";
      await resetMouseModes();
      await mouseMove(0, 0);
      await ctx.proxy.write("\x1B[?1003h\x1B[?1006h");
      await mouseDown("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 1, row: 1, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 1, row: 1, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(50, 10);
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 51, row: 11, state: { action: "move", button: "<none>", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 51, row: 11, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 51, row: 11, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(cols - 1, rows - 1);
      await mouseDown("left");
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: cols, row: rows, state: { action: "move", button: "<none>", modifier: { control: false, shift: false, meta: false } } },
        { col: cols, row: rows, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: cols, row: rows, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "move", button: "<none>", modifier: { control: false, shift: false, meta: false } } },
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await mouseMove(43, 24);
      await mouseDown("right");
      await mouseMove(44, 24);
      await mouseUp("right");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "move", button: "<none>", modifier: { control: false, shift: false, meta: false } } },
        { col: 44, row: 25, state: { action: "press", button: "right", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "move", button: "right", modifier: { control: false, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "right", modifier: { control: false, shift: false, meta: false } } }
      ]);
      await ctx.page.keyboard.down("Control");
      await mouseMove(43, 24);
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "move", button: "<none>", modifier: { control: true, shift: false, meta: false } } },
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: true, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: true, shift: false, meta: false } } },
        { col: 45, row: 25, state: { action: "release", button: "left", modifier: { control: true, shift: false, meta: false } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: true, shift: false, meta: false } } }
      ]);
      await ctx.page.keyboard.down("Alt");
      await mouseMove(43, 24);
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "move", button: "<none>", modifier: { control: false, shift: false, meta: true } } },
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: false, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: false, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "release", button: "left", modifier: { control: false, shift: false, meta: true } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: false, shift: false, meta: true } } }
      ]);
      await ctx.page.keyboard.down("Control");
      await ctx.page.keyboard.down("Alt");
      await mouseMove(43, 24);
      await mouseDown("left");
      await mouseMove(44, 24);
      await mouseUp("left");
      await ctx.page.keyboard.up("Control");
      await ctx.page.keyboard.up("Alt");
      await (0, import_TestUtils.pollFor)(ctx.page, () => getReports(encoding), [
        { col: 44, row: 25, state: { action: "move", button: "<none>", modifier: { control: true, shift: false, meta: true } } },
        { col: 44, row: 25, state: { action: "press", button: "left", modifier: { control: true, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "move", button: "left", modifier: { control: true, shift: false, meta: true } } },
        { col: 45, row: 25, state: { action: "release", button: "left", modifier: { control: true, shift: false, meta: true } } }
        // { col: 45, row: 25, state: { action: 'down', button: 'wheel', modifier: { control: true, shift: false, meta: true } } }
      ]);
    });
  });
});
//# sourceMappingURL=MouseTracking.test.js.map
