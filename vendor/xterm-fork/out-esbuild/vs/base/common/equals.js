"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var equals_exports = {};
__export(equals_exports, {
  equalsIfDefined: () => equalsIfDefined,
  getStructuralKey: () => getStructuralKey,
  itemEquals: () => itemEquals,
  itemsEquals: () => itemsEquals,
  jsonStringifyEquals: () => jsonStringifyEquals,
  strictEquals: () => strictEquals,
  structuralEquals: () => structuralEquals
});
module.exports = __toCommonJS(equals_exports);
var arrays = __toESM(require("vs/base/common/arrays"));
const strictEquals = (a, b) => a === b;
function itemsEquals(itemEquals2 = strictEquals) {
  return (a, b) => arrays.equals(a, b, itemEquals2);
}
function jsonStringifyEquals() {
  return (a, b) => JSON.stringify(a) === JSON.stringify(b);
}
function itemEquals() {
  return (a, b) => a.equals(b);
}
function equalsIfDefined(equalsOrV1, v2, equals) {
  if (equals !== void 0) {
    const v1 = equalsOrV1;
    if (v1 === void 0 || v1 === null || v2 === void 0 || v2 === null) {
      return v2 === v1;
    }
    return equals(v1, v2);
  } else {
    const equals2 = equalsOrV1;
    return (v1, v22) => {
      if (v1 === void 0 || v1 === null || v22 === void 0 || v22 === null) {
        return v22 === v1;
      }
      return equals2(v1, v22);
    };
  }
}
function structuralEquals(a, b) {
  if (a === b) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!structuralEquals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  if (a && typeof a === "object" && b && typeof b === "object") {
    if (Object.getPrototypeOf(a) === Object.prototype && Object.getPrototypeOf(b) === Object.prototype) {
      const aObj = a;
      const bObj = b;
      const keysA = Object.keys(aObj);
      const keysB = Object.keys(bObj);
      const keysBSet = new Set(keysB);
      if (keysA.length !== keysB.length) {
        return false;
      }
      for (const key of keysA) {
        if (!keysBSet.has(key)) {
          return false;
        }
        if (!structuralEquals(aObj[key], bObj[key])) {
          return false;
        }
      }
      return true;
    }
  }
  return false;
}
function getStructuralKey(t) {
  return JSON.stringify(toNormalizedJsonStructure(t));
}
let objectId = 0;
const objIds = /* @__PURE__ */ new WeakMap();
function toNormalizedJsonStructure(t) {
  if (Array.isArray(t)) {
    return t.map(toNormalizedJsonStructure);
  }
  if (t && typeof t === "object") {
    if (Object.getPrototypeOf(t) === Object.prototype) {
      const tObj = t;
      const res = /* @__PURE__ */ Object.create(null);
      for (const key of Object.keys(tObj).sort()) {
        res[key] = toNormalizedJsonStructure(tObj[key]);
      }
      return res;
    } else {
      let objId = objIds.get(t);
      if (objId === void 0) {
        objId = objectId++;
        objIds.set(t, objId);
      }
      return objId + "----2b76a038c20c4bcc";
    }
  }
  return t;
}
//# sourceMappingURL=equals.js.map
