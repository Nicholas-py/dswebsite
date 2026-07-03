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
var assert_exports = {};
__export(assert_exports, {
  assert: () => assert,
  assertFn: () => assertFn,
  assertNever: () => assertNever,
  checkAdjacentItems: () => checkAdjacentItems,
  ok: () => ok,
  softAssert: () => softAssert
});
module.exports = __toCommonJS(assert_exports);
var import_errors = require("vs/base/common/errors");
function ok(value, message) {
  if (!value) {
    throw new Error(message ? `Assertion failed (${message})` : "Assertion Failed");
  }
}
function assertNever(value, message = "Unreachable") {
  throw new Error(message);
}
function assert(condition, message = "unexpected state") {
  if (!condition) {
    throw new import_errors.BugIndicatingError(`Assertion Failed: ${message}`);
  }
}
function softAssert(condition) {
  if (!condition) {
    (0, import_errors.onUnexpectedError)(new import_errors.BugIndicatingError("Soft Assertion Failed"));
  }
}
function assertFn(condition) {
  if (!condition()) {
    debugger;
    condition();
    (0, import_errors.onUnexpectedError)(new import_errors.BugIndicatingError("Assertion Failed"));
  }
}
function checkAdjacentItems(items, predicate) {
  let i = 0;
  while (i < items.length - 1) {
    const a = items[i];
    const b = items[i + 1];
    if (!predicate(a, b)) {
      return false;
    }
    i++;
  }
  return true;
}
//# sourceMappingURL=assert.js.map
