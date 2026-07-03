"use strict";
var import_chai = require("chai");
var import_OptionsService = require("common/services/OptionsService");
/**
 * Copyright (c) 2020 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("OptionsService", () => {
  describe("constructor", () => {
    const originalError = console.error;
    beforeEach(() => {
      console.error = () => {
      };
    });
    afterEach(() => {
      console.error = originalError;
    });
    it("uses default value if invalid constructor option values passed for cols/rows", () => {
      const optionsService = new import_OptionsService.OptionsService({ cols: void 0, rows: void 0 });
      import_chai.assert.equal(optionsService.options.rows, import_OptionsService.DEFAULT_OPTIONS.rows);
      import_chai.assert.equal(optionsService.options.cols, import_OptionsService.DEFAULT_OPTIONS.cols);
    });
    it("uses values from constructor option values if correctly passed", () => {
      const optionsService = new import_OptionsService.OptionsService({ cols: 80, rows: 25 });
      import_chai.assert.equal(optionsService.options.rows, 25);
      import_chai.assert.equal(optionsService.options.cols, 80);
    });
    it("uses default value if invalid constructor option value passed", () => {
      import_chai.assert.equal(new import_OptionsService.OptionsService({ tabStopWidth: 0 }).options.tabStopWidth, import_OptionsService.DEFAULT_OPTIONS.tabStopWidth);
    });
    it("object.keys return the correct number of options", () => {
      const optionsService = new import_OptionsService.OptionsService({ cols: 80, rows: 25 });
      import_chai.assert.notEqual(Object.keys(optionsService.options).length, 0);
    });
  });
  describe("setOption", () => {
    let service;
    beforeEach(() => {
      service = new import_OptionsService.OptionsService({});
    });
    it("applies valid fontWeight option values", () => {
      service.options.fontWeight = "bold";
      import_chai.assert.equal(service.options.fontWeight, "bold", '"bold" keyword value should be applied');
      service.options.fontWeight = "normal";
      import_chai.assert.equal(service.options.fontWeight, "normal", '"normal" keyword value should be applied');
      service.options.fontWeight = "600";
      import_chai.assert.equal(service.options.fontWeight, "600", "String numeric values should be applied");
      service.options.fontWeight = 350;
      import_chai.assert.equal(service.options.fontWeight, 350, "Values between 1 and 1000 should be applied as is");
      service.options.fontWeight = 1;
      import_chai.assert.equal(service.options.fontWeight, 1, "Range should include minimum value: 1");
      service.options.fontWeight = 1e3;
      import_chai.assert.equal(service.options.fontWeight, 1e3, "Range should include maximum value: 1000");
    });
    it("normalizes invalid fontWeight option values", () => {
      service.options.fontWeight = 350;
      import_chai.assert.doesNotThrow(() => service.options.fontWeight = 1e4, "fontWeight should be normalized instead of throwing");
      import_chai.assert.equal(service.options.fontWeight, import_OptionsService.DEFAULT_OPTIONS.fontWeight, "Values greater than 1000 should be reset to default");
      service.options.fontWeight = 350;
      service.options.fontWeight = -10;
      import_chai.assert.equal(service.options.fontWeight, import_OptionsService.DEFAULT_OPTIONS.fontWeight, "Values less than 1 should be reset to default");
      service.options.fontWeight = 350;
      service.options.fontWeight = "bold700";
      import_chai.assert.equal(service.options.fontWeight, import_OptionsService.DEFAULT_OPTIONS.fontWeight, "Wrong string literals should be reset to default");
    });
  });
  describe("onOptionChange", () => {
    let service;
    beforeEach(() => {
      service = new import_OptionsService.OptionsService({});
    });
    it("should fire on any option change", async () => {
      let disposable;
      await new Promise((r) => {
        disposable = service.onOptionChange((e) => {
          import_chai.assert.strictEqual(e, "cursorWidth");
          r();
        });
        service.options.cursorWidth = 10;
      });
      disposable.dispose();
      await new Promise((r) => {
        service.onOptionChange((e) => {
          import_chai.assert.strictEqual(e, "scrollback");
          r();
        });
        service.options.scrollback = 20;
      });
    });
  });
  describe("onSpecificOptionChange", () => {
    let service;
    beforeEach(() => {
      service = new import_OptionsService.OptionsService({});
    });
    it("should fire only on a specific option change", async () => {
      await new Promise((r) => {
        service.onSpecificOptionChange("scrollback", (e) => {
          import_chai.assert.strictEqual(e, 20);
          r();
        });
        service.options.cursorWidth = 10;
        service.options.scrollback = 20;
      });
    });
  });
  describe("onSpecificOptionChange", () => {
    let service;
    beforeEach(() => {
      service = new import_OptionsService.OptionsService({});
    });
    it("should fire only on a specific option change", async () => {
      await new Promise((r) => {
        service.onSpecificOptionChange("scrollback", (e) => {
          import_chai.assert.strictEqual(e, 20);
          r();
        });
        service.options.cursorWidth = 10;
        service.options.scrollback = 20;
      });
    });
  });
  describe("onMultipleOptionChange", () => {
    let service;
    beforeEach(() => {
      service = new import_OptionsService.OptionsService({});
    });
    it("should fire only for specific options", async () => {
      await new Promise((r) => {
        let called = false;
        service.onMultipleOptionChange(["scrollback"], () => {
          called = true;
        });
        service.options.cursorWidth = 10;
        import_chai.assert.notOk(called);
        service.options.scrollback = 20;
        import_chai.assert.ok(called);
        r();
      });
    });
  });
});
//# sourceMappingURL=OptionsService.test.js.map
