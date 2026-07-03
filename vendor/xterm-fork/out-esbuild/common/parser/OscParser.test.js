"use strict";
var import_chai = require("chai");
var import_OscParser = require("common/parser/OscParser");
var import_TextDecoder = require("common/input/TextDecoder");
var import_Constants = require("common/parser/Constants");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function toUtf32(s) {
  const utf32 = new Uint32Array(s.length);
  const decoder = new import_TextDecoder.StringToUtf32();
  const length = decoder.decode(s, utf32);
  return utf32.subarray(0, length);
}
class TestHandler {
  constructor(id, output, msg, returnFalse = false) {
    this.id = id;
    this.output = output;
    this.msg = msg;
    this.returnFalse = returnFalse;
  }
  start() {
    this.output.push([this.msg, this.id, "START"]);
  }
  put(data, start, end) {
    this.output.push([this.msg, this.id, "PUT", (0, import_TextDecoder.utf32ToString)(data, start, end)]);
  }
  end(success) {
    this.output.push([this.msg, this.id, "END", success]);
    if (this.returnFalse) {
      return false;
    }
    return true;
  }
}
describe("OscParser", () => {
  let parser;
  let reports = [];
  beforeEach(() => {
    reports = [];
    parser = new import_OscParser.OscParser();
    parser.setHandlerFallback((id, action, data) => {
      reports.push([id, action, data]);
    });
  });
  describe("identifier parsing", () => {
    it("no report for illegal ids", () => {
      const data = toUtf32("hello world!");
      parser.put(data, 0, data.length);
      parser.end(true);
      import_chai.assert.deepEqual(reports, []);
    });
    it("no payload", () => {
      parser.start();
      let data = toUtf32("12");
      parser.put(data, 0, data.length);
      data = toUtf32("34");
      parser.put(data, 0, data.length);
      parser.end(true);
      import_chai.assert.deepEqual(reports, [[1234, "START", void 0], [1234, "END", true]]);
    });
    it("with payload", () => {
      parser.start();
      let data = toUtf32("12");
      parser.put(data, 0, data.length);
      data = toUtf32("34");
      parser.put(data, 0, data.length);
      data = toUtf32(";h");
      parser.put(data, 0, data.length);
      data = toUtf32("ello");
      parser.put(data, 0, data.length);
      parser.end(true);
      import_chai.assert.deepEqual(reports, [
        [1234, "START", void 0],
        [1234, "PUT", "h"],
        [1234, "PUT", "ello"],
        [1234, "END", true]
      ]);
    });
  });
  describe("handler registration", () => {
    it("setOscHandler", () => {
      parser.registerHandler(1234, new TestHandler(1234, reports, "th"));
      parser.start();
      let data = toUtf32("1234;Here comes");
      parser.put(data, 0, data.length);
      data = toUtf32("the mouse!");
      parser.put(data, 0, data.length);
      parser.end(true);
      import_chai.assert.deepEqual(reports, [
        // messages from TestHandler
        ["th", 1234, "START"],
        ["th", 1234, "PUT", "Here comes"],
        ["th", 1234, "PUT", "the mouse!"],
        ["th", 1234, "END", true]
      ]);
    });
    it("clearOscHandler", () => {
      parser.registerHandler(1234, new TestHandler(1234, reports, "th"));
      parser.clearHandler(1234);
      parser.start();
      let data = toUtf32("1234;Here comes");
      parser.put(data, 0, data.length);
      data = toUtf32("the mouse!");
      parser.put(data, 0, data.length);
      parser.end(true);
      import_chai.assert.deepEqual(reports, [
        // messages from fallback handler
        [1234, "START", void 0],
        [1234, "PUT", "Here comes"],
        [1234, "PUT", "the mouse!"],
        [1234, "END", true]
      ]);
    });
    it("addOscHandler", () => {
      parser.registerHandler(1234, new TestHandler(1234, reports, "th1"));
      parser.registerHandler(1234, new TestHandler(1234, reports, "th2"));
      parser.start();
      let data = toUtf32("1234;Here comes");
      parser.put(data, 0, data.length);
      data = toUtf32("the mouse!");
      parser.put(data, 0, data.length);
      parser.end(true);
      import_chai.assert.deepEqual(reports, [
        ["th2", 1234, "START"],
        ["th1", 1234, "START"],
        ["th2", 1234, "PUT", "Here comes"],
        ["th1", 1234, "PUT", "Here comes"],
        ["th2", 1234, "PUT", "the mouse!"],
        ["th1", 1234, "PUT", "the mouse!"],
        ["th2", 1234, "END", true],
        ["th1", 1234, "END", false]
        // false due being already handled by th2!
      ]);
    });
    it("addOscHandler with return false", () => {
      parser.registerHandler(1234, new TestHandler(1234, reports, "th1"));
      parser.registerHandler(1234, new TestHandler(1234, reports, "th2", true));
      parser.start();
      let data = toUtf32("1234;Here comes");
      parser.put(data, 0, data.length);
      data = toUtf32("the mouse!");
      parser.put(data, 0, data.length);
      parser.end(true);
      import_chai.assert.deepEqual(reports, [
        ["th2", 1234, "START"],
        ["th1", 1234, "START"],
        ["th2", 1234, "PUT", "Here comes"],
        ["th1", 1234, "PUT", "Here comes"],
        ["th2", 1234, "PUT", "the mouse!"],
        ["th1", 1234, "PUT", "the mouse!"],
        ["th2", 1234, "END", true],
        ["th1", 1234, "END", true]
        // true since th2 indicated to keep bubbling
      ]);
    });
    it("dispose handlers", () => {
      parser.registerHandler(1234, new TestHandler(1234, reports, "th1"));
      const dispo = parser.registerHandler(1234, new TestHandler(1234, reports, "th2", true));
      dispo.dispose();
      parser.start();
      let data = toUtf32("1234;Here comes");
      parser.put(data, 0, data.length);
      data = toUtf32("the mouse!");
      parser.put(data, 0, data.length);
      parser.end(true);
      import_chai.assert.deepEqual(reports, [
        ["th1", 1234, "START"],
        ["th1", 1234, "PUT", "Here comes"],
        ["th1", 1234, "PUT", "the mouse!"],
        ["th1", 1234, "END", true]
      ]);
    });
  });
  describe("OscHandlerFactory", () => {
    it("should be called once on end(true)", () => {
      parser.registerHandler(1234, new import_OscParser.OscHandler((data2) => {
        reports.push([1234, data2]);
        return true;
      }));
      parser.start();
      let data = toUtf32("1234;Here comes");
      parser.put(data, 0, data.length);
      data = toUtf32(" the mouse!");
      parser.put(data, 0, data.length);
      parser.end(true);
      import_chai.assert.deepEqual(reports, [[1234, "Here comes the mouse!"]]);
    });
    it("should not be called on end(false)", () => {
      parser.registerHandler(1234, new import_OscParser.OscHandler((data2) => {
        reports.push([1234, data2]);
        return true;
      }));
      parser.start();
      let data = toUtf32("1234;Here comes");
      parser.put(data, 0, data.length);
      data = toUtf32(" the mouse!");
      parser.put(data, 0, data.length);
      parser.end(false);
      import_chai.assert.deepEqual(reports, []);
    });
    it("should be disposable", () => {
      parser.registerHandler(1234, new import_OscParser.OscHandler((data2) => {
        reports.push(["one", data2]);
        return true;
      }));
      const dispo = parser.registerHandler(1234, new import_OscParser.OscHandler((data2) => {
        reports.push(["two", data2]);
        return true;
      }));
      parser.start();
      let data = toUtf32("1234;Here comes");
      parser.put(data, 0, data.length);
      data = toUtf32(" the mouse!");
      parser.put(data, 0, data.length);
      parser.end(true);
      import_chai.assert.deepEqual(reports, [["two", "Here comes the mouse!"]]);
      dispo.dispose();
      parser.start();
      data = toUtf32("1234;some other");
      parser.put(data, 0, data.length);
      data = toUtf32(" data");
      parser.put(data, 0, data.length);
      parser.end(true);
      import_chai.assert.deepEqual(reports, [["two", "Here comes the mouse!"], ["one", "some other data"]]);
    });
    it("should respect return false", () => {
      parser.registerHandler(1234, new import_OscParser.OscHandler((data2) => {
        reports.push(["one", data2]);
        return true;
      }));
      parser.registerHandler(1234, new import_OscParser.OscHandler((data2) => {
        reports.push(["two", data2]);
        return false;
      }));
      parser.start();
      let data = toUtf32("1234;Here comes");
      parser.put(data, 0, data.length);
      data = toUtf32(" the mouse!");
      parser.put(data, 0, data.length);
      parser.end(true);
      import_chai.assert.deepEqual(reports, [["two", "Here comes the mouse!"], ["one", "Here comes the mouse!"]]);
    });
    it("should work up to payload limit", function() {
      this.timeout(3e4);
      parser.registerHandler(1234, new import_OscParser.OscHandler((data2) => {
        reports.push([1234, data2]);
        return true;
      }));
      parser.start();
      let data = toUtf32("1234;");
      parser.put(data, 0, data.length);
      data = toUtf32("A".repeat(1e3));
      for (let i = 0; i < import_Constants.PAYLOAD_LIMIT; i += 1e3) {
        parser.put(data, 0, data.length);
      }
      parser.end(true);
      import_chai.assert.deepEqual(reports, [[1234, "A".repeat(import_Constants.PAYLOAD_LIMIT)]]);
    });
    it("should abort for payload limit +1", function() {
      this.timeout(3e4);
      parser.registerHandler(1234, new import_OscParser.OscHandler((data2) => {
        reports.push([1234, data2]);
        return true;
      }));
      parser.start();
      let data = toUtf32("1234;");
      parser.put(data, 0, data.length);
      data = toUtf32("A".repeat(1e3));
      for (let i = 0; i < import_Constants.PAYLOAD_LIMIT; i += 1e3) {
        parser.put(data, 0, data.length);
      }
      data = toUtf32("A");
      parser.put(data, 0, data.length);
      parser.end(true);
      import_chai.assert.deepEqual(reports, []);
    });
  });
});
class TestHandlerAsync {
  constructor(id, output, msg, returnFalse = false) {
    this.id = id;
    this.output = output;
    this.msg = msg;
    this.returnFalse = returnFalse;
  }
  start() {
    this.output.push([this.msg, this.id, "START"]);
  }
  put(data, start, end) {
    this.output.push([this.msg, this.id, "PUT", (0, import_TextDecoder.utf32ToString)(data, start, end)]);
  }
  async end(success) {
    await new Promise((res) => setTimeout(res, 20));
    this.output.push([this.msg, this.id, "END", success]);
    if (this.returnFalse) {
      return false;
    }
    return true;
  }
}
async function endP(parser, success) {
  let result;
  let prev;
  while (result = parser.end(success, prev)) {
    prev = await result;
  }
}
describe("OscParser - async tests", () => {
  let parser;
  let reports = [];
  beforeEach(() => {
    reports = [];
    parser = new import_OscParser.OscParser();
    parser.setHandlerFallback((id, action, data) => {
      reports.push([id, action, data]);
    });
  });
  describe("sync and async mixed", () => {
    describe("sync | async | sync", () => {
      it("first should run, cleanup action for others", async () => {
        parser.registerHandler(1234, new TestHandler(1234, reports, "s1"));
        parser.registerHandler(1234, new TestHandlerAsync(1234, reports, "a1"));
        parser.registerHandler(1234, new TestHandler(1234, reports, "s2"));
        parser.start();
        let data = toUtf32("1234;Here comes");
        parser.put(data, 0, data.length);
        data = toUtf32("the mouse!");
        parser.put(data, 0, data.length);
        await endP(parser, true);
        import_chai.assert.deepEqual(reports, [
          // messages from TestHandler
          ["s2", 1234, "START"],
          ["a1", 1234, "START"],
          ["s1", 1234, "START"],
          ["s2", 1234, "PUT", "Here comes"],
          ["a1", 1234, "PUT", "Here comes"],
          ["s1", 1234, "PUT", "Here comes"],
          ["s2", 1234, "PUT", "the mouse!"],
          ["a1", 1234, "PUT", "the mouse!"],
          ["s1", 1234, "PUT", "the mouse!"],
          ["s2", 1234, "END", true],
          ["a1", 1234, "END", false],
          ["s1", 1234, "END", false]
        ]);
      });
      it("all should run", async () => {
        parser.registerHandler(1234, new TestHandler(1234, reports, "s1", true));
        parser.registerHandler(1234, new TestHandlerAsync(1234, reports, "a1", true));
        parser.registerHandler(1234, new TestHandler(1234, reports, "s2", true));
        parser.start();
        let data = toUtf32("1234;Here comes");
        parser.put(data, 0, data.length);
        data = toUtf32("the mouse!");
        parser.put(data, 0, data.length);
        await endP(parser, true);
        import_chai.assert.deepEqual(reports, [
          // messages from TestHandler
          ["s2", 1234, "START"],
          ["a1", 1234, "START"],
          ["s1", 1234, "START"],
          ["s2", 1234, "PUT", "Here comes"],
          ["a1", 1234, "PUT", "Here comes"],
          ["s1", 1234, "PUT", "Here comes"],
          ["s2", 1234, "PUT", "the mouse!"],
          ["a1", 1234, "PUT", "the mouse!"],
          ["s1", 1234, "PUT", "the mouse!"],
          ["s2", 1234, "END", true],
          ["a1", 1234, "END", true],
          ["s1", 1234, "END", true]
        ]);
      });
    });
    describe("async | sync | async", () => {
      it("first should run, cleanup action for others", async () => {
        parser.registerHandler(1234, new TestHandlerAsync(1234, reports, "s1"));
        parser.registerHandler(1234, new TestHandler(1234, reports, "a1"));
        parser.registerHandler(1234, new TestHandlerAsync(1234, reports, "s2"));
        parser.start();
        let data = toUtf32("1234;Here comes");
        parser.put(data, 0, data.length);
        data = toUtf32("the mouse!");
        parser.put(data, 0, data.length);
        await endP(parser, true);
        import_chai.assert.deepEqual(reports, [
          // messages from TestHandler
          ["s2", 1234, "START"],
          ["a1", 1234, "START"],
          ["s1", 1234, "START"],
          ["s2", 1234, "PUT", "Here comes"],
          ["a1", 1234, "PUT", "Here comes"],
          ["s1", 1234, "PUT", "Here comes"],
          ["s2", 1234, "PUT", "the mouse!"],
          ["a1", 1234, "PUT", "the mouse!"],
          ["s1", 1234, "PUT", "the mouse!"],
          ["s2", 1234, "END", true],
          ["a1", 1234, "END", false],
          ["s1", 1234, "END", false]
        ]);
      });
      it("all should run", async () => {
        parser.registerHandler(1234, new TestHandlerAsync(1234, reports, "s1", true));
        parser.registerHandler(1234, new TestHandler(1234, reports, "a1", true));
        parser.registerHandler(1234, new TestHandlerAsync(1234, reports, "s2", true));
        parser.start();
        let data = toUtf32("1234;Here comes");
        parser.put(data, 0, data.length);
        data = toUtf32("the mouse!");
        parser.put(data, 0, data.length);
        await endP(parser, true);
        import_chai.assert.deepEqual(reports, [
          // messages from TestHandler
          ["s2", 1234, "START"],
          ["a1", 1234, "START"],
          ["s1", 1234, "START"],
          ["s2", 1234, "PUT", "Here comes"],
          ["a1", 1234, "PUT", "Here comes"],
          ["s1", 1234, "PUT", "Here comes"],
          ["s2", 1234, "PUT", "the mouse!"],
          ["a1", 1234, "PUT", "the mouse!"],
          ["s1", 1234, "PUT", "the mouse!"],
          ["s2", 1234, "END", true],
          ["a1", 1234, "END", true],
          ["s1", 1234, "END", true]
        ]);
      });
    });
    describe("OscHandlerFactory", () => {
      it("should be called once on end(true)", async () => {
        parser.registerHandler(1234, new import_OscParser.OscHandler(async (data2) => {
          reports.push([1234, data2]);
          return true;
        }));
        parser.start();
        let data = toUtf32("1234;Here comes");
        parser.put(data, 0, data.length);
        data = toUtf32(" the mouse!");
        parser.put(data, 0, data.length);
        parser.end(true);
        await endP(parser, true);
        import_chai.assert.deepEqual(reports, [[1234, "Here comes the mouse!"]]);
      });
      it("should not be called on end(false)", async () => {
        parser.registerHandler(1234, new import_OscParser.OscHandler(async (data2) => {
          reports.push([1234, data2]);
          return true;
        }));
        parser.start();
        let data = toUtf32("1234;Here comes");
        parser.put(data, 0, data.length);
        data = toUtf32(" the mouse!");
        parser.put(data, 0, data.length);
        await endP(parser, false);
        import_chai.assert.deepEqual(reports, []);
      });
      it("should be disposable", async () => {
        parser.registerHandler(1234, new import_OscParser.OscHandler(async (data2) => {
          reports.push(["one", data2]);
          return true;
        }));
        const dispo = parser.registerHandler(1234, new import_OscParser.OscHandler(async (data2) => {
          reports.push(["two", data2]);
          return true;
        }));
        parser.start();
        let data = toUtf32("1234;Here comes");
        parser.put(data, 0, data.length);
        data = toUtf32(" the mouse!");
        parser.put(data, 0, data.length);
        await endP(parser, true);
        import_chai.assert.deepEqual(reports, [["two", "Here comes the mouse!"]]);
        dispo.dispose();
        parser.start();
        data = toUtf32("1234;some other");
        parser.put(data, 0, data.length);
        data = toUtf32(" data");
        parser.put(data, 0, data.length);
        await endP(parser, true);
        import_chai.assert.deepEqual(reports, [["two", "Here comes the mouse!"], ["one", "some other data"]]);
      });
      it("should respect return false", async () => {
        parser.registerHandler(1234, new import_OscParser.OscHandler(async (data2) => {
          reports.push(["one", data2]);
          return true;
        }));
        parser.registerHandler(1234, new import_OscParser.OscHandler(async (data2) => {
          reports.push(["two", data2]);
          return false;
        }));
        parser.start();
        let data = toUtf32("1234;Here comes");
        parser.put(data, 0, data.length);
        data = toUtf32(" the mouse!");
        parser.put(data, 0, data.length);
        await endP(parser, true);
        import_chai.assert.deepEqual(reports, [["two", "Here comes the mouse!"], ["one", "Here comes the mouse!"]]);
      });
    });
  });
});
//# sourceMappingURL=OscParser.test.js.map
