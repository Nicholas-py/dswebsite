"use strict";
var import_RendererUtils = require("browser/renderer/shared/RendererUtils");
var import_chai = require("chai");
/**
 * Copyright (c) 2023 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("RendererUtils", () => {
  it("computeNextVariantOffset", () => {
    const cellWidth = 11;
    const doubleCellWidth = 22;
    let line = 1;
    let variantOffset = 0;
    let cells = [cellWidth, cellWidth, doubleCellWidth, doubleCellWidth];
    let result = [1, 0, 0, 0];
    for (let index = 0; index < cells.length; index++) {
      const cell = cells[index];
      variantOffset = (0, import_RendererUtils.computeNextVariantOffset)(cell, line, variantOffset);
      import_chai.assert.equal(variantOffset, result[index]);
    }
    line = 2;
    variantOffset = 0;
    cells = [cellWidth, cellWidth, doubleCellWidth, doubleCellWidth];
    result = [3, 2, 0, 2];
    for (let index = 0; index < cells.length; index++) {
      const cell = cells[index];
      variantOffset = (0, import_RendererUtils.computeNextVariantOffset)(cell, line, variantOffset);
      import_chai.assert.equal(variantOffset, result[index]);
    }
    line = 3;
    variantOffset = 0;
    cells = [cellWidth, cellWidth, doubleCellWidth, doubleCellWidth];
    result = [5, 4, 2, 0];
    for (let index = 0; index < cells.length; index++) {
      const cell = cells[index];
      variantOffset = (0, import_RendererUtils.computeNextVariantOffset)(cell, line, variantOffset);
      import_chai.assert.equal(variantOffset, result[index]);
    }
  });
});
//# sourceMappingURL=RendererUtils.test.js.map
