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
var path = __toESM(require("path"));
var sinon = __toESM(require("sinon"));
var import_chai = require("chai");
var fontFinder = __toESM(require("font-finder"));
var ligatureSupport = __toESM(require("."));
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("LigaturesAddon", () => {
  let onRefresh;
  let term;
  const input = "a -> b www c";
  before(() => {
    sinon.stub(fontFinder, "list").returns(Promise.resolve({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Fira Code": [{
        path: path.join(__dirname, "../fonts/firaCode.otf"),
        style: fontFinder.Style.Regular,
        type: fontFinder.Type.Monospace,
        weight: 400
      }],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Iosevka": [{
        path: path.join(__dirname, "../fonts/iosevka.ttf"),
        style: fontFinder.Style.Regular,
        type: fontFinder.Type.Monospace,
        weight: 400
      }],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Nonexistant Font": [{
        path: path.join(__dirname, "../fonts/nonexistant.ttf"),
        style: fontFinder.Style.Regular,
        type: fontFinder.Type.Monospace,
        weight: 400
      }]
    }));
  });
  beforeEach(() => {
    onRefresh = sinon.stub();
    term = new MockTerminal(onRefresh);
    ligatureSupport.enableLigatures(term);
  });
  it("registers itself correctly", () => {
    const term2 = new MockTerminal(sinon.spy());
    import_chai.assert.isUndefined(term2.joiner);
    ligatureSupport.enableLigatures(term2);
    import_chai.assert.isFunction(term2.joiner);
  });
  it("registers itself correctly when called directly", () => {
    const term2 = new MockTerminal(sinon.spy());
    import_chai.assert.isUndefined(term2.joiner);
    ligatureSupport.enableLigatures(term2);
    import_chai.assert.isFunction(term2.joiner);
  });
  it("returns an empty set of ranges on the first call while the font is loading", () => {
    import_chai.assert.deepEqual(term.joiner(input), []);
  });
  it("fails if it finds but cannot load the font", async () => {
    term.options.fontFamily = "Nonexistant Font, monospace";
    import_chai.assert.deepEqual(term.joiner(input), []);
    await delay(500);
    import_chai.assert.isTrue(onRefresh.notCalled);
  });
  it("returns nothing if the font is not present on the system", async () => {
    term.options.fontFamily = "notinstalled";
    import_chai.assert.deepEqual(term.joiner(input), []);
    await delay(500);
    import_chai.assert.isTrue(onRefresh.notCalled);
    import_chai.assert.deepEqual(term.joiner(input), []);
  });
  it("returns nothing if no specific font is specified", async () => {
    term.options.fontFamily = "monospace";
    import_chai.assert.deepEqual(term.joiner(input), []);
    await delay(500);
    import_chai.assert.isTrue(onRefresh.notCalled);
    import_chai.assert.deepEqual(term.joiner(input), []);
  });
  it("returns nothing if no fonts are provided", async () => {
    term.options.fontFamily = "";
    import_chai.assert.deepEqual(term.joiner(input), []);
    await delay(500);
    import_chai.assert.isTrue(onRefresh.notCalled);
    import_chai.assert.deepEqual(term.joiner(input), []);
  });
  it("fails when given malformed inputs", async () => {
    term.options.fontFamily = {};
    import_chai.assert.deepEqual(term.joiner(input), []);
    await delay(500);
    import_chai.assert.isTrue(onRefresh.notCalled);
  });
});
class MockTerminal {
  constructor(onRefresh) {
    this._options = {
      fontFamily: "Fira Code, monospace",
      rows: 50
    };
    this.refresh = onRefresh;
  }
  registerCharacterJoiner(handler) {
    this.joiner = handler;
    return 1;
  }
  deregisterCharacterJoiner(id) {
    this.joiner = void 0;
  }
  get options() {
    return this._options;
  }
  set options(options) {
    for (const key in this._options) {
      this._options[key] = options[key];
    }
  }
}
function delay(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}
//# sourceMappingURL=index.test.js.map
