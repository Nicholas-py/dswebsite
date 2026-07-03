"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var MoveToCell_exports = {};
__export(MoveToCell_exports, {
  moveToCellSequence: () => moveToCellSequence
});
module.exports = __toCommonJS(MoveToCell_exports);
var import_EscapeSequences = require("common/data/EscapeSequences");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
var Direction = /* @__PURE__ */ ((Direction2) => {
  Direction2["UP"] = "A";
  Direction2["DOWN"] = "B";
  Direction2["RIGHT"] = "C";
  Direction2["LEFT"] = "D";
  return Direction2;
})(Direction || {});
function moveToCellSequence(targetX, targetY, bufferService, applicationCursor) {
  const startX = bufferService.buffer.x;
  const startY = bufferService.buffer.y;
  if (!bufferService.buffer.hasScrollback) {
    return resetStartingRow(startX, startY, targetX, targetY, bufferService, applicationCursor) + moveToRequestedRow(startY, targetY, bufferService, applicationCursor) + moveToRequestedCol(startX, startY, targetX, targetY, bufferService, applicationCursor);
  }
  let direction;
  if (startY === targetY) {
    direction = startX > targetX ? "D" /* LEFT */ : "C" /* RIGHT */;
    return repeat(Math.abs(startX - targetX), sequence(direction, applicationCursor));
  }
  direction = startY > targetY ? "D" /* LEFT */ : "C" /* RIGHT */;
  const rowDifference = Math.abs(startY - targetY);
  const cellsToMove = colsFromRowEnd(startY > targetY ? targetX : startX, bufferService) + (rowDifference - 1) * bufferService.cols + 1 + colsFromRowBeginning(startY > targetY ? startX : targetX, bufferService);
  return repeat(cellsToMove, sequence(direction, applicationCursor));
}
function colsFromRowBeginning(currX, bufferService) {
  return currX - 1;
}
function colsFromRowEnd(currX, bufferService) {
  return bufferService.cols - currX;
}
function resetStartingRow(startX, startY, targetX, targetY, bufferService, applicationCursor) {
  if (moveToRequestedRow(startY, targetY, bufferService, applicationCursor).length === 0) {
    return "";
  }
  return repeat(bufferLine(
    startX,
    startY,
    startX,
    startY - wrappedRowsForRow(startY, bufferService),
    false,
    bufferService
  ).length, sequence("D" /* LEFT */, applicationCursor));
}
function moveToRequestedRow(startY, targetY, bufferService, applicationCursor) {
  const startRow = startY - wrappedRowsForRow(startY, bufferService);
  const endRow = targetY - wrappedRowsForRow(targetY, bufferService);
  const rowsToMove = Math.abs(startRow - endRow) - wrappedRowsCount(startY, targetY, bufferService);
  return repeat(rowsToMove, sequence(verticalDirection(startY, targetY), applicationCursor));
}
function moveToRequestedCol(startX, startY, targetX, targetY, bufferService, applicationCursor) {
  let startRow;
  if (moveToRequestedRow(startY, targetY, bufferService, applicationCursor).length > 0) {
    startRow = targetY - wrappedRowsForRow(targetY, bufferService);
  } else {
    startRow = startY;
  }
  const endRow = targetY;
  const direction = horizontalDirection(startX, startY, targetX, targetY, bufferService, applicationCursor);
  return repeat(bufferLine(
    startX,
    startRow,
    targetX,
    endRow,
    direction === "C" /* RIGHT */,
    bufferService
  ).length, sequence(direction, applicationCursor));
}
function wrappedRowsCount(startY, targetY, bufferService) {
  let wrappedRows = 0;
  const startRow = startY - wrappedRowsForRow(startY, bufferService);
  const endRow = targetY - wrappedRowsForRow(targetY, bufferService);
  for (let i = 0; i < Math.abs(startRow - endRow); i++) {
    const direction = verticalDirection(startY, targetY) === "A" /* UP */ ? -1 : 1;
    const line = bufferService.buffer.lines.get(startRow + direction * i);
    if (line?.isWrapped) {
      wrappedRows++;
    }
  }
  return wrappedRows;
}
function wrappedRowsForRow(currentRow, bufferService) {
  let rowCount = 0;
  let line = bufferService.buffer.lines.get(currentRow);
  let lineWraps = line?.isWrapped;
  while (lineWraps && currentRow >= 0 && currentRow < bufferService.rows) {
    rowCount++;
    line = bufferService.buffer.lines.get(--currentRow);
    lineWraps = line?.isWrapped;
  }
  return rowCount;
}
function horizontalDirection(startX, startY, targetX, targetY, bufferService, applicationCursor) {
  let startRow;
  if (moveToRequestedRow(targetX, targetY, bufferService, applicationCursor).length > 0) {
    startRow = targetY - wrappedRowsForRow(targetY, bufferService);
  } else {
    startRow = startY;
  }
  if (startX < targetX && startRow <= targetY || // down/right or same y/right
  startX >= targetX && startRow < targetY) {
    return "C" /* RIGHT */;
  }
  return "D" /* LEFT */;
}
function verticalDirection(startY, targetY) {
  return startY > targetY ? "A" /* UP */ : "B" /* DOWN */;
}
function bufferLine(startCol, startRow, endCol, endRow, forward, bufferService) {
  let currentCol = startCol;
  let currentRow = startRow;
  let bufferStr = "";
  while (currentCol !== endCol || currentRow !== endRow) {
    currentCol += forward ? 1 : -1;
    if (forward && currentCol > bufferService.cols - 1) {
      bufferStr += bufferService.buffer.translateBufferLineToString(
        currentRow,
        false,
        startCol,
        currentCol
      );
      currentCol = 0;
      startCol = 0;
      currentRow++;
    } else if (!forward && currentCol < 0) {
      bufferStr += bufferService.buffer.translateBufferLineToString(
        currentRow,
        false,
        0,
        startCol + 1
      );
      currentCol = bufferService.cols - 1;
      startCol = currentCol;
      currentRow--;
    }
  }
  return bufferStr + bufferService.buffer.translateBufferLineToString(
    currentRow,
    false,
    startCol,
    currentCol
  );
}
function sequence(direction, applicationCursor) {
  const mod = applicationCursor ? "O" : "[";
  return import_EscapeSequences.C0.ESC + mod + direction;
}
function repeat(count, str) {
  count = Math.floor(count);
  let rpt = "";
  for (let i = 0; i < count; i++) {
    rpt += str;
  }
  return rpt;
}
//# sourceMappingURL=MoveToCell.js.map
