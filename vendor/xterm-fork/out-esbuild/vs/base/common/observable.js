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
var observable_exports = {};
__export(observable_exports, {
  ObservableLazy: () => import_promise.ObservableLazy,
  ObservableLazyPromise: () => import_promise.ObservableLazyPromise,
  ObservablePromise: () => import_promise.ObservablePromise,
  PromiseResult: () => import_promise.PromiseResult,
  autorun: () => import_autorun.autorun,
  autorunDelta: () => import_autorun.autorunDelta,
  autorunHandleChanges: () => import_autorun.autorunHandleChanges,
  autorunOpts: () => import_autorun.autorunOpts,
  autorunWithStore: () => import_autorun.autorunWithStore,
  autorunWithStoreHandleChanges: () => import_autorun.autorunWithStoreHandleChanges,
  constObservable: () => import_utils.constObservable,
  debouncedObservable: () => import_utils.debouncedObservable,
  derived: () => import_derived.derived,
  derivedHandleChanges: () => import_derived.derivedHandleChanges,
  derivedObservableWithCache: () => import_utils.derivedObservableWithCache,
  derivedObservableWithWritableCache: () => import_utils.derivedObservableWithWritableCache,
  derivedOpts: () => import_derived.derivedOpts,
  derivedWithCancellationToken: () => import_promise.derivedWithCancellationToken,
  derivedWithStore: () => import_derived.derivedWithStore,
  disposableObservableValue: () => import_base.disposableObservableValue,
  keepObserved: () => import_utils.keepObserved,
  observableFromEvent: () => import_utils.observableFromEvent,
  observableFromPromise: () => import_utils.observableFromPromise,
  observableSignal: () => import_utils.observableSignal,
  observableSignalFromEvent: () => import_utils.observableSignalFromEvent,
  observableValue: () => import_base.observableValue,
  observableValueOpts: () => import_api.observableValueOpts,
  recomputeInitiallyAndOnChange: () => import_utils.recomputeInitiallyAndOnChange,
  subtransaction: () => import_base.subtransaction,
  transaction: () => import_base.transaction,
  waitForState: () => import_promise.waitForState,
  wasEventTriggeredRecently: () => import_utils.wasEventTriggeredRecently
});
module.exports = __toCommonJS(observable_exports);
var import_base = require("vs/base/common/observableInternal/base");
var import_derived = require("vs/base/common/observableInternal/derived");
var import_autorun = require("vs/base/common/observableInternal/autorun");
var import_utils = require("vs/base/common/observableInternal/utils");
var import_promise = require("vs/base/common/observableInternal/promise");
var import_api = require("vs/base/common/observableInternal/api");
var import_logging = require("vs/base/common/observableInternal/logging");
const enableLogging = false;
if (enableLogging) {
  (0, import_logging.setLogger)(new import_logging.ConsoleObservableLogger());
}
//# sourceMappingURL=observable.js.map
