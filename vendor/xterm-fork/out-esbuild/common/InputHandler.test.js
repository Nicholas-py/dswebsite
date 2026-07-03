"use strict";
var import_chai = require("chai");
var import_InputHandler = require("common/InputHandler");
var import_Types = require("common/Types");
var import_BufferLine = require("common/buffer/BufferLine");
var import_CellData = require("common/buffer/CellData");
var import_Constants = require("common/buffer/Constants");
var import_AttributeData = require("common/buffer/AttributeData");
var import_Params = require("common/parser/Params");
var import_TestUtils = require("common/TestUtils.test");
var import_OptionsService = require("common/services/OptionsService");
var import_Clone = require("common/Clone");
var import_BufferService = require("common/services/BufferService");
var import_CoreService = require("common/services/CoreService");
var import_OscLinkService = require("common/services/OscLinkService");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function getCursor(bufferService) {
  return [
    bufferService.buffer.x,
    bufferService.buffer.y
  ];
}
function getLines(bufferService, limit = bufferService.rows) {
  const res = [];
  for (let i = 0; i < limit; ++i) {
    const line = bufferService.buffer.lines.get(i);
    if (line) {
      res.push(line.translateToString(true));
    }
  }
  return res;
}
class TestInputHandler extends import_InputHandler.InputHandler {
  get curAttrData() {
    return this._curAttrData;
  }
  get windowTitleStack() {
    return this._windowTitleStack;
  }
  get iconNameStack() {
    return this._iconNameStack;
  }
  /**
   * Promise based parse call to await the full resolve of given input data.
   * This is useful to test async handlers in inputhandler directly.
   */
  async parseP(data) {
    let result;
    let prev;
    while (result = this.parse(data, prev)) {
      prev = await result;
    }
  }
}
describe("InputHandler", () => {
  let bufferService;
  let coreService;
  let optionsService;
  let oscLinkService;
  let inputHandler;
  beforeEach(() => {
    optionsService = new import_TestUtils.MockOptionsService();
    bufferService = new import_BufferService.BufferService(optionsService);
    bufferService.resize(80, 30);
    coreService = new import_CoreService.CoreService(bufferService, new import_TestUtils.MockLogService(), optionsService);
    oscLinkService = new import_OscLinkService.OscLinkService(bufferService);
    inputHandler = new TestInputHandler(bufferService, new import_TestUtils.MockCharsetService(), coreService, new import_TestUtils.MockLogService(), optionsService, oscLinkService, new import_TestUtils.MockCoreMouseService(), new import_TestUtils.MockUnicodeService());
  });
  describe("SL/SR/DECIC/DECDC", () => {
    beforeEach(() => {
      bufferService.resize(5, 5);
      optionsService.options.scrollback = 1;
      bufferService.reset();
    });
    it("SL (scrollLeft)", async () => {
      await inputHandler.parseP("12345".repeat(6));
      await inputHandler.parseP("\x1B[ @");
      import_chai.assert.deepEqual(getLines(bufferService, 6), ["12345", "2345", "2345", "2345", "2345", "2345"]);
      await inputHandler.parseP("\x1B[0 @");
      import_chai.assert.deepEqual(getLines(bufferService, 6), ["12345", "345", "345", "345", "345", "345"]);
      await inputHandler.parseP("\x1B[2 @");
      import_chai.assert.deepEqual(getLines(bufferService, 6), ["12345", "5", "5", "5", "5", "5"]);
    });
    it("SR (scrollRight)", async () => {
      await inputHandler.parseP("12345".repeat(6));
      await inputHandler.parseP("\x1B[ A");
      import_chai.assert.deepEqual(getLines(bufferService, 6), ["12345", " 1234", " 1234", " 1234", " 1234", " 1234"]);
      await inputHandler.parseP("\x1B[0 A");
      import_chai.assert.deepEqual(getLines(bufferService, 6), ["12345", "  123", "  123", "  123", "  123", "  123"]);
      await inputHandler.parseP("\x1B[2 A");
      import_chai.assert.deepEqual(getLines(bufferService, 6), ["12345", "    1", "    1", "    1", "    1", "    1"]);
    });
    it("insertColumns (DECIC)", async () => {
      await inputHandler.parseP("12345".repeat(6));
      await inputHandler.parseP("\x1B[3;3H");
      await inputHandler.parseP("\x1B['}");
      import_chai.assert.deepEqual(getLines(bufferService, 6), ["12345", "12 34", "12 34", "12 34", "12 34", "12 34"]);
      bufferService.reset();
      await inputHandler.parseP("12345".repeat(6));
      await inputHandler.parseP("\x1B[3;3H");
      await inputHandler.parseP("\x1B[1'}");
      import_chai.assert.deepEqual(getLines(bufferService, 6), ["12345", "12 34", "12 34", "12 34", "12 34", "12 34"]);
      bufferService.reset();
      await inputHandler.parseP("12345".repeat(6));
      await inputHandler.parseP("\x1B[3;3H");
      await inputHandler.parseP("\x1B[2'}");
      import_chai.assert.deepEqual(getLines(bufferService, 6), ["12345", "12  3", "12  3", "12  3", "12  3", "12  3"]);
    });
    it("deleteColumns (DECDC)", async () => {
      await inputHandler.parseP("12345".repeat(6));
      await inputHandler.parseP("\x1B[3;3H");
      await inputHandler.parseP("\x1B['~");
      import_chai.assert.deepEqual(getLines(bufferService, 6), ["12345", "1245", "1245", "1245", "1245", "1245"]);
      bufferService.reset();
      await inputHandler.parseP("12345".repeat(6));
      await inputHandler.parseP("\x1B[3;3H");
      await inputHandler.parseP("\x1B[1'~");
      import_chai.assert.deepEqual(getLines(bufferService, 6), ["12345", "1245", "1245", "1245", "1245", "1245"]);
      bufferService.reset();
      await inputHandler.parseP("12345".repeat(6));
      await inputHandler.parseP("\x1B[3;3H");
      await inputHandler.parseP("\x1B[2'~");
      import_chai.assert.deepEqual(getLines(bufferService, 6), ["12345", "125", "125", "125", "125", "125"]);
    });
  });
  describe("BS with reverseWraparound set/unset", () => {
    const ttyBS = "\b \b";
    beforeEach(() => {
      bufferService.resize(5, 5);
      optionsService.options.scrollback = 1;
      bufferService.reset();
    });
    describe("reverseWraparound set", () => {
      it("should not reverse outside of scroll margins", async () => {
        await inputHandler.parseP("#####abcdefghijklmnopqrstuvwxy");
        import_chai.assert.deepEqual(getLines(bufferService, 6), ["#####", "abcde", "fghij", "klmno", "pqrst", "uvwxy"]);
        import_chai.assert.equal(bufferService.buffers.active.ydisp, 1);
        import_chai.assert.equal(bufferService.buffers.active.x, 5);
        import_chai.assert.equal(bufferService.buffers.active.y, 4);
        await inputHandler.parseP(ttyBS.repeat(100));
        import_chai.assert.deepEqual(getLines(bufferService, 6), ["#####", "abcde", "fghij", "klmno", "pqrst", "    y"]);
        await inputHandler.parseP("\x1B[?45h");
        await inputHandler.parseP("uvwxy");
        await inputHandler.parseP("\x1B[2;4r");
        bufferService.buffers.active.x = 5;
        bufferService.buffers.active.y = 4;
        await inputHandler.parseP(ttyBS.repeat(100));
        import_chai.assert.deepEqual(getLines(bufferService, 6), ["#####", "abcde", "fghij", "klmno", "pqrst", "     "]);
        await inputHandler.parseP("uvwxy");
        bufferService.buffers.active.x = 5;
        bufferService.buffers.active.y = 3;
        await inputHandler.parseP(ttyBS.repeat(100));
        import_chai.assert.deepEqual(getLines(bufferService, 6), ["#####", "abcde", "     ", "     ", "     ", "uvwxy"]);
        import_chai.assert.equal(bufferService.buffers.active.x, 0);
        import_chai.assert.equal(bufferService.buffers.active.y, bufferService.buffers.active.scrollTop);
        await inputHandler.parseP("fghijklmnopqrst");
        bufferService.buffers.active.x = 5;
        bufferService.buffers.active.y = 0;
        await inputHandler.parseP(ttyBS.repeat(100));
        import_chai.assert.deepEqual(getLines(bufferService, 6), ["#####", "     ", "fghij", "klmno", "pqrst", "uvwxy"]);
      });
    });
  });
  it("save and restore cursor", () => {
    bufferService.buffer.x = 1;
    bufferService.buffer.y = 2;
    bufferService.buffer.ybase = 0;
    inputHandler.curAttrData.fg = 3;
    inputHandler.saveCursor();
    import_chai.assert.equal(bufferService.buffer.x, 1);
    import_chai.assert.equal(bufferService.buffer.y, 2);
    import_chai.assert.equal(inputHandler.curAttrData.fg, 3);
    bufferService.buffer.x = 10;
    bufferService.buffer.y = 20;
    inputHandler.curAttrData.fg = 30;
    inputHandler.restoreCursor();
    import_chai.assert.equal(bufferService.buffer.x, 1);
    import_chai.assert.equal(bufferService.buffer.y, 2);
    import_chai.assert.equal(inputHandler.curAttrData.fg, 3);
  });
  describe("setCursorStyle", () => {
    it("should call Terminal.setOption with correct params", () => {
      inputHandler.setCursorStyle(import_Params.Params.fromArray([0]));
      import_chai.assert.equal(coreService.decPrivateModes.cursorStyle, void 0);
      import_chai.assert.equal(coreService.decPrivateModes.cursorBlink, void 0);
      optionsService.options = (0, import_Clone.clone)(import_OptionsService.DEFAULT_OPTIONS);
      inputHandler.setCursorStyle(import_Params.Params.fromArray([1]));
      import_chai.assert.equal(coreService.decPrivateModes.cursorStyle, "block");
      import_chai.assert.equal(coreService.decPrivateModes.cursorBlink, true);
      optionsService.options = (0, import_Clone.clone)(import_OptionsService.DEFAULT_OPTIONS);
      inputHandler.setCursorStyle(import_Params.Params.fromArray([2]));
      import_chai.assert.equal(coreService.decPrivateModes.cursorStyle, "block");
      import_chai.assert.equal(coreService.decPrivateModes.cursorBlink, false);
      optionsService.options = (0, import_Clone.clone)(import_OptionsService.DEFAULT_OPTIONS);
      inputHandler.setCursorStyle(import_Params.Params.fromArray([3]));
      import_chai.assert.equal(coreService.decPrivateModes.cursorStyle, "underline");
      import_chai.assert.equal(coreService.decPrivateModes.cursorBlink, true);
      optionsService.options = (0, import_Clone.clone)(import_OptionsService.DEFAULT_OPTIONS);
      inputHandler.setCursorStyle(import_Params.Params.fromArray([4]));
      import_chai.assert.equal(coreService.decPrivateModes.cursorStyle, "underline");
      import_chai.assert.equal(coreService.decPrivateModes.cursorBlink, false);
      optionsService.options = (0, import_Clone.clone)(import_OptionsService.DEFAULT_OPTIONS);
      inputHandler.setCursorStyle(import_Params.Params.fromArray([5]));
      import_chai.assert.equal(coreService.decPrivateModes.cursorStyle, "bar");
      import_chai.assert.equal(coreService.decPrivateModes.cursorBlink, true);
      optionsService.options = (0, import_Clone.clone)(import_OptionsService.DEFAULT_OPTIONS);
      inputHandler.setCursorStyle(import_Params.Params.fromArray([6]));
      import_chai.assert.equal(coreService.decPrivateModes.cursorStyle, "bar");
      import_chai.assert.equal(coreService.decPrivateModes.cursorBlink, false);
    });
  });
  describe("setMode", () => {
    it("should toggle bracketedPasteMode", () => {
      const coreService2 = new import_TestUtils.MockCoreService();
      const inputHandler2 = new TestInputHandler(new import_TestUtils.MockBufferService(80, 30), new import_TestUtils.MockCharsetService(), coreService2, new import_TestUtils.MockLogService(), new import_TestUtils.MockOptionsService(), new import_TestUtils.MockOscLinkService(), new import_TestUtils.MockCoreMouseService(), new import_TestUtils.MockUnicodeService());
      inputHandler2.setModePrivate(import_Params.Params.fromArray([2004]));
      import_chai.assert.equal(coreService2.decPrivateModes.bracketedPasteMode, true);
      inputHandler2.resetModePrivate(import_Params.Params.fromArray([2004]));
      import_chai.assert.equal(coreService2.decPrivateModes.bracketedPasteMode, false);
    });
  });
  describe("regression tests", function() {
    function termContent(bufferService2, trim) {
      const result = [];
      for (let i = 0; i < bufferService2.rows; ++i) result.push(bufferService2.buffer.lines.get(i).translateToString(trim));
      return result;
    }
    it("insertChars", async () => {
      const bufferService2 = new import_TestUtils.MockBufferService(80, 30);
      const inputHandler2 = new TestInputHandler(
        bufferService2,
        new import_TestUtils.MockCharsetService(),
        new import_TestUtils.MockCoreService(),
        new import_TestUtils.MockLogService(),
        new import_TestUtils.MockOptionsService(),
        new import_TestUtils.MockOscLinkService(),
        new import_TestUtils.MockCoreMouseService(),
        new import_TestUtils.MockUnicodeService()
      );
      await inputHandler2.parseP(Array(bufferService2.cols - 9).join("a"));
      await inputHandler2.parseP("1234567890");
      await inputHandler2.parseP(Array(bufferService2.cols - 9).join("a"));
      await inputHandler2.parseP("1234567890");
      const line1 = bufferService2.buffer.lines.get(0);
      import_chai.assert.equal(line1.translateToString(false), Array(bufferService2.cols - 9).join("a") + "1234567890");
      bufferService2.buffer.y = 0;
      bufferService2.buffer.x = 70;
      inputHandler2.insertChars(import_Params.Params.fromArray([0]));
      import_chai.assert.equal(line1.translateToString(false), Array(bufferService2.cols - 9).join("a") + " 123456789");
      bufferService2.buffer.y = 0;
      bufferService2.buffer.x = 70;
      inputHandler2.insertChars(import_Params.Params.fromArray([1]));
      import_chai.assert.equal(line1.translateToString(false), Array(bufferService2.cols - 9).join("a") + "  12345678");
      bufferService2.buffer.y = 0;
      bufferService2.buffer.x = 70;
      inputHandler2.insertChars(import_Params.Params.fromArray([2]));
      import_chai.assert.equal(line1.translateToString(false), Array(bufferService2.cols - 9).join("a") + "    123456");
      bufferService2.buffer.y = 0;
      bufferService2.buffer.x = 70;
      inputHandler2.insertChars(import_Params.Params.fromArray([10]));
      import_chai.assert.equal(line1.translateToString(false), Array(bufferService2.cols - 9).join("a") + "          ");
      import_chai.assert.equal(line1.translateToString(true), Array(bufferService2.cols - 9).join("a"));
    });
    it("deleteChars", async () => {
      const bufferService2 = new import_TestUtils.MockBufferService(80, 30);
      const inputHandler2 = new TestInputHandler(
        bufferService2,
        new import_TestUtils.MockCharsetService(),
        new import_TestUtils.MockCoreService(),
        new import_TestUtils.MockLogService(),
        new import_TestUtils.MockOptionsService(),
        new import_TestUtils.MockOscLinkService(),
        new import_TestUtils.MockCoreMouseService(),
        new import_TestUtils.MockUnicodeService()
      );
      await inputHandler2.parseP(Array(bufferService2.cols - 9).join("a"));
      await inputHandler2.parseP("1234567890");
      await inputHandler2.parseP(Array(bufferService2.cols - 9).join("a"));
      await inputHandler2.parseP("1234567890");
      const line1 = bufferService2.buffer.lines.get(0);
      import_chai.assert.equal(line1.translateToString(false), Array(bufferService2.cols - 9).join("a") + "1234567890");
      bufferService2.buffer.y = 0;
      bufferService2.buffer.x = 70;
      inputHandler2.deleteChars(import_Params.Params.fromArray([0]));
      import_chai.assert.equal(line1.translateToString(false), Array(bufferService2.cols - 9).join("a") + "234567890 ");
      import_chai.assert.equal(line1.translateToString(true), Array(bufferService2.cols - 9).join("a") + "234567890");
      bufferService2.buffer.y = 0;
      bufferService2.buffer.x = 70;
      inputHandler2.deleteChars(import_Params.Params.fromArray([1]));
      import_chai.assert.equal(line1.translateToString(false), Array(bufferService2.cols - 9).join("a") + "34567890  ");
      import_chai.assert.equal(line1.translateToString(true), Array(bufferService2.cols - 9).join("a") + "34567890");
      bufferService2.buffer.y = 0;
      bufferService2.buffer.x = 70;
      inputHandler2.deleteChars(import_Params.Params.fromArray([2]));
      import_chai.assert.equal(line1.translateToString(false), Array(bufferService2.cols - 9).join("a") + "567890    ");
      import_chai.assert.equal(line1.translateToString(true), Array(bufferService2.cols - 9).join("a") + "567890");
      bufferService2.buffer.y = 0;
      bufferService2.buffer.x = 70;
      inputHandler2.deleteChars(import_Params.Params.fromArray([10]));
      import_chai.assert.equal(line1.translateToString(false), Array(bufferService2.cols - 9).join("a") + "          ");
      import_chai.assert.equal(line1.translateToString(true), Array(bufferService2.cols - 9).join("a"));
    });
    it("eraseInLine", async () => {
      const bufferService2 = new import_TestUtils.MockBufferService(80, 30);
      const inputHandler2 = new TestInputHandler(
        bufferService2,
        new import_TestUtils.MockCharsetService(),
        new import_TestUtils.MockCoreService(),
        new import_TestUtils.MockLogService(),
        new import_TestUtils.MockOptionsService(),
        new import_TestUtils.MockOscLinkService(),
        new import_TestUtils.MockCoreMouseService(),
        new import_TestUtils.MockUnicodeService()
      );
      await inputHandler2.parseP(Array(bufferService2.cols + 1).join("a"));
      await inputHandler2.parseP(Array(bufferService2.cols + 1).join("a"));
      await inputHandler2.parseP(Array(bufferService2.cols + 1).join("a"));
      bufferService2.buffer.y = 0;
      bufferService2.buffer.x = 70;
      inputHandler2.eraseInLine(import_Params.Params.fromArray([0]));
      import_chai.assert.equal(bufferService2.buffer.lines.get(0).translateToString(false), Array(71).join("a") + "          ");
      bufferService2.buffer.y = 1;
      bufferService2.buffer.x = 70;
      inputHandler2.eraseInLine(import_Params.Params.fromArray([1]));
      import_chai.assert.equal(bufferService2.buffer.lines.get(1).translateToString(false), Array(71).join(" ") + " aaaaaaaaa");
      bufferService2.buffer.y = 2;
      bufferService2.buffer.x = 70;
      inputHandler2.eraseInLine(import_Params.Params.fromArray([2]));
      import_chai.assert.equal(bufferService2.buffer.lines.get(2).translateToString(false), Array(bufferService2.cols + 1).join(" "));
    });
    it("eraseInLine reflow", async () => {
      const bufferService2 = new import_TestUtils.MockBufferService(80, 30);
      const inputHandler2 = new TestInputHandler(
        bufferService2,
        new import_TestUtils.MockCharsetService(),
        new import_TestUtils.MockCoreService(),
        new import_TestUtils.MockLogService(),
        new import_TestUtils.MockOptionsService(),
        new import_TestUtils.MockOscLinkService(),
        new import_TestUtils.MockCoreMouseService(),
        new import_TestUtils.MockUnicodeService()
      );
      const resetToBaseState = async () => {
        bufferService2.buffer.y = 0;
        bufferService2.buffer.x = 0;
        await inputHandler2.parseP(Array(bufferService2.cols + 1).join("a"));
        await inputHandler2.parseP(Array(bufferService2.cols + 10).join("a"));
        for (let i = 3; i < bufferService2.rows; ++i) await inputHandler2.parseP(Array(bufferService2.cols + 1).join("a"));
        import_chai.assert.equal(bufferService2.buffer.lines.get(2).isWrapped, true);
      };
      await resetToBaseState();
      bufferService2.buffer.y = 2;
      bufferService2.buffer.x = 40;
      inputHandler2.eraseInLine(import_Params.Params.fromArray([0]));
      import_chai.assert.equal(bufferService2.buffer.lines.get(2).isWrapped, true);
      bufferService2.buffer.y = 2;
      bufferService2.buffer.x = 0;
      inputHandler2.eraseInLine(import_Params.Params.fromArray([0]));
      import_chai.assert.equal(bufferService2.buffer.lines.get(2).isWrapped, false);
      await resetToBaseState();
      bufferService2.buffer.y = 2;
      bufferService2.buffer.x = 40;
      inputHandler2.eraseInLine(import_Params.Params.fromArray([1]));
      import_chai.assert.equal(bufferService2.buffer.lines.get(2).isWrapped, true);
      await resetToBaseState();
      bufferService2.buffer.y = 2;
      bufferService2.buffer.x = 40;
      inputHandler2.eraseInLine(import_Params.Params.fromArray([2]));
      import_chai.assert.equal(bufferService2.buffer.lines.get(2).isWrapped, false);
    });
    it("eraseInDisplay", async () => {
      const bufferService2 = new import_TestUtils.MockBufferService(80, 7);
      const inputHandler2 = new TestInputHandler(
        bufferService2,
        new import_TestUtils.MockCharsetService(),
        new import_TestUtils.MockCoreService(),
        new import_TestUtils.MockLogService(),
        new import_TestUtils.MockOptionsService(),
        new import_TestUtils.MockOscLinkService(),
        new import_TestUtils.MockCoreMouseService(),
        new import_TestUtils.MockUnicodeService()
      );
      for (let i = 0; i < bufferService2.rows; ++i) await inputHandler2.parseP(Array(bufferService2.cols + 1).join("a"));
      bufferService2.buffer.y = 5;
      bufferService2.buffer.x = 40;
      inputHandler2.eraseInDisplay(import_Params.Params.fromArray([0]));
      import_chai.assert.deepEqual(termContent(bufferService2, false), [
        Array(bufferService2.cols + 1).join("a"),
        Array(bufferService2.cols + 1).join("a"),
        Array(bufferService2.cols + 1).join("a"),
        Array(bufferService2.cols + 1).join("a"),
        Array(bufferService2.cols + 1).join("a"),
        Array(40 + 1).join("a") + Array(bufferService2.cols - 40 + 1).join(" "),
        Array(bufferService2.cols + 1).join(" ")
      ]);
      import_chai.assert.deepEqual(termContent(bufferService2, true), [
        Array(bufferService2.cols + 1).join("a"),
        Array(bufferService2.cols + 1).join("a"),
        Array(bufferService2.cols + 1).join("a"),
        Array(bufferService2.cols + 1).join("a"),
        Array(bufferService2.cols + 1).join("a"),
        Array(40 + 1).join("a"),
        ""
      ]);
      bufferService2.buffer.y = 0;
      bufferService2.buffer.x = 0;
      for (let i = 0; i < bufferService2.rows; ++i) await inputHandler2.parseP(Array(bufferService2.cols + 1).join("a"));
      bufferService2.buffer.y = 5;
      bufferService2.buffer.x = 40;
      inputHandler2.eraseInDisplay(import_Params.Params.fromArray([1]));
      import_chai.assert.deepEqual(termContent(bufferService2, false), [
        Array(bufferService2.cols + 1).join(" "),
        Array(bufferService2.cols + 1).join(" "),
        Array(bufferService2.cols + 1).join(" "),
        Array(bufferService2.cols + 1).join(" "),
        Array(bufferService2.cols + 1).join(" "),
        Array(41 + 1).join(" ") + Array(bufferService2.cols - 41 + 1).join("a"),
        Array(bufferService2.cols + 1).join("a")
      ]);
      import_chai.assert.deepEqual(termContent(bufferService2, true), [
        "",
        "",
        "",
        "",
        "",
        Array(41 + 1).join(" ") + Array(bufferService2.cols - 41 + 1).join("a"),
        Array(bufferService2.cols + 1).join("a")
      ]);
      bufferService2.buffer.y = 0;
      bufferService2.buffer.x = 0;
      for (let i = 0; i < bufferService2.rows; ++i) await inputHandler2.parseP(Array(bufferService2.cols + 1).join("a"));
      bufferService2.buffer.y = 5;
      bufferService2.buffer.x = 40;
      inputHandler2.eraseInDisplay(import_Params.Params.fromArray([2]));
      import_chai.assert.deepEqual(termContent(bufferService2, false), [
        Array(bufferService2.cols + 1).join(" "),
        Array(bufferService2.cols + 1).join(" "),
        Array(bufferService2.cols + 1).join(" "),
        Array(bufferService2.cols + 1).join(" "),
        Array(bufferService2.cols + 1).join(" "),
        Array(bufferService2.cols + 1).join(" "),
        Array(bufferService2.cols + 1).join(" ")
      ]);
      import_chai.assert.deepEqual(termContent(bufferService2, true), [
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ]);
      bufferService2.buffer.y = 0;
      bufferService2.buffer.x = 0;
      await inputHandler2.parseP(Array(bufferService2.cols + 1).join("a"));
      await inputHandler2.parseP(Array(bufferService2.cols + 10).join("a"));
      for (let i = 3; i < bufferService2.rows; ++i) await inputHandler2.parseP(Array(bufferService2.cols + 1).join("a"));
      import_chai.assert.equal(bufferService2.buffer.lines.get(2).isWrapped, true);
      bufferService2.buffer.y = 2;
      bufferService2.buffer.x = 40;
      inputHandler2.eraseInDisplay(import_Params.Params.fromArray([1]));
      import_chai.assert.equal(bufferService2.buffer.lines.get(2).isWrapped, false);
      bufferService2.buffer.y = 0;
      bufferService2.buffer.x = 0;
      await inputHandler2.parseP(Array(bufferService2.cols + 1).join("a"));
      await inputHandler2.parseP(Array(bufferService2.cols + 10).join("a"));
      for (let i = 3; i < bufferService2.rows; ++i) await inputHandler2.parseP(Array(bufferService2.cols + 1).join("a"));
      import_chai.assert.equal(bufferService2.buffer.lines.get(2).isWrapped, true);
      bufferService2.buffer.y = 1;
      bufferService2.buffer.x = 90;
      inputHandler2.eraseInDisplay(import_Params.Params.fromArray([1]));
      import_chai.assert.equal(bufferService2.buffer.lines.get(2).isWrapped, false);
    });
  });
  describe("print", () => {
    it("should not cause an infinite loop (regression test)", () => {
      const inputHandler2 = new TestInputHandler(
        new import_TestUtils.MockBufferService(80, 30),
        new import_TestUtils.MockCharsetService(),
        new import_TestUtils.MockCoreService(),
        new import_TestUtils.MockLogService(),
        new import_TestUtils.MockOptionsService(),
        new import_TestUtils.MockOscLinkService(),
        new import_TestUtils.MockCoreMouseService(),
        new import_TestUtils.MockUnicodeService()
      );
      const container = new Uint32Array(10);
      container[0] = 8203;
      inputHandler2.print(container, 0, 1);
    });
    it("should clear cells to the right on early wrap-around", async () => {
      bufferService.resize(5, 5);
      optionsService.options.scrollback = 1;
      await inputHandler.parseP("12345");
      bufferService.buffer.x = 0;
      await inputHandler.parseP("\uFFE5\uFFE5\uFFE5");
      import_chai.assert.deepEqual(getLines(bufferService, 2), ["\uFFE5\uFFE5", "\uFFE5"]);
    });
  });
  describe("alt screen", () => {
    let bufferService2;
    let handler;
    beforeEach(() => {
      bufferService2 = new import_TestUtils.MockBufferService(80, 30);
      handler = new TestInputHandler(bufferService2, new import_TestUtils.MockCharsetService(), new import_TestUtils.MockCoreService(), new import_TestUtils.MockLogService(), new import_TestUtils.MockOptionsService(), new import_TestUtils.MockOscLinkService(), new import_TestUtils.MockCoreMouseService(), new import_TestUtils.MockUnicodeService());
    });
    it("should handle DECSET/DECRST 47 (alt screen buffer)", async () => {
      await handler.parseP("\x1B[?47h\r\n\x1B[31mJUNK\x1B[?47lTEST");
      import_chai.assert.equal(bufferService2.buffer.translateBufferLineToString(0, true), "");
      import_chai.assert.equal(bufferService2.buffer.translateBufferLineToString(1, true), "    TEST");
      import_chai.assert.equal(bufferService2.buffer.lines.get(1).loadCell(4, new import_CellData.CellData()).getFgColor(), 1);
    });
    it("should handle DECSET/DECRST 1047 (alt screen buffer)", async () => {
      await handler.parseP("\x1B[?1047h\r\n\x1B[31mJUNK\x1B[?1047lTEST");
      import_chai.assert.equal(bufferService2.buffer.translateBufferLineToString(0, true), "");
      import_chai.assert.equal(bufferService2.buffer.translateBufferLineToString(1, true), "    TEST");
      import_chai.assert.equal(bufferService2.buffer.lines.get(1).loadCell(4, new import_CellData.CellData()).getFgColor(), 1);
    });
    it("should handle DECSET/DECRST 1048 (alt screen cursor)", async () => {
      await handler.parseP("\x1B[?1048h\r\n\x1B[31mJUNK\x1B[?1048lTEST");
      import_chai.assert.equal(bufferService2.buffer.translateBufferLineToString(0, true), "TEST");
      import_chai.assert.equal(bufferService2.buffer.translateBufferLineToString(1, true), "JUNK");
      import_chai.assert.equal(bufferService2.buffer.lines.get(0).loadCell(0, new import_CellData.CellData()).fg, import_BufferLine.DEFAULT_ATTR_DATA.fg);
      import_chai.assert.equal(bufferService2.buffer.lines.get(1).loadCell(0, new import_CellData.CellData()).getFgColor(), 1);
    });
    it("should handle DECSET/DECRST 1049 (alt screen buffer+cursor)", async () => {
      await handler.parseP("\x1B[?1049h\r\n\x1B[31mJUNK\x1B[?1049lTEST");
      import_chai.assert.equal(bufferService2.buffer.translateBufferLineToString(0, true), "TEST");
      import_chai.assert.equal(bufferService2.buffer.translateBufferLineToString(1, true), "");
      import_chai.assert.equal(bufferService2.buffer.lines.get(0).loadCell(0, new import_CellData.CellData()).fg, import_BufferLine.DEFAULT_ATTR_DATA.fg);
    });
    it("should handle DECSET/DECRST 1049 - maintains saved cursor for alt buffer", async () => {
      await handler.parseP("\x1B[?1049h\r\n\x1B[31m\x1B[s\x1B[?1049lTEST");
      import_chai.assert.equal(bufferService2.buffer.translateBufferLineToString(0, true), "TEST");
      import_chai.assert.equal(bufferService2.buffer.lines.get(0).loadCell(0, new import_CellData.CellData()).fg, import_BufferLine.DEFAULT_ATTR_DATA.fg);
      await handler.parseP("\x1B[?1049h\x1B[uTEST");
      import_chai.assert.equal(bufferService2.buffer.translateBufferLineToString(1, true), "TEST");
      import_chai.assert.equal(bufferService2.buffer.lines.get(1).loadCell(0, new import_CellData.CellData()).getFgColor(), 1);
    });
    it("should handle DECSET/DECRST 1049 - clears alt buffer with erase attributes", async () => {
      await handler.parseP("\x1B[42m\x1B[?1049h");
      import_chai.assert.equal(bufferService2.buffer.lines.get(20).loadCell(10, new import_CellData.CellData()).getBgColor(), 2);
    });
  });
  describe("text attributes", () => {
    it("bold", async () => {
      await inputHandler.parseP("\x1B[1m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isBold(), true);
      await inputHandler.parseP("\x1B[22m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isBold(), false);
    });
    it("dim", async () => {
      await inputHandler.parseP("\x1B[2m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isDim(), true);
      await inputHandler.parseP("\x1B[22m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isDim(), false);
    });
    it("italic", async () => {
      await inputHandler.parseP("\x1B[3m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isItalic(), true);
      await inputHandler.parseP("\x1B[23m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isItalic(), false);
    });
    it("underline", async () => {
      await inputHandler.parseP("\x1B[4m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isUnderline(), true);
      await inputHandler.parseP("\x1B[24m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isUnderline(), false);
    });
    it("blink", async () => {
      await inputHandler.parseP("\x1B[5m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isBlink(), true);
      await inputHandler.parseP("\x1B[25m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isBlink(), false);
    });
    it("inverse", async () => {
      await inputHandler.parseP("\x1B[7m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isInverse(), true);
      await inputHandler.parseP("\x1B[27m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isInverse(), false);
    });
    it("invisible", async () => {
      await inputHandler.parseP("\x1B[8m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isInvisible(), true);
      await inputHandler.parseP("\x1B[28m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isInvisible(), false);
    });
    it("strikethrough", async () => {
      await inputHandler.parseP("\x1B[9m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isStrikethrough(), true);
      await inputHandler.parseP("\x1B[29m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isStrikethrough(), false);
    });
    it("colormode palette 16", async () => {
      import_chai.assert.equal(inputHandler.curAttrData.getFgColorMode(), 0);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColorMode(), 0);
      for (let i = 0; i < 8; ++i) {
        await inputHandler.parseP(`\x1B[${i + 30};${i + 40}m`);
        import_chai.assert.equal(inputHandler.curAttrData.getFgColorMode(), import_Constants.Attributes.CM_P16);
        import_chai.assert.equal(inputHandler.curAttrData.getFgColor(), i);
        import_chai.assert.equal(inputHandler.curAttrData.getBgColorMode(), import_Constants.Attributes.CM_P16);
        import_chai.assert.equal(inputHandler.curAttrData.getBgColor(), i);
      }
      await inputHandler.parseP(`\x1B[39;49m`);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColorMode(), 0);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColorMode(), 0);
    });
    it("colormode palette 256", async () => {
      import_chai.assert.equal(inputHandler.curAttrData.getFgColorMode(), 0);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColorMode(), 0);
      for (let i = 0; i < 256; ++i) {
        await inputHandler.parseP(`\x1B[38;5;${i};48;5;${i}m`);
        import_chai.assert.equal(inputHandler.curAttrData.getFgColorMode(), import_Constants.Attributes.CM_P256);
        import_chai.assert.equal(inputHandler.curAttrData.getFgColor(), i);
        import_chai.assert.equal(inputHandler.curAttrData.getBgColorMode(), import_Constants.Attributes.CM_P256);
        import_chai.assert.equal(inputHandler.curAttrData.getBgColor(), i);
      }
      await inputHandler.parseP(`\x1B[39;49m`);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColorMode(), 0);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColor(), -1);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColorMode(), 0);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColor(), -1);
    });
    it("colormode RGB", async () => {
      import_chai.assert.equal(inputHandler.curAttrData.getFgColorMode(), 0);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColorMode(), 0);
      await inputHandler.parseP(`\x1B[38;2;1;2;3;48;2;4;5;6m`);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColorMode(), import_Constants.Attributes.CM_RGB);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColor(), 1 << 16 | 2 << 8 | 3);
      import_chai.assert.deepEqual(import_AttributeData.AttributeData.toColorRGB(inputHandler.curAttrData.getFgColor()), [1, 2, 3]);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColorMode(), import_Constants.Attributes.CM_RGB);
      import_chai.assert.deepEqual(import_AttributeData.AttributeData.toColorRGB(inputHandler.curAttrData.getBgColor()), [4, 5, 6]);
      await inputHandler.parseP(`\x1B[39;49m`);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColorMode(), 0);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColor(), -1);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColorMode(), 0);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColor(), -1);
    });
    it("colormode transition RGB to 256", async () => {
      await inputHandler.parseP(`\x1B[38;2;1;2;3;48;2;4;5;6m`);
      await inputHandler.parseP(`\x1B[38;5;255;48;5;255m`);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColorMode(), import_Constants.Attributes.CM_P256);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColor(), 255);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColorMode(), import_Constants.Attributes.CM_P256);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColor(), 255);
    });
    it("colormode transition RGB to 16", async () => {
      await inputHandler.parseP(`\x1B[38;2;1;2;3;48;2;4;5;6m`);
      await inputHandler.parseP(`\x1B[37;47m`);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColorMode(), import_Constants.Attributes.CM_P16);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColor(), 7);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColorMode(), import_Constants.Attributes.CM_P16);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColor(), 7);
    });
    it("colormode transition 16 to 256", async () => {
      await inputHandler.parseP(`\x1B[37;47m`);
      await inputHandler.parseP(`\x1B[38;5;255;48;5;255m`);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColorMode(), import_Constants.Attributes.CM_P256);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColor(), 255);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColorMode(), import_Constants.Attributes.CM_P256);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColor(), 255);
    });
    it("colormode transition 256 to 16", async () => {
      await inputHandler.parseP(`\x1B[38;5;255;48;5;255m`);
      await inputHandler.parseP(`\x1B[37;47m`);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColorMode(), import_Constants.Attributes.CM_P16);
      import_chai.assert.equal(inputHandler.curAttrData.getFgColor(), 7);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColorMode(), import_Constants.Attributes.CM_P16);
      import_chai.assert.equal(inputHandler.curAttrData.getBgColor(), 7);
    });
    it("should zero missing RGB values", async () => {
      await inputHandler.parseP(`\x1B[38;2;1;2;3m`);
      await inputHandler.parseP(`\x1B[38;2;5m`);
      import_chai.assert.deepEqual(import_AttributeData.AttributeData.toColorRGB(inputHandler.curAttrData.getFgColor()), [5, 0, 0]);
    });
  });
  describe("colon notation", () => {
    let inputHandler2;
    beforeEach(() => {
      inputHandler2 = new TestInputHandler(bufferService, new import_TestUtils.MockCharsetService(), coreService, new import_TestUtils.MockLogService(), optionsService, new import_TestUtils.MockOscLinkService(), new import_TestUtils.MockCoreMouseService(), new import_TestUtils.MockUnicodeService());
    });
    describe("should equal to semicolon", () => {
      it("CSI 38:2::50:100:150 m", async () => {
        inputHandler.curAttrData.fg = 4294967295;
        inputHandler2.curAttrData.fg = 4294967295;
        await inputHandler2.parseP("\x1B[38;2;50;100;150m");
        await inputHandler.parseP("\x1B[38:2::50:100:150m");
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 16777215, 50 << 16 | 100 << 8 | 150);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
      it("CSI 38:2::50:100: m", async () => {
        inputHandler.curAttrData.fg = 4294967295;
        inputHandler2.curAttrData.fg = 4294967295;
        await inputHandler2.parseP("\x1B[38;2;50;100;m");
        await inputHandler.parseP("\x1B[38:2::50:100:m");
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 16777215, 50 << 16 | 100 << 8 | 0);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
      it("CSI 38:2::50:: m", async () => {
        inputHandler.curAttrData.fg = 4294967295;
        inputHandler2.curAttrData.fg = 4294967295;
        await inputHandler2.parseP("\x1B[38;2;50;;m");
        await inputHandler.parseP("\x1B[38:2::50::m");
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 16777215, 50 << 16 | 0 << 8 | 0);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
      it("CSI 38:2:::: m", async () => {
        inputHandler.curAttrData.fg = 4294967295;
        inputHandler2.curAttrData.fg = 4294967295;
        await inputHandler2.parseP("\x1B[38;2;;;m");
        await inputHandler.parseP("\x1B[38:2::::m");
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 16777215, 0 << 16 | 0 << 8 | 0);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
      it("CSI 38;2::50:100:150 m", async () => {
        inputHandler.curAttrData.fg = 4294967295;
        inputHandler2.curAttrData.fg = 4294967295;
        await inputHandler2.parseP("\x1B[38;2;50;100;150m");
        await inputHandler.parseP("\x1B[38;2::50:100:150m");
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 16777215, 50 << 16 | 100 << 8 | 150);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
      it("CSI 38;2;50:100:150 m", async () => {
        inputHandler.curAttrData.fg = 4294967295;
        inputHandler2.curAttrData.fg = 4294967295;
        await inputHandler2.parseP("\x1B[38;2;50;100;150m");
        await inputHandler.parseP("\x1B[38;2;50:100:150m");
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 16777215, 50 << 16 | 100 << 8 | 150);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
      it("CSI 38;2;50;100:150 m", async () => {
        inputHandler.curAttrData.fg = 4294967295;
        inputHandler2.curAttrData.fg = 4294967295;
        await inputHandler2.parseP("\x1B[38;2;50;100;150m");
        await inputHandler.parseP("\x1B[38;2;50;100:150m");
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 16777215, 50 << 16 | 100 << 8 | 150);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
      it("CSI 38:5:50 m", async () => {
        inputHandler.curAttrData.fg = 4294967295;
        inputHandler2.curAttrData.fg = 4294967295;
        await inputHandler2.parseP("\x1B[38;5;50m");
        await inputHandler.parseP("\x1B[38:5:50m");
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 255, 50);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
      it("CSI 38:5: m", async () => {
        inputHandler.curAttrData.fg = 4294967295;
        inputHandler2.curAttrData.fg = 4294967295;
        await inputHandler2.parseP("\x1B[38;5;m");
        await inputHandler.parseP("\x1B[38:5:m");
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 255, 0);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
      it("CSI 38;5:50 m", async () => {
        inputHandler.curAttrData.fg = 4294967295;
        inputHandler2.curAttrData.fg = 4294967295;
        await inputHandler2.parseP("\x1B[38;5;50m");
        await inputHandler.parseP("\x1B[38;5:50m");
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 255, 50);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
    });
    describe("should fill early sequence end with default of 0", () => {
      it("CSI 38:2 m", async () => {
        inputHandler.curAttrData.fg = 4294967295;
        inputHandler2.curAttrData.fg = 4294967295;
        await inputHandler2.parseP("\x1B[38;2m");
        await inputHandler.parseP("\x1B[38:2m");
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 16777215, 0 << 16 | 0 << 8 | 0);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
      it("CSI 38:5 m", async () => {
        inputHandler.curAttrData.fg = 4294967295;
        inputHandler2.curAttrData.fg = 4294967295;
        await inputHandler2.parseP("\x1B[38;5m");
        await inputHandler.parseP("\x1B[38:5m");
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 255, 0);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
    });
    describe("should not interfere with leading/following SGR attrs", () => {
      it("CSI 1 ; 38:2::50:100:150 ; 4 m", async () => {
        await inputHandler2.parseP("\x1B[1;38;2;50;100;150;4m");
        await inputHandler.parseP("\x1B[1;38:2::50:100:150;4m");
        import_chai.assert.equal(!!inputHandler2.curAttrData.isBold(), true);
        import_chai.assert.equal(!!inputHandler2.curAttrData.isUnderline(), true);
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 16777215, 50 << 16 | 100 << 8 | 150);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
      it("CSI 1 ; 38:2::50:100: ; 4 m", async () => {
        await inputHandler2.parseP("\x1B[1;38;2;50;100;;4m");
        await inputHandler.parseP("\x1B[1;38:2::50:100:;4m");
        import_chai.assert.equal(!!inputHandler2.curAttrData.isBold(), true);
        import_chai.assert.equal(!!inputHandler2.curAttrData.isUnderline(), true);
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 16777215, 50 << 16 | 100 << 8 | 0);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
      it("CSI 1 ; 38:2::50:100 ; 4 m", async () => {
        await inputHandler2.parseP("\x1B[1;38;2;50;100;;4m");
        await inputHandler.parseP("\x1B[1;38:2::50:100;4m");
        import_chai.assert.equal(!!inputHandler2.curAttrData.isBold(), true);
        import_chai.assert.equal(!!inputHandler2.curAttrData.isUnderline(), true);
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 16777215, 50 << 16 | 100 << 8 | 0);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
      it("CSI 1 ; 38:2:: ; 4 m", async () => {
        await inputHandler2.parseP("\x1B[1;38;2;;;;4m");
        await inputHandler.parseP("\x1B[1;38:2::;4m");
        import_chai.assert.equal(!!inputHandler2.curAttrData.isBold(), true);
        import_chai.assert.equal(!!inputHandler2.curAttrData.isUnderline(), true);
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 16777215, 0);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
      it("CSI 1 ; 38;2:: ; 4 m", async () => {
        await inputHandler2.parseP("\x1B[1;38;2;;;;4m");
        await inputHandler.parseP("\x1B[1;38;2::;4m");
        import_chai.assert.equal(!!inputHandler2.curAttrData.isBold(), true);
        import_chai.assert.equal(!!inputHandler2.curAttrData.isUnderline(), true);
        import_chai.assert.equal(inputHandler2.curAttrData.fg & 16777215, 0);
        import_chai.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
      });
    });
  });
  describe("cursor positioning", () => {
    beforeEach(() => {
      bufferService.resize(10, 10);
    });
    it("cursor forward (CUF)", async () => {
      await inputHandler.parseP("\x1B[C");
      import_chai.assert.deepEqual(getCursor(bufferService), [1, 0]);
      await inputHandler.parseP("\x1B[1C");
      import_chai.assert.deepEqual(getCursor(bufferService), [2, 0]);
      await inputHandler.parseP("\x1B[4C");
      import_chai.assert.deepEqual(getCursor(bufferService), [6, 0]);
      await inputHandler.parseP("\x1B[100C");
      import_chai.assert.deepEqual(getCursor(bufferService), [9, 0]);
      bufferService.buffer.x = 8;
      bufferService.buffer.y = 4;
      await inputHandler.parseP("\x1B[C");
      import_chai.assert.deepEqual(getCursor(bufferService), [9, 4]);
    });
    it("cursor backward (CUB)", async () => {
      await inputHandler.parseP("\x1B[D");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      await inputHandler.parseP("\x1B[1D");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      await inputHandler.parseP("\x1B[100C");
      await inputHandler.parseP("\x1B[D");
      import_chai.assert.deepEqual(getCursor(bufferService), [8, 0]);
      await inputHandler.parseP("\x1B[1D");
      import_chai.assert.deepEqual(getCursor(bufferService), [7, 0]);
      await inputHandler.parseP("\x1B[4D");
      import_chai.assert.deepEqual(getCursor(bufferService), [3, 0]);
      await inputHandler.parseP("\x1B[100D");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      bufferService.buffer.x = 4;
      bufferService.buffer.y = 4;
      await inputHandler.parseP("\x1B[D");
      import_chai.assert.deepEqual(getCursor(bufferService), [3, 4]);
    });
    it("cursor down (CUD)", async () => {
      await inputHandler.parseP("\x1B[B");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 1]);
      await inputHandler.parseP("\x1B[1B");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 2]);
      await inputHandler.parseP("\x1B[4B");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 6]);
      await inputHandler.parseP("\x1B[100B");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 9]);
      bufferService.buffer.x = 8;
      bufferService.buffer.y = 0;
      await inputHandler.parseP("\x1B[B");
      import_chai.assert.deepEqual(getCursor(bufferService), [8, 1]);
    });
    it("cursor up (CUU)", async () => {
      await inputHandler.parseP("\x1B[A");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      await inputHandler.parseP("\x1B[1A");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      await inputHandler.parseP("\x1B[100B");
      await inputHandler.parseP("\x1B[A");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 8]);
      await inputHandler.parseP("\x1B[1A");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 7]);
      await inputHandler.parseP("\x1B[4A");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 3]);
      await inputHandler.parseP("\x1B[100A");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      bufferService.buffer.x = 8;
      bufferService.buffer.y = 9;
      await inputHandler.parseP("\x1B[A");
      import_chai.assert.deepEqual(getCursor(bufferService), [8, 8]);
    });
    it("cursor next line (CNL)", async () => {
      await inputHandler.parseP("\x1B[E");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 1]);
      await inputHandler.parseP("\x1B[1E");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 2]);
      await inputHandler.parseP("\x1B[4E");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 6]);
      await inputHandler.parseP("\x1B[100E");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 9]);
      bufferService.buffer.x = 8;
      bufferService.buffer.y = 0;
      await inputHandler.parseP("\x1B[E");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 1]);
    });
    it("cursor previous line (CPL)", async () => {
      await inputHandler.parseP("\x1B[F");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      await inputHandler.parseP("\x1B[1F");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      await inputHandler.parseP("\x1B[100E");
      await inputHandler.parseP("\x1B[F");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 8]);
      await inputHandler.parseP("\x1B[1F");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 7]);
      await inputHandler.parseP("\x1B[4F");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 3]);
      await inputHandler.parseP("\x1B[100F");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      bufferService.buffer.x = 8;
      bufferService.buffer.y = 9;
      await inputHandler.parseP("\x1B[F");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 8]);
    });
    it("cursor character absolute (CHA)", async () => {
      await inputHandler.parseP("\x1B[G");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      await inputHandler.parseP("\x1B[1G");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      await inputHandler.parseP("\x1B[2G");
      import_chai.assert.deepEqual(getCursor(bufferService), [1, 0]);
      await inputHandler.parseP("\x1B[5G");
      import_chai.assert.deepEqual(getCursor(bufferService), [4, 0]);
      await inputHandler.parseP("\x1B[100G");
      import_chai.assert.deepEqual(getCursor(bufferService), [9, 0]);
    });
    it("cursor position (CUP)", async () => {
      bufferService.buffer.x = 5;
      bufferService.buffer.y = 5;
      await inputHandler.parseP("\x1B[H");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      bufferService.buffer.x = 5;
      bufferService.buffer.y = 5;
      await inputHandler.parseP("\x1B[1H");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      bufferService.buffer.x = 5;
      bufferService.buffer.y = 5;
      await inputHandler.parseP("\x1B[1;1H");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      bufferService.buffer.x = 5;
      bufferService.buffer.y = 5;
      await inputHandler.parseP("\x1B[8H");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 7]);
      bufferService.buffer.x = 5;
      bufferService.buffer.y = 5;
      await inputHandler.parseP("\x1B[;8H");
      import_chai.assert.deepEqual(getCursor(bufferService), [7, 0]);
      bufferService.buffer.x = 5;
      bufferService.buffer.y = 5;
      await inputHandler.parseP("\x1B[100;100H");
      import_chai.assert.deepEqual(getCursor(bufferService), [9, 9]);
    });
    it("horizontal position absolute (HPA)", async () => {
      await inputHandler.parseP("\x1B[`");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      await inputHandler.parseP("\x1B[1`");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      await inputHandler.parseP("\x1B[2`");
      import_chai.assert.deepEqual(getCursor(bufferService), [1, 0]);
      await inputHandler.parseP("\x1B[5`");
      import_chai.assert.deepEqual(getCursor(bufferService), [4, 0]);
      await inputHandler.parseP("\x1B[100`");
      import_chai.assert.deepEqual(getCursor(bufferService), [9, 0]);
    });
    it("horizontal position relative (HPR)", async () => {
      await inputHandler.parseP("\x1B[a");
      import_chai.assert.deepEqual(getCursor(bufferService), [1, 0]);
      await inputHandler.parseP("\x1B[1a");
      import_chai.assert.deepEqual(getCursor(bufferService), [2, 0]);
      await inputHandler.parseP("\x1B[4a");
      import_chai.assert.deepEqual(getCursor(bufferService), [6, 0]);
      await inputHandler.parseP("\x1B[100a");
      import_chai.assert.deepEqual(getCursor(bufferService), [9, 0]);
      bufferService.buffer.x = 8;
      bufferService.buffer.y = 4;
      await inputHandler.parseP("\x1B[a");
      import_chai.assert.deepEqual(getCursor(bufferService), [9, 4]);
    });
    it("vertical position absolute (VPA)", async () => {
      await inputHandler.parseP("\x1B[d");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      await inputHandler.parseP("\x1B[1d");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      await inputHandler.parseP("\x1B[2d");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 1]);
      await inputHandler.parseP("\x1B[5d");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 4]);
      await inputHandler.parseP("\x1B[100d");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 9]);
      bufferService.buffer.x = 8;
      bufferService.buffer.y = 4;
      await inputHandler.parseP("\x1B[d");
      import_chai.assert.deepEqual(getCursor(bufferService), [8, 0]);
    });
    it("vertical position relative (VPR)", async () => {
      await inputHandler.parseP("\x1B[e");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 1]);
      await inputHandler.parseP("\x1B[1e");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 2]);
      await inputHandler.parseP("\x1B[4e");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 6]);
      await inputHandler.parseP("\x1B[100e");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 9]);
      bufferService.buffer.x = 8;
      bufferService.buffer.y = 4;
      await inputHandler.parseP("\x1B[e");
      import_chai.assert.deepEqual(getCursor(bufferService), [8, 5]);
    });
    describe("should clamp cursor into addressible range", () => {
      it("CUF", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[C");
        import_chai.assert.deepEqual(getCursor(bufferService), [9, 9]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[C");
        import_chai.assert.deepEqual(getCursor(bufferService), [1, 0]);
      });
      it("CUB", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[D");
        import_chai.assert.deepEqual(getCursor(bufferService), [8, 9]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[D");
        import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      });
      it("CUD", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[B");
        import_chai.assert.deepEqual(getCursor(bufferService), [9, 9]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[B");
        import_chai.assert.deepEqual(getCursor(bufferService), [0, 1]);
      });
      it("CUU", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[A");
        import_chai.assert.deepEqual(getCursor(bufferService), [9, 8]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[A");
        import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      });
      it("CNL", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[E");
        import_chai.assert.deepEqual(getCursor(bufferService), [0, 9]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[E");
        import_chai.assert.deepEqual(getCursor(bufferService), [0, 1]);
      });
      it("CPL", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[F");
        import_chai.assert.deepEqual(getCursor(bufferService), [0, 8]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[F");
        import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      });
      it("CHA", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[5G");
        import_chai.assert.deepEqual(getCursor(bufferService), [4, 9]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[5G");
        import_chai.assert.deepEqual(getCursor(bufferService), [4, 0]);
      });
      it("CUP", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[5;5H");
        import_chai.assert.deepEqual(getCursor(bufferService), [4, 4]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[5;5H");
        import_chai.assert.deepEqual(getCursor(bufferService), [4, 4]);
      });
      it("HPA", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[5`");
        import_chai.assert.deepEqual(getCursor(bufferService), [4, 9]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[5`");
        import_chai.assert.deepEqual(getCursor(bufferService), [4, 0]);
      });
      it("HPR", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[a");
        import_chai.assert.deepEqual(getCursor(bufferService), [9, 9]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[a");
        import_chai.assert.deepEqual(getCursor(bufferService), [1, 0]);
      });
      it("VPA", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[5d");
        import_chai.assert.deepEqual(getCursor(bufferService), [9, 4]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[5d");
        import_chai.assert.deepEqual(getCursor(bufferService), [0, 4]);
      });
      it("VPR", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[e");
        import_chai.assert.deepEqual(getCursor(bufferService), [9, 9]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[e");
        import_chai.assert.deepEqual(getCursor(bufferService), [0, 1]);
      });
      it("DCH", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[P");
        import_chai.assert.deepEqual(getCursor(bufferService), [9, 9]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[P");
        import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      });
      it("DCH - should delete last cell", async () => {
        await inputHandler.parseP("0123456789\x1B[P");
        import_chai.assert.equal(bufferService.buffer.lines.get(0).translateToString(false), "012345678 ");
      });
      it("ECH", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[X");
        import_chai.assert.deepEqual(getCursor(bufferService), [9, 9]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[X");
        import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      });
      it("ECH - should delete last cell", async () => {
        await inputHandler.parseP("0123456789\x1B[X");
        import_chai.assert.equal(bufferService.buffer.lines.get(0).translateToString(false), "012345678 ");
      });
      it("ICH", async () => {
        bufferService.buffer.x = 1e4;
        bufferService.buffer.y = 1e4;
        await inputHandler.parseP("\x1B[@");
        import_chai.assert.deepEqual(getCursor(bufferService), [9, 9]);
        bufferService.buffer.x = -1e4;
        bufferService.buffer.y = -1e4;
        await inputHandler.parseP("\x1B[@");
        import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
      });
      it("ICH - should delete last cell", async () => {
        await inputHandler.parseP("0123456789\x1B[@");
        import_chai.assert.equal(bufferService.buffer.lines.get(0).translateToString(false), "012345678 ");
      });
    });
  });
  describe("DECSTBM - scroll margins", () => {
    beforeEach(() => {
      bufferService.resize(10, 10);
    });
    it("should default to whole viewport", async () => {
      await inputHandler.parseP("\x1B[r");
      import_chai.assert.equal(bufferService.buffer.scrollTop, 0);
      import_chai.assert.equal(bufferService.buffer.scrollBottom, 9);
      await inputHandler.parseP("\x1B[3;7r");
      import_chai.assert.equal(bufferService.buffer.scrollTop, 2);
      import_chai.assert.equal(bufferService.buffer.scrollBottom, 6);
      await inputHandler.parseP("\x1B[0;0r");
      import_chai.assert.equal(bufferService.buffer.scrollTop, 0);
      import_chai.assert.equal(bufferService.buffer.scrollBottom, 9);
    });
    it("should clamp bottom", async () => {
      await inputHandler.parseP("\x1B[3;1000r");
      import_chai.assert.equal(bufferService.buffer.scrollTop, 2);
      import_chai.assert.equal(bufferService.buffer.scrollBottom, 9);
    });
    it("should only apply for top < bottom", async () => {
      await inputHandler.parseP("\x1B[7;2r");
      import_chai.assert.equal(bufferService.buffer.scrollTop, 0);
      import_chai.assert.equal(bufferService.buffer.scrollBottom, 9);
    });
    it("should home cursor", async () => {
      bufferService.buffer.x = 1e4;
      bufferService.buffer.y = 1e4;
      await inputHandler.parseP("\x1B[2;7r");
      import_chai.assert.deepEqual(getCursor(bufferService), [0, 0]);
    });
  });
  describe("scroll margins", () => {
    beforeEach(() => {
      bufferService.resize(10, 10);
    });
    it("scrollUp", async () => {
      await inputHandler.parseP("0\r\n1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n7\r\n8\r\n9\x1B[2;4r\x1B[2Sm");
      import_chai.assert.deepEqual(getLines(bufferService), ["m", "3", "", "", "4", "5", "6", "7", "8", "9"]);
    });
    it("scrollDown", async () => {
      await inputHandler.parseP("0\r\n1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n7\r\n8\r\n9\x1B[2;4r\x1B[2Tm");
      import_chai.assert.deepEqual(getLines(bufferService), ["m", "", "", "1", "4", "5", "6", "7", "8", "9"]);
    });
    it("insertLines - out of margins", async () => {
      await inputHandler.parseP("0\r\n1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n7\r\n8\r\n9\x1B[3;6r");
      import_chai.assert.equal(bufferService.buffer.scrollTop, 2);
      import_chai.assert.equal(bufferService.buffer.scrollBottom, 5);
      await inputHandler.parseP("\x1B[2Lm");
      import_chai.assert.deepEqual(getLines(bufferService), ["m", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
      await inputHandler.parseP("\x1B[2H\x1B[2Ln");
      import_chai.assert.deepEqual(getLines(bufferService), ["m", "n", "2", "3", "4", "5", "6", "7", "8", "9"]);
      await inputHandler.parseP("\x1B[7H\x1B[2Lo");
      import_chai.assert.deepEqual(getLines(bufferService), ["m", "n", "2", "3", "4", "5", "o", "7", "8", "9"]);
      await inputHandler.parseP("\x1B[8H\x1B[2Lp");
      import_chai.assert.deepEqual(getLines(bufferService), ["m", "n", "2", "3", "4", "5", "o", "p", "8", "9"]);
      await inputHandler.parseP("\x1B[100H\x1B[2Lq");
      import_chai.assert.deepEqual(getLines(bufferService), ["m", "n", "2", "3", "4", "5", "o", "p", "8", "q"]);
    });
    it("insertLines - within margins", async () => {
      await inputHandler.parseP("0\r\n1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n7\r\n8\r\n9\x1B[3;6r");
      import_chai.assert.equal(bufferService.buffer.scrollTop, 2);
      import_chai.assert.equal(bufferService.buffer.scrollBottom, 5);
      await inputHandler.parseP("\x1B[3H\x1B[2Lm");
      import_chai.assert.deepEqual(getLines(bufferService), ["0", "1", "m", "", "2", "3", "6", "7", "8", "9"]);
      await inputHandler.parseP("\x1B[6H\x1B[2Ln");
      import_chai.assert.deepEqual(getLines(bufferService), ["0", "1", "m", "", "2", "n", "6", "7", "8", "9"]);
    });
    it("deleteLines - out of margins", async () => {
      await inputHandler.parseP("0\r\n1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n7\r\n8\r\n9\x1B[3;6r");
      import_chai.assert.equal(bufferService.buffer.scrollTop, 2);
      import_chai.assert.equal(bufferService.buffer.scrollBottom, 5);
      await inputHandler.parseP("\x1B[2Mm");
      import_chai.assert.deepEqual(getLines(bufferService), ["m", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
      await inputHandler.parseP("\x1B[2H\x1B[2Mn");
      import_chai.assert.deepEqual(getLines(bufferService), ["m", "n", "2", "3", "4", "5", "6", "7", "8", "9"]);
      await inputHandler.parseP("\x1B[7H\x1B[2Mo");
      import_chai.assert.deepEqual(getLines(bufferService), ["m", "n", "2", "3", "4", "5", "o", "7", "8", "9"]);
      await inputHandler.parseP("\x1B[8H\x1B[2Mp");
      import_chai.assert.deepEqual(getLines(bufferService), ["m", "n", "2", "3", "4", "5", "o", "p", "8", "9"]);
      await inputHandler.parseP("\x1B[100H\x1B[2Mq");
      import_chai.assert.deepEqual(getLines(bufferService), ["m", "n", "2", "3", "4", "5", "o", "p", "8", "q"]);
    });
    it("deleteLines - within margins", async () => {
      await inputHandler.parseP("0\r\n1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n7\r\n8\r\n9\x1B[3;6r");
      import_chai.assert.equal(bufferService.buffer.scrollTop, 2);
      import_chai.assert.equal(bufferService.buffer.scrollBottom, 5);
      await inputHandler.parseP("\x1B[6H\x1B[2Mm");
      import_chai.assert.deepEqual(getLines(bufferService), ["0", "1", "2", "3", "4", "m", "6", "7", "8", "9"]);
      await inputHandler.parseP("\x1B[3H\x1B[2Mn");
      import_chai.assert.deepEqual(getLines(bufferService), ["0", "1", "n", "m", "", "", "6", "7", "8", "9"]);
    });
  });
  it("should parse big chunks in smaller subchunks", async () => {
    const calls = [];
    bufferService.resize(10, 10);
    inputHandler._parser.parse = (data, length) => {
      calls.push([data.length, length]);
    };
    await inputHandler.parseP("12345");
    await inputHandler.parseP("a".repeat(1e4));
    await inputHandler.parseP("a".repeat(2e5));
    await inputHandler.parseP("a".repeat(3e5));
    import_chai.assert.deepEqual(calls, [
      [4096, 5],
      [1e4, 1e4],
      [131072, 131072],
      [131072, 2e5 - 131072],
      [131072, 131072],
      [131072, 131072],
      [131072, 3e5 - 131072 - 131072]
    ]);
  });
  describe("windowOptions", () => {
    it("all should be disabled by default and not report", async () => {
      bufferService.resize(10, 10);
      const stack = [];
      coreService.onData((data) => stack.push(data));
      await inputHandler.parseP("\x1B[14t");
      await inputHandler.parseP("\x1B[16t");
      await inputHandler.parseP("\x1B[18t");
      await inputHandler.parseP("\x1B[20t");
      await inputHandler.parseP("\x1B[21t");
      import_chai.assert.deepEqual(stack, []);
    });
    it("14 - GetWinSizePixels", async () => {
      bufferService.resize(10, 10);
      optionsService.options.windowOptions.getWinSizePixels = true;
      const stack = [];
      coreService.onData((data) => stack.push(data));
      await inputHandler.parseP("\x1B[14t");
      import_chai.assert.deepEqual(stack, []);
    });
    it("16 - GetCellSizePixels", async () => {
      bufferService.resize(10, 10);
      optionsService.options.windowOptions.getCellSizePixels = true;
      const stack = [];
      coreService.onData((data) => stack.push(data));
      await inputHandler.parseP("\x1B[16t");
      import_chai.assert.deepEqual(stack, []);
    });
    it("18 - GetWinSizeChars", async () => {
      bufferService.resize(10, 10);
      optionsService.options.windowOptions.getWinSizeChars = true;
      const stack = [];
      coreService.onData((data) => stack.push(data));
      await inputHandler.parseP("\x1B[18t");
      import_chai.assert.deepEqual(stack, ["\x1B[8;10;10t"]);
      bufferService.resize(50, 20);
      await inputHandler.parseP("\x1B[18t");
      import_chai.assert.deepEqual(stack, ["\x1B[8;10;10t", "\x1B[8;20;50t"]);
    });
    it("22/23 - PushTitle/PopTitle", async () => {
      bufferService.resize(10, 10);
      optionsService.options.windowOptions.pushTitle = true;
      optionsService.options.windowOptions.popTitle = true;
      const stack = [];
      inputHandler.onTitleChange((data) => stack.push(data));
      await inputHandler.parseP("\x1B]0;1\x07");
      await inputHandler.parseP("\x1B[22t");
      await inputHandler.parseP("\x1B]0;2\x07");
      await inputHandler.parseP("\x1B[22t");
      await inputHandler.parseP("\x1B]0;3\x07");
      await inputHandler.parseP("\x1B[22t");
      import_chai.assert.deepEqual(inputHandler.windowTitleStack, ["1", "2", "3"]);
      import_chai.assert.deepEqual(inputHandler.iconNameStack, ["1", "2", "3"]);
      import_chai.assert.deepEqual(stack, ["1", "2", "3"]);
      await inputHandler.parseP("\x1B[23t");
      await inputHandler.parseP("\x1B[23t");
      await inputHandler.parseP("\x1B[23t");
      await inputHandler.parseP("\x1B[23t");
      import_chai.assert.deepEqual(inputHandler.windowTitleStack, []);
      import_chai.assert.deepEqual(inputHandler.iconNameStack, []);
      import_chai.assert.deepEqual(stack, ["1", "2", "3", "3", "2", "1"]);
    });
    it("22/23 - PushTitle/PopTitle with ;1", async () => {
      bufferService.resize(10, 10);
      optionsService.options.windowOptions.pushTitle = true;
      optionsService.options.windowOptions.popTitle = true;
      const stack = [];
      inputHandler.onTitleChange((data) => stack.push(data));
      await inputHandler.parseP("\x1B]0;1\x07");
      await inputHandler.parseP("\x1B[22;1t");
      await inputHandler.parseP("\x1B]0;2\x07");
      await inputHandler.parseP("\x1B[22;1t");
      await inputHandler.parseP("\x1B]0;3\x07");
      await inputHandler.parseP("\x1B[22;1t");
      import_chai.assert.deepEqual(inputHandler.windowTitleStack, []);
      import_chai.assert.deepEqual(inputHandler.iconNameStack, ["1", "2", "3"]);
      import_chai.assert.deepEqual(stack, ["1", "2", "3"]);
      await inputHandler.parseP("\x1B[23;1t");
      await inputHandler.parseP("\x1B[23;1t");
      await inputHandler.parseP("\x1B[23;1t");
      await inputHandler.parseP("\x1B[23;1t");
      import_chai.assert.deepEqual(inputHandler.windowTitleStack, []);
      import_chai.assert.deepEqual(inputHandler.iconNameStack, []);
      import_chai.assert.deepEqual(stack, ["1", "2", "3"]);
    });
    it("22/23 - PushTitle/PopTitle with ;2", async () => {
      bufferService.resize(10, 10);
      optionsService.options.windowOptions.pushTitle = true;
      optionsService.options.windowOptions.popTitle = true;
      const stack = [];
      inputHandler.onTitleChange((data) => stack.push(data));
      await inputHandler.parseP("\x1B]0;1\x07");
      await inputHandler.parseP("\x1B[22;2t");
      await inputHandler.parseP("\x1B]0;2\x07");
      await inputHandler.parseP("\x1B[22;2t");
      await inputHandler.parseP("\x1B]0;3\x07");
      await inputHandler.parseP("\x1B[22;2t");
      import_chai.assert.deepEqual(inputHandler.windowTitleStack, ["1", "2", "3"]);
      import_chai.assert.deepEqual(inputHandler.iconNameStack, []);
      import_chai.assert.deepEqual(stack, ["1", "2", "3"]);
      await inputHandler.parseP("\x1B[23;2t");
      await inputHandler.parseP("\x1B[23;2t");
      await inputHandler.parseP("\x1B[23;2t");
      await inputHandler.parseP("\x1B[23;2t");
      import_chai.assert.deepEqual(inputHandler.windowTitleStack, []);
      import_chai.assert.deepEqual(inputHandler.iconNameStack, []);
      import_chai.assert.deepEqual(stack, ["1", "2", "3", "3", "2", "1"]);
    });
    it('DECCOLM - should only work with "SetWinLines" (24) enabled', async () => {
      bufferService.resize(10, 10);
      await inputHandler.parseP("\x1B[?3l");
      import_chai.assert.equal(bufferService.cols, 10);
      await inputHandler.parseP("\x1B[?3h");
      import_chai.assert.equal(bufferService.cols, 10);
      inputHandler.reset();
      optionsService.options.windowOptions.setWinLines = true;
      await inputHandler.parseP("\x1B[?3l");
      import_chai.assert.equal(bufferService.cols, 80);
      await inputHandler.parseP("\x1B[?3h");
      import_chai.assert.equal(bufferService.cols, 132);
    });
  });
  describe("should correctly reset cells taken by wide chars", () => {
    beforeEach(async () => {
      bufferService.resize(10, 5);
      optionsService.options.scrollback = 1;
      await inputHandler.parseP("\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5");
    });
    it("print", async () => {
      await inputHandler.parseP("\x1B[H#");
      import_chai.assert.deepEqual(getLines(bufferService), ["# \uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("\x1B[1;6H######");
      import_chai.assert.deepEqual(getLines(bufferService), ["# \uFFE5 #####", "# \uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("#");
      import_chai.assert.deepEqual(getLines(bufferService), ["# \uFFE5 #####", "##\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("#");
      import_chai.assert.deepEqual(getLines(bufferService), ["# \uFFE5 #####", "### \uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("\x1B[3;9H#");
      import_chai.assert.deepEqual(getLines(bufferService), ["# \uFFE5 #####", "### \uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5#", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("#");
      import_chai.assert.deepEqual(getLines(bufferService), ["# \uFFE5 #####", "### \uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5##", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("#");
      import_chai.assert.deepEqual(getLines(bufferService), ["# \uFFE5 #####", "### \uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5##", "# \uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("\x1B[4;10H#");
      import_chai.assert.deepEqual(getLines(bufferService), ["# \uFFE5 #####", "### \uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5##", "# \uFFE5\uFFE5\uFFE5 #", ""]);
    });
    it("EL", async () => {
      await inputHandler.parseP("\x1B[1;6H\x1B[K#");
      import_chai.assert.deepEqual(getLines(bufferService), ["\uFFE5\uFFE5 #", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("\x1B[2;5H\x1B[1K");
      import_chai.assert.deepEqual(getLines(bufferService), ["\uFFE5\uFFE5 #", "      \uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("\x1B[3;6H\x1B[1K");
      import_chai.assert.deepEqual(getLines(bufferService), ["\uFFE5\uFFE5 #", "      \uFFE5\uFFE5", "      \uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
    });
    it("ICH", async () => {
      await inputHandler.parseP("\x1B[1;6H\x1B[@");
      import_chai.assert.deepEqual(getLines(bufferService), ["\uFFE5\uFFE5   \uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("\x1B[2;4H\x1B[2@");
      import_chai.assert.deepEqual(getLines(bufferService), ["\uFFE5\uFFE5   \uFFE5", "\uFFE5    \uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("\x1B[3;4H\x1B[3@");
      import_chai.assert.deepEqual(getLines(bufferService), ["\uFFE5\uFFE5   \uFFE5", "\uFFE5    \uFFE5\uFFE5", "\uFFE5     \uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("\x1B[4;4H\x1B[4@");
      import_chai.assert.deepEqual(getLines(bufferService), ["\uFFE5\uFFE5   \uFFE5", "\uFFE5    \uFFE5\uFFE5", "\uFFE5     \uFFE5", "\uFFE5      \uFFE5", ""]);
    });
    it("DCH", async () => {
      await inputHandler.parseP("\x1B[1;6H\x1B[P");
      import_chai.assert.deepEqual(getLines(bufferService), ["\uFFE5\uFFE5 \uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("\x1B[2;6H\x1B[2P");
      import_chai.assert.deepEqual(getLines(bufferService), ["\uFFE5\uFFE5 \uFFE5\uFFE5", "\uFFE5\uFFE5  \uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("\x1B[3;6H\x1B[3P");
      import_chai.assert.deepEqual(getLines(bufferService), ["\uFFE5\uFFE5 \uFFE5\uFFE5", "\uFFE5\uFFE5  \uFFE5", "\uFFE5\uFFE5 \uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
    });
    it("ECH", async () => {
      await inputHandler.parseP("\x1B[1;6H\x1B[X");
      import_chai.assert.deepEqual(getLines(bufferService), ["\uFFE5\uFFE5  \uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("\x1B[2;6H\x1B[2X");
      import_chai.assert.deepEqual(getLines(bufferService), ["\uFFE5\uFFE5  \uFFE5\uFFE5", "\uFFE5\uFFE5    \uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
      await inputHandler.parseP("\x1B[3;6H\x1B[3X");
      import_chai.assert.deepEqual(getLines(bufferService), ["\uFFE5\uFFE5  \uFFE5\uFFE5", "\uFFE5\uFFE5    \uFFE5", "\uFFE5\uFFE5    \uFFE5", "\uFFE5\uFFE5\uFFE5\uFFE5\uFFE5", ""]);
    });
  });
  describe("BS with reverseWraparound set/unset", () => {
    const ttyBS = "\b \b";
    beforeEach(() => {
      bufferService.resize(5, 5);
      optionsService.options.scrollback = 1;
    });
    describe("reverseWraparound unset (default)", () => {
      it("cannot delete last cell", async () => {
        await inputHandler.parseP("12345");
        await inputHandler.parseP(ttyBS);
        import_chai.assert.deepEqual(getLines(bufferService, 1), ["123 5"]);
        await inputHandler.parseP(ttyBS.repeat(10));
        import_chai.assert.deepEqual(getLines(bufferService, 1), ["    5"]);
      });
      it("cannot access prev line", async () => {
        await inputHandler.parseP("12345".repeat(2));
        await inputHandler.parseP(ttyBS);
        import_chai.assert.deepEqual(getLines(bufferService, 2), ["12345", "123 5"]);
        await inputHandler.parseP(ttyBS.repeat(10));
        import_chai.assert.deepEqual(getLines(bufferService, 2), ["12345", "    5"]);
      });
    });
    describe("reverseWraparound set", () => {
      it("can delete last cell", async () => {
        await inputHandler.parseP("\x1B[?45h");
        await inputHandler.parseP("12345");
        await inputHandler.parseP(ttyBS);
        import_chai.assert.deepEqual(getLines(bufferService, 1), ["1234 "]);
        await inputHandler.parseP(ttyBS.repeat(7));
        import_chai.assert.deepEqual(getLines(bufferService, 1), ["     "]);
      });
      it("can access prev line if wrapped", async () => {
        await inputHandler.parseP("\x1B[?45h");
        await inputHandler.parseP("12345".repeat(2));
        await inputHandler.parseP(ttyBS);
        import_chai.assert.deepEqual(getLines(bufferService, 2), ["12345", "1234 "]);
        await inputHandler.parseP(ttyBS.repeat(7));
        import_chai.assert.deepEqual(getLines(bufferService, 2), ["12   ", "     "]);
      });
      it("should lift isWrapped", async () => {
        await inputHandler.parseP("\x1B[?45h");
        await inputHandler.parseP("12345".repeat(2));
        import_chai.assert.equal(bufferService.buffer.lines.get(1)?.isWrapped, true);
        await inputHandler.parseP(ttyBS.repeat(7));
        import_chai.assert.equal(bufferService.buffer.lines.get(1)?.isWrapped, false);
      });
      it("stops at hard NLs", async () => {
        await inputHandler.parseP("\x1B[?45h");
        await inputHandler.parseP("12345\r\n");
        await inputHandler.parseP("12345".repeat(2));
        await inputHandler.parseP(ttyBS.repeat(50));
        import_chai.assert.deepEqual(getLines(bufferService, 3), ["12345", "     ", "     "]);
        import_chai.assert.equal(bufferService.buffer.x, 0);
        import_chai.assert.equal(bufferService.buffer.y, 1);
      });
      it("handles wide chars correctly", async () => {
        await inputHandler.parseP("\x1B[?45h");
        await inputHandler.parseP("\uFFE5\uFFE5\uFFE5");
        import_chai.assert.deepEqual(getLines(bufferService, 2), ["\uFFE5\uFFE5", "\uFFE5"]);
        await inputHandler.parseP(ttyBS);
        import_chai.assert.deepEqual(getLines(bufferService, 2), ["\uFFE5\uFFE5", "  "]);
        import_chai.assert.equal(bufferService.buffer.x, 1);
        await inputHandler.parseP(ttyBS);
        import_chai.assert.deepEqual(getLines(bufferService, 2), ["\uFFE5\uFFE5", "  "]);
        import_chai.assert.equal(bufferService.buffer.x, 0);
        await inputHandler.parseP(ttyBS);
        import_chai.assert.deepEqual(getLines(bufferService, 2), ["\uFFE5  ", "  "]);
        import_chai.assert.equal(bufferService.buffer.x, 3);
        await inputHandler.parseP(ttyBS);
        import_chai.assert.deepEqual(getLines(bufferService, 2), ["\uFFE5  ", "  "]);
        import_chai.assert.equal(bufferService.buffer.x, 2);
        await inputHandler.parseP(ttyBS);
        import_chai.assert.deepEqual(getLines(bufferService, 2), ["    ", "  "]);
        import_chai.assert.equal(bufferService.buffer.x, 1);
        await inputHandler.parseP(ttyBS);
        import_chai.assert.deepEqual(getLines(bufferService, 2), ["    ", "  "]);
        import_chai.assert.equal(bufferService.buffer.x, 0);
      });
    });
  });
  describe("reset text attributes (SGR 0)", () => {
    it("resets all attributes if there is no url", async () => {
      await inputHandler.parseP("\x1B[30m\x1B[40m\x1B[4m");
      import_chai.assert.notEqual(inputHandler.curAttrData.fg, 0);
      import_chai.assert.notEqual(inputHandler.curAttrData.bg, 0);
      import_chai.assert.isFalse(inputHandler.curAttrData.extended.isEmpty());
      await inputHandler.parseP("\x1B[m");
      import_chai.assert.equal(inputHandler.curAttrData.fg, 0);
      import_chai.assert.equal(inputHandler.curAttrData.bg, 0);
      import_chai.assert.isTrue(inputHandler.curAttrData.extended.isEmpty());
    });
    it("resets all attributes except for the url", async () => {
      await inputHandler.parseP("\x1B[30m\x1B[40m\x1B[4m");
      await inputHandler.parseP("\x1B]8;;http://example.com\x1B\\");
      import_chai.assert.notEqual(inputHandler.curAttrData.fg, 0);
      import_chai.assert.notEqual(inputHandler.curAttrData.bg, 0);
      import_chai.assert.notEqual(inputHandler.curAttrData.extended.ext, 0);
      const urlId = inputHandler.curAttrData.extended.urlId;
      import_chai.assert.notEqual(urlId, 0);
      await inputHandler.parseP("\x1B[m");
      import_chai.assert.equal(inputHandler.curAttrData.fg, 0);
      import_chai.assert.equal(inputHandler.curAttrData.bg, import_Constants.BgFlags.HAS_EXTENDED);
      const expectedExtended = new import_AttributeData.ExtendedAttrs();
      expectedExtended.urlId = urlId;
      import_chai.assert.deepEqual(inputHandler.curAttrData.extended, expectedExtended);
    });
  });
  describe("extended underline style support (SGR 4)", () => {
    beforeEach(() => {
      bufferService.resize(10, 5);
    });
    it("4 | 24", async () => {
      await inputHandler.parseP("\x1B[4m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.SINGLE);
      await inputHandler.parseP("\x1B[24m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
    });
    it("21 | 24", async () => {
      await inputHandler.parseP("\x1B[21m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.DOUBLE);
      await inputHandler.parseP("\x1B[24m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
    });
    it("4:1 | 4:0", async () => {
      await inputHandler.parseP("\x1B[4:1m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.SINGLE);
      await inputHandler.parseP("\x1B[4:0m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
      await inputHandler.parseP("\x1B[4:1m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.SINGLE);
      await inputHandler.parseP("\x1B[24m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
    });
    it("4:2 | 4:0", async () => {
      await inputHandler.parseP("\x1B[4:2m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.DOUBLE);
      await inputHandler.parseP("\x1B[4:0m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
      await inputHandler.parseP("\x1B[4:2m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.DOUBLE);
      await inputHandler.parseP("\x1B[24m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
    });
    it("4:3 | 4:0", async () => {
      await inputHandler.parseP("\x1B[4:3m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.CURLY);
      await inputHandler.parseP("\x1B[4:0m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
      await inputHandler.parseP("\x1B[4:3m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.CURLY);
      await inputHandler.parseP("\x1B[24m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
    });
    it("4:4 | 4:0", async () => {
      await inputHandler.parseP("\x1B[4:4m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.DOTTED);
      await inputHandler.parseP("\x1B[4:0m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
      await inputHandler.parseP("\x1B[4:4m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.DOTTED);
      await inputHandler.parseP("\x1B[24m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
    });
    it("4:5 | 4:0", async () => {
      await inputHandler.parseP("\x1B[4:5m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.DASHED);
      await inputHandler.parseP("\x1B[4:0m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
      await inputHandler.parseP("\x1B[4:5m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.DASHED);
      await inputHandler.parseP("\x1B[24m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.NONE);
    });
    it("4:x --> 4 should revert to single underline", async () => {
      await inputHandler.parseP("\x1B[4:5m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.DASHED);
      await inputHandler.parseP("\x1B[4m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), import_Constants.UnderlineStyle.SINGLE);
    });
  });
  describe("underline colors (SGR 58 & SGR 59)", () => {
    beforeEach(() => {
      bufferService.resize(10, 5);
    });
    it("defaults to FG color", async () => {
      for (const s of ["", "\x1B[30m", "\x1B[38;510m", "\x1B[38;2;1;2;3m"]) {
        await inputHandler.parseP(s);
        import_chai.assert.equal(inputHandler.curAttrData.getUnderlineColor(), inputHandler.curAttrData.getFgColor());
        import_chai.assert.equal(inputHandler.curAttrData.getUnderlineColorMode(), inputHandler.curAttrData.getFgColorMode());
        import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorRGB(), inputHandler.curAttrData.isFgRGB());
        import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorPalette(), inputHandler.curAttrData.isFgPalette());
        import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorDefault(), inputHandler.curAttrData.isFgDefault());
      }
    });
    it("correctly sets P256/RGB colors", async () => {
      await inputHandler.parseP("\x1B[4m");
      await inputHandler.parseP("\x1B[58;5;123m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineColor(), 123);
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineColorMode(), import_Constants.Attributes.CM_P256);
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorRGB(), false);
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorPalette(), true);
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorDefault(), false);
      await inputHandler.parseP("\x1B[58;2::1:2:3m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineColor(), 1 << 16 | 2 << 8 | 3);
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineColorMode(), import_Constants.Attributes.CM_RGB);
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorRGB(), true);
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorPalette(), false);
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorDefault(), false);
    });
    it("P256/RGB persistence", async () => {
      const cell = new import_CellData.CellData();
      await inputHandler.parseP("\x1B[4m");
      await inputHandler.parseP("\x1B[58;5;123m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineColor(), 123);
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineColorMode(), import_Constants.Attributes.CM_P256);
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorRGB(), false);
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorPalette(), true);
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorDefault(), false);
      await inputHandler.parseP("ab");
      bufferService.buffer.lines.get(0).loadCell(1, cell);
      import_chai.assert.equal(cell.getUnderlineColor(), 123);
      import_chai.assert.equal(cell.getUnderlineColorMode(), import_Constants.Attributes.CM_P256);
      import_chai.assert.equal(cell.isUnderlineColorRGB(), false);
      import_chai.assert.equal(cell.isUnderlineColorPalette(), true);
      import_chai.assert.equal(cell.isUnderlineColorDefault(), false);
      await inputHandler.parseP("\x1B[4:0m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineColor(), inputHandler.curAttrData.getFgColor());
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineColorMode(), inputHandler.curAttrData.getFgColorMode());
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorRGB(), inputHandler.curAttrData.isFgRGB());
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorPalette(), inputHandler.curAttrData.isFgPalette());
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorDefault(), inputHandler.curAttrData.isFgDefault());
      await inputHandler.parseP("a");
      bufferService.buffer.lines.get(0).loadCell(1, cell);
      import_chai.assert.equal(cell.getUnderlineColor(), 123);
      import_chai.assert.equal(cell.getUnderlineColorMode(), import_Constants.Attributes.CM_P256);
      import_chai.assert.equal(cell.isUnderlineColorRGB(), false);
      import_chai.assert.equal(cell.isUnderlineColorPalette(), true);
      import_chai.assert.equal(cell.isUnderlineColorDefault(), false);
      bufferService.buffer.lines.get(0).loadCell(2, cell);
      import_chai.assert.equal(cell.getUnderlineColor(), inputHandler.curAttrData.getFgColor());
      import_chai.assert.equal(cell.getUnderlineColorMode(), inputHandler.curAttrData.getFgColorMode());
      import_chai.assert.equal(cell.isUnderlineColorRGB(), inputHandler.curAttrData.isFgRGB());
      import_chai.assert.equal(cell.isUnderlineColorPalette(), inputHandler.curAttrData.isFgPalette());
      import_chai.assert.equal(cell.isUnderlineColorDefault(), inputHandler.curAttrData.isFgDefault());
      await inputHandler.parseP("\x1B[4m");
      await inputHandler.parseP("\x1B[58;2::1:2:3m");
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineColor(), 1 << 16 | 2 << 8 | 3);
      import_chai.assert.equal(inputHandler.curAttrData.getUnderlineColorMode(), import_Constants.Attributes.CM_RGB);
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorRGB(), true);
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorPalette(), false);
      import_chai.assert.equal(inputHandler.curAttrData.isUnderlineColorDefault(), false);
      await inputHandler.parseP("a");
      await inputHandler.parseP("\x1B[24m");
      bufferService.buffer.lines.get(0).loadCell(1, cell);
      import_chai.assert.equal(cell.getUnderlineColor(), 123);
      import_chai.assert.equal(cell.getUnderlineColorMode(), import_Constants.Attributes.CM_P256);
      import_chai.assert.equal(cell.isUnderlineColorRGB(), false);
      import_chai.assert.equal(cell.isUnderlineColorPalette(), true);
      import_chai.assert.equal(cell.isUnderlineColorDefault(), false);
      bufferService.buffer.lines.get(0).loadCell(3, cell);
      import_chai.assert.equal(cell.getUnderlineColor(), 1 << 16 | 2 << 8 | 3);
      import_chai.assert.equal(cell.getUnderlineColorMode(), import_Constants.Attributes.CM_RGB);
      import_chai.assert.equal(cell.isUnderlineColorRGB(), true);
      import_chai.assert.equal(cell.isUnderlineColorPalette(), false);
      import_chai.assert.equal(cell.isUnderlineColorDefault(), false);
      import_chai.assert.equal(
        bufferService.buffer.lines.get(0)._extendedAttrs[0],
        bufferService.buffer.lines.get(0)._extendedAttrs[1]
      );
      import_chai.assert.equal(bufferService.buffer.lines.get(0)._extendedAttrs[2], void 0);
      import_chai.assert.notEqual(
        bufferService.buffer.lines.get(0)._extendedAttrs[1],
        bufferService.buffer.lines.get(0)._extendedAttrs[3]
      );
    });
  });
  describe("DECSTR", () => {
    beforeEach(async () => {
      bufferService.resize(10, 5);
      optionsService.options.scrollback = 1;
      await inputHandler.parseP("01234567890123");
    });
    it("should reset IRM", async () => {
      await inputHandler.parseP("\x1B[4h");
      import_chai.assert.equal(coreService.modes.insertMode, true);
      await inputHandler.parseP("\x1B[!p");
      import_chai.assert.equal(coreService.modes.insertMode, false);
    });
    it("should reset cursor visibility", async () => {
      await inputHandler.parseP("\x1B[?25l");
      import_chai.assert.equal(coreService.isCursorHidden, true);
      await inputHandler.parseP("\x1B[!p");
      import_chai.assert.equal(coreService.isCursorHidden, false);
    });
    it("should reset scroll margins", async () => {
      await inputHandler.parseP("\x1B[2;4r");
      import_chai.assert.equal(bufferService.buffer.scrollTop, 1);
      import_chai.assert.equal(bufferService.buffer.scrollBottom, 3);
      await inputHandler.parseP("\x1B[!p");
      import_chai.assert.equal(bufferService.buffer.scrollTop, 0);
      import_chai.assert.equal(bufferService.buffer.scrollBottom, bufferService.rows - 1);
    });
    it("should reset text attributes", async () => {
      await inputHandler.parseP("\x1B[1;2;32;43m");
      import_chai.assert.equal(!!inputHandler.curAttrData.isBold(), true);
      await inputHandler.parseP("\x1B[!p");
      import_chai.assert.equal(!!inputHandler.curAttrData.isBold(), false);
      import_chai.assert.equal(inputHandler.curAttrData.fg, 0);
      import_chai.assert.equal(inputHandler.curAttrData.bg, 0);
    });
    it("should reset DECSC data", async () => {
      await inputHandler.parseP("\x1B7");
      import_chai.assert.equal(bufferService.buffer.savedX, 4);
      import_chai.assert.equal(bufferService.buffer.savedY, 1);
      await inputHandler.parseP("\x1B[!p");
      import_chai.assert.equal(bufferService.buffer.savedX, 0);
      import_chai.assert.equal(bufferService.buffer.savedY, 0);
    });
    it("should reset DECOM", async () => {
      await inputHandler.parseP("\x1B[?6h");
      import_chai.assert.equal(coreService.decPrivateModes.origin, true);
      await inputHandler.parseP("\x1B[!p");
      import_chai.assert.equal(coreService.decPrivateModes.origin, false);
    });
  });
  describe("OSC", () => {
    it("4: query color events", async () => {
      const stack = [];
      inputHandler.onColor((ev) => stack.push(ev));
      await inputHandler.parseP("\x1B]4;0;?\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.REPORT, index: 0 }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]4;123;?\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.REPORT, index: 123 }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]4;0;?;123;?\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.REPORT, index: 0 }, { type: import_Types.ColorRequestType.REPORT, index: 123 }]]);
      stack.length = 0;
    });
    it("4: set color events", async () => {
      const stack = [];
      inputHandler.onColor((ev) => stack.push(ev));
      await inputHandler.parseP("\x1B]4;0;rgb:01/02/03\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.SET, index: 0, color: [1, 2, 3] }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]4;123;#aabbcc\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.SET, index: 123, color: [170, 187, 204] }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]4;0;rgb:aa/bb/cc;123;#001122\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.SET, index: 0, color: [170, 187, 204] }, { type: import_Types.ColorRequestType.SET, index: 123, color: [0, 17, 34] }]]);
      stack.length = 0;
    });
    it("4: should ignore invalid values", async () => {
      const stack = [];
      inputHandler.onColor((ev) => stack.push(ev));
      await inputHandler.parseP("\x1B]4;0;rgb:aa/bb/cc;45;rgb:1/22/333;123;#001122\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.SET, index: 0, color: [170, 187, 204] }, { type: import_Types.ColorRequestType.SET, index: 123, color: [0, 17, 34] }]]);
      stack.length = 0;
    });
    it("8: hyperlink with id", async () => {
      await inputHandler.parseP("\x1B]8;id=100;http://localhost:3000\x07");
      import_chai.assert.notStrictEqual(inputHandler.curAttrData.extended.urlId, 0);
      import_chai.assert.deepStrictEqual(
        oscLinkService.getLinkData(inputHandler.curAttrData.extended.urlId),
        {
          id: "100",
          uri: "http://localhost:3000"
        }
      );
      await inputHandler.parseP("\x1B]8;;\x07");
      import_chai.assert.strictEqual(inputHandler.curAttrData.extended.urlId, 0);
    });
    it("8: hyperlink with semi-colon", async () => {
      await inputHandler.parseP("\x1B]8;;http://localhost:3000;abc=def\x07");
      import_chai.assert.notStrictEqual(inputHandler.curAttrData.extended.urlId, 0);
      import_chai.assert.deepStrictEqual(
        oscLinkService.getLinkData(inputHandler.curAttrData.extended.urlId),
        {
          id: void 0,
          uri: "http://localhost:3000;abc=def"
        }
      );
      await inputHandler.parseP("\x1B]8;;\x07");
      import_chai.assert.strictEqual(inputHandler.curAttrData.extended.urlId, 0);
    });
    it("104: restore events", async () => {
      const stack = [];
      inputHandler.onColor((ev) => stack.push(ev));
      await inputHandler.parseP("\x1B]104;0\x07\x1B]104;43\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.RESTORE, index: 0 }], [{ type: import_Types.ColorRequestType.RESTORE, index: 43 }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]104;0;43\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.RESTORE, index: 0 }, { type: import_Types.ColorRequestType.RESTORE, index: 43 }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]104\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.RESTORE }]]);
    });
    it("10: FG set & query events", async () => {
      const stack = [];
      inputHandler.onColor((ev) => stack.push(ev));
      await inputHandler.parseP("\x1B]10;?\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.REPORT, index: import_Types.SpecialColorIndex.FOREGROUND }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]10;?;?;?;?\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.REPORT, index: import_Types.SpecialColorIndex.FOREGROUND }], [{ type: import_Types.ColorRequestType.REPORT, index: import_Types.SpecialColorIndex.BACKGROUND }], [{ type: import_Types.ColorRequestType.REPORT, index: import_Types.SpecialColorIndex.CURSOR }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]10;rgb:01/02/03\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.SET, index: import_Types.SpecialColorIndex.FOREGROUND, color: [1, 2, 3] }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]10;#aabbcc\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.SET, index: import_Types.SpecialColorIndex.FOREGROUND, color: [170, 187, 204] }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]10;rgb:aa/bb/cc;#001122;rgb:12/34/56\x07");
      import_chai.assert.deepEqual(stack, [
        [{ type: import_Types.ColorRequestType.SET, index: import_Types.SpecialColorIndex.FOREGROUND, color: [170, 187, 204] }],
        [{ type: import_Types.ColorRequestType.SET, index: import_Types.SpecialColorIndex.BACKGROUND, color: [0, 17, 34] }],
        [{ type: import_Types.ColorRequestType.SET, index: import_Types.SpecialColorIndex.CURSOR, color: [18, 52, 86] }]
      ]);
    });
    it("110: restore FG color", async () => {
      const stack = [];
      inputHandler.onColor((ev) => stack.push(ev));
      await inputHandler.parseP("\x1B]110\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.RESTORE, index: import_Types.SpecialColorIndex.FOREGROUND }]]);
    });
    it("11: BG set & query events", async () => {
      const stack = [];
      inputHandler.onColor((ev) => stack.push(ev));
      await inputHandler.parseP("\x1B]11;?\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.REPORT, index: import_Types.SpecialColorIndex.BACKGROUND }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]11;?;?;?;?\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.REPORT, index: import_Types.SpecialColorIndex.BACKGROUND }], [{ type: import_Types.ColorRequestType.REPORT, index: import_Types.SpecialColorIndex.CURSOR }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]11;rgb:01/02/03\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.SET, index: import_Types.SpecialColorIndex.BACKGROUND, color: [1, 2, 3] }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]11;#aabbcc\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.SET, index: import_Types.SpecialColorIndex.BACKGROUND, color: [170, 187, 204] }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]11;#001122;rgb:12/34/56\x07");
      import_chai.assert.deepEqual(stack, [
        [{ type: import_Types.ColorRequestType.SET, index: import_Types.SpecialColorIndex.BACKGROUND, color: [0, 17, 34] }],
        [{ type: import_Types.ColorRequestType.SET, index: import_Types.SpecialColorIndex.CURSOR, color: [18, 52, 86] }]
      ]);
    });
    it("111: restore BG color", async () => {
      const stack = [];
      inputHandler.onColor((ev) => stack.push(ev));
      await inputHandler.parseP("\x1B]111\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.RESTORE, index: import_Types.SpecialColorIndex.BACKGROUND }]]);
    });
    it("12: cursor color set & query events", async () => {
      const stack = [];
      inputHandler.onColor((ev) => stack.push(ev));
      await inputHandler.parseP("\x1B]12;?\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.REPORT, index: import_Types.SpecialColorIndex.CURSOR }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]12;?;?;?;?\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.REPORT, index: import_Types.SpecialColorIndex.CURSOR }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]12;rgb:01/02/03\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.SET, index: import_Types.SpecialColorIndex.CURSOR, color: [1, 2, 3] }]]);
      stack.length = 0;
      await inputHandler.parseP("\x1B]12;#aabbcc\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.SET, index: import_Types.SpecialColorIndex.CURSOR, color: [170, 187, 204] }]]);
    });
    it("112: restore cursor color", async () => {
      const stack = [];
      inputHandler.onColor((ev) => stack.push(ev));
      await inputHandler.parseP("\x1B]112\x07");
      import_chai.assert.deepEqual(stack, [[{ type: import_Types.ColorRequestType.RESTORE, index: import_Types.SpecialColorIndex.CURSOR }]]);
    });
  });
  describe("EL/ED cursor at buffer.cols", () => {
    beforeEach(() => {
      bufferService.resize(10, 5);
    });
    describe("cursor should stay at cols / does not overflow", () => {
      it("EL0", async () => {
        await inputHandler.parseP("##########\x1B[0K");
        import_chai.assert.equal(bufferService.buffer.x, 10);
        import_chai.assert.deepEqual(getLines(bufferService), ["#".repeat(10), "", "", "", ""]);
      });
      it("EL1", async () => {
        await inputHandler.parseP("##########\x1B[1K");
        import_chai.assert.equal(bufferService.buffer.x, 10);
        import_chai.assert.deepEqual(getLines(bufferService), ["", "", "", "", ""]);
      });
      it("EL2", async () => {
        await inputHandler.parseP("##########\x1B[2K");
        import_chai.assert.equal(bufferService.buffer.x, 10);
        import_chai.assert.deepEqual(getLines(bufferService), ["", "", "", "", ""]);
      });
      it("ED0", async () => {
        await inputHandler.parseP("##########\x1B[0J");
        import_chai.assert.equal(bufferService.buffer.x, 10);
        import_chai.assert.deepEqual(getLines(bufferService), ["#".repeat(10), "", "", "", ""]);
      });
      it("ED1", async () => {
        await inputHandler.parseP("##########\x1B[1J");
        import_chai.assert.equal(bufferService.buffer.x, 10);
        import_chai.assert.deepEqual(getLines(bufferService), ["", "", "", "", ""]);
      });
      it("ED2", async () => {
        await inputHandler.parseP("##########\x1B[2J");
        import_chai.assert.equal(bufferService.buffer.x, 10);
        import_chai.assert.deepEqual(getLines(bufferService), ["", "", "", "", ""]);
      });
      it("ED3", async () => {
        await inputHandler.parseP("##########\x1B[3J");
        import_chai.assert.equal(bufferService.buffer.x, 10);
        import_chai.assert.deepEqual(getLines(bufferService), ["#".repeat(10), "", "", "", ""]);
      });
    });
    describe("following sequence keeps working", () => {
      const SEQ = [
        /* ICH */
        "\x1B[10@",
        /* SL */
        "\x1B[10 @",
        /* CUU */
        "\x1B[10A",
        /* SR */
        "\x1B[10 A",
        /* CUD */
        "\x1B[10B",
        /* CUF */
        "\x1B[10C",
        /* CUB */
        "\x1B[10D",
        /* CNL */
        "\x1B[10E",
        /* CPL */
        "\x1B[10F",
        /* CHA */
        "\x1B[10G",
        /* CUP */
        "\x1B[10;10H",
        /* CHT */
        "\x1B[10I",
        /* IL */
        "\x1B[10L",
        /* DL */
        "\x1B[10M",
        /* DCH */
        "\x1B[10P",
        /* SU */
        "\x1B[10S",
        /* SD */
        "\x1B[10T",
        /* ECH */
        "\x1B[10X",
        /* CBT */
        "\x1B[10Z",
        /* HPA */
        "\x1B[10`",
        /* HPR */
        "\x1B[10a",
        /* REP */
        "\x1B[10b",
        /* VPA */
        "\x1B[10d",
        /* VPR */
        "\x1B[10e",
        /* HVP */
        "\x1B[10;10f",
        /* TBC */
        "\x1B[0g",
        /* SCOSC */
        "\x1B[s",
        /* DECIC */
        "\x1B[10'}",
        /* DECDC */
        "\x1B[10'~"
      ];
      it("cursor never advances beyond cols", async () => {
        for (const seq of SEQ) {
          await inputHandler.parseP("##########\x1B[2J" + seq);
          import_chai.assert.equal(bufferService.buffer.x <= bufferService.cols, true);
          inputHandler.reset();
          bufferService.reset();
        }
      });
    });
  });
  describe("DECSCA and DECSED/DECSEL", () => {
    it("default is unprotected", async () => {
      await inputHandler.parseP("some text");
      await inputHandler.parseP("\x1B[?2K");
      import_chai.assert.deepEqual(getLines(bufferService, 2), ["", ""]);
      await inputHandler.parseP("some text");
      await inputHandler.parseP("\x1B[?2J");
      import_chai.assert.deepEqual(getLines(bufferService, 2), ["", ""]);
    });
    it("DECSCA 1 with DECSEL", async () => {
      await inputHandler.parseP('###\x1B[1"qlineerase\x1B[0"q***');
      await inputHandler.parseP("\x1B[?2K");
      import_chai.assert.deepEqual(getLines(bufferService, 2), ["   lineerase", ""]);
      await inputHandler.parseP("\x1B[2K");
      import_chai.assert.deepEqual(getLines(bufferService, 2), ["", ""]);
    });
    it("DECSCA 1 with DECSED", async () => {
      await inputHandler.parseP('###\x1B[1"qdisplayerase\x1B[0"q***');
      await inputHandler.parseP("\x1B[?2J");
      import_chai.assert.deepEqual(getLines(bufferService, 2), ["   displayerase", ""]);
      await inputHandler.parseP("\x1B[2J");
      import_chai.assert.deepEqual(getLines(bufferService, 2), ["", ""]);
    });
    it("DECRQSS reports correct DECSCA state", async () => {
      const sendStack = [];
      coreService.onData((d) => sendStack.push(d));
      await inputHandler.parseP('\x1BP$q"q\x1B\\');
      import_chai.assert.deepEqual(sendStack.pop(), '\x1BP1$r0"q\x1B\\');
      await inputHandler.parseP('###\x1B[1"q');
      await inputHandler.parseP('\x1BP$q"q\x1B\\');
      import_chai.assert.deepEqual(sendStack.pop(), '\x1BP1$r1"q\x1B\\');
      await inputHandler.parseP('###\x1B[2"q');
      await inputHandler.parseP('\x1BP$q"q\x1B\\');
      import_chai.assert.deepEqual(sendStack.pop(), '\x1BP1$r0"q\x1B\\');
    });
  });
  describe("DECRQM", () => {
    const reportStack = [];
    beforeEach(() => {
      reportStack.length = 0;
      coreService.onData((data) => reportStack.push(data));
    });
    it("ANSI 2 (keyboard action mode)", async () => {
      await inputHandler.parseP("\x1B[2$p");
      import_chai.assert.deepEqual(reportStack.pop(), "\x1B[2;4$y");
    });
    it("ANSI 4 (insert mode)", async () => {
      await inputHandler.parseP("\x1B[4$p");
      import_chai.assert.deepEqual(reportStack.pop(), "\x1B[4;2$y");
      await inputHandler.parseP("\x1B[4h");
      await inputHandler.parseP("\x1B[4$p");
      import_chai.assert.deepEqual(reportStack.pop(), "\x1B[4;1$y");
      await inputHandler.parseP("\x1B[4l");
      await inputHandler.parseP("\x1B[4$p");
      import_chai.assert.deepEqual(reportStack.pop(), "\x1B[4;2$y");
    });
    it("ANSI 12 (send/receive)", async () => {
      await inputHandler.parseP("\x1B[12$p");
      import_chai.assert.deepEqual(reportStack.pop(), "\x1B[12;3$y");
    });
    it("ANSI 20 (newline mode)", async () => {
      await inputHandler.parseP("\x1B[20$p");
      import_chai.assert.deepEqual(reportStack.pop(), "\x1B[20;2$y");
      await inputHandler.parseP("\x1B[20h");
      await inputHandler.parseP("\x1B[20$p");
      import_chai.assert.deepEqual(reportStack.pop(), "\x1B[20;1$y");
      await inputHandler.parseP("\x1B[20l");
      await inputHandler.parseP("\x1B[20$p");
      import_chai.assert.deepEqual(reportStack.pop(), "\x1B[20;2$y");
    });
    it("ANSI unknown", async () => {
      await inputHandler.parseP("\x1B[1234$p");
      import_chai.assert.deepEqual(reportStack.pop(), "\x1B[1234;0$y");
    });
    it("DEC privates with set/reset semantic", async () => {
      const reset = [1, 6, 9, 12, 45, 66, 1e3, 1002, 1003, 1004, 1006, 1016, 47, 1047, 1049, 2004];
      for (const mode of reset) {
        await inputHandler.parseP(`\x1B[?${mode}$p`);
        import_chai.assert.deepEqual(reportStack.pop(), `\x1B[?${mode};2$y`);
        await inputHandler.parseP(`\x1B[?${mode}h`);
        await inputHandler.parseP(`\x1B[?${mode}$p`);
        import_chai.assert.deepEqual(reportStack.pop(), `\x1B[?${mode};1$y`);
        await inputHandler.parseP(`\x1B[?${mode}l`);
        await inputHandler.parseP(`\x1B[?${mode}$p`);
        import_chai.assert.deepEqual(reportStack.pop(), `\x1B[?${mode};2$y`);
      }
      const set = [7, 25];
      for (const mode of set) {
        await inputHandler.parseP(`\x1B[?${mode}$p`);
        import_chai.assert.deepEqual(reportStack.pop(), `\x1B[?${mode};1$y`);
        await inputHandler.parseP(`\x1B[?${mode}l`);
        await inputHandler.parseP(`\x1B[?${mode}$p`);
        import_chai.assert.deepEqual(reportStack.pop(), `\x1B[?${mode};2$y`);
        await inputHandler.parseP(`\x1B[?${mode}h`);
        await inputHandler.parseP(`\x1B[?${mode}$p`);
        import_chai.assert.deepEqual(reportStack.pop(), `\x1B[?${mode};1$y`);
      }
    });
    it("DEC privates perma modes", async () => {
      const perma = [[3, 0], [8, 3], [67, 4], [1005, 4], [1015, 4], [1048, 1]];
      for (const [mode, value] of perma) {
        await inputHandler.parseP(`\x1B[?${mode}$p`);
        import_chai.assert.deepEqual(reportStack.pop(), `\x1B[?${mode};${value}$y`);
      }
    });
  });
});
describe("InputHandler - async handlers", () => {
  let bufferService;
  let coreService;
  let optionsService;
  let inputHandler;
  beforeEach(() => {
    optionsService = new import_TestUtils.MockOptionsService();
    bufferService = new import_BufferService.BufferService(optionsService);
    bufferService.resize(80, 30);
    coreService = new import_CoreService.CoreService(bufferService, new import_TestUtils.MockLogService(), optionsService);
    coreService.onData((data) => {
      console.log(data);
    });
    inputHandler = new TestInputHandler(bufferService, new import_TestUtils.MockCharsetService(), coreService, new import_TestUtils.MockLogService(), optionsService, new import_TestUtils.MockOscLinkService(), new import_TestUtils.MockCoreMouseService(), new import_TestUtils.MockUnicodeService());
  });
  it("async CUP with CPR check", async () => {
    const cup = [];
    const cpr = [];
    inputHandler.registerCsiHandler({ final: "H" }, async (params) => {
      cup.push(params.toArray());
      await new Promise((res) => setTimeout(res, 50));
      return inputHandler.cursorPosition(params);
    });
    coreService.onData((data) => {
      const m = data.match(/\x1b\[(.*?);(.*?)R/);
      if (m) {
        cpr.push([parseInt(m[1]), parseInt(m[2])]);
      }
    });
    await inputHandler.parseP("aaa\x1B[3;4H\x1B[6nbbb\x1B[6;8H\x1B[6n");
    import_chai.assert.deepEqual(cup, cpr);
  });
  it("async OSC between", async () => {
    inputHandler.registerOscHandler(1e3, async (data) => {
      await new Promise((res) => setTimeout(res, 50));
      import_chai.assert.deepEqual(getLines(bufferService, 2), ["hello world!", ""]);
      import_chai.assert.equal(data, "some data");
      return true;
    });
    await inputHandler.parseP("hello world!\r\n\x1B]1000;some data\x07second line");
    import_chai.assert.deepEqual(getLines(bufferService, 2), ["hello world!", "second line"]);
  });
  it("async DCS between", async () => {
    inputHandler.registerDcsHandler({ final: "a" }, async (data, params) => {
      await new Promise((res) => setTimeout(res, 50));
      import_chai.assert.deepEqual(getLines(bufferService, 2), ["hello world!", ""]);
      import_chai.assert.equal(data, "some data");
      import_chai.assert.deepEqual(params.toArray(), [1, 2]);
      return true;
    });
    await inputHandler.parseP("hello world!\r\n\x1BP1;2asome data\x1B\\second line");
    import_chai.assert.deepEqual(getLines(bufferService, 2), ["hello world!", "second line"]);
  });
});
//# sourceMappingURL=InputHandler.test.js.map
