"use strict";
var import_chai = require("chai");
var import_Linkifier = require("./Linkifier");
var import_TestUtils = require("common/TestUtils.test");
var import_LinkProviderService = require("browser/services/LinkProviderService");
/**
 * Copyright (c) 2020 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const jsdom = require("jsdom");
class TestLinkifier2 extends import_Linkifier.Linkifier {
  set currentLink(link) {
    this._currentLink = link;
  }
  linkHover(element, link, event) {
    this._linkHover(element, link, event);
  }
  linkLeave(element, link, event) {
    this._linkLeave(element, link, event);
  }
}
describe("Linkifier2", () => {
  let bufferService;
  let linkifier;
  const link = {
    text: "foo",
    range: {
      start: {
        x: 5,
        y: 1
      },
      end: {
        x: 7,
        y: 1
      }
    },
    activate: () => {
    }
  };
  beforeEach(() => {
    const dom = new jsdom.JSDOM();
    bufferService = new import_TestUtils.MockBufferService(100, 10);
    linkifier = new TestLinkifier2(dom.window.document.createElement("div"), null, null, bufferService, new import_LinkProviderService.LinkProviderService());
    linkifier.currentLink = {
      link,
      state: {
        decorations: {
          underline: true,
          pointerCursor: true
        },
        isHovered: true
      }
    };
  });
  it("onShowLinkUnderline event range is correct", (done) => {
    linkifier.onShowLinkUnderline((e) => {
      import_chai.assert.equal(link.range.start.x - 1, e.x1);
      import_chai.assert.equal(link.range.start.y - 1, e.y1);
      import_chai.assert.equal(link.range.end.x, e.x2);
      import_chai.assert.equal(link.range.end.y - 1, e.y2);
      done();
    });
    linkifier.linkHover({ classList: { add: () => {
    } } }, link, {});
  });
  it("onHideLinkUnderline event range is correct", (done) => {
    linkifier.onHideLinkUnderline((e) => {
      import_chai.assert.equal(link.range.start.x - 1, e.x1);
      import_chai.assert.equal(link.range.start.y - 1, e.y1);
      import_chai.assert.equal(link.range.end.x, e.x2);
      import_chai.assert.equal(link.range.end.y - 1, e.y2);
      done();
    });
    linkifier.linkLeave({ classList: { add: () => {
    } } }, link, {});
  });
});
//# sourceMappingURL=Linkifier.test.js.map
