"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRangeLength = getRangeLength;
function getRangeLength(range, bufferCols) {
    if (range.start.y > range.end.y) {
        throw new Error(`Buffer range end (${range.end.x}, ${range.end.y}) cannot be before start (${range.start.x}, ${range.start.y})`);
    }
    return bufferCols * (range.end.y - range.start.y) + (range.end.x - range.start.x + 1);
}
//# sourceMappingURL=BufferRange.js.map