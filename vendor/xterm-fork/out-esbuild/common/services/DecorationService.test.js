"use strict";
var import_chai = require("chai");
var import_DecorationService = require("./DecorationService");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const fakeMarker = Object.freeze(new class extends import_lifecycle.Disposable {
  constructor() {
    super(...arguments);
    this.id = 1;
    this.line = 1;
    this.isDisposed = false;
    this.onDispose = new import_event.Emitter().event;
  }
}());
describe("DecorationService", () => {
  it("should set isDisposed to true after dispose", () => {
    const service = new import_DecorationService.DecorationService();
    const decoration = service.registerDecoration({
      marker: fakeMarker
    });
    import_chai.assert.ok(decoration);
    import_chai.assert.isFalse(decoration.isDisposed);
    decoration.dispose();
    import_chai.assert.isTrue(decoration.isDisposed);
  });
});
//# sourceMappingURL=DecorationService.test.js.map
