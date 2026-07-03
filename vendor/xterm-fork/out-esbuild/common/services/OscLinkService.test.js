"use strict";
var import_chai = require("chai");
var import_AttributeData = require("common/buffer/AttributeData");
var import_BufferService = require("common/services/BufferService");
var import_OptionsService = require("common/services/OptionsService");
var import_OscLinkService = require("common/services/OscLinkService");
/**
 * Copyright (c) 2020 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("OscLinkService", () => {
  describe("constructor", () => {
    let bufferService;
    let optionsService;
    let oscLinkService;
    beforeEach(() => {
      optionsService = new import_OptionsService.OptionsService({ rows: 3, cols: 10 });
      bufferService = new import_BufferService.BufferService(optionsService);
      oscLinkService = new import_OscLinkService.OscLinkService(bufferService);
    });
    it("link IDs are created and fetched consistently", () => {
      const linkId = oscLinkService.registerLink({ id: "foo", uri: "bar" });
      import_chai.assert.ok(linkId);
      import_chai.assert.equal(oscLinkService.registerLink({ id: "foo", uri: "bar" }), linkId);
    });
    it("should dispose the link ID when the last marker is trimmed from the buffer", () => {
      bufferService.buffers.activateAltBuffer();
      const linkId = oscLinkService.registerLink({ id: "foo", uri: "bar" });
      import_chai.assert.ok(linkId);
      bufferService.scroll(new import_AttributeData.AttributeData());
      import_chai.assert.notStrictEqual(oscLinkService.registerLink({ id: "foo", uri: "bar" }), linkId);
    });
    it("should fetch link data from link id", () => {
      const linkId = oscLinkService.registerLink({ id: "foo", uri: "bar" });
      import_chai.assert.deepStrictEqual(oscLinkService.getLinkData(linkId), { id: "foo", uri: "bar" });
    });
  });
});
//# sourceMappingURL=OscLinkService.test.js.map
