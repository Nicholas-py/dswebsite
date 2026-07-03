"use strict";
var import_Types = require("common/parser/Types");
var import_EscapeSequenceParser = require("common/parser/EscapeSequenceParser");
var import_chai = require("chai");
var import_TextDecoder = require("common/input/TextDecoder");
var import_Constants = require("common/parser/Constants");
var import_Params = require("common/parser/Params");
var import_OscParser = require("common/parser/OscParser");
var import_DcsParser = require("common/parser/DcsParser");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function r(a, b) {
  let c = b - a;
  const arr = new Array(c);
  while (c--) {
    arr[c] = String.fromCharCode(--b);
  }
  return arr;
}
class MockOscPutParser {
  constructor() {
    this._fallback = () => {
    };
    this.data = "";
  }
  reset() {
    this.data = "";
  }
  put(data, start, end) {
    this.data += (0, import_TextDecoder.utf32ToString)(data, start, end);
  }
  dispose() {
  }
  start() {
  }
  end(success) {
    this.data += `, success: ${success}`;
    const id = parseInt(this.data.slice(0, this.data.indexOf(";")));
    if (!isNaN(id)) {
      this._fallback(id, "END", this.data.slice(this.data.indexOf(";") + 1));
    }
  }
  registerHandler(ident, handler) {
    throw new Error("not implemented");
  }
  setHandler(ident, handler) {
    throw new Error("not implemented");
  }
  clearHandler(ident) {
    throw new Error("not implemented");
  }
  setHandlerFallback(handler) {
    this._fallback = handler;
  }
}
const oscPutParser = new MockOscPutParser();
class TestEscapeSequenceParser extends import_EscapeSequenceParser.EscapeSequenceParser {
  constructor() {
    super(...arguments);
    this._trackStack = false;
    this.trackedStack = [];
  }
  get transitions() {
    return this._transitions;
  }
  get osc() {
    return this._oscParser.data;
  }
  set osc(value) {
    this._oscParser.data = value;
  }
  get params() {
    return this._params.toArray();
  }
  set params(value) {
    this._params = import_Params.Params.fromArray(value);
  }
  get realParams() {
    return this._params;
  }
  get collect() {
    return this.identToString(this._collect);
  }
  set collect(value) {
    this._collect = 0;
    for (let i = 0; i < value.length; ++i) {
      this._collect <<= 8;
      this._collect |= value.charCodeAt(i);
    }
  }
  mockOscParser() {
    this._oscParser = oscPutParser;
  }
  identifier(id) {
    return this._identifier(id);
  }
  get parseStack() {
    return this._parseStack;
  }
  trackStackSavesOnPause() {
    this._trackStack = true;
  }
  parse(data, length, promiseResult) {
    const result = super.parse(data, length, promiseResult);
    if (result instanceof Promise && this._trackStack) {
      this.trackedStack.push({ ...this.parseStack });
    }
    return result;
  }
}
const testTerminal = {
  calls: [],
  clear() {
    this.calls = [];
  },
  compare(value) {
    import_chai.assert.deepEqual(this.calls, value);
  },
  print(data, start, end) {
    let s = "";
    for (let i = start; i < end; ++i) {
      s += (0, import_TextDecoder.stringFromCodePoint)(data[i]);
    }
    this.calls.push(["print", s]);
  },
  actionOSC(s) {
    this.calls.push(["osc", s]);
  },
  actionExecute(flag) {
    this.calls.push(["exe", flag]);
  },
  actionCSI(collect, params, flag) {
    this.calls.push(["csi", collect, params.toArray(), flag]);
  },
  actionESC(collect, flag) {
    this.calls.push(["esc", collect, flag]);
  },
  actionDCSHook(params) {
    this.calls.push(["dcs hook", params.toArray()]);
  },
  actionDCSPrint(s) {
    this.calls.push(["dcs put", s]);
  },
  actionDCSUnhook(success) {
    this.calls.push(["dcs unhook", success]);
  }
};
const states = [
  import_Constants.ParserState.GROUND,
  import_Constants.ParserState.ESCAPE,
  import_Constants.ParserState.ESCAPE_INTERMEDIATE,
  import_Constants.ParserState.CSI_ENTRY,
  import_Constants.ParserState.CSI_PARAM,
  import_Constants.ParserState.CSI_INTERMEDIATE,
  import_Constants.ParserState.CSI_IGNORE,
  import_Constants.ParserState.SOS_PM_APC_STRING,
  import_Constants.ParserState.OSC_STRING,
  import_Constants.ParserState.DCS_ENTRY,
  import_Constants.ParserState.DCS_PARAM,
  import_Constants.ParserState.DCS_IGNORE,
  import_Constants.ParserState.DCS_INTERMEDIATE,
  import_Constants.ParserState.DCS_PASSTHROUGH
];
let state;
const testParser = new TestEscapeSequenceParser();
testParser.mockOscParser();
testParser.setPrintHandler(testTerminal.print.bind(testTerminal));
testParser.setCsiHandlerFallback((ident, params) => {
  const id = testParser.identToString(ident);
  testTerminal.actionCSI(id.slice(0, -1), params, id.slice(-1));
});
testParser.setEscHandlerFallback((ident) => {
  const id = testParser.identToString(ident);
  testTerminal.actionESC(id.slice(0, -1), id.slice(-1));
});
testParser.setExecuteHandlerFallback((code) => {
  testTerminal.actionExecute(String.fromCharCode(code));
});
testParser.setOscHandlerFallback((identifier, action, data) => {
  if (identifier === -1) testTerminal.actionOSC(data);
  else if (action === "END") testTerminal.actionOSC("" + identifier + ";" + data);
});
testParser.setDcsHandlerFallback((collectAndFlag, action, payload) => {
  switch (action) {
    case "HOOK":
      testTerminal.actionDCSHook(payload);
      break;
    case "PUT":
      testTerminal.actionDCSPrint(payload);
      break;
    case "UNHOOK":
      testTerminal.actionDCSUnhook(payload);
  }
});
function parse(parser, data) {
  const container = new Uint32Array(data.length);
  const decoder = new import_TextDecoder.StringToUtf32();
  parser.parse(container, decoder.decode(data, container));
}
describe("EscapeSequenceParser", () => {
  const parser = testParser;
  describe("Parser init and methods", () => {
    it("constructor", () => {
      let p = new TestEscapeSequenceParser();
      import_chai.assert.deepEqual(p.transitions, import_EscapeSequenceParser.VT500_TRANSITION_TABLE);
      p = new TestEscapeSequenceParser(import_EscapeSequenceParser.VT500_TRANSITION_TABLE);
      import_chai.assert.deepEqual(p.transitions, import_EscapeSequenceParser.VT500_TRANSITION_TABLE);
      const tansitions = new import_EscapeSequenceParser.TransitionTable(10);
      p = new TestEscapeSequenceParser(tansitions);
      import_chai.assert.deepEqual(p.transitions, tansitions);
    });
    it("inital states", () => {
      import_chai.assert.equal(parser.initialState, import_Constants.ParserState.GROUND);
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.GROUND);
      import_chai.assert.equal(parser.osc, "");
      import_chai.assert.deepEqual(parser.params, [0]);
      import_chai.assert.equal(parser.collect, "");
    });
    it("reset states", () => {
      parser.currentState = 124;
      parser.osc = "#";
      parser.params = [123];
      parser.collect = "#";
      parser.reset();
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.GROUND);
      import_chai.assert.equal(parser.osc, "");
      import_chai.assert.deepEqual(parser.params, [0]);
      import_chai.assert.equal(parser.collect, "");
    });
  });
  describe("state transitions and actions", () => {
    it("state GROUND execute action", () => {
      parser.reset();
      testTerminal.clear();
      let exes = r(0, 24);
      exes = exes.concat([""]);
      exes = exes.concat(r(28, 32));
      for (let i = 0; i < exes.length; ++i) {
        parser.currentState = import_Constants.ParserState.GROUND;
        parse(parser, exes[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.GROUND);
        testTerminal.compare([["exe", exes[i]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("state GROUND print action", () => {
      parser.reset();
      testTerminal.clear();
      const printables = r(32, 127);
      for (let i = 0; i < printables.length; ++i) {
        parser.currentState = import_Constants.ParserState.GROUND;
        parse(parser, printables[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.GROUND);
        testTerminal.compare([["print", printables[i]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("trans ANYWHERE --> GROUND with actions", () => {
      const exes = [
        "",
        "",
        "\x80",
        "\x81",
        "\x82",
        "\x83",
        "\x84",
        "\x85",
        "\x86",
        "\x87",
        "\x88",
        "\x89",
        "\x8A",
        "\x8B",
        "\x8C",
        "\x8D",
        "\x8E",
        "\x8F",
        "\x91",
        "\x92",
        "\x93",
        "\x94",
        "\x95",
        "\x96",
        "\x97",
        "\x99",
        "\x9A"
      ];
      const exceptions = {
        8: { "": [], "": [] },
        // abort OSC_STRING
        13: { "": [["dcs unhook", false]], "": [["dcs unhook", false]] }
        // abort DCS_PASSTHROUGH
      };
      parser.reset();
      testTerminal.clear();
      for (state in states) {
        for (let i = 0; i < exes.length; ++i) {
          parser.currentState = state;
          parse(parser, exes[i]);
          import_chai.assert.equal(parser.currentState, import_Constants.ParserState.GROUND);
          testTerminal.compare((state in exceptions ? exceptions[state][exes[i]] : 0) || [["exe", exes[i]]]);
          parser.reset();
          testTerminal.clear();
        }
        parse(parser, "\x9C");
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.GROUND);
        testTerminal.compare([]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("trans ANYWHERE --> ESCAPE with clear", () => {
      parser.reset();
      for (state in states) {
        parser.currentState = state;
        parser.params = [23];
        parser.collect = "#";
        parse(parser, "\x1B");
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.ESCAPE);
        import_chai.assert.deepEqual(parser.params, [0]);
        import_chai.assert.equal(parser.collect, "");
        parser.reset();
      }
    });
    it("state ESCAPE execute rules", () => {
      parser.reset();
      testTerminal.clear();
      let exes = r(0, 24);
      exes = exes.concat([""]);
      exes = exes.concat(r(28, 32));
      for (let i = 0; i < exes.length; ++i) {
        parser.currentState = import_Constants.ParserState.ESCAPE;
        parse(parser, exes[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.ESCAPE);
        testTerminal.compare([["exe", exes[i]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("state ESCAPE ignore", () => {
      parser.reset();
      testTerminal.clear();
      parser.currentState = import_Constants.ParserState.ESCAPE;
      parse(parser, "\x7F");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.ESCAPE);
      testTerminal.compare([]);
      parser.reset();
      testTerminal.clear();
    });
    it("trans ESCAPE --> GROUND with ecs_dispatch action", () => {
      parser.reset();
      testTerminal.clear();
      let dispatches = r(48, 80);
      dispatches = dispatches.concat(r(81, 88));
      dispatches = dispatches.concat(["Y", "Z"]);
      dispatches = dispatches.concat(r(96, 127));
      for (let i = 0; i < dispatches.length; ++i) {
        parser.currentState = import_Constants.ParserState.ESCAPE;
        parse(parser, dispatches[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.GROUND);
        testTerminal.compare([["esc", "", dispatches[i]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("trans ESCAPE --> ESCAPE_INTERMEDIATE with collect action", () => {
      parser.reset();
      const collect = r(32, 48);
      for (let i = 0; i < collect.length; ++i) {
        parser.currentState = import_Constants.ParserState.ESCAPE;
        parse(parser, collect[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.ESCAPE_INTERMEDIATE);
        import_chai.assert.equal(parser.collect, collect[i]);
        parser.reset();
      }
    });
    it("state ESCAPE_INTERMEDIATE execute rules", () => {
      parser.reset();
      testTerminal.clear();
      let exes = r(0, 24);
      exes = exes.concat([""]);
      exes = exes.concat(r(28, 32));
      for (let i = 0; i < exes.length; ++i) {
        parser.currentState = import_Constants.ParserState.ESCAPE_INTERMEDIATE;
        parse(parser, exes[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.ESCAPE_INTERMEDIATE);
        testTerminal.compare([["exe", exes[i]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("state ESCAPE_INTERMEDIATE ignore", () => {
      parser.reset();
      testTerminal.clear();
      parser.currentState = import_Constants.ParserState.ESCAPE_INTERMEDIATE;
      parse(parser, "\x7F");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.ESCAPE_INTERMEDIATE);
      testTerminal.compare([]);
      parser.reset();
      testTerminal.clear();
    });
    it("state ESCAPE_INTERMEDIATE collect action", () => {
      parser.reset();
      const collect = r(32, 48);
      for (let i = 0; i < collect.length; ++i) {
        parser.currentState = import_Constants.ParserState.ESCAPE_INTERMEDIATE;
        parse(parser, collect[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.ESCAPE_INTERMEDIATE);
        import_chai.assert.equal(parser.collect, collect[i]);
        parser.reset();
      }
    });
    it("trans ESCAPE_INTERMEDIATE --> GROUND with esc_dispatch action", () => {
      parser.reset();
      testTerminal.clear();
      const collect = r(48, 127);
      for (let i = 0; i < collect.length; ++i) {
        parser.currentState = import_Constants.ParserState.ESCAPE_INTERMEDIATE;
        parse(parser, collect[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.GROUND);
        testTerminal.compare(collect[i] === "\\" ? [] : [["esc", "", collect[i]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("trans ANYWHERE/ESCAPE --> CSI_ENTRY with clear", () => {
      parser.reset();
      parser.currentState = import_Constants.ParserState.ESCAPE;
      parser.params = [123];
      parser.collect = "#";
      parse(parser, "[");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_ENTRY);
      import_chai.assert.deepEqual(parser.params, [0]);
      import_chai.assert.equal(parser.collect, "");
      parser.reset();
      for (state in states) {
        parser.currentState = state;
        parser.params = [123];
        parser.collect = "#";
        parse(parser, "\x9B");
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_ENTRY);
        import_chai.assert.deepEqual(parser.params, [0]);
        import_chai.assert.equal(parser.collect, "");
        parser.reset();
      }
    });
    it("state CSI_ENTRY execute rules", () => {
      parser.reset();
      testTerminal.clear();
      let exes = r(0, 24);
      exes = exes.concat([""]);
      exes = exes.concat(r(28, 32));
      for (let i = 0; i < exes.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_ENTRY;
        parse(parser, exes[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_ENTRY);
        testTerminal.compare([["exe", exes[i]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("state CSI_ENTRY ignore", () => {
      parser.reset();
      testTerminal.clear();
      parser.currentState = import_Constants.ParserState.CSI_ENTRY;
      parse(parser, "\x7F");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_ENTRY);
      testTerminal.compare([]);
      parser.reset();
      testTerminal.clear();
    });
    it("trans CSI_ENTRY --> GROUND with csi_dispatch action", () => {
      parser.reset();
      const dispatches = r(64, 127);
      for (let i = 0; i < dispatches.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_ENTRY;
        parse(parser, dispatches[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.GROUND);
        testTerminal.compare([["csi", "", [0], dispatches[i]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("trans CSI_ENTRY --> CSI_PARAM with param/collect actions", () => {
      parser.reset();
      const params = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
      const collect = ["<", "=", ">", "?"];
      for (let i = 0; i < params.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_ENTRY;
        parse(parser, params[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_PARAM);
        import_chai.assert.deepEqual(parser.params, [params[i].charCodeAt(0) - 48]);
        parser.reset();
      }
      parser.currentState = import_Constants.ParserState.CSI_ENTRY;
      parse(parser, ";");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_PARAM);
      import_chai.assert.deepEqual(parser.params, [0, 0]);
      parser.reset();
      for (let i = 0; i < collect.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_ENTRY;
        parse(parser, collect[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_PARAM);
        import_chai.assert.equal(parser.collect, collect[i]);
        parser.reset();
      }
    });
    it("state CSI_PARAM execute rules", () => {
      parser.reset();
      testTerminal.clear();
      let exes = r(0, 24);
      exes = exes.concat([""]);
      exes = exes.concat(r(28, 32));
      for (let i = 0; i < exes.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_PARAM;
        parse(parser, exes[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_PARAM);
        testTerminal.compare([["exe", exes[i]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("state CSI_PARAM param action", () => {
      parser.reset();
      const params = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
      for (let i = 0; i < params.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_PARAM;
        parse(parser, params[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_PARAM);
        import_chai.assert.deepEqual(parser.params, [params[i].charCodeAt(0) - 48]);
        parser.reset();
      }
      parser.currentState = import_Constants.ParserState.CSI_PARAM;
      parse(parser, ";");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_PARAM);
      import_chai.assert.deepEqual(parser.params, [0, 0]);
      parser.reset();
    });
    it("state CSI_PARAM ignore", () => {
      parser.reset();
      testTerminal.clear();
      parser.currentState = import_Constants.ParserState.CSI_PARAM;
      parse(parser, "\x7F");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_PARAM);
      testTerminal.compare([]);
      parser.reset();
      testTerminal.clear();
    });
    it("trans CSI_PARAM --> GROUND with csi_dispatch action", () => {
      parser.reset();
      const dispatches = r(64, 127);
      for (let i = 0; i < dispatches.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_PARAM;
        parser.params = [0, 1];
        parse(parser, dispatches[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.GROUND);
        testTerminal.compare([["csi", "", [0, 1], dispatches[i]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("trans CSI_ENTRY --> CSI_INTERMEDIATE with collect action", () => {
      parser.reset();
      const collect = r(32, 48);
      for (let i = 0; i < collect.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_ENTRY;
        parse(parser, collect[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_INTERMEDIATE);
        import_chai.assert.equal(parser.collect, collect[i]);
        parser.reset();
      }
    });
    it("trans CSI_PARAM --> CSI_INTERMEDIATE with collect action", () => {
      parser.reset();
      const collect = r(32, 48);
      for (let i = 0; i < collect.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_PARAM;
        parse(parser, collect[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_INTERMEDIATE);
        import_chai.assert.equal(parser.collect, collect[i]);
        parser.reset();
      }
    });
    it("state CSI_INTERMEDIATE execute rules", () => {
      parser.reset();
      testTerminal.clear();
      let exes = r(0, 24);
      exes = exes.concat([""]);
      exes = exes.concat(r(28, 32));
      for (let i = 0; i < exes.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_INTERMEDIATE;
        parse(parser, exes[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_INTERMEDIATE);
        testTerminal.compare([["exe", exes[i]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("state CSI_INTERMEDIATE collect", () => {
      parser.reset();
      const collect = r(32, 48);
      for (let i = 0; i < collect.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_INTERMEDIATE;
        parse(parser, collect[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_INTERMEDIATE);
        import_chai.assert.equal(parser.collect, collect[i]);
        parser.reset();
      }
    });
    it("state CSI_INTERMEDIATE ignore", () => {
      parser.reset();
      testTerminal.clear();
      parser.currentState = import_Constants.ParserState.CSI_INTERMEDIATE;
      parse(parser, "\x7F");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_INTERMEDIATE);
      testTerminal.compare([]);
      parser.reset();
      testTerminal.clear();
    });
    it("trans CSI_INTERMEDIATE --> GROUND with csi_dispatch action", () => {
      parser.reset();
      const dispatches = r(64, 127);
      for (let i = 0; i < dispatches.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_INTERMEDIATE;
        parser.params = [0, 1];
        parse(parser, dispatches[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.GROUND);
        testTerminal.compare([["csi", "", [0, 1], dispatches[i]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it('trans CSI_ENTRY --> CSI_PARAM for ":" (0x3a)', () => {
      parser.reset();
      parser.currentState = import_Constants.ParserState.CSI_ENTRY;
      parse(parser, ":");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_PARAM);
      parser.reset();
    });
    it("trans CSI_PARAM --> CSI_IGNORE", () => {
      parser.reset();
      const chars = ["<", "=", ">", "?"];
      for (let i = 0; i < chars.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_PARAM;
        parse(parser, ";" + chars[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_IGNORE);
        import_chai.assert.deepEqual(parser.params, [0, 0]);
        parser.reset();
      }
    });
    it("trans CSI_PARAM --> CSI_IGNORE", () => {
      parser.reset();
      const chars = ["<", "=", ">", "?"];
      for (let i = 0; i < chars.length; ++i) {
        import_chai.assert.deepEqual(parser.params, [0]);
        parser.currentState = import_Constants.ParserState.CSI_PARAM;
        parse(parser, ";" + chars[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_IGNORE);
        import_chai.assert.deepEqual(parser.params, [0, 0]);
        parser.reset();
      }
    });
    it("trans CSI_INTERMEDIATE --> CSI_IGNORE", () => {
      parser.reset();
      const chars = r(48, 64);
      for (let i = 0; i < chars.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_INTERMEDIATE;
        parse(parser, chars[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_IGNORE);
        import_chai.assert.deepEqual(parser.params, [0]);
        parser.reset();
      }
    });
    it("state CSI_IGNORE execute rules", () => {
      parser.reset();
      testTerminal.clear();
      let exes = r(0, 24);
      exes = exes.concat([""]);
      exes = exes.concat(r(28, 32));
      for (let i = 0; i < exes.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_IGNORE;
        parse(parser, exes[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_IGNORE);
        testTerminal.compare([["exe", exes[i]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("state CSI_IGNORE ignore", () => {
      parser.reset();
      testTerminal.clear();
      let ignored = r(32, 64);
      ignored = ignored.concat(["\x7F"]);
      for (let i = 0; i < ignored.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_IGNORE;
        parse(parser, ignored[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_IGNORE);
        testTerminal.compare([]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("trans CSI_IGNORE --> GROUND", () => {
      parser.reset();
      const dispatches = r(64, 127);
      for (let i = 0; i < dispatches.length; ++i) {
        parser.currentState = import_Constants.ParserState.CSI_IGNORE;
        parser.params = [0, 1];
        parse(parser, dispatches[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.GROUND);
        testTerminal.compare([]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("trans ANYWHERE/ESCAPE --> SOS_PM_APC_STRING", () => {
      parser.reset();
      let initializers = ["X", "^", "_"];
      for (let i = 0; i < initializers.length; ++i) {
        parse(parser, "\x1B" + initializers[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.SOS_PM_APC_STRING);
        parser.reset();
      }
      for (state in states) {
        parser.currentState = state;
        initializers = ["\x98", "\x9E", "\x9F"];
        for (let i = 0; i < initializers.length; ++i) {
          parse(parser, initializers[i]);
          import_chai.assert.equal(parser.currentState, import_Constants.ParserState.SOS_PM_APC_STRING);
          parser.reset();
        }
      }
    });
    it("state SOS_PM_APC_STRING ignore rules", () => {
      parser.reset();
      let ignored = r(0, 24);
      ignored = ignored.concat([""]);
      ignored = ignored.concat(r(28, 32));
      ignored = ignored.concat(r(32, 128));
      for (let i = 0; i < ignored.length; ++i) {
        parser.currentState = import_Constants.ParserState.SOS_PM_APC_STRING;
        parse(parser, ignored[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.SOS_PM_APC_STRING);
        parser.reset();
      }
    });
    it("trans ANYWHERE/ESCAPE --> OSC_STRING", () => {
      parser.reset();
      parse(parser, "\x1B]");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.OSC_STRING);
      parser.reset();
      for (state in states) {
        parser.currentState = state;
        parse(parser, "\x9D");
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.OSC_STRING);
        parser.reset();
      }
    });
    it("state OSC_STRING ignore rules", () => {
      parser.reset();
      const ignored = [
        "\0",
        "",
        "",
        "",
        "",
        "",
        "",
        /* '\x07', */
        "\b",
        "	",
        "\n",
        "\v",
        "\f",
        "\r",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ];
      for (let i = 0; i < ignored.length; ++i) {
        parser.currentState = import_Constants.ParserState.OSC_STRING;
        parse(parser, ignored[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.OSC_STRING);
        import_chai.assert.equal(parser.osc, "");
        parser.reset();
      }
    });
    it("state OSC_STRING put action", () => {
      parser.reset();
      const puts = r(32, 128);
      for (let i = 0; i < puts.length; ++i) {
        parser.currentState = import_Constants.ParserState.OSC_STRING;
        parse(parser, puts[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.OSC_STRING);
        import_chai.assert.equal(parser.osc, puts[i]);
        parser.reset();
      }
    });
    it("state DCS_ENTRY", () => {
      parser.reset();
      parse(parser, "\x1BP");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_ENTRY);
      parser.reset();
      for (state in states) {
        parser.currentState = state;
        parse(parser, "\x90");
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_ENTRY);
        parser.reset();
      }
    });
    it("state DCS_ENTRY ignore rules", () => {
      parser.reset();
      const ignored = [
        "\0",
        "",
        "",
        "",
        "",
        "",
        "",
        "\x07",
        "\b",
        "	",
        "\n",
        "\v",
        "\f",
        "\r",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "\x7F"
      ];
      for (let i = 0; i < ignored.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_ENTRY;
        parse(parser, ignored[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_ENTRY);
        parser.reset();
      }
    });
    it("state DCS_ENTRY --> DCS_PARAM with param/collect actions", () => {
      parser.reset();
      const params = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
      const collect = ["<", "=", ">", "?"];
      for (let i = 0; i < params.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_ENTRY;
        parse(parser, params[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_PARAM);
        import_chai.assert.deepEqual(parser.params, [params[i].charCodeAt(0) - 48]);
        parser.reset();
      }
      parser.currentState = import_Constants.ParserState.DCS_ENTRY;
      parse(parser, ";");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_PARAM);
      import_chai.assert.deepEqual(parser.params, [0, 0]);
      parser.reset();
      for (let i = 0; i < collect.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_ENTRY;
        parse(parser, collect[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_PARAM);
        import_chai.assert.equal(parser.collect, collect[i]);
        parser.reset();
      }
    });
    it("state DCS_PARAM ignore rules", () => {
      parser.reset();
      const ignored = [
        "\0",
        "",
        "",
        "",
        "",
        "",
        "",
        "\x07",
        "\b",
        "	",
        "\n",
        "\v",
        "\f",
        "\r",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "\x7F"
      ];
      for (let i = 0; i < ignored.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_PARAM;
        parse(parser, ignored[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_PARAM);
        parser.reset();
      }
    });
    it("state DCS_PARAM param action", () => {
      parser.reset();
      const params = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
      for (let i = 0; i < params.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_PARAM;
        parse(parser, params[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_PARAM);
        import_chai.assert.deepEqual(parser.params, [params[i].charCodeAt(0) - 48]);
        parser.reset();
      }
      parser.currentState = import_Constants.ParserState.DCS_PARAM;
      parse(parser, ";");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_PARAM);
      import_chai.assert.deepEqual(parser.params, [0, 0]);
      parser.reset();
    });
    it('trans DCS_ENTRY --> DCS_PARAM for ":" (0x3a)', () => {
      parser.reset();
      parser.currentState = import_Constants.ParserState.DCS_ENTRY;
      parse(parser, ":");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_PARAM);
      parser.reset();
    });
    it("trans DCS_PARAM --> DCS_IGNORE", () => {
      parser.reset();
      const chars = ["<", "=", ">", "?"];
      for (let i = 0; i < chars.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_PARAM;
        parse(parser, ";" + chars[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_IGNORE);
        import_chai.assert.deepEqual(parser.params, [0, 0]);
        parser.reset();
      }
    });
    it("trans DCS_INTERMEDIATE --> DCS_IGNORE", () => {
      parser.reset();
      const chars = r(48, 64);
      for (let i = 0; i < chars.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_INTERMEDIATE;
        parse(parser, chars[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_IGNORE);
        parser.reset();
      }
    });
    it("state DCS_IGNORE ignore rules", () => {
      parser.reset();
      let ignored = [
        "\0",
        "",
        "",
        "",
        "",
        "",
        "",
        "\x07",
        "\b",
        "	",
        "\n",
        "\v",
        "\f",
        "\r",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "\x7F"
      ];
      ignored = ignored.concat(r(32, 128));
      for (let i = 0; i < ignored.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_IGNORE;
        parse(parser, ignored[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_IGNORE);
        parser.reset();
      }
    });
    it("trans DCS_ENTRY --> DCS_INTERMEDIATE with collect action", () => {
      parser.reset();
      const collect = r(32, 48);
      for (let i = 0; i < collect.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_ENTRY;
        parse(parser, collect[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_INTERMEDIATE);
        import_chai.assert.equal(parser.collect, collect[i]);
        parser.reset();
      }
    });
    it("trans DCS_PARAM --> DCS_INTERMEDIATE with collect action", () => {
      parser.reset();
      const collect = r(32, 48);
      for (let i = 0; i < collect.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_PARAM;
        parse(parser, collect[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_INTERMEDIATE);
        import_chai.assert.equal(parser.collect, collect[i]);
        parser.reset();
      }
    });
    it("state DCS_INTERMEDIATE ignore rules", () => {
      parser.reset();
      const ignored = [
        "\0",
        "",
        "",
        "",
        "",
        "",
        "",
        "\x07",
        "\b",
        "	",
        "\n",
        "\v",
        "\f",
        "\r",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "\x7F"
      ];
      for (let i = 0; i < ignored.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_INTERMEDIATE;
        parse(parser, ignored[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_INTERMEDIATE);
        parser.reset();
      }
    });
    it("state DCS_INTERMEDIATE collect action", () => {
      parser.reset();
      const collect = r(32, 48);
      for (let i = 0; i < collect.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_INTERMEDIATE;
        parse(parser, collect[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_INTERMEDIATE);
        import_chai.assert.equal(parser.collect, collect[i]);
        parser.reset();
      }
    });
    it("trans DCS_INTERMEDIATE --> DCS_IGNORE", () => {
      parser.reset();
      const chars = r(48, 64);
      for (let i = 0; i < chars.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_INTERMEDIATE;
        parse(parser, " " + chars[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_IGNORE);
        import_chai.assert.equal(parser.collect, " ");
        parser.reset();
      }
    });
    it("trans DCS_ENTRY --> DCS_PASSTHROUGH with hook", () => {
      parser.reset();
      testTerminal.clear();
      const collect = r(64, 127);
      for (let i = 0; i < collect.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_ENTRY;
        parse(parser, collect[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_PASSTHROUGH);
        testTerminal.compare([["dcs hook", [0]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("trans DCS_PARAM --> DCS_PASSTHROUGH with hook", () => {
      parser.reset();
      testTerminal.clear();
      const collect = r(64, 127);
      for (let i = 0; i < collect.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_PARAM;
        parse(parser, collect[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_PASSTHROUGH);
        testTerminal.compare([["dcs hook", [0]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("trans DCS_INTERMEDIATE --> DCS_PASSTHROUGH with hook", () => {
      parser.reset();
      testTerminal.clear();
      const collect = r(64, 127);
      for (let i = 0; i < collect.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_INTERMEDIATE;
        parse(parser, collect[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_PASSTHROUGH);
        testTerminal.compare([["dcs hook", [0]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("state DCS_PASSTHROUGH put action", () => {
      parser.reset();
      testTerminal.clear();
      let puts = r(0, 24);
      puts = puts.concat([""]);
      puts = puts.concat(r(28, 32));
      puts = puts.concat(r(32, 127));
      for (let i = 0; i < puts.length; ++i) {
        parser.currentState = import_Constants.ParserState.DCS_PASSTHROUGH;
        parse(parser, puts[i]);
        import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_PASSTHROUGH);
        testTerminal.compare([["dcs put", puts[i]]]);
        parser.reset();
        testTerminal.clear();
      }
    });
    it("state DCS_PASSTHROUGH ignore", () => {
      parser.reset();
      testTerminal.clear();
      parser.currentState = import_Constants.ParserState.DCS_PASSTHROUGH;
      parse(parser, "\x7F");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_PASSTHROUGH);
      testTerminal.compare([]);
      parser.reset();
      testTerminal.clear();
    });
  });
  function test(s, value, noReset) {
    if (!noReset) {
      parser.reset();
      testTerminal.clear();
    }
    parse(parser, s);
    testTerminal.compare(value);
  }
  describe("escape sequence examples", () => {
    it("CSI with print and execute", () => {
      test(
        "\x1B[<31;5mHello World! \xF6\xE4\xFC\u20AC\nabc",
        [
          ["csi", "<", [31, 5], "m"],
          ["print", "Hello World! \xF6\xE4\xFC\u20AC"],
          ["exe", "\n"],
          ["print", "abc"]
        ],
        null
      );
    });
    it("OSC", () => {
      test("\x1B]0;abc123\u20AC\xF6\xE4\xFC\x07", [
        ["osc", "0;abc123\u20AC\xF6\xE4\xFC, success: true"]
      ], null);
    });
    it("single DCS", () => {
      test("\x1BP1;2;3+$a\xE4bc;d\xE4e\x9C", [
        ["dcs hook", [1, 2, 3]],
        ["dcs put", "\xE4bc;d\xE4e"],
        ["dcs unhook", true]
      ], null);
    });
    it("multi DCS", () => {
      test("\x1BP1;2;3+$abc;de", [
        ["dcs hook", [1, 2, 3]],
        ["dcs put", "bc;de"]
      ], null);
      testTerminal.clear();
      test("abc\x9C", [
        ["dcs put", "abc"],
        ["dcs unhook", true]
      ], true);
    });
    it("print + DCS(C1)", () => {
      test("abc\x901;2;3+$abc;de\x9C", [
        ["print", "abc"],
        ["dcs hook", [1, 2, 3]],
        ["dcs put", "bc;de"],
        ["dcs unhook", true]
      ], null);
    });
    it("print + PM(C1) + print", () => {
      test("abc\x98123tzf\x9Cdefg", [
        ["print", "abc"],
        ["print", "defg"]
      ], null);
    });
    it("print + OSC(C1) + print", () => {
      test("abc\x9D123;tzf\x9Cdefg", [
        ["print", "abc"],
        ["osc", "123;tzf, success: true"],
        ["print", "defg"]
      ], null);
    });
    it("error recovery", () => {
      test("\x1B[1\u20ACabcdefg\x9B<;c", [
        ["print", "abcdefg"],
        ["csi", "<", [0, 0], "c"]
      ], null);
    });
    it("7bit ST should be swallowed", () => {
      test("abc\x9D123;tzf\x1B\\defg", [
        ["print", "abc"],
        ["osc", "123;tzf, success: true"],
        ["print", "defg"]
      ], null);
    });
    it("colon notation in CSI params", () => {
      test(
        "\x1B[<31;5::123:;8mHello World! \xF6\xE4\xFC\u20AC\nabc",
        [
          ["csi", "<", [31, 5, [-1, 123, -1], 8], "m"],
          ["print", "Hello World! \xF6\xE4\xFC\u20AC"],
          ["exe", "\n"],
          ["print", "abc"]
        ],
        null
      );
    });
    it("colon notation in DCS params", () => {
      test("abc\x901;2::55;3+$abc;de\x9C", [
        ["print", "abc"],
        ["dcs hook", [1, 2, [-1, 55], 3]],
        ["dcs put", "bc;de"],
        ["dcs unhook", true]
      ], null);
    });
    it("CAN should abort DCS", () => {
      test("abc\x901;2::55;3+$abc;de", [
        ["print", "abc"],
        ["dcs hook", [1, 2, [-1, 55], 3]],
        ["dcs put", "bc;de"],
        ["dcs unhook", false]
        // false for abort
      ], null);
    });
    it("SUB should abort DCS", () => {
      test("abc\x901;2::55;3+$abc;de", [
        ["print", "abc"],
        ["dcs hook", [1, 2, [-1, 55], 3]],
        ["dcs put", "bc;de"],
        ["dcs unhook", false]
        // false for abort
      ], null);
    });
    it("CAN should abort OSC", () => {
      test("\x1B]0;abc123\u20AC\xF6\xE4\xFC", [
        ["osc", "0;abc123\u20AC\xF6\xE4\xFC, success: false"]
      ], null);
    });
    it("SUB should abort OSC", () => {
      test("\x1B]0;abc123\u20AC\xF6\xE4\xFC", [
        ["osc", "0;abc123\u20AC\xF6\xE4\xFC, success: false"]
      ], null);
    });
  });
  describe("coverage tests", () => {
    it("CSI_IGNORE error", () => {
      parser.reset();
      testTerminal.clear();
      parser.currentState = import_Constants.ParserState.CSI_IGNORE;
      parse(parser, "\u20AC\xF6\xE4\xFC");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.CSI_IGNORE);
      testTerminal.compare([]);
      parser.reset();
      testTerminal.clear();
    });
    it("DCS_IGNORE error", () => {
      parser.reset();
      testTerminal.clear();
      parser.currentState = import_Constants.ParserState.DCS_IGNORE;
      parse(parser, "\u20AC\xF6\xE4\xFC");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_IGNORE);
      testTerminal.compare([]);
      parser.reset();
      testTerminal.clear();
    });
    it("DCS_PASSTHROUGH error", () => {
      parser.reset();
      testTerminal.clear();
      parser.currentState = import_Constants.ParserState.DCS_PASSTHROUGH;
      parse(parser, "\x901;2;3+$a\u20AC\xF6\xE4\xFC");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.DCS_PASSTHROUGH);
      testTerminal.compare([["dcs hook", [1, 2, 3]], ["dcs put", "\u20AC\xF6\xE4\xFC"]]);
      parser.reset();
      testTerminal.clear();
    });
    it("error else of if (code > 159)", () => {
      parser.reset();
      testTerminal.clear();
      parser.currentState = import_Constants.ParserState.GROUND;
      parse(parser, "\x9C");
      import_chai.assert.equal(parser.currentState, import_Constants.ParserState.GROUND);
      testTerminal.compare([]);
      parser.reset();
      testTerminal.clear();
    });
  });
  describe("set/clear handler", () => {
    const INPUT = "\x1B[1;31mhello \x1B%Gwor\x1BEld!\x1B[0m\r\n$>\x1B]1;foo=bar\x1B\\";
    let parser2;
    let print = "";
    const esc = [];
    const csi = [];
    const exe = [];
    const osc = [];
    const dcs = [];
    function clearAccu() {
      print = "";
      esc.length = 0;
      csi.length = 0;
      exe.length = 0;
      osc.length = 0;
      dcs.length = 0;
    }
    beforeEach(() => {
      parser2 = new TestEscapeSequenceParser();
      clearAccu();
    });
    it("print handler", () => {
      parser2.setPrintHandler(function(data, start, end) {
        for (let i = start; i < end; ++i) {
          print += (0, import_TextDecoder.stringFromCodePoint)(data[i]);
        }
      });
      parse(parser2, INPUT);
      import_chai.assert.equal(print, "hello world!$>");
      parser2.clearPrintHandler();
      parser2.clearPrintHandler();
      clearAccu();
      parse(parser2, INPUT);
      import_chai.assert.equal(print, "");
    });
    it("ESC handler", () => {
      parser2.registerEscHandler({ intermediates: "%", final: "G" }, function() {
        esc.push("%G");
        return true;
      });
      parser2.registerEscHandler({ final: "E" }, function() {
        esc.push("E");
        return true;
      });
      parse(parser2, INPUT);
      import_chai.assert.deepEqual(esc, ["%G", "E"]);
      parser2.clearEscHandler({ intermediates: "%", final: "G" });
      parser2.clearEscHandler({ intermediates: "%", final: "G" });
      clearAccu();
      parse(parser2, INPUT);
      import_chai.assert.deepEqual(esc, ["E"]);
      parser2.clearEscHandler({ final: "E" });
      clearAccu();
      parse(parser2, INPUT);
      import_chai.assert.deepEqual(esc, []);
    });
    describe("ESC custom handlers", () => {
      it("prevent fallback", () => {
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          esc.push("default - %G");
          return true;
        });
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          esc.push("custom - %G");
          return true;
        });
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(esc, ["custom - %G"]);
      });
      it("allow fallback", () => {
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          esc.push("default - %G");
          return true;
        });
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          esc.push("custom - %G");
          return false;
        });
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(esc, ["custom - %G", "default - %G"]);
      });
      it("Multiple custom handlers fallback once", () => {
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          esc.push("default - %G");
          return true;
        });
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          esc.push("custom - %G");
          return true;
        });
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          esc.push("custom2 - %G");
          return false;
        });
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(esc, ["custom2 - %G", "custom - %G"]);
      });
      it("Multiple custom handlers no fallback", () => {
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          esc.push("default - %G");
          return true;
        });
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          esc.push("custom - %G");
          return true;
        });
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          esc.push("custom2 - %G");
          return true;
        });
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(esc, ["custom2 - %G"]);
      });
      it("Execution order should go from latest handler down to the original", () => {
        const order = [];
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          order.push(1);
          return true;
        });
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          order.push(2);
          return false;
        });
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          order.push(3);
          return false;
        });
        parse(parser2, "\x1B%G");
        import_chai.assert.deepEqual(order, [3, 2, 1]);
      });
      it("Dispose should work", () => {
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          esc.push("default - %G");
          return true;
        });
        const dispo = parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          esc.push("custom - %G");
          return true;
        });
        dispo.dispose();
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(esc, ["default - %G"]);
      });
      it("Should not corrupt the parser when dispose is called twice", () => {
        parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          esc.push("default - %G");
          return true;
        });
        const dispo = parser2.registerEscHandler({ intermediates: "%", final: "G" }, () => {
          esc.push("custom - %G");
          return true;
        });
        dispo.dispose();
        dispo.dispose();
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(esc, ["default - %G"]);
      });
    });
    it("CSI handler", () => {
      parser2.registerCsiHandler({ final: "m" }, function(params) {
        csi.push(["m", params.toArray(), ""]);
        return true;
      });
      parse(parser2, INPUT);
      import_chai.assert.deepEqual(csi, [["m", [1, 31], ""], ["m", [0], ""]]);
      parser2.clearCsiHandler({ final: "m" });
      parser2.clearCsiHandler({ final: "m" });
      clearAccu();
      parse(parser2, INPUT);
      import_chai.assert.deepEqual(csi, []);
    });
    describe("CSI custom handlers", () => {
      it("Prevent fallback", () => {
        const csiCustom = [];
        parser2.registerCsiHandler({ final: "m" }, (params) => {
          csi.push(["m", params.toArray(), ""]);
          return true;
        });
        parser2.registerCsiHandler({ final: "m" }, (params) => {
          csiCustom.push(["m", params.toArray(), ""]);
          return true;
        });
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(csi, [], "Should not fallback to original handler");
        import_chai.assert.deepEqual(csiCustom, [["m", [1, 31], ""], ["m", [0], ""]]);
      });
      it("Allow fallback", () => {
        const csiCustom = [];
        parser2.registerCsiHandler({ final: "m" }, (params) => {
          csi.push(["m", params.toArray(), ""]);
          return true;
        });
        parser2.registerCsiHandler({ final: "m" }, (params) => {
          csiCustom.push(["m", params.toArray(), ""]);
          return false;
        });
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(csi, [["m", [1, 31], ""], ["m", [0], ""]], "Should fallback to original handler");
        import_chai.assert.deepEqual(csiCustom, [["m", [1, 31], ""], ["m", [0], ""]]);
      });
      it("Multiple custom handlers fallback once", () => {
        const csiCustom = [];
        const csiCustom2 = [];
        parser2.registerCsiHandler({ final: "m" }, (params) => {
          csi.push(["m", params.toArray(), ""]);
          return true;
        });
        parser2.registerCsiHandler({ final: "m" }, (params) => {
          csiCustom.push(["m", params.toArray(), ""]);
          return true;
        });
        parser2.registerCsiHandler({ final: "m" }, (params) => {
          csiCustom2.push(["m", params.toArray(), ""]);
          return false;
        });
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(csi, [], "Should not fallback to original handler");
        import_chai.assert.deepEqual(csiCustom, [["m", [1, 31], ""], ["m", [0], ""]]);
        import_chai.assert.deepEqual(csiCustom2, [["m", [1, 31], ""], ["m", [0], ""]]);
      });
      it("Multiple custom handlers no fallback", () => {
        const csiCustom = [];
        const csiCustom2 = [];
        parser2.registerCsiHandler({ final: "m" }, (params) => {
          csi.push(["m", params.toArray(), ""]);
          return true;
        });
        parser2.registerCsiHandler({ final: "m" }, (params) => {
          csiCustom.push(["m", params.toArray(), ""]);
          return true;
        });
        parser2.registerCsiHandler({ final: "m" }, (params) => {
          csiCustom2.push(["m", params.toArray(), ""]);
          return true;
        });
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(csi, [], "Should not fallback to original handler");
        import_chai.assert.deepEqual(csiCustom, [], "Should not fallback once");
        import_chai.assert.deepEqual(csiCustom2, [["m", [1, 31], ""], ["m", [0], ""]]);
      });
      it("Execution order should go from latest handler down to the original", () => {
        const order = [];
        parser2.registerCsiHandler({ final: "m" }, () => {
          order.push(1);
          return true;
        });
        parser2.registerCsiHandler({ final: "m" }, () => {
          order.push(2);
          return false;
        });
        parser2.registerCsiHandler({ final: "m" }, () => {
          order.push(3);
          return false;
        });
        parse(parser2, "\x1B[0m");
        import_chai.assert.deepEqual(order, [3, 2, 1]);
      });
      it("Dispose should work", () => {
        const csiCustom = [];
        parser2.registerCsiHandler({ final: "m" }, (params) => {
          csi.push(["m", params.toArray(), ""]);
          return true;
        });
        const customHandler = parser2.registerCsiHandler({ final: "m" }, (params) => {
          csiCustom.push(["m", params.toArray(), ""]);
          return true;
        });
        customHandler.dispose();
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(csi, [["m", [1, 31], ""], ["m", [0], ""]]);
        import_chai.assert.deepEqual(csiCustom, [], "Should not use custom handler as it was disposed");
      });
      it("Should not corrupt the parser when dispose is called twice", () => {
        const csiCustom = [];
        parser2.registerCsiHandler({ final: "m" }, (params) => {
          csi.push(["m", params.toArray(), ""]);
          return true;
        });
        const customHandler = parser2.registerCsiHandler({ final: "m" }, (params) => {
          csiCustom.push(["m", params.toArray(), ""]);
          return true;
        });
        customHandler.dispose();
        customHandler.dispose();
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(csi, [["m", [1, 31], ""], ["m", [0], ""]]);
        import_chai.assert.deepEqual(csiCustom, [], "Should not use custom handler as it was disposed");
      });
    });
    it("EXECUTE handler", () => {
      parser2.setExecuteHandler("\n", function() {
        exe.push("\n");
        return true;
      });
      parser2.setExecuteHandler("\r", function() {
        exe.push("\r");
        return true;
      });
      parse(parser2, INPUT);
      import_chai.assert.deepEqual(exe, ["\r", "\n"]);
      parser2.clearExecuteHandler("\r");
      parser2.clearExecuteHandler("\r");
      clearAccu();
      parse(parser2, INPUT);
      import_chai.assert.deepEqual(exe, ["\n"]);
    });
    it("OSC handler", () => {
      parser2.registerOscHandler(1, new import_OscParser.OscHandler(function(data) {
        osc.push([1, data]);
        return true;
      }));
      parse(parser2, INPUT);
      import_chai.assert.deepEqual(osc, [[1, "foo=bar"]]);
      parser2.clearOscHandler(1);
      parser2.clearOscHandler(1);
      clearAccu();
      parse(parser2, INPUT);
      import_chai.assert.deepEqual(osc, []);
    });
    describe("OSC custom handlers", () => {
      it("Prevent fallback", () => {
        const oscCustom = [];
        parser2.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
          osc.push([1, data]);
          return true;
        }));
        parser2.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
          oscCustom.push([1, data]);
          return true;
        }));
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(osc, [], "Should not fallback to original handler");
        import_chai.assert.deepEqual(oscCustom, [[1, "foo=bar"]]);
      });
      it("Allow fallback", () => {
        const oscCustom = [];
        parser2.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
          osc.push([1, data]);
          return true;
        }));
        parser2.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
          oscCustom.push([1, data]);
          return false;
        }));
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(osc, [[1, "foo=bar"]], "Should fallback to original handler");
        import_chai.assert.deepEqual(oscCustom, [[1, "foo=bar"]]);
      });
      it("Multiple custom handlers fallback once", () => {
        const oscCustom = [];
        const oscCustom2 = [];
        parser2.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
          osc.push([1, data]);
          return true;
        }));
        parser2.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
          oscCustom.push([1, data]);
          return true;
        }));
        parser2.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
          oscCustom2.push([1, data]);
          return false;
        }));
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(osc, [], "Should not fallback to original handler");
        import_chai.assert.deepEqual(oscCustom, [[1, "foo=bar"]]);
        import_chai.assert.deepEqual(oscCustom2, [[1, "foo=bar"]]);
      });
      it("Multiple custom handlers no fallback", () => {
        const oscCustom = [];
        const oscCustom2 = [];
        parser2.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
          osc.push([1, data]);
          return true;
        }));
        parser2.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
          oscCustom.push([1, data]);
          return true;
        }));
        parser2.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
          oscCustom2.push([1, data]);
          return true;
        }));
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(osc, [], "Should not fallback to original handler");
        import_chai.assert.deepEqual(oscCustom, [], "Should not fallback once");
        import_chai.assert.deepEqual(oscCustom2, [[1, "foo=bar"]]);
      });
      it("Execution order should go from latest handler down to the original", () => {
        const order = [];
        parser2.registerOscHandler(1, new import_OscParser.OscHandler(() => {
          order.push(1);
          return true;
        }));
        parser2.registerOscHandler(1, new import_OscParser.OscHandler(() => {
          order.push(2);
          return false;
        }));
        parser2.registerOscHandler(1, new import_OscParser.OscHandler(() => {
          order.push(3);
          return false;
        }));
        parse(parser2, "\x1B]1;foo=bar\x1B\\");
        import_chai.assert.deepEqual(order, [3, 2, 1]);
      });
      it("Dispose should work", () => {
        const oscCustom = [];
        parser2.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
          osc.push([1, data]);
          return true;
        }));
        const customHandler = parser2.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
          oscCustom.push([1, data]);
          return true;
        }));
        customHandler.dispose();
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(osc, [[1, "foo=bar"]]);
        import_chai.assert.deepEqual(oscCustom, [], "Should not use custom handler as it was disposed");
      });
      it("Should not corrupt the parser when dispose is called twice", () => {
        const oscCustom = [];
        parser2.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
          osc.push([1, data]);
          return true;
        }));
        const customHandler = parser2.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
          oscCustom.push([1, data]);
          return true;
        }));
        customHandler.dispose();
        customHandler.dispose();
        parse(parser2, INPUT);
        import_chai.assert.deepEqual(osc, [[1, "foo=bar"]]);
        import_chai.assert.deepEqual(oscCustom, [], "Should not use custom handler as it was disposed");
      });
    });
    it("DCS handler", () => {
      parser2.registerDcsHandler({ intermediates: "+", final: "p" }, {
        hook: function(params) {
          dcs.push(["hook", "", params.toArray(), 0]);
        },
        put: function(data, start, end) {
          let s = "";
          for (let i = start; i < end; ++i) {
            s += (0, import_TextDecoder.stringFromCodePoint)(data[i]);
          }
          dcs.push(["put", s]);
        },
        unhook: function() {
          dcs.push(["unhook"]);
          return true;
        }
      });
      parse(parser2, "\x1BP1;2;3+pabc");
      parse(parser2, ";de\x9C");
      import_chai.assert.deepEqual(dcs, [
        ["hook", "", [1, 2, 3], 0],
        ["put", "abc"],
        ["put", ";de"],
        ["unhook"]
      ]);
      parser2.clearDcsHandler({ intermediates: "+", final: "p" });
      parser2.clearDcsHandler({ intermediates: "+", final: "p" });
      clearAccu();
      parse(parser2, "\x1BP1;2;3+pabc");
      parse(parser2, ";de\x9C");
      import_chai.assert.deepEqual(dcs, []);
    });
    describe("DCS custom handlers", () => {
      const DCS_INPUT = "\x1BP1;2;3+pabc\x1B\\";
      it("Prevent fallback", () => {
        const dcsCustom = [];
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler((data, params) => {
          dcsCustom.push(["A", params.toArray(), data]);
          return true;
        }));
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler((data, params) => {
          dcsCustom.push(["B", params.toArray(), data]);
          return true;
        }));
        parse(parser2, DCS_INPUT);
        import_chai.assert.deepEqual(dcsCustom, [["B", [1, 2, 3], "abc"]]);
      });
      it("Allow fallback", () => {
        const dcsCustom = [];
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler((data, params) => {
          dcsCustom.push(["A", params.toArray(), data]);
          return true;
        }));
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler((data, params) => {
          dcsCustom.push(["B", params.toArray(), data]);
          return false;
        }));
        parse(parser2, DCS_INPUT);
        import_chai.assert.deepEqual(dcsCustom, [["B", [1, 2, 3], "abc"], ["A", [1, 2, 3], "abc"]]);
      });
      it("Multiple custom handlers fallback once", () => {
        const dcsCustom = [];
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler((data, params) => {
          dcsCustom.push(["A", params.toArray(), data]);
          return true;
        }));
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler((data, params) => {
          dcsCustom.push(["B", params.toArray(), data]);
          return true;
        }));
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler((data, params) => {
          dcsCustom.push(["C", params.toArray(), data]);
          return false;
        }));
        parse(parser2, DCS_INPUT);
        import_chai.assert.deepEqual(dcsCustom, [["C", [1, 2, 3], "abc"], ["B", [1, 2, 3], "abc"]]);
      });
      it("Multiple custom handlers no fallback", () => {
        const dcsCustom = [];
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler((data, params) => {
          dcsCustom.push(["A", params.toArray(), data]);
          return true;
        }));
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler((data, params) => {
          dcsCustom.push(["B", params.toArray(), data]);
          return true;
        }));
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler((data, params) => {
          dcsCustom.push(["C", params.toArray(), data]);
          return true;
        }));
        parse(parser2, DCS_INPUT);
        import_chai.assert.deepEqual(dcsCustom, [["C", [1, 2, 3], "abc"]]);
      });
      it("Execution order should go from latest handler down to the original", () => {
        const order = [];
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler(() => {
          order.push(1);
          return true;
        }));
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler(() => {
          order.push(2);
          return false;
        }));
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler(() => {
          order.push(3);
          return false;
        }));
        parse(parser2, DCS_INPUT);
        import_chai.assert.deepEqual(order, [3, 2, 1]);
      });
      it("Dispose should work", () => {
        const dcsCustom = [];
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler((data, params) => {
          dcsCustom.push(["A", params.toArray(), data]);
          return true;
        }));
        const dispo = parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler((data, params) => {
          dcsCustom.push(["B", params.toArray(), data]);
          return true;
        }));
        dispo.dispose();
        parse(parser2, DCS_INPUT);
        import_chai.assert.deepEqual(dcsCustom, [["A", [1, 2, 3], "abc"]]);
      });
      it("Should not corrupt the parser when dispose is called twice", () => {
        const dcsCustom = [];
        parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler((data, params) => {
          dcsCustom.push(["A", params.toArray(), data]);
          return true;
        }));
        const dispo = parser2.registerDcsHandler({ intermediates: "+", final: "p" }, new import_DcsParser.DcsHandler((data, params) => {
          dcsCustom.push(["B", params.toArray(), data]);
          return true;
        }));
        dispo.dispose();
        dispo.dispose();
        parse(parser2, DCS_INPUT);
        import_chai.assert.deepEqual(dcsCustom, [["A", [1, 2, 3], "abc"]]);
      });
    });
    it("ERROR handler", () => {
      let errorState = null;
      parser2.setErrorHandler(function(state2) {
        errorState = state2;
        return state2;
      });
      parse(parser2, "\x1B[1;2;\u20AC;3m");
      import_chai.assert.deepEqual(errorState, {
        position: 6,
        code: "\u20AC".charCodeAt(0),
        currentState: import_Constants.ParserState.CSI_PARAM,
        collect: 0,
        params: import_Params.Params.fromArray([1, 2, 0]),
        // extra zero here
        abort: false
      });
      parser2.clearErrorHandler();
      parser2.clearErrorHandler();
      errorState = null;
      parse(parser2, "\x1B[1;2;a;3m");
      import_chai.assert.equal(errorState, null);
    });
  });
  describe("function identifiers", () => {
    describe("registration limits", () => {
      it("prefix range 0x3c .. 0x3f, one byte", () => {
        for (let i = 60; i <= 63; ++i) {
          const c = String.fromCharCode(i);
          import_chai.assert.equal(parser.identToString(parser.identifier({ prefix: c, final: "z" })), c + "z");
        }
        import_chai.assert.throws(() => {
          parser.identifier({ prefix: ";", final: "z" });
        }, "prefix must be in range 0x3c .. 0x3f");
        import_chai.assert.throws(() => {
          parser.identifier({ prefix: "@", final: "z" });
        }, "prefix must be in range 0x3c .. 0x3f");
        import_chai.assert.throws(() => {
          parser.identifier({ prefix: "??", final: "z" });
        }, "only one byte as prefix supported");
      });
      it("intermediates range 0x20 .. 0x2f, up to two bytes", () => {
        for (let i = 32; i <= 47; ++i) {
          const c = String.fromCharCode(i);
          import_chai.assert.equal(parser.identToString(parser.identifier({ intermediates: c + c, final: "z" })), c + c + "z");
        }
        import_chai.assert.throws(() => {
          parser.identifier({ intermediates: "", final: "z" });
        }, "intermediate must be in range 0x20 .. 0x2f");
        import_chai.assert.throws(() => {
          parser.identifier({ intermediates: "0", final: "z" });
        }, "intermediate must be in range 0x20 .. 0x2f");
        import_chai.assert.throws(() => {
          parser.identifier({ intermediates: "!!!", final: "z" });
        }, "only two bytes as intermediates are supported");
      });
      it("final CSI/DCS range 0x40 .. 0x7e (default), one byte", () => {
        for (let i = 64; i <= 126; ++i) {
          const c = String.fromCharCode(i);
          import_chai.assert.equal(parser.identToString(parser.identifier({ final: c })), c);
        }
        import_chai.assert.throws(() => {
          parser.identifier({ final: "?" });
        }, "final must be in range 64 .. 126");
        import_chai.assert.throws(() => {
          parser.identifier({ final: "\x7F" });
        }, "final must be in range 64 .. 126");
        import_chai.assert.throws(() => {
          parser.identifier({ final: "zz" });
        }, "final must be a single byte");
      });
      it("final ESC range 0x30 .. 0x7e, one byte", () => {
        for (let i = 48; i <= 126; ++i) {
          const final = String.fromCharCode(i);
          let handler;
          import_chai.assert.doesNotThrow(() => {
            handler = parser.registerEscHandler({ final }, () => true);
          }, "final must be in range 48 .. 126");
          if (handler) handler.dispose();
        }
        import_chai.assert.throws(() => {
          parser.registerEscHandler({ final: "/" }, () => true);
        }, "final must be in range 48 .. 126");
        import_chai.assert.throws(() => {
          parser.registerEscHandler({ final: "\x7F" }, () => true);
        }, "final must be in range 48 .. 126");
      });
      it("id calculation - should stacking prefix -> intermediate -> final", () => {
        import_chai.assert.equal(parser.identToString(parser.identifier({ final: "z" })), "z");
        import_chai.assert.equal(parser.identToString(parser.identifier({ prefix: "?", final: "z" })), "?z");
        import_chai.assert.equal(parser.identToString(parser.identifier({ intermediates: "!", final: "z" })), "!z");
        import_chai.assert.equal(parser.identToString(parser.identifier({ prefix: "?", intermediates: "!", final: "z" })), "?!z");
        import_chai.assert.equal(parser.identToString(parser.identifier({ prefix: "?", intermediates: "!!", final: "z" })), "?!!z");
      });
    });
    describe("identifier invocation", () => {
      it("ESC", () => {
        const callstack = [];
        const h1 = parser.registerEscHandler({ final: "z" }, () => {
          callstack.push("z");
          return true;
        });
        const h2 = parser.registerEscHandler({ intermediates: "!", final: "z" }, () => {
          callstack.push("!z");
          return true;
        });
        const h3 = parser.registerEscHandler({ intermediates: "!!", final: "z" }, () => {
          callstack.push("!!z");
          return true;
        });
        parse(parser, "\x1Bz\x1B!z\x1B!!z");
        h1.dispose();
        h2.dispose();
        h3.dispose();
        parse(parser, "\x1Bz\x1B!z\x1B!!z");
        import_chai.assert.deepEqual(callstack, ["z", "!z", "!!z"]);
      });
      it("CSI", () => {
        const callstack = [];
        const h1 = parser.registerCsiHandler({ final: "z" }, (params) => {
          callstack.push(["z", params.toArray()]);
          return true;
        });
        const h2 = parser.registerCsiHandler({ intermediates: "!", final: "z" }, (params) => {
          callstack.push(["!z", params.toArray()]);
          return true;
        });
        const h3 = parser.registerCsiHandler({ intermediates: "!!", final: "z" }, (params) => {
          callstack.push(["!!z", params.toArray()]);
          return true;
        });
        const h4 = parser.registerCsiHandler({ prefix: "?", final: "z" }, (params) => {
          callstack.push(["?z", params.toArray()]);
          return true;
        });
        const h5 = parser.registerCsiHandler({ prefix: "?", intermediates: "!", final: "z" }, (params) => {
          callstack.push(["?!z", params.toArray()]);
          return true;
        });
        const h6 = parser.registerCsiHandler({ prefix: "?", intermediates: "!!", final: "z" }, (params) => {
          callstack.push(["?!!z", params.toArray()]);
          return true;
        });
        parse(parser, "\x1B[1;z\x1B[1;!z\x1B[1;!!z\x1B[?1;z\x1B[?1;!z\x1B[?1;!!z");
        h1.dispose();
        h2.dispose();
        h3.dispose();
        h4.dispose();
        h5.dispose();
        h6.dispose();
        parse(parser, "\x1B[1;z\x1B[1;!z\x1B[1;!!z\x1B[?1;z\x1B[?1;!z\x1B[?1;!!z");
        import_chai.assert.deepEqual(
          callstack,
          [["z", [1, 0]], ["!z", [1, 0]], ["!!z", [1, 0]], ["?z", [1, 0]], ["?!z", [1, 0]], ["?!!z", [1, 0]]]
        );
      });
      it("DCS", () => {
        const callstack = [];
        const h1 = parser.registerDcsHandler({ final: "z" }, new import_DcsParser.DcsHandler((data, params) => {
          callstack.push(["z", params.toArray(), data]);
          return true;
        }));
        const h2 = parser.registerDcsHandler({ intermediates: "!", final: "z" }, new import_DcsParser.DcsHandler((data, params) => {
          callstack.push(["!z", params.toArray(), data]);
          return true;
        }));
        const h3 = parser.registerDcsHandler({ intermediates: "!!", final: "z" }, new import_DcsParser.DcsHandler((data, params) => {
          callstack.push(["!!z", params.toArray(), data]);
          return true;
        }));
        const h4 = parser.registerDcsHandler({ prefix: "?", final: "z" }, new import_DcsParser.DcsHandler((data, params) => {
          callstack.push(["?z", params.toArray(), data]);
          return true;
        }));
        const h5 = parser.registerDcsHandler({ prefix: "?", intermediates: "!", final: "z" }, new import_DcsParser.DcsHandler((data, params) => {
          callstack.push(["?!z", params.toArray(), data]);
          return true;
        }));
        const h6 = parser.registerDcsHandler({ prefix: "?", intermediates: "!!", final: "z" }, new import_DcsParser.DcsHandler((data, params) => {
          callstack.push(["?!!z", params.toArray(), data]);
          return true;
        }));
        parse(parser, "\x1BP1;zAB\x1B\\\x1BP1;!zAB\x1B\\\x1BP1;!!zAB\x1B\\\x1BP?1;zAB\x1B\\\x1BP?1;!zAB\x1B\\\x1BP?1;!!zAB\x1B\\");
        h1.dispose();
        h2.dispose();
        h3.dispose();
        h4.dispose();
        h5.dispose();
        h6.dispose();
        parse(parser, "\x1BP1;zAB\x1B\\\x1BP1;!zAB\x1B\\\x1BP1;!!zAB\x1B\\\x1BP?1;zAB\x1B\\\x1BP?1;!zAB\x1B\\\x1BP?1;!!zAB\x1B\\");
        import_chai.assert.deepEqual(
          callstack,
          [
            ["z", [1, 0], "AB"],
            ["!z", [1, 0], "AB"],
            ["!!z", [1, 0], "AB"],
            ["?z", [1, 0], "AB"],
            ["?!z", [1, 0], "AB"],
            ["?!!z", [1, 0], "AB"]
          ]
        );
      });
    });
  });
});
function parseSync(parser, data) {
  const container = new Uint32Array(data.length);
  const decoder = new import_TextDecoder.StringToUtf32();
  return parser.parse(container, decoder.decode(data, container));
}
async function parseP(parser, data) {
  const container = new Uint32Array(data.length);
  const decoder = new import_TextDecoder.StringToUtf32();
  const len = decoder.decode(data, container);
  let result;
  let prev;
  while (result = parser.parse(container, len, prev)) {
    prev = await result;
  }
}
function evalStackSaves(stackSaves, data) {
  import_chai.assert.equal(stackSaves.length, data.length);
  for (let i = 0; i < data.length; ++i) {
    import_chai.assert.equal(stackSaves[i].chunkPos, data[i][0]);
    import_chai.assert.equal(stackSaves[i].state, data[i][1]);
    import_chai.assert.equal(stackSaves[i].handlerPos, data[i][2]);
  }
}
async function throwsAsync(fn, message) {
  let msg;
  try {
    await fn();
  } catch (e) {
    if (e instanceof Error) {
      msg = e.message;
    } else if (typeof e === "string") {
      msg = e;
    }
    if (typeof message === "string") {
      import_chai.assert.equal(msg, message);
    }
    return;
  }
  import_chai.assert.throws(fn, message);
}
describe("EscapeSequenceParser - async", () => {
  const INPUT = "\x1B[1;31mhello \x1B%Gwor\x1BEld!\x1B[0m\r\n$>\x1BP1;2axyz\x1B\\\x1B]1;foo=bar\x1B\\FIN";
  let RESULT;
  let parser;
  const callstack = [];
  function clearAccu() {
    callstack.length = 0;
    parser.trackedStack.length = 0;
  }
  beforeEach(() => {
    RESULT = [
      ["SGR", [1, 31]],
      ["PRINT", "hello "],
      ["ESC %G"],
      ["PRINT", "wor"],
      ["ESC E"],
      ["PRINT", "ld!"],
      ["SGR", [0]],
      ["EXE \r"],
      ["EXE \n"],
      ["PRINT", "$>"],
      ["DCS a", ["xyz", [1, 2]]],
      ["OSC 1", "foo=bar"],
      ["PRINT", "FIN"]
    ];
    parser = new TestEscapeSequenceParser();
    parser.reset();
    parser.trackStackSavesOnPause();
    clearAccu();
  });
  describe("sync handlers should behave as before", () => {
    beforeEach(() => {
      parser.setPrintHandler((data, start, end) => {
        let result = "";
        for (let i = start; i < end; ++i) {
          result += (0, import_TextDecoder.stringFromCodePoint)(data[i]);
        }
        callstack.push(["PRINT", result]);
      });
      parser.registerCsiHandler({ final: "m" }, (params) => {
        callstack.push(["SGR", params.toArray()]);
        return true;
      });
      parser.registerEscHandler({ intermediates: "%", final: "G" }, () => {
        callstack.push(["ESC %G"]);
        return true;
      });
      parser.registerEscHandler({ final: "E" }, () => {
        callstack.push(["ESC E"]);
        return true;
      });
      parser.setExecuteHandler("\r", () => {
        callstack.push(["EXE \r"]);
        return true;
      });
      parser.setExecuteHandler("\n", () => {
        callstack.push(["EXE \n"]);
        return true;
      });
      parser.registerOscHandler(1, new import_OscParser.OscHandler((data) => {
        callstack.push(["OSC 1", data]);
        return true;
      }));
      parser.registerDcsHandler({ final: "a" }, new import_DcsParser.DcsHandler((data, params) => {
        callstack.push(["DCS a", [data, params.toArray()]]);
        return true;
      }));
    });
    it("sync handlers keep being parsed in sync mode", () => {
      import_chai.assert.equal(!parseSync(parser, INPUT), true);
      import_chai.assert.equal(parser.parseStack.state, import_Types.ParserStackType.NONE);
      import_chai.assert.equal(parser.trackedStack.length, 0);
    });
    it("correct result on sync parse call", () => {
      parseSync(parser, INPUT);
      import_chai.assert.deepEqual(callstack, RESULT);
      import_chai.assert.equal(parser.trackedStack.length, 0);
    });
    it("correct result on async parse call", async () => {
      await parseP(parser, INPUT);
      import_chai.assert.deepEqual(callstack, RESULT);
      import_chai.assert.equal(parser.trackedStack.length, 0);
    });
  });
  describe("async handlers", () => {
    beforeEach(() => {
      parser.setPrintHandler((data, start, end) => {
        let result = "";
        for (let i = start; i < end; ++i) {
          result += (0, import_TextDecoder.stringFromCodePoint)(data[i]);
        }
        callstack.push(["PRINT", result]);
      });
      parser.registerCsiHandler({ final: "m" }, async (params) => {
        callstack.push(["SGR", params.toArray()]);
        return true;
      });
      parser.registerEscHandler({ intermediates: "%", final: "G" }, async () => {
        callstack.push(["ESC %G"]);
        return true;
      });
      parser.registerEscHandler({ final: "E" }, async () => {
        callstack.push(["ESC E"]);
        return true;
      });
      parser.setExecuteHandler("\r", () => {
        callstack.push(["EXE \r"]);
        return true;
      });
      parser.setExecuteHandler("\n", () => {
        callstack.push(["EXE \n"]);
        return true;
      });
      parser.registerOscHandler(1, new import_OscParser.OscHandler(async (data) => {
        callstack.push(["OSC 1", data]);
        return true;
      }));
      parser.registerDcsHandler({ final: "a" }, new import_DcsParser.DcsHandler(async (data, params) => {
        callstack.push(["DCS a", [data, params.toArray()]]);
        return true;
      }));
    });
    it("sync parse call does not work anymore", () => {
      import_chai.assert.notEqual(!parseSync(parser, INPUT), true);
      import_chai.assert.notDeepEqual(callstack, RESULT);
      import_chai.assert.equal(parser.trackedStack.length, 1);
    });
    it("improper continuation should throw", async () => {
      import_chai.assert.notEqual(!parseSync(parser, INPUT), true);
      import_chai.assert.notDeepEqual(callstack, RESULT);
      import_chai.assert.throws(() => parseSync(parser, INPUT), "improper continuation due to previous async handler, giving up parsing");
      import_chai.assert.throws(() => parseSync(parser, "random"), "improper continuation due to previous async handler, giving up parsing");
      await throwsAsync(() => parseP(parser, "foobar"), "improper continuation due to previous async handler, giving up parsing");
      parser.reset();
      await parseP(parser, INPUT);
    });
    it("correct result on awaited parse call", async () => {
      await parseP(parser, INPUT);
      import_chai.assert.deepEqual(callstack, RESULT);
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
    });
    it("correct result on chunked awaited parse calls", async () => {
      RESULT = [
        ["SGR", [1, 31]],
        ["PRINT", "h"],
        // due to single char input PRINT is split
        ["PRINT", "e"],
        ["PRINT", "l"],
        ["PRINT", "l"],
        ["PRINT", "o"],
        ["PRINT", " "],
        ["ESC %G"],
        ["PRINT", "w"],
        ["PRINT", "o"],
        ["PRINT", "r"],
        ["ESC E"],
        ["PRINT", "l"],
        ["PRINT", "d"],
        ["PRINT", "!"],
        ["SGR", [0]],
        ["EXE \r"],
        ["EXE \n"],
        ["PRINT", "$"],
        ["PRINT", ">"],
        ["DCS a", ["xyz", [1, 2]]],
        ["OSC 1", "foo=bar"],
        ["PRINT", "F"],
        ["PRINT", "I"],
        ["PRINT", "N"]
      ];
      for (let i = 0; i < INPUT.length; ++i) {
        await parseP(parser, INPUT[i]);
      }
      import_chai.assert.deepEqual(callstack, RESULT);
      evalStackSaves(parser.trackedStack, [
        [0, import_Types.ParserStackType.CSI, 0],
        [0, import_Types.ParserStackType.ESC, 0],
        [0, import_Types.ParserStackType.ESC, 0],
        [0, import_Types.ParserStackType.CSI, 0],
        [0, import_Types.ParserStackType.DCS, 0],
        [0, import_Types.ParserStackType.OSC, 0]
      ]);
    });
    it("multiple async SGR handlers", async () => {
      const SGR2 = parser.registerCsiHandler({ final: "m" }, async (params) => {
        callstack.push(["2# SGR", params.toArray()]);
        return false;
      });
      await parseP(parser, INPUT);
      for (let i = 0; i < callstack.length; ++i) {
        const entry = callstack[i];
        if (entry[0] === "2# SGR") import_chai.assert.equal(callstack[i + 1][0], "SGR", "Should fallback to original handler");
      }
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 1],
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 1],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
      SGR2.dispose();
      await parseP(parser, INPUT);
      import_chai.assert.deepEqual(callstack, RESULT, "Should not call custom handler");
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
      const SGR22 = parser.registerCsiHandler({ final: "m" }, async (params) => {
        callstack.push(["2# SGR", params.toArray()]);
        return true;
      });
      await parseP(parser, INPUT);
      for (let i = 0; i < callstack.length; ++i) {
        const entry = callstack[i];
        if (entry[0] === "2# SGR") import_chai.assert.notEqual(callstack[i + 1][0], "SGR", "Should not fallback to original handler");
      }
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 1],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 1],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
      SGR22.dispose();
      await parseP(parser, INPUT);
      import_chai.assert.deepEqual(callstack, RESULT, "Should not call custom handler");
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
    });
    it("multiple async ESC handlers", async () => {
      const ESC2 = parser.registerEscHandler({ final: "E" }, async () => {
        callstack.push(["2# ESC E"]);
        return false;
      });
      await parseP(parser, INPUT);
      for (let i = 0; i < callstack.length; ++i) {
        const entry = callstack[i];
        if (entry[0] === "2# ESC E") import_chai.assert.equal(callstack[i + 1][0], "ESC E", "Should fallback to original handler");
      }
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 1],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
      ESC2.dispose();
      await parseP(parser, INPUT);
      import_chai.assert.deepEqual(callstack, RESULT, "Should not call custom handler");
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
      const ESC22 = parser.registerEscHandler({ final: "E" }, async () => {
        callstack.push(["2# ESC E"]);
        return true;
      });
      await parseP(parser, INPUT);
      for (let i = 0; i < callstack.length; ++i) {
        const entry = callstack[i];
        if (entry[0] === "2# ESC E") import_chai.assert.notEqual(callstack[i + 1][0], "ESC E", "Should not fallback to original handler");
      }
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 1],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
      ESC22.dispose();
      await parseP(parser, INPUT);
      import_chai.assert.deepEqual(callstack, RESULT, "Should not call custom handler");
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
    });
    it("sync/async SGR mixed", async () => {
      const SGR2 = parser.registerCsiHandler({ final: "m" }, (params) => {
        callstack.push(["2# SGR", params.toArray()]);
        return false;
      });
      const SGR3 = parser.registerCsiHandler({ final: "m" }, async (params) => {
        callstack.push(["3# SGR", params.toArray()]);
        return false;
      });
      await parseP(parser, INPUT);
      for (let i = 0; i < callstack.length; ++i) {
        const entry = callstack[i];
        if (entry[0] === "3# SGR") {
          import_chai.assert.equal(callstack[i + 1][0], "2# SGR", "Should fallback to next handler");
          import_chai.assert.equal(callstack[i + 2][0], "SGR", "Should fallback to original handler");
        }
      }
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 2],
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 2],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
      SGR2.dispose();
      await parseP(parser, INPUT);
      for (let i = 0; i < callstack.length; ++i) {
        const entry = callstack[i];
        if (entry[0] === "3# SGR") {
          import_chai.assert.equal(callstack[i + 1][0], "SGR", "Should fallback to original handler");
        }
      }
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 1],
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 1],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
      SGR3.dispose();
      await parseP(parser, INPUT);
      import_chai.assert.deepEqual(callstack, RESULT, "Should not call custom handler");
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
    });
    it("multiple async OSC handlers", async () => {
      const OSC2 = parser.registerOscHandler(1, new import_OscParser.OscHandler(async (data) => {
        callstack.push(["2# OSC 1", data]);
        return false;
      }));
      await parseP(parser, INPUT);
      for (let i = 0; i < callstack.length; ++i) {
        const entry = callstack[i];
        if (entry[0] === "2# OSC 1") import_chai.assert.equal(callstack[i + 1][0], "OSC 1", "Should fallback to original handler");
      }
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
      OSC2.dispose();
      await parseP(parser, INPUT);
      import_chai.assert.deepEqual(callstack, RESULT, "Should not call custom handler");
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
      const OSC22 = parser.registerOscHandler(1, new import_OscParser.OscHandler(async (data) => {
        callstack.push(["2# OSC 1", data]);
        return true;
      }));
      await parseP(parser, INPUT);
      for (let i = 0; i < callstack.length; ++i) {
        const entry = callstack[i];
        if (entry[0] === "2# OSC 1") import_chai.assert.notEqual(callstack[i + 1][0], "OSC 1", "Should fallback to original handler");
      }
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
      OSC22.dispose();
      await parseP(parser, INPUT);
      import_chai.assert.deepEqual(callstack, RESULT, "Should not call custom handler");
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
    });
    it("multiple async DCS handlers", async () => {
      const DCS2 = parser.registerDcsHandler({ final: "a" }, new import_DcsParser.DcsHandler(async (data, params) => {
        callstack.push(["#2 DCS a", [data, params.toArray()]]);
        return false;
      }));
      await parseP(parser, INPUT);
      for (let i = 0; i < callstack.length; ++i) {
        const entry = callstack[i];
        if (entry[0] === "2# DCS a") import_chai.assert.equal(callstack[i + 1][0], "DCS a", "Should fallback to original handler");
      }
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
      DCS2.dispose();
      await parseP(parser, INPUT);
      import_chai.assert.deepEqual(callstack, RESULT, "Should not call custom handler");
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
      const DCS22 = parser.registerDcsHandler({ final: "a" }, new import_DcsParser.DcsHandler(async (data, params) => {
        callstack.push(["#2 DCS a", [data, params.toArray()]]);
        return true;
      }));
      await parseP(parser, INPUT);
      for (let i = 0; i < callstack.length; ++i) {
        const entry = callstack[i];
        if (entry[0] === "2# DCS a") import_chai.assert.notEqual(callstack[i + 1][0], "DCS a", "Should fallback to original handler");
      }
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
      DCS22.dispose();
      await parseP(parser, INPUT);
      import_chai.assert.deepEqual(callstack, RESULT, "Should not call custom handler");
      evalStackSaves(parser.trackedStack, [
        [6, import_Types.ParserStackType.CSI, 0],
        [15, import_Types.ParserStackType.ESC, 0],
        [20, import_Types.ParserStackType.ESC, 0],
        [27, import_Types.ParserStackType.CSI, 0],
        [41, import_Types.ParserStackType.DCS, 0],
        [54, import_Types.ParserStackType.OSC, 0]
      ]);
      clearAccu();
    });
  });
});
//# sourceMappingURL=EscapeSequenceParser.test.js.map
