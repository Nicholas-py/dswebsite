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
let ctx;
import_test.default.beforeAll(async ({ browser }) => {
  ctx = await (0, import_TestUtils.createTestContext)(browser);
  await (0, import_TestUtils.openTerminal)(ctx, { cols: 40 });
});
import_test.default.afterAll(async () => await ctx.page.close());
import_test.default.describe("WebLinksAddon", () => {
  import_test.default.beforeEach(async () => {
    await ctx.page.evaluate(`
      window.term.reset();
      window._linkaddon?.dispose();
    `);
    await (0, import_TestUtils.timeout)(10);
    await ctx.page.evaluate(`
      window._linkaddon = new WebLinksAddon();
      window.term.loadAddon(window._linkaddon);
    `);
  });
  const countryTlds = [
    ".ac",
    ".ad",
    ".ae",
    ".af",
    ".ag",
    ".ai",
    ".al",
    ".am",
    ".ao",
    ".aq",
    ".ar",
    ".as",
    ".at",
    ".au",
    ".aw",
    ".ax",
    ".az",
    ".ba",
    ".bb",
    ".bd",
    ".be",
    ".bf",
    ".bg",
    ".bh",
    ".bi",
    ".bj",
    ".bm",
    ".bn",
    ".bo",
    ".bq",
    ".br",
    ".bs",
    ".bt",
    ".bw",
    ".by",
    ".bz",
    ".ca",
    ".cc",
    ".cd",
    ".cf",
    ".cg",
    ".ch",
    ".ci",
    ".ck",
    ".cl",
    ".cm",
    ".cn",
    ".co",
    ".cr",
    ".cu",
    ".cv",
    ".cw",
    ".cx",
    ".cy",
    ".cz",
    ".de",
    ".dj",
    ".dk",
    ".dm",
    ".do",
    ".dz",
    ".ec",
    ".ee",
    ".eg",
    ".eh",
    ".er",
    ".es",
    ".et",
    ".eu",
    ".fi",
    ".fj",
    ".fk",
    ".fm",
    ".fo",
    ".fr",
    ".ga",
    ".gd",
    ".ge",
    ".gf",
    ".gg",
    ".gh",
    ".gi",
    ".gl",
    ".gm",
    ".gn",
    ".gp",
    ".gq",
    ".gr",
    ".gs",
    ".gt",
    ".gu",
    ".gw",
    ".gy",
    ".hk",
    ".hm",
    ".hn",
    ".hr",
    ".ht",
    ".hu",
    ".id",
    ".ie",
    ".il",
    ".im",
    ".in",
    ".io",
    ".iq",
    ".ir",
    ".is",
    ".it",
    ".je",
    ".jm",
    ".jo",
    ".jp",
    ".ke",
    ".kg",
    ".kh",
    ".ki",
    ".km",
    ".kn",
    ".kp",
    ".kr",
    ".kw",
    ".ky",
    ".kz",
    ".la",
    ".lb",
    ".lc",
    ".li",
    ".lk",
    ".lr",
    ".ls",
    ".lt",
    ".lu",
    ".lv",
    ".ly",
    ".ma",
    ".mc",
    ".md",
    ".me",
    ".mg",
    ".mh",
    ".mk",
    ".ml",
    ".mm",
    ".mn",
    ".mo",
    ".mp",
    ".mq",
    ".mr",
    ".ms",
    ".mt",
    ".mu",
    ".mv",
    ".mw",
    ".mx",
    ".my",
    ".mz",
    ".na",
    ".nc",
    ".ne",
    ".nf",
    ".ng",
    ".ni",
    ".nl",
    ".no",
    ".np",
    ".nr",
    ".nu",
    ".nz",
    ".om",
    ".pa",
    ".pe",
    ".pf",
    ".pg",
    ".ph",
    ".pk",
    ".pl",
    ".pm",
    ".pn",
    ".pr",
    ".ps",
    ".pt",
    ".pw",
    ".py",
    ".qa",
    ".re",
    ".ro",
    ".rs",
    ".ru",
    ".rw",
    ".sa",
    ".sb",
    ".sc",
    ".sd",
    ".se",
    ".sg",
    ".sh",
    ".si",
    ".sk",
    ".sl",
    ".sm",
    ".sn",
    ".so",
    ".sr",
    ".ss",
    ".st",
    ".su",
    ".sv",
    ".sx",
    ".sy",
    ".sz",
    ".tc",
    ".td",
    ".tf",
    ".tg",
    ".th",
    ".tj",
    ".tk",
    ".tl",
    ".tm",
    ".tn",
    ".to",
    ".tr",
    ".tt",
    ".tv",
    ".tw",
    ".tz",
    ".ua",
    ".ug",
    ".uk",
    ".us",
    ".uy",
    ".uz",
    ".va",
    ".vc",
    ".ve",
    ".vg",
    ".vi",
    ".vn",
    ".vu",
    ".wf",
    ".ws",
    ".ye",
    ".yt",
    ".za",
    ".zm",
    ".zw"
  ];
  for (const tld of countryTlds) {
    (0, import_test.default)(tld, async () => await testHostName(`foo${tld}`));
  }
  (0, import_test.default)(`.com`, async () => await testHostName(`foo.com`));
  for (const tld of countryTlds) {
    (0, import_test.default)(`.com${tld}`, async () => await testHostName(`foo.com${tld}`));
  }
  import_test.default.describe("correct buffer offsets & uri", () => {
    import_test.default.beforeEach(async () => {
      await ctx.page.evaluate(`
        window._linkStateData = {uri:''};
        window._linkaddon._options.hover = (event, uri, range) => { window._linkStateData = { uri, range }; };
      `);
    });
    (0, import_test.default)("all half width", async () => {
      await ctx.proxy.write("aaa http://example.com aaa http://example.com aaa");
      await resetAndHover(5, 0);
      await evalLinkStateData("http://example.com", { start: { x: 5, y: 1 }, end: { x: 22, y: 1 } });
      await resetAndHover(1, 1);
      await evalLinkStateData("http://example.com", { start: { x: 28, y: 1 }, end: { x: 5, y: 2 } });
    });
    (0, import_test.default)("url after full width", async () => {
      await ctx.proxy.write("\uFFE5\uFFE5\uFFE5 http://example.com \uFFE5\uFFE5\uFFE5 http://example.com aaa");
      await resetAndHover(8, 0);
      await evalLinkStateData("http://example.com", { start: { x: 8, y: 1 }, end: { x: 25, y: 1 } });
      await resetAndHover(1, 1);
      await evalLinkStateData("http://example.com", { start: { x: 34, y: 1 }, end: { x: 11, y: 2 } });
    });
    (0, import_test.default)("full width within url and before", async () => {
      await ctx.proxy.write("\uFFE5\uFFE5\uFFE5 https://ko.wikipedia.org/wiki/\uC704\uD0A4\uBC31\uACFC:\uB300\uBB38 aaa https://ko.wikipedia.org/wiki/\uC704\uD0A4\uBC31\uACFC:\uB300\uBB38 \uFFE5\uFFE5\uFFE5");
      await resetAndHover(8, 0);
      await evalLinkStateData("https://ko.wikipedia.org/wiki/\uC704\uD0A4\uBC31\uACFC:\uB300\uBB38", { start: { x: 8, y: 1 }, end: { x: 11, y: 2 } });
      await resetAndHover(1, 1);
      await evalLinkStateData("https://ko.wikipedia.org/wiki/\uC704\uD0A4\uBC31\uACFC:\uB300\uBB38", { start: { x: 8, y: 1 }, end: { x: 11, y: 2 } });
      await resetAndHover(17, 1);
      await evalLinkStateData("https://ko.wikipedia.org/wiki/\uC704\uD0A4\uBC31\uACFC:\uB300\uBB38", { start: { x: 17, y: 2 }, end: { x: 19, y: 3 } });
    });
    (0, import_test.default)("name + password url after full width and combining", async () => {
      await ctx.proxy.write("\uFFE5\uFFE5\uFFE5cafe\u0301 http://test:password@example.com/some_path");
      await resetAndHover(12, 0);
      await evalLinkStateData("http://test:password@example.com/some_path", { start: { x: 12, y: 1 }, end: { x: 13, y: 2 } });
      await resetAndHover(5, 1);
      await evalLinkStateData("http://test:password@example.com/some_path", { start: { x: 12, y: 1 }, end: { x: 13, y: 2 } });
    });
    (0, import_test.default)("url encoded params work properly", async () => {
      await ctx.proxy.write("\uFFE5\uFFE5\uFFE5cafe\u0301 http://test:password@example.com/some_path?param=1%202%3");
      await resetAndHover(12, 0);
      await evalLinkStateData("http://test:password@example.com/some_path?param=1%202%3", { start: { x: 12, y: 1 }, end: { x: 27, y: 2 } });
      await resetAndHover(5, 1);
      await evalLinkStateData("http://test:password@example.com/some_path?param=1%202%3", { start: { x: 12, y: 1 }, end: { x: 27, y: 2 } });
    });
  });
  (0, import_test.default)("uppercase in protocol and host, default ports", async () => {
    await ctx.proxy.write(
      `  HTTP://EXAMPLE.COM  \r
  HTTPS://Example.com  \r
  HTTP://Example.com:80  \r
  HTTP://Example.com:80/staysUpper  \r
  HTTP://Ab:xY@abc.com:80/staysUpper  \r
`
    );
    await pollForLinkAtCell(3, 0, `HTTP://EXAMPLE.COM`);
    await pollForLinkAtCell(3, 1, `HTTPS://Example.com`);
    await pollForLinkAtCell(3, 2, `HTTP://Example.com:80`);
    await pollForLinkAtCell(3, 3, `HTTP://Example.com:80/staysUpper`);
    await pollForLinkAtCell(3, 4, `HTTP://Ab:xY@abc.com:80/staysUpper`);
  });
});
async function testHostName(hostname) {
  await ctx.proxy.write(
    `  http://${hostname}  \r
  http://${hostname}/a~b#c~d?e~f  \r
  http://${hostname}/colon:test  \r
  http://${hostname}/colon:test:  \r
"http://${hostname}/"\r
'http://${hostname}/'\r
http://${hostname}/subpath/+/id`
  );
  await pollForLinkAtCell(3, 0, `http://${hostname}`);
  await pollForLinkAtCell(3, 1, `http://${hostname}/a~b#c~d?e~f`);
  await pollForLinkAtCell(3, 2, `http://${hostname}/colon:test`);
  await pollForLinkAtCell(3, 3, `http://${hostname}/colon:test`);
  await pollForLinkAtCell(2, 4, `http://${hostname}/`);
  await pollForLinkAtCell(2, 5, `http://${hostname}/`);
  await pollForLinkAtCell(1, 6, `http://${hostname}/subpath/+/id`);
}
async function pollForLinkAtCell(col, row, value) {
  await ctx.page.mouse.move(...await cellPos(col, row));
  await (0, import_TestUtils.pollFor)(ctx.page, `!!Array.from(document.querySelectorAll('.xterm-rows > :nth-child(${row + 1}) > span[style]')).filter(el => el.style.textDecoration == 'underline').length`, true);
  const text = await ctx.page.evaluate(`Array.from(document.querySelectorAll('.xterm-rows > :nth-child(${row + 1}) > span[style]')).filter(el => el.style.textDecoration == 'underline').map(el => el.textContent).join('');`);
  (0, import_assert.deepStrictEqual)(text, value);
}
async function resetAndHover(col, row) {
  await ctx.page.mouse.move(0, 0);
  await ctx.page.evaluate(`window._linkStateData = {uri:''};`);
  await new Promise((r) => setTimeout(r, 200));
  await ctx.page.mouse.move(...await cellPos(col, row));
  await (0, import_TestUtils.pollFor)(ctx.page, `!!window._linkStateData.uri.length`, true);
}
async function evalLinkStateData(uri, range) {
  const data = await ctx.page.evaluate(`window._linkStateData`);
  (0, import_assert.strictEqual)(data.uri, uri);
  (0, import_assert.deepStrictEqual)(data.range, range);
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
//# sourceMappingURL=WebLinksAddon.test.js.map
