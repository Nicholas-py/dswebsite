"use strict";
var import_chai = require("chai");
var import_IIPHeaderParser = require("./IIPHeaderParser");
/**
 * Copyright (c) 2023 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const CASES = [
  ["File=size=123456;name=dGVzdA==:", { name: "test", size: 123456 }],
  ["File=size=123456;name=dGVzdA:", { name: "test", size: 123456 }],
  // utf-8 encoding in name
  ["File=size=123456;name=w7xtbMOkdXTDnw==:", { name: "\xFCml\xE4ut\xDF", size: 123456 }],
  ["File=size=123456;name=w7xtbMOkdXTDnw:", { name: "\xFCml\xE4ut\xDF", size: 123456 }],
  // full header spec
  [
    "File=inline=1;width=10px;height=20%;preserveAspectRatio=1;size=123456;name=w7xtbMOkdXTDnw:",
    {
      inline: 1,
      width: "10px",
      height: "20%",
      preserveAspectRatio: 1,
      size: 123456,
      name: "\xFCml\xE4ut\xDF"
    }
  ],
  [
    "File=inline=1;width=auto;height=20;preserveAspectRatio=1;size=123456;name=w7xtbMOkdXTDnw:",
    {
      inline: 1,
      width: "auto",
      height: "20",
      preserveAspectRatio: 1,
      size: 123456,
      name: "\xFCml\xE4ut\xDF"
    }
  ]
];
function fromBs(bs) {
  const r = new Uint32Array(bs.length);
  for (let i = 0; i < r.length; ++i) r[i] = bs.charCodeAt(i);
  return r;
}
describe("IIPHeaderParser", () => {
  it("at once", () => {
    const hp = new import_IIPHeaderParser.HeaderParser();
    for (const example of CASES) {
      hp.reset();
      const inp = fromBs(example[0]);
      const res = hp.parse(inp, 0, inp.length);
      import_chai.assert.strictEqual(res, inp.length);
      import_chai.assert.strictEqual(hp.state, import_IIPHeaderParser.HeaderState.END);
      import_chai.assert.deepEqual(hp.fields, example[1]);
    }
  });
  it("bytewise", () => {
    const hp = new import_IIPHeaderParser.HeaderParser();
    for (const example of CASES) {
      hp.reset();
      const inp = fromBs(example[0]);
      let pos = 0;
      let res = -2;
      while (res === -2 && pos < inp.length) {
        res = hp.parse(new Uint32Array([inp[pos++]]), 0, 1);
      }
      import_chai.assert.strictEqual(res, 1);
      import_chai.assert.strictEqual(hp.state, import_IIPHeaderParser.HeaderState.END);
      import_chai.assert.deepEqual(hp.fields, example[1]);
    }
  });
  it("no File= starter", () => {
    const hp = new import_IIPHeaderParser.HeaderParser();
    let inp = fromBs("size=123456;name=dGVzdA==:");
    let res = hp.parse(inp, 0, inp.length);
    import_chai.assert.strictEqual(res, -1);
    hp.reset();
    inp = fromBs(CASES[0][0]);
    res = hp.parse(inp, 0, inp.length);
    import_chai.assert.strictEqual(res, inp.length);
    import_chai.assert.strictEqual(hp.state, import_IIPHeaderParser.HeaderState.END);
    import_chai.assert.deepEqual(hp.fields, CASES[0][1]);
  });
  it("empty key - error", () => {
    const hp = new import_IIPHeaderParser.HeaderParser();
    let inp = fromBs("File=size=123456;=dGVzdA==:");
    let res = hp.parse(inp, 0, inp.length);
    import_chai.assert.strictEqual(res, -1);
    hp.reset();
    inp = fromBs(CASES[0][0]);
    res = hp.parse(inp, 0, inp.length);
    import_chai.assert.strictEqual(res, inp.length);
    import_chai.assert.strictEqual(hp.state, import_IIPHeaderParser.HeaderState.END);
    import_chai.assert.deepEqual(hp.fields, CASES[0][1]);
  });
  it("empty size value - set to 0", () => {
    const hp = new import_IIPHeaderParser.HeaderParser();
    let inp = fromBs("File=size=;name=dGVzdA==:");
    let res = hp.parse(inp, 0, inp.length);
    import_chai.assert.strictEqual(res, inp.length);
    import_chai.assert.strictEqual(hp.state, import_IIPHeaderParser.HeaderState.END);
    import_chai.assert.deepEqual(hp.fields, { name: "test", size: 0 });
    hp.reset();
    inp = fromBs(CASES[0][0]);
    res = hp.parse(inp, 0, inp.length);
    import_chai.assert.strictEqual(res, inp.length);
    import_chai.assert.strictEqual(hp.state, import_IIPHeaderParser.HeaderState.END);
    import_chai.assert.deepEqual(hp.fields, CASES[0][1]);
  });
  it("empty name value - set to empty string", () => {
    const hp = new import_IIPHeaderParser.HeaderParser();
    let inp = fromBs("File=size=123456;name=:");
    let res = hp.parse(inp, 0, inp.length);
    import_chai.assert.strictEqual(res, inp.length);
    import_chai.assert.strictEqual(hp.state, import_IIPHeaderParser.HeaderState.END);
    import_chai.assert.deepEqual(hp.fields, { name: "", size: 123456 });
    hp.reset();
    inp = fromBs(CASES[0][0]);
    res = hp.parse(inp, 0, inp.length);
    import_chai.assert.strictEqual(res, inp.length);
    import_chai.assert.strictEqual(hp.state, import_IIPHeaderParser.HeaderState.END);
    import_chai.assert.deepEqual(hp.fields, CASES[0][1]);
  });
  it("empty size value - error", () => {
    const hp = new import_IIPHeaderParser.HeaderParser();
    let inp = fromBs("File=inline=1;width=;height=20%;preserveAspectRatio=1;size=123456;name=w7xtbMOkdXTDnw:");
    let res = hp.parse(inp, 0, inp.length);
    import_chai.assert.strictEqual(res, -1);
    hp.reset();
    inp = fromBs(CASES[0][0]);
    res = hp.parse(inp, 0, inp.length);
    import_chai.assert.strictEqual(res, inp.length);
    import_chai.assert.strictEqual(hp.state, import_IIPHeaderParser.HeaderState.END);
    import_chai.assert.deepEqual(hp.fields, CASES[0][1]);
  });
});
//# sourceMappingURL=IIPHeaderParser.test.js.map
