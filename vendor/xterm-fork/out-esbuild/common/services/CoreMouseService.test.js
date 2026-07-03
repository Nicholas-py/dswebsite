"use strict";
var import_CoreMouseService = require("common/services/CoreMouseService");
var import_TestUtils = require("common/TestUtils.test");
var import_chai = require("chai");
var import_Types = require("common/Types");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const bufferService = new import_TestUtils.MockBufferService(300, 100);
const coreService = new import_TestUtils.MockCoreService();
function toBytes(s) {
  if (!s) {
    return [];
  }
  const res = [];
  for (let i = 0; i < s.length; ++i) {
    res.push(s.charCodeAt(i));
  }
  return res;
}
describe("CoreMouseService", () => {
  it("init", () => {
    const cms = new import_CoreMouseService.CoreMouseService(bufferService, coreService);
    import_chai.assert.equal(cms.activeEncoding, "DEFAULT");
    import_chai.assert.equal(cms.activeProtocol, "NONE");
  });
  it("default protocols - NONE, X10, VT200, DRAG, ANY", () => {
    const cms = new import_CoreMouseService.CoreMouseService(bufferService, coreService);
    import_chai.assert.deepEqual(Object.keys(cms._protocols), ["NONE", "X10", "VT200", "DRAG", "ANY"]);
  });
  it("default encodings - DEFAULT, SGR", () => {
    const cms = new import_CoreMouseService.CoreMouseService(bufferService, coreService);
    import_chai.assert.deepEqual(Object.keys(cms._encodings), ["DEFAULT", "SGR", "SGR_PIXELS"]);
  });
  it("protocol/encoding setter, reset", () => {
    const cms = new import_CoreMouseService.CoreMouseService(bufferService, coreService);
    cms.activeEncoding = "SGR";
    cms.activeProtocol = "ANY";
    import_chai.assert.equal(cms.activeEncoding, "SGR");
    import_chai.assert.equal(cms.activeProtocol, "ANY");
    cms.reset();
    import_chai.assert.equal(cms.activeEncoding, "DEFAULT");
    import_chai.assert.equal(cms.activeProtocol, "NONE");
    import_chai.assert.throws(() => {
      cms.activeEncoding = "xyz";
    }, 'unknown encoding "xyz"');
    import_chai.assert.throws(() => {
      cms.activeProtocol = "xyz";
    }, 'unknown protocol "xyz"');
  });
  it("addEncoding", () => {
    const cms = new import_CoreMouseService.CoreMouseService(bufferService, coreService);
    cms.addEncoding("XYZ", (e) => "");
    cms.activeEncoding = "XYZ";
    import_chai.assert.equal(cms.activeEncoding, "XYZ");
  });
  it("addProtocol", () => {
    const cms = new import_CoreMouseService.CoreMouseService(bufferService, coreService);
    cms.addProtocol("XYZ", { events: import_Types.CoreMouseEventType.NONE, restrict: (e) => false });
    cms.activeProtocol = "XYZ";
    import_chai.assert.equal(cms.activeProtocol, "XYZ");
  });
  it("onProtocolChange", () => {
    const cms = new import_CoreMouseService.CoreMouseService(bufferService, coreService);
    const wantedEvents = [];
    cms.onProtocolChange((events) => wantedEvents.push(events));
    cms.activeProtocol = "NONE";
    import_chai.assert.deepEqual(wantedEvents, [import_Types.CoreMouseEventType.NONE]);
    cms.activeProtocol = "ANY";
    import_chai.assert.deepEqual(wantedEvents, [
      import_Types.CoreMouseEventType.NONE,
      import_Types.CoreMouseEventType.DOWN | import_Types.CoreMouseEventType.UP | import_Types.CoreMouseEventType.WHEEL | import_Types.CoreMouseEventType.DRAG | import_Types.CoreMouseEventType.MOVE
    ]);
  });
  describe("triggerMouseEvent", () => {
    let cms;
    let reports;
    beforeEach(() => {
      cms = new import_CoreMouseService.CoreMouseService(bufferService, coreService);
      reports = [];
      coreService.triggerDataEvent = (data, userInput) => reports.push(data);
      coreService.triggerBinaryEvent = (data) => reports.push(data);
    });
    it("NONE", () => {
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.DOWN }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.UP }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.MOVE }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.MIDDLE, action: import_Types.CoreMouseAction.DOWN }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.RIGHT, action: import_Types.CoreMouseAction.DOWN }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.WHEEL, action: import_Types.CoreMouseAction.UP }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.NONE, action: import_Types.CoreMouseAction.MOVE }), false);
    });
    it("X10", () => {
      cms.activeProtocol = "X10";
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.DOWN }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.UP }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.MOVE }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.MIDDLE, action: import_Types.CoreMouseAction.DOWN }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.RIGHT, action: import_Types.CoreMouseAction.DOWN }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.WHEEL, action: import_Types.CoreMouseAction.UP }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.NONE, action: import_Types.CoreMouseAction.MOVE }), false);
    });
    it("VT200", () => {
      cms.activeProtocol = "VT200";
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.DOWN }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.UP }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.MOVE }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.MIDDLE, action: import_Types.CoreMouseAction.DOWN }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.RIGHT, action: import_Types.CoreMouseAction.DOWN }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.WHEEL, action: import_Types.CoreMouseAction.UP }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.NONE, action: import_Types.CoreMouseAction.MOVE }), false);
    });
    it("DRAG", () => {
      cms.activeProtocol = "DRAG";
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.DOWN }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.UP }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.MOVE }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.MIDDLE, action: import_Types.CoreMouseAction.DOWN }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.RIGHT, action: import_Types.CoreMouseAction.DOWN }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.WHEEL, action: import_Types.CoreMouseAction.UP }), true);
    });
    it("ANY", () => {
      cms.activeProtocol = "ANY";
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.DOWN }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.UP }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.MOVE }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.MIDDLE, action: import_Types.CoreMouseAction.DOWN }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.RIGHT, action: import_Types.CoreMouseAction.DOWN }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.WHEEL, action: import_Types.CoreMouseAction.UP }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.NONE, action: import_Types.CoreMouseAction.MOVE }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.WHEEL, action: import_Types.CoreMouseAction.MOVE }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.NONE, action: import_Types.CoreMouseAction.DOWN }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.NONE, action: import_Types.CoreMouseAction.UP }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: -1, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.DOWN }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 500, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.DOWN }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: -1, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.DOWN }), false);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 500, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.DOWN }), false);
    });
    describe("coords", () => {
      it("DEFAULT encoding", () => {
        cms.activeProtocol = "ANY";
        for (let i = 0; i < bufferService.cols; ++i) {
          import_chai.assert.equal(cms.triggerMouseEvent({ col: i, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.DOWN }), true);
          if (i > 222) {
            import_chai.assert.deepEqual(toBytes(reports.pop()), []);
          } else {
            import_chai.assert.deepEqual(toBytes(reports.pop()), [27, 91, 77, 32, i + 33, 33]);
          }
        }
      });
      it("SGR encoding", () => {
        cms.activeProtocol = "ANY";
        cms.activeEncoding = "SGR";
        for (let i = 0; i < bufferService.cols; ++i) {
          import_chai.assert.equal(cms.triggerMouseEvent({ col: i, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.DOWN }), true);
          import_chai.assert.deepEqual(reports.pop(), `\x1B[<0;${i + 1};1M`);
        }
      });
      it("SGR_PIXELS encoding", () => {
        cms.activeProtocol = "ANY";
        cms.activeEncoding = "SGR_PIXELS";
        for (let i = 0; i < 500; ++i) {
          import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: i, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.DOWN }), true);
          import_chai.assert.deepEqual(reports.pop(), `\x1B[<0;${i};0M`);
        }
      });
    });
    it("eventCodes with modifiers (DEFAULT encoding)", () => {
      cms.activeProtocol = "ANY";
      cms.activeEncoding = "DEFAULT";
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.DOWN, ctrl: false, alt: false, shift: false }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.MIDDLE, action: import_Types.CoreMouseAction.DOWN, ctrl: false, alt: false, shift: false }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.RIGHT, action: import_Types.CoreMouseAction.DOWN, ctrl: false, alt: false, shift: false }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.WHEEL, action: import_Types.CoreMouseAction.DOWN, ctrl: false, alt: false, shift: false }), true);
      import_chai.assert.deepEqual(reports, ["\x1B[M !!", "\x1B[M!!!", '\x1B[M"!!', "\x1B[Ma!!"]);
      reports = [];
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.UP, ctrl: false, alt: false, shift: false }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.MIDDLE, action: import_Types.CoreMouseAction.UP, ctrl: false, alt: false, shift: false }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.RIGHT, action: import_Types.CoreMouseAction.UP, ctrl: false, alt: false, shift: false }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.WHEEL, action: import_Types.CoreMouseAction.UP, ctrl: false, alt: false, shift: false }), true);
      import_chai.assert.deepEqual(reports, ["\x1B[M#!!", "\x1B[M#!!", "\x1B[M#!!", "\x1B[M`!!"]);
      reports = [];
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.LEFT, action: import_Types.CoreMouseAction.MOVE, ctrl: false, alt: false, shift: false }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.MIDDLE, action: import_Types.CoreMouseAction.MOVE, ctrl: false, alt: false, shift: false }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.RIGHT, action: import_Types.CoreMouseAction.MOVE, ctrl: false, alt: false, shift: false }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.NONE, action: import_Types.CoreMouseAction.MOVE, ctrl: false, alt: false, shift: false }), true);
      import_chai.assert.deepEqual(reports, ["\x1B[M@!!", "\x1B[MA!!", "\x1B[MB!!", "\x1B[MC!!"]);
      reports = [];
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.NONE, action: import_Types.CoreMouseAction.MOVE, ctrl: true, alt: false, shift: false }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.NONE, action: import_Types.CoreMouseAction.MOVE, ctrl: false, alt: true, shift: false }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.NONE, action: import_Types.CoreMouseAction.MOVE, ctrl: false, alt: false, shift: true }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.NONE, action: import_Types.CoreMouseAction.MOVE, ctrl: true, alt: true, shift: false }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.NONE, action: import_Types.CoreMouseAction.MOVE, ctrl: false, alt: true, shift: true }), true);
      import_chai.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: import_Types.CoreMouseButton.NONE, action: import_Types.CoreMouseAction.MOVE, ctrl: true, alt: true, shift: true }), true);
      import_chai.assert.deepEqual(reports, ["\x1B[MS!!", "\x1B[MK!!", "\x1B[MG!!", "\x1B[M[!!", "\x1B[MO!!", "\x1B[M_!!"]);
      reports = [];
    });
  });
});
//# sourceMappingURL=CoreMouseService.test.js.map
