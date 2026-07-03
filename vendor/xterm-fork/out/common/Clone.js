"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = clone;
function clone(val, depth = 5) {
    if (typeof val !== 'object') {
        return val;
    }
    const clonedObject = Array.isArray(val) ? [] : {};
    for (const key in val) {
        clonedObject[key] = depth <= 1 ? val[key] : (val[key] && clone(val[key], depth - 1));
    }
    return clonedObject;
}
//# sourceMappingURL=Clone.js.map