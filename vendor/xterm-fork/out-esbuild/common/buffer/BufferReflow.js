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
var BufferReflow_exports = {};
__export(BufferReflow_exports, {
  getWrappedLineTrimmedLength: () => getWrappedLineTrimmedLength,
  reflowLargerApplyNewLayout: () => reflowLargerApplyNewLayout,
  reflowLargerCreateNewLayout: () => reflowLargerCreateNewLayout,
  reflowLargerGetLinesToRemove: () => reflowLargerGetLinesToRemove,
  reflowSmallerGetNewLineLengths: () => reflowSmallerGetNewLineLengths
});
module.exports = __toCommonJS(BufferReflow_exports);
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function reflowLargerGetLinesToRemove(lines, oldCols, newCols, bufferAbsoluteY, nullCell, reflowCursorLine) {
  const toRemove = [];
  for (let y = 0; y < lines.length - 1; y++) {
    let i = y;
    let nextLine = lines.get(++i);
    if (!nextLine.isWrapped) {
      continue;
    }
    const wrappedLines = [lines.get(y)];
    while (i < lines.length && nextLine.isWrapped) {
      wrappedLines.push(nextLine);
      nextLine = lines.get(++i);
    }
    if (!reflowCursorLine) {
      if (bufferAbsoluteY >= y && bufferAbsoluteY < i) {
        y += wrappedLines.length - 1;
        continue;
      }
    }
    let destLineIndex = 0;
    let destCol = getWrappedLineTrimmedLength(wrappedLines, destLineIndex, oldCols);
    let srcLineIndex = 1;
    let srcCol = 0;
    while (srcLineIndex < wrappedLines.length) {
      const srcTrimmedTineLength = getWrappedLineTrimmedLength(wrappedLines, srcLineIndex, oldCols);
      const srcRemainingCells = srcTrimmedTineLength - srcCol;
      const destRemainingCells = newCols - destCol;
      const cellsToCopy = Math.min(srcRemainingCells, destRemainingCells);
      wrappedLines[destLineIndex].copyCellsFrom(wrappedLines[srcLineIndex], srcCol, destCol, cellsToCopy, false);
      destCol += cellsToCopy;
      if (destCol === newCols) {
        destLineIndex++;
        destCol = 0;
      }
      srcCol += cellsToCopy;
      if (srcCol === srcTrimmedTineLength) {
        srcLineIndex++;
        srcCol = 0;
      }
      if (destCol === 0 && destLineIndex !== 0) {
        if (wrappedLines[destLineIndex - 1].getWidth(newCols - 1) === 2) {
          wrappedLines[destLineIndex].copyCellsFrom(wrappedLines[destLineIndex - 1], newCols - 1, destCol++, 1, false);
          wrappedLines[destLineIndex - 1].setCell(newCols - 1, nullCell);
        }
      }
    }
    wrappedLines[destLineIndex].replaceCells(destCol, newCols, nullCell);
    let countToRemove = 0;
    for (let i2 = wrappedLines.length - 1; i2 > 0; i2--) {
      if (i2 > destLineIndex || wrappedLines[i2].getTrimmedLength() === 0) {
        countToRemove++;
      } else {
        break;
      }
    }
    if (countToRemove > 0) {
      toRemove.push(y + wrappedLines.length - countToRemove);
      toRemove.push(countToRemove);
    }
    y += wrappedLines.length - 1;
  }
  return toRemove;
}
function reflowLargerCreateNewLayout(lines, toRemove) {
  const layout = [];
  let nextToRemoveIndex = 0;
  let nextToRemoveStart = toRemove[nextToRemoveIndex];
  let countRemovedSoFar = 0;
  for (let i = 0; i < lines.length; i++) {
    if (nextToRemoveStart === i) {
      const countToRemove = toRemove[++nextToRemoveIndex];
      lines.onDeleteEmitter.fire({
        index: i - countRemovedSoFar,
        amount: countToRemove
      });
      i += countToRemove - 1;
      countRemovedSoFar += countToRemove;
      nextToRemoveStart = toRemove[++nextToRemoveIndex];
    } else {
      layout.push(i);
    }
  }
  return {
    layout,
    countRemoved: countRemovedSoFar
  };
}
function reflowLargerApplyNewLayout(lines, newLayout) {
  const newLayoutLines = [];
  for (let i = 0; i < newLayout.length; i++) {
    newLayoutLines.push(lines.get(newLayout[i]));
  }
  for (let i = 0; i < newLayoutLines.length; i++) {
    lines.set(i, newLayoutLines[i]);
  }
  lines.length = newLayout.length;
}
function reflowSmallerGetNewLineLengths(wrappedLines, oldCols, newCols) {
  const newLineLengths = [];
  const cellsNeeded = wrappedLines.map((l, i) => getWrappedLineTrimmedLength(wrappedLines, i, oldCols)).reduce((p, c) => p + c);
  let srcCol = 0;
  let srcLine = 0;
  let cellsAvailable = 0;
  while (cellsAvailable < cellsNeeded) {
    if (cellsNeeded - cellsAvailable < newCols) {
      newLineLengths.push(cellsNeeded - cellsAvailable);
      break;
    }
    srcCol += newCols;
    const oldTrimmedLength = getWrappedLineTrimmedLength(wrappedLines, srcLine, oldCols);
    if (srcCol > oldTrimmedLength) {
      srcCol -= oldTrimmedLength;
      srcLine++;
    }
    const endsWithWide = wrappedLines[srcLine].getWidth(srcCol - 1) === 2;
    if (endsWithWide) {
      srcCol--;
    }
    const lineLength = endsWithWide ? newCols - 1 : newCols;
    newLineLengths.push(lineLength);
    cellsAvailable += lineLength;
  }
  return newLineLengths;
}
function getWrappedLineTrimmedLength(lines, i, cols) {
  if (i === lines.length - 1) {
    return lines[i].getTrimmedLength();
  }
  const endsInNull = !lines[i].hasContent(cols - 1) && lines[i].getWidth(cols - 1) === 1;
  const followingLineStartsWithWide = lines[i + 1].getWidth(0) === 2;
  if (endsInNull && followingLineStartsWithWide) {
    return cols - 1;
  }
  return cols;
}
//# sourceMappingURL=BufferReflow.js.map
