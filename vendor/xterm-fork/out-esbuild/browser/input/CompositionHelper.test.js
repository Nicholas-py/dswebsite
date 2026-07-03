"use strict";
var import_chai = require("chai");
var import_CompositionHelper = require("browser/input/CompositionHelper");
var import_TestUtils = require("browser/TestUtils.test");
var import_TestUtils2 = require("common/TestUtils.test");
/**
 * Copyright (c) 2016 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("CompositionHelper", () => {
  let compositionHelper;
  let compositionView;
  let textarea;
  let handledText;
  beforeEach(() => {
    compositionView = {
      classList: {
        add: () => {
        },
        remove: () => {
        }
      },
      getBoundingClientRect: () => {
        return { width: 0 };
      },
      style: {
        left: 0,
        top: 0
      },
      textContent: ""
    };
    textarea = {
      value: "",
      style: {
        left: 0,
        top: 0
      }
    };
    const coreService = new import_TestUtils2.MockCoreService();
    coreService.triggerDataEvent = (text) => {
      handledText += text;
    };
    handledText = "";
    const bufferService = new import_TestUtils2.MockBufferService(10, 5);
    compositionHelper = new import_CompositionHelper.CompositionHelper(textarea, compositionView, bufferService, new import_TestUtils2.MockOptionsService(), coreService, new import_TestUtils.MockRenderService());
  });
  describe("Input", () => {
    it("Should insert simple characters", (done) => {
      compositionHelper.compositionstart();
      compositionHelper.compositionupdate({ data: "\u3147" });
      textarea.value = "\u3147";
      setTimeout(() => {
        compositionHelper.compositionend();
        setTimeout(() => {
          import_chai.assert.equal(handledText, "\u3147");
          compositionHelper.compositionstart();
          compositionHelper.compositionupdate({ data: "\u3147" });
          textarea.value = "\u3147\u3147";
          setTimeout(() => {
            compositionHelper.compositionend();
            setTimeout(() => {
              import_chai.assert.equal(handledText, "\u3147\u3147");
              done();
            }, 0);
          }, 0);
        }, 0);
      }, 0);
    });
    it("Should insert complex characters", (done) => {
      compositionHelper.compositionstart();
      compositionHelper.compositionupdate({ data: "\u3147" });
      textarea.value = "\u3147";
      setTimeout(() => {
        compositionHelper.compositionupdate({ data: "\uC544" });
        textarea.value = "\uC544";
        setTimeout(() => {
          compositionHelper.compositionupdate({ data: "\uC559" });
          textarea.value = "\uC559";
          setTimeout(() => {
            compositionHelper.compositionend();
            setTimeout(() => {
              import_chai.assert.equal(handledText, "\uC559");
              compositionHelper.compositionstart();
              compositionHelper.compositionupdate({ data: "\u3147" });
              textarea.value = "\uC559\u3147";
              setTimeout(() => {
                compositionHelper.compositionupdate({ data: "\uC544" });
                textarea.value = "\uC559\uC544";
                setTimeout(() => {
                  compositionHelper.compositionupdate({ data: "\uC559" });
                  textarea.value = "\uC559\uC559";
                  setTimeout(() => {
                    compositionHelper.compositionend();
                    setTimeout(() => {
                      import_chai.assert.equal(handledText, "\uC559\uC559");
                      done();
                    }, 0);
                  }, 0);
                }, 0);
              }, 0);
            }, 0);
          }, 0);
        }, 0);
      }, 0);
    });
    it("Should insert complex characters that change with following character", (done) => {
      compositionHelper.compositionstart();
      compositionHelper.compositionupdate({ data: "\u3147" });
      textarea.value = "\u3147";
      setTimeout(() => {
        compositionHelper.compositionupdate({ data: "\uC544" });
        textarea.value = "\uC544";
        setTimeout(() => {
          compositionHelper.compositionupdate({ data: "\uC559" });
          textarea.value = "\uC559";
          setTimeout(() => {
            compositionHelper.compositionend();
            compositionHelper.compositionstart();
            compositionHelper.compositionupdate({ data: "\uC544" });
            textarea.value = "\uC544\uC544";
            setTimeout(() => {
              compositionHelper.compositionend();
              setTimeout(() => {
                import_chai.assert.equal(handledText, "\uC544\uC544");
                done();
              }, 0);
            }, 0);
          }, 0);
        }, 0);
      }, 0);
    });
    it("Should insert multi-characters compositions", (done) => {
      compositionHelper.compositionstart();
      compositionHelper.compositionupdate({ data: "d" });
      textarea.value = "d";
      setTimeout(() => {
        compositionHelper.compositionupdate({ data: "\u3060" });
        textarea.value = "\u3060";
        setTimeout(() => {
          compositionHelper.compositionupdate({ data: "\u3060\u3042" });
          textarea.value = "\u3060\u3042";
          setTimeout(() => {
            compositionHelper.compositionend();
            setTimeout(() => {
              import_chai.assert.equal(handledText, "\u3060\u3042");
              done();
            }, 0);
          }, 0);
        }, 0);
      }, 0);
    });
    it("Should insert multi-character compositions that are converted to other characters with the same length", (done) => {
      compositionHelper.compositionstart();
      compositionHelper.compositionupdate({ data: "d" });
      textarea.value = "d";
      setTimeout(() => {
        compositionHelper.compositionupdate({ data: "\u3060" });
        textarea.value = "\u3060";
        setTimeout(() => {
          compositionHelper.compositionupdate({ data: "\u3060\u30FC" });
          textarea.value = "\u3060\u30FC";
          setTimeout(() => {
            compositionHelper.compositionupdate({ data: "\u30C0\u30FC" });
            textarea.value = "\u30C0\u30FC";
            setTimeout(() => {
              compositionHelper.compositionend();
              setTimeout(() => {
                import_chai.assert.equal(handledText, "\u30C0\u30FC");
                done();
              }, 0);
            }, 0);
          }, 0);
        }, 0);
      }, 0);
    });
    it("Should insert multi-character compositions that are converted to other characters with different lengths", (done) => {
      compositionHelper.compositionstart();
      compositionHelper.compositionupdate({ data: "\u3044" });
      textarea.value = "\u3044";
      setTimeout(() => {
        compositionHelper.compositionupdate({ data: "\u3044m" });
        textarea.value = "\u3044m";
        setTimeout(() => {
          compositionHelper.compositionupdate({ data: "\u3044\u307E" });
          textarea.value = "\u3044\u307E";
          setTimeout(() => {
            compositionHelper.compositionupdate({ data: "\u4ECA" });
            textarea.value = "\u4ECA";
            setTimeout(() => {
              compositionHelper.compositionend();
              setTimeout(() => {
                import_chai.assert.equal(handledText, "\u4ECA");
                done();
              }, 0);
            }, 0);
          }, 0);
        }, 0);
      }, 0);
    });
    it("Should insert non-composition characters input immediately after composition characters", (done) => {
      compositionHelper.compositionstart();
      compositionHelper.compositionupdate({ data: "\u3147" });
      textarea.value = "\u3147";
      setTimeout(() => {
        compositionHelper.compositionend();
        textarea.value = "\u31471";
        setTimeout(() => {
          import_chai.assert.equal(handledText, "\u31471");
          done();
        }, 0);
      }, 0);
    });
  });
});
//# sourceMappingURL=CompositionHelper.test.js.map
