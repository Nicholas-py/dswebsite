"use strict";
var import_chai = require("chai");
var import_DomRendererRowFactory = require("browser/renderer/dom/DomRendererRowFactory");
var import_Constants = require("common/buffer/Constants");
var import_BufferLine = require("common/buffer/BufferLine");
var import_CellData = require("common/buffer/CellData");
var import_TestUtils = require("common/TestUtils.test");
var import_TestUtils2 = require("browser/TestUtils.test");
var import_WidthCache = require("browser/renderer/dom/WidthCache.test");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const jsdom = require("jsdom");
const dom = new jsdom.JSDOM("");
const EMPTY_WIDTH = new import_WidthCache.TestWidthCache(dom.window.document, dom.window.document.createElement("div"));
describe("DomRendererRowFactory", () => {
  let dom2;
  let rowFactory;
  let lineData;
  beforeEach(() => {
    dom2 = new jsdom.JSDOM("");
    rowFactory = new import_DomRendererRowFactory.DomRendererRowFactory(
      dom2.window.document,
      new import_TestUtils2.MockCharacterJoinerService(),
      new import_TestUtils.MockOptionsService({ drawBoldTextInBrightColors: true }),
      new import_TestUtils2.MockCoreBrowserService(),
      new import_TestUtils.MockCoreService(),
      new import_TestUtils.MockDecorationService(),
      new import_TestUtils2.MockThemeService()
    );
    lineData = createEmptyLineData(2);
  });
  describe("createRow", () => {
    it("should not create anything for an empty row", () => {
      const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        ""
      );
    });
    it("should set correct attributes for double width characters", () => {
      EMPTY_WIDTH.widths["\u8A9E"] = [10, 10, 10, 10];
      lineData.setCell(0, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "\u8A9E", 2, "\u8A9E".charCodeAt(0)]));
      lineData.setCell(1, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "", 0, 0]));
      const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        "<span>\u8A9E</span>"
      );
    });
    it("should add class for cursor and cursor style", () => {
      for (const style of ["block", "bar", "underline"]) {
        const spans = rowFactory.createRow(lineData, 0, true, style, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
        import_chai.assert.equal(
          extractHtml(spans),
          `<span class="xterm-cursor xterm-cursor-${style}"> </span>`
        );
      }
    });
    it("should add class for cursor blink", () => {
      const spans = rowFactory.createRow(lineData, 0, true, "block", void 0, 0, true, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        `<span class="xterm-cursor xterm-cursor-blink xterm-cursor-block"> </span>`
      );
    });
    it("should add class for inactive cursor", () => {
      const coreBrowserService = new import_TestUtils2.MockCoreBrowserService();
      coreBrowserService.isFocused = false;
      const rowFactory2 = new import_DomRendererRowFactory.DomRendererRowFactory(
        dom2.window.document,
        new import_TestUtils2.MockCharacterJoinerService(),
        new import_TestUtils.MockOptionsService({ drawBoldTextInBrightColors: true }),
        coreBrowserService,
        new import_TestUtils.MockCoreService(),
        new import_TestUtils.MockDecorationService(),
        new import_TestUtils2.MockThemeService()
      );
      for (const inactiveStyle of ["outline", "block", "bar", "underline", "none"]) {
        const spans = rowFactory2.createRow(lineData, 0, true, "block", inactiveStyle, 0, false, 5, EMPTY_WIDTH, -1, -1);
        if (inactiveStyle === "none") {
          import_chai.assert.equal(
            extractHtml(spans),
            `<span class="xterm-cursor"> </span>`
          );
        } else {
          import_chai.assert.equal(
            extractHtml(spans),
            `<span class="xterm-cursor xterm-cursor-${inactiveStyle}"> </span>`
          );
        }
      }
    });
    it("should not display cursor for before initializing", () => {
      const coreService = new import_TestUtils.MockCoreService();
      coreService.isCursorInitialized = false;
      const rowFactory2 = new import_DomRendererRowFactory.DomRendererRowFactory(
        dom2.window.document,
        new import_TestUtils2.MockCharacterJoinerService(),
        new import_TestUtils.MockOptionsService(),
        new import_TestUtils2.MockCoreBrowserService(),
        coreService,
        new import_TestUtils.MockDecorationService(),
        new import_TestUtils2.MockThemeService()
      );
      const spans = rowFactory2.createRow(lineData, 0, true, "block", void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        `<span> </span>`
      );
    });
    describe("attributes", () => {
      it("should add class for bold", () => {
        const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
        cell.fg = import_BufferLine.DEFAULT_ATTR_DATA.fg | import_Constants.FgFlags.BOLD;
        lineData.setCell(0, cell);
        const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
        import_chai.assert.equal(
          extractHtml(spans),
          '<span class="xterm-bold">a</span>'
        );
      });
      it("should add class for italic", () => {
        const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
        cell.bg = import_BufferLine.DEFAULT_ATTR_DATA.bg | import_Constants.BgFlags.ITALIC;
        lineData.setCell(0, cell);
        const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
        import_chai.assert.equal(
          extractHtml(spans),
          '<span class="xterm-italic">a</span>'
        );
      });
      it("should add class for dim", () => {
        const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
        cell.bg = import_BufferLine.DEFAULT_ATTR_DATA.bg | import_Constants.BgFlags.DIM;
        lineData.setCell(0, cell);
        const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
        import_chai.assert.equal(
          extractHtml(spans),
          '<span class="xterm-dim">a</span>'
        );
      });
      describe("underline", () => {
        it("should add class for straight underline style", () => {
          const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
          cell.fg = import_BufferLine.DEFAULT_ATTR_DATA.fg | import_Constants.FgFlags.UNDERLINE;
          cell.bg = import_BufferLine.DEFAULT_ATTR_DATA.bg | import_Constants.BgFlags.HAS_EXTENDED;
          cell.extended.underlineStyle = import_Constants.UnderlineStyle.SINGLE;
          lineData.setCell(0, cell);
          const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
          import_chai.assert.equal(
            extractHtml(spans),
            '<span class="xterm-underline-1">a</span>'
          );
        });
        it("should add class for double underline style", () => {
          const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
          cell.fg = import_BufferLine.DEFAULT_ATTR_DATA.fg | import_Constants.FgFlags.UNDERLINE;
          cell.bg = import_BufferLine.DEFAULT_ATTR_DATA.bg | import_Constants.BgFlags.HAS_EXTENDED;
          cell.extended.underlineStyle = import_Constants.UnderlineStyle.DOUBLE;
          lineData.setCell(0, cell);
          const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
          import_chai.assert.equal(
            extractHtml(spans),
            '<span class="xterm-underline-2">a</span>'
          );
        });
        it("should add class for curly underline style", () => {
          const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
          cell.fg = import_BufferLine.DEFAULT_ATTR_DATA.fg | import_Constants.FgFlags.UNDERLINE;
          cell.bg = import_BufferLine.DEFAULT_ATTR_DATA.bg | import_Constants.BgFlags.HAS_EXTENDED;
          cell.extended.underlineStyle = import_Constants.UnderlineStyle.CURLY;
          lineData.setCell(0, cell);
          const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
          import_chai.assert.equal(
            extractHtml(spans),
            '<span class="xterm-underline-3">a</span>'
          );
        });
        it("should add class for double dotted style", () => {
          const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
          cell.fg = import_BufferLine.DEFAULT_ATTR_DATA.fg | import_Constants.FgFlags.UNDERLINE;
          cell.bg = import_BufferLine.DEFAULT_ATTR_DATA.bg | import_Constants.BgFlags.HAS_EXTENDED;
          cell.extended.underlineStyle = import_Constants.UnderlineStyle.DOTTED;
          lineData.setCell(0, cell);
          const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
          import_chai.assert.equal(
            extractHtml(spans),
            '<span class="xterm-underline-4">a</span>'
          );
        });
        it("should add class for dashed underline style", () => {
          const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
          cell.fg = import_BufferLine.DEFAULT_ATTR_DATA.fg | import_Constants.FgFlags.UNDERLINE;
          cell.bg = import_BufferLine.DEFAULT_ATTR_DATA.bg | import_Constants.BgFlags.HAS_EXTENDED;
          cell.extended.underlineStyle = import_Constants.UnderlineStyle.DASHED;
          lineData.setCell(0, cell);
          const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
          import_chai.assert.equal(
            extractHtml(spans),
            '<span class="xterm-underline-5">a</span>'
          );
        });
      });
      it("should add class for overline", () => {
        const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
        cell.bg = import_BufferLine.DEFAULT_ATTR_DATA.bg | import_Constants.BgFlags.OVERLINE;
        lineData.setCell(0, cell);
        const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
        import_chai.assert.equal(
          extractHtml(spans),
          '<span class="xterm-overline">a</span>'
        );
      });
      it("should add class for strikethrough", () => {
        const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
        cell.fg = import_BufferLine.DEFAULT_ATTR_DATA.fg | import_Constants.FgFlags.STRIKETHROUGH;
        lineData.setCell(0, cell);
        const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
        import_chai.assert.equal(
          extractHtml(spans),
          '<span class="xterm-strikethrough">a</span>'
        );
      });
      it("should add classes for 256 foreground colors", () => {
        const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
        cell.fg |= import_Constants.Attributes.CM_P256;
        for (let i = 0; i < 256; i++) {
          cell.fg &= ~import_Constants.Attributes.PCOLOR_MASK;
          cell.fg |= i;
          lineData.setCell(0, cell);
          const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
          import_chai.assert.equal(
            extractHtml(spans),
            `<span class="xterm-fg-${i}">a</span>`
          );
        }
      });
      it("should add classes for 256 background colors", () => {
        const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
        cell.bg |= import_Constants.Attributes.CM_P256;
        for (let i = 0; i < 256; i++) {
          cell.bg &= ~import_Constants.Attributes.PCOLOR_MASK;
          cell.bg |= i;
          lineData.setCell(0, cell);
          const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
          import_chai.assert.equal(
            extractHtml(spans),
            `<span class="xterm-bg-${i}">a</span>`
          );
        }
      });
      it("should correctly invert colors", () => {
        const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
        cell.fg |= import_Constants.Attributes.CM_P16 | 2 | import_Constants.FgFlags.INVERSE;
        cell.bg |= import_Constants.Attributes.CM_P16 | 1;
        lineData.setCell(0, cell);
        const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
        import_chai.assert.equal(
          extractHtml(spans),
          '<span class="xterm-bg-2 xterm-fg-1">a</span>'
        );
      });
      it("should correctly invert default fg color", () => {
        const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
        cell.fg |= import_Constants.FgFlags.INVERSE;
        cell.bg |= import_Constants.Attributes.CM_P16 | 1;
        lineData.setCell(0, cell);
        const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
        import_chai.assert.equal(
          extractHtml(spans),
          '<span class="xterm-bg-257 xterm-fg-1">a</span>'
        );
      });
      it("should correctly invert default bg color", () => {
        const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
        cell.fg |= import_Constants.Attributes.CM_P16 | 1 | import_Constants.FgFlags.INVERSE;
        lineData.setCell(0, cell);
        const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
        import_chai.assert.equal(
          extractHtml(spans),
          '<span class="xterm-bg-1 xterm-fg-257">a</span>'
        );
      });
      it("should turn bold fg text bright", () => {
        const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
        cell.fg |= import_Constants.FgFlags.BOLD | import_Constants.Attributes.CM_P16;
        for (let i = 0; i < 8; i++) {
          cell.fg &= ~import_Constants.Attributes.PCOLOR_MASK;
          cell.fg |= i;
          lineData.setCell(0, cell);
          const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
          import_chai.assert.equal(
            extractHtml(spans),
            `<span class="xterm-bold xterm-fg-${i + 8}">a</span>`
          );
        }
      });
      it("should set style attribute for RBG", () => {
        const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
        cell.fg |= import_Constants.Attributes.CM_RGB | 1 << 16 | 2 << 8 | 3;
        cell.bg |= import_Constants.Attributes.CM_RGB | 4 << 16 | 5 << 8 | 6;
        lineData.setCell(0, cell);
        const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
        import_chai.assert.equal(
          extractHtml(spans),
          '<span style="background-color:#040506;color:#010203;">a</span>'
        );
      });
      it("should correctly invert RGB colors", () => {
        const cell = import_CellData.CellData.fromCharData([0, "a", 1, "a".charCodeAt(0)]);
        cell.fg |= import_Constants.Attributes.CM_RGB | 1 << 16 | 2 << 8 | 3 | import_Constants.FgFlags.INVERSE;
        cell.bg |= import_Constants.Attributes.CM_RGB | 4 << 16 | 5 << 8 | 6;
        lineData.setCell(0, cell);
        const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
        import_chai.assert.equal(
          extractHtml(spans),
          '<span style="background-color:#010203;color:#040506;">a</span>'
        );
      });
    });
    describe("selectionForeground", () => {
      it("should force selected cells with content to be rendered above the background", () => {
        lineData.setCell(0, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "a", 1, "a".charCodeAt(0)]));
        lineData.setCell(1, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "b", 1, "b".charCodeAt(0)]));
        rowFactory.handleSelectionChanged([1, 0], [2, 0], false);
        const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
        import_chai.assert.equal(
          extractHtml(spans),
          '<span>a</span><span style="background-color:#ff0000;" class="xterm-decoration-top">b</span>'
        );
      });
      it("should force whitespace cells to be rendered above the background", () => {
        lineData.setCell(1, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "a", 1, "a".charCodeAt(0)]));
        rowFactory.handleSelectionChanged([0, 0], [2, 0], false);
        const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
        import_chai.assert.equal(
          extractHtml(spans),
          '<span style="background-color:#ff0000;" class="xterm-decoration-top"> a</span>'
        );
      });
    });
  });
  describe("createRow with merged spans", () => {
    beforeEach(() => {
      lineData = createEmptyLineData(10);
    });
    it("should not create anything for an empty row", () => {
      const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        ""
      );
    });
    it("can merge codepoints for equal spacing", () => {
      lineData.setCell(0, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "a", 1, "a".charCodeAt(0)]));
      lineData.setCell(1, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "b", 1, "b".charCodeAt(0)]));
      lineData.setCell(2, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "c", 1, "c".charCodeAt(0)]));
      const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        "<span>abc</span>"
      );
    });
    it("should not merge codepoints with different spacing", () => {
      EMPTY_WIDTH.widths["\u20AC"] = [2, 2, 2, 2];
      lineData.setCell(0, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "a", 1, "a".charCodeAt(0)]));
      lineData.setCell(1, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "\u20AC", 1, "\u20AC".charCodeAt(0)]));
      lineData.setCell(2, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "c", 1, "c".charCodeAt(0)]));
      const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        '<span>a</span><span style="letter-spacing: 3px;">\u20AC</span><span>c</span>'
      );
    });
    it("should not merge on FG change", () => {
      const aColor1 = import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "a", 1, "a".charCodeAt(0)]);
      aColor1.fg |= import_Constants.Attributes.CM_P16 | 1;
      const bColor2 = import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "b", 1, "b".charCodeAt(0)]);
      bColor2.fg |= import_Constants.Attributes.CM_P16 | 2;
      lineData.setCell(0, aColor1);
      lineData.setCell(1, aColor1);
      lineData.setCell(2, bColor2);
      lineData.setCell(3, bColor2);
      const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        '<span class="xterm-fg-1">aa</span><span class="xterm-fg-2">bb</span>'
      );
    });
    it("should not merge cursor cell", () => {
      lineData.setCell(0, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "a", 1, "a".charCodeAt(0)]));
      lineData.setCell(1, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "a", 1, "a".charCodeAt(0)]));
      lineData.setCell(2, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "X", 1, "X".charCodeAt(0)]));
      lineData.setCell(3, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "b", 1, "b".charCodeAt(0)]));
      lineData.setCell(4, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "b", 1, "b".charCodeAt(0)]));
      const spans = rowFactory.createRow(lineData, 0, true, void 0, void 0, 2, false, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        '<span>aa</span><span class="xterm-cursor xterm-cursor-block">X</span><span>bb</span>'
      );
    });
    it("should handle BCE correctly", () => {
      const nullCell = lineData.loadCell(0, new import_CellData.CellData());
      nullCell.bg = import_Constants.Attributes.CM_P16 | 1;
      lineData.setCell(2, nullCell);
      nullCell.bg = import_Constants.Attributes.CM_P16 | 2;
      lineData.setCell(3, nullCell);
      lineData.setCell(4, nullCell);
      const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        '<span>  </span><span class="xterm-bg-1"> </span><span class="xterm-bg-2">  </span>'
      );
    });
    it("should handle BCE for multiple cells", () => {
      const nullCell = lineData.loadCell(0, new import_CellData.CellData());
      nullCell.bg = import_Constants.Attributes.CM_P16 | 1;
      lineData.setCell(0, nullCell);
      let spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        '<span class="xterm-bg-1"> </span>'
      );
      lineData.setCell(1, nullCell);
      spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        '<span class="xterm-bg-1">  </span>'
      );
      lineData.setCell(2, nullCell);
      lineData.setCell(3, nullCell);
      spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        '<span class="xterm-bg-1">    </span>'
      );
      lineData.setCell(4, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "a", 1, "a".charCodeAt(0)]));
      spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        '<span class="xterm-bg-1">    </span><span>a</span>'
      );
    });
    it("should apply correct positive or negative spacing", () => {
      EMPTY_WIDTH.widths["\u20AC"] = [2, 2, 2, 2];
      EMPTY_WIDTH.widths["\u8A9E"] = [10, 10, 10, 10];
      EMPTY_WIDTH.widths["\u{1D11E}"] = [7, 7, 7, 7];
      lineData.setCell(0, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "a", 1, "a".charCodeAt(0)]));
      lineData.setCell(1, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "\u20AC", 1, "\u20AC".charCodeAt(0)]));
      lineData.setCell(2, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "c", 1, "c".charCodeAt(0)]));
      lineData.setCell(3, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "\u8A9E", 2, "c".charCodeAt(0)]));
      lineData.setCell(4, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "\u{1D11E}", 1, "c".charCodeAt(0)]));
      const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -1, -1);
      import_chai.assert.equal(
        extractHtml(spans),
        '<span>a</span><span style="letter-spacing: 3px;">\u20AC</span><span>c\u8A9E</span><span style="letter-spacing: -2px;">\u{1D11E}</span>'
      );
    });
    it("should not merge across link borders", () => {
      lineData.setCell(0, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "a", 1, "a".charCodeAt(0)]));
      lineData.setCell(1, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "a", 1, "a".charCodeAt(0)]));
      lineData.setCell(2, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "x", 1, "x".charCodeAt(0)]));
      lineData.setCell(3, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "x", 1, "x".charCodeAt(0)]));
      lineData.setCell(4, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "x", 1, "x".charCodeAt(0)]));
      lineData.setCell(5, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "b", 1, "b".charCodeAt(0)]));
      lineData.setCell(6, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "b", 1, "b".charCodeAt(0)]));
      const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, 2, 4);
      import_chai.assert.equal(
        extractHtml(spans),
        '<span>aa</span><span style="text-decoration: underline;">xxx</span><span>bb</span>'
      );
    });
    it("empty cells included in link underline", () => {
      lineData.setCell(0, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "a", 1, "a".charCodeAt(0)]));
      lineData.setCell(1, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "a", 1, "a".charCodeAt(0)]));
      lineData.setCell(2, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "x", 1, "x".charCodeAt(0)]));
      lineData.setCell(4, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "x", 1, "x".charCodeAt(0)]));
      const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, 2, 4);
      import_chai.assert.equal(
        extractHtml(spans),
        '<span>aa</span><span style="text-decoration: underline;">x x</span>'
      );
    });
    it("link range gets capped to actual line borders", () => {
      for (let i = 0; i < 10; ++i) {
        lineData.setCell(i, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, "a", 1, "a".charCodeAt(0)]));
      }
      const spans = rowFactory.createRow(lineData, 0, false, void 0, void 0, 0, false, 5, EMPTY_WIDTH, -100, 100);
      import_chai.assert.equal(
        extractHtml(spans),
        '<span style="text-decoration: underline;">aaaaaaaaaa</span>'
      );
    });
  });
  function extractHtml(spans) {
    const element = dom2.window.document.createElement("div");
    element.replaceChildren(...spans);
    return element.innerHTML;
  }
  function createEmptyLineData(cols) {
    const lineData2 = new import_BufferLine.BufferLine(cols);
    for (let i = 0; i < cols; i++) {
      lineData2.setCell(i, import_CellData.CellData.fromCharData([import_Constants.DEFAULT_ATTR, import_Constants.NULL_CELL_CHAR, import_Constants.NULL_CELL_WIDTH, import_Constants.NULL_CELL_CODE]));
    }
    return lineData2;
  }
});
//# sourceMappingURL=DomRendererRowFactory.test.js.map
