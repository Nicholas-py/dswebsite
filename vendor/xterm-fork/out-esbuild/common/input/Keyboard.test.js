"use strict";
var import_chai = require("chai");
var import_Keyboard = require("common/input/Keyboard");
function testEvaluateKeyboardEvent(partialEvent, partialOptions = {}) {
  const event = {
    altKey: partialEvent.altKey || false,
    ctrlKey: partialEvent.ctrlKey || false,
    shiftKey: partialEvent.shiftKey || false,
    metaKey: partialEvent.metaKey || false,
    keyCode: partialEvent.keyCode !== void 0 ? partialEvent.keyCode : 0,
    code: partialEvent.code || "",
    key: partialEvent.key || "",
    type: partialEvent.type || ""
  };
  const options = {
    applicationCursorMode: partialOptions.applicationCursorMode || false,
    isMac: partialOptions.isMac || false,
    macOptionIsMeta: partialOptions.macOptionIsMeta || false
  };
  return (0, import_Keyboard.evaluateKeyboardEvent)(event, options.applicationCursorMode, options.isMac, options.macOptionIsMeta);
}
describe("Keyboard", () => {
  describe("evaluateKeyEscapeSequence", () => {
    it("should return the correct escape sequence for unmodified keys", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 8 }).key, "\x7F");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 9 }).key, "	");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 13 }).key, "\r");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 27 }).key, "\x1B");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 33 }).key, "\x1B[5~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 34 }).key, "\x1B[6~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 35 }).key, "\x1B[F");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 36 }).key, "\x1B[H");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 37 }).key, "\x1B[D");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 38 }).key, "\x1B[A");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 39 }).key, "\x1B[C");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 40 }).key, "\x1B[B");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 45 }).key, "\x1B[2~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 46 }).key, "\x1B[3~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 112 }).key, "\x1BOP");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 113 }).key, "\x1BOQ");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 114 }).key, "\x1BOR");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 115 }).key, "\x1BOS");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 116 }).key, "\x1B[15~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 117 }).key, "\x1B[17~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 118 }).key, "\x1B[18~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 119 }).key, "\x1B[19~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 120 }).key, "\x1B[20~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 121 }).key, "\x1B[21~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 122 }).key, "\x1B[23~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 123 }).key, "\x1B[24~");
    });
    it("should return \\x1b[3;5~ for ctrl+delete", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 46 }).key, "\x1B[3;5~");
    });
    it("should return \\x1b[3;2~ for shift+delete", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 46 }).key, "\x1B[3;2~");
    });
    it("should return \\x1b[3;3~ for alt+delete", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 46 }).key, "\x1B[3;3~");
    });
    it("should return \\x1b\\r for alt+enter", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 13 }).key, "\x1B\r");
    });
    it("should return \\x1b\\x1b for alt+esc", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 27 }).key, "\x1B\x1B");
    });
    it("should return \\x1b[5D for ctrl+left", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 37 }).key, "\x1B[1;5D");
    });
    it("should return \\x1b[5C for ctrl+right", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 39 }).key, "\x1B[1;5C");
    });
    it("should return \\x1b[5A for ctrl+up", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 38 }).key, "\x1B[1;5A");
    });
    it("should return \\x1b[5B for ctrl+down", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 40 }).key, "\x1B[1;5B");
    });
    it("should return \\x08 for ctrl+backspace", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 8 }).key, "\b");
    });
    it("should return \\x1b\\x7f for alt+backspace", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 8 }).key, "\x1B\x7F");
    });
    it("should return \\x1b\\x08 for ctrl+alt+backspace", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, altKey: true, keyCode: 8 }).key, "\x1B\b");
    });
    it("should return \\x1b[3;2~ for shift+delete", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 46 }).key, "\x1B[3;2~");
    });
    it("should return \\x1b[3;3~ for alt+delete", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 46 }).key, "\x1B[3;3~");
    });
    describe("On non-macOS platforms", () => {
      it("should return \\x1b[5D for alt+left", () => {
        import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 37 }, { isMac: false }).key, "\x1B[1;5D");
      });
      it("should return \\x1b[5C for alt+right", () => {
        import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 39 }, { isMac: false }).key, "\x1B[1;5C");
      });
      it("should return \\x1b[5D for alt+up", () => {
        import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 38 }, { isMac: false }).key, "\x1B[1;5A");
      });
      it("should return \\x1b[5C for alt+down", () => {
        import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 40 }, { isMac: false }).key, "\x1B[1;5B");
      });
      it("should return \\x1ba for alt+a", () => {
        import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 65 }, { isMac: false }).key, "\x1Ba");
      });
      it("should return \\x1b\\x20 for alt+space", () => {
        import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 32 }, { isMac: false }).key, "\x1B ");
      });
      it("should return \\x1b\\x00 for ctrl+alt+space", () => {
        import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, ctrlKey: true, keyCode: 32 }, { isMac: false }).key, "\x1B\0");
      });
    });
    describe("On macOS platforms", () => {
      it("should return \\x1bb for alt+left", () => {
        import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 37 }, { isMac: true }).key, "\x1Bb");
      });
      it("should return \\x1bf for alt+right", () => {
        import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 39 }, { isMac: true }).key, "\x1Bf");
      });
      it("should return \\x1bb for alt+up", () => {
        import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 38 }, { isMac: true }).key, "\x1B[1;3A");
      });
      it("should return \\x1bf for alt+down", () => {
        import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 40 }, { isMac: true }).key, "\x1B[1;3B");
      });
      it("should return undefined for alt+a", () => {
        import_chai.assert.strictEqual(testEvaluateKeyboardEvent({ altKey: true, keyCode: 65 }, { isMac: true }).key, void 0);
      });
    });
    describe("with macOptionIsMeta", () => {
      it("should return \\x1ba for alt+a", () => {
        import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 65 }, { isMac: true, macOptionIsMeta: true }).key, "\x1Ba");
      });
      it("should return \\x1b\\x1b for alt+enter", () => {
        import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 13 }, { isMac: true, macOptionIsMeta: true }).key, "\x1B\r");
      });
    });
    it("should return \\x1b[5A for alt+up", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 38 }).key, "\x1B[1;5A");
    });
    it("should return \\x1b[5B for alt+down", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 40 }).key, "\x1B[1;5B");
    });
    it("should return the correct escape sequence for modified F1-F12 keys", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 112 }).key, "\x1B[1;2P");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 113 }).key, "\x1B[1;2Q");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 114 }).key, "\x1B[1;2R");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 115 }).key, "\x1B[1;2S");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 116 }).key, "\x1B[15;2~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 117 }).key, "\x1B[17;2~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 118 }).key, "\x1B[18;2~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 119 }).key, "\x1B[19;2~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 120 }).key, "\x1B[20;2~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 121 }).key, "\x1B[21;2~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 122 }).key, "\x1B[23;2~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 123 }).key, "\x1B[24;2~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 112 }).key, "\x1B[1;3P");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 113 }).key, "\x1B[1;3Q");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 114 }).key, "\x1B[1;3R");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 115 }).key, "\x1B[1;3S");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 116 }).key, "\x1B[15;3~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 117 }).key, "\x1B[17;3~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 118 }).key, "\x1B[18;3~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 119 }).key, "\x1B[19;3~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 120 }).key, "\x1B[20;3~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 121 }).key, "\x1B[21;3~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 122 }).key, "\x1B[23;3~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, keyCode: 123 }).key, "\x1B[24;3~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 112 }).key, "\x1B[1;5P");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 113 }).key, "\x1B[1;5Q");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 114 }).key, "\x1B[1;5R");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 115 }).key, "\x1B[1;5S");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 116 }).key, "\x1B[15;5~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 117 }).key, "\x1B[17;5~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 118 }).key, "\x1B[18;5~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 119 }).key, "\x1B[19;5~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 120 }).key, "\x1B[20;5~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 121 }).key, "\x1B[21;5~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 122 }).key, "\x1B[23;5~");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, keyCode: 123 }).key, "\x1B[24;5~");
    });
    it("should return proper sequence for ctrl+alt+a", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, ctrlKey: true, keyCode: 65 }).key, "\x1B");
    });
    it("should return proper sequences for alt+0", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 48 }).key, "\x1B0");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 48 }).key, "\x1B)");
    });
    it("should return proper sequences for alt+1", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 49 }).key, "\x1B1");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 49 }).key, "\x1B!");
    });
    it("should return proper sequences for alt+2", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 50 }).key, "\x1B2");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 50 }).key, "\x1B@");
    });
    it("should return proper sequences for alt+3", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 51 }).key, "\x1B3");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 51 }).key, "\x1B#");
    });
    it("should return proper sequences for alt+4", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 52 }).key, "\x1B4");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 52 }).key, "\x1B$");
    });
    it("should return proper sequences for alt+5", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 53 }).key, "\x1B5");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 53 }).key, "\x1B%");
    });
    it("should return proper sequences for alt+6", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 54 }).key, "\x1B6");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 54 }).key, "\x1B^");
    });
    it("should return proper sequences for alt+7", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 55 }).key, "\x1B7");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 55 }).key, "\x1B&");
    });
    it("should return proper sequences for alt+8", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 56 }).key, "\x1B8");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 56 }).key, "\x1B*");
    });
    it("should return proper sequences for alt+9", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 57 }).key, "\x1B9");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 57 }).key, "\x1B(");
    });
    it("should return proper sequences for alt+;", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 186 }).key, "\x1B;");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 186 }).key, "\x1B:");
    });
    it("should return proper sequences for alt+=", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 187 }).key, "\x1B=");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 187 }).key, "\x1B+");
    });
    it("should return proper sequences for alt+,", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 188 }).key, "\x1B,");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 188 }).key, "\x1B<");
    });
    it("should return proper sequences for alt+-", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 189 }).key, "\x1B-");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 189 }).key, "\x1B_");
    });
    it("should return proper sequences for alt+.", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 190 }).key, "\x1B.");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 190 }).key, "\x1B>");
    });
    it("should return proper sequences for alt+/", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 191 }).key, "\x1B/");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 191 }).key, "\x1B?");
    });
    it("should return proper sequences for alt+~", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 192 }).key, "\x1B`");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 192 }).key, "\x1B~");
    });
    it("should return proper sequences for alt+[", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 219 }).key, "\x1B[");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 219 }).key, "\x1B{");
    });
    it("should return proper sequences for alt+\\", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 220 }).key, "\x1B\\");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 220 }).key, "\x1B|");
    });
    it("should return proper sequences for alt+]", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 221 }).key, "\x1B]");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 221 }).key, "\x1B}");
    });
    it("should return proper sequences for alt+'", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: false, keyCode: 222 }).key, "\x1B'");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ altKey: true, shiftKey: true, keyCode: 222 }).key, '\x1B"');
    });
    it("should handle mobile arrow events", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 0, key: "UIKeyInputUpArrow" }).key, "\x1B[A");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 0, key: "UIKeyInputUpArrow" }, { applicationCursorMode: true }).key, "\x1BOA");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 0, key: "UIKeyInputLeftArrow" }).key, "\x1B[D");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 0, key: "UIKeyInputLeftArrow" }, { applicationCursorMode: true }).key, "\x1BOD");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 0, key: "UIKeyInputRightArrow" }).key, "\x1B[C");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 0, key: "UIKeyInputRightArrow" }, { applicationCursorMode: true }).key, "\x1BOC");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 0, key: "UIKeyInputDownArrow" }).key, "\x1B[B");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 0, key: "UIKeyInputDownArrow" }, { applicationCursorMode: true }).key, "\x1BOB");
    });
    it("should handle lowercase letters", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 65, key: "a" }).key, "a");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ keyCode: 189, key: "-" }).key, "-");
    });
    it("should handle uppercase letters", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 65, key: "A" }).key, "A");
      import_chai.assert.equal(testEvaluateKeyboardEvent({ shiftKey: true, keyCode: 49, key: "!" }).key, "!");
    });
    it("should return proper sequence for ctrl+@", () => {
      import_chai.assert.equal(testEvaluateKeyboardEvent({ ctrlKey: true, shiftKey: true, keyCode: 50, key: "@" }).key, "\0");
    });
  });
});
//# sourceMappingURL=Keyboard.test.js.map
