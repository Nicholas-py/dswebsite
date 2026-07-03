"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concat = concat;
function concat(a, b) {
    const result = new a.constructor(a.length + b.length);
    result.set(a);
    result.set(b, a.length);
    return result;
}
//# sourceMappingURL=TypedArrayUtils.js.map