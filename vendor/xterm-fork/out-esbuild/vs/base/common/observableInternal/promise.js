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
var promise_exports = {};
__export(promise_exports, {
  ObservableLazy: () => ObservableLazy,
  ObservableLazyPromise: () => ObservableLazyPromise,
  ObservablePromise: () => ObservablePromise,
  PromiseResult: () => PromiseResult,
  derivedWithCancellationToken: () => derivedWithCancellationToken,
  waitForState: () => waitForState
});
module.exports = __toCommonJS(promise_exports);
var import_autorun = require("vs/base/common/observableInternal/autorun");
var import_base = require("./base");
var import_derived = require("vs/base/common/observableInternal/derived");
var import_cancellation = require("vs/base/common/cancellation");
var import_debugName = require("vs/base/common/observableInternal/debugName");
var import_equals = require("vs/base/common/equals");
var import_errors = require("vs/base/common/errors");
class ObservableLazy {
  constructor(_computeValue) {
    this._computeValue = _computeValue;
    this._value = (0, import_base.observableValue)(this, void 0);
  }
  /**
   * The cached value.
   * Does not force a computation of the value.
   */
  get cachedValue() {
    return this._value;
  }
  /**
   * Returns the cached value.
   * Computes the value if the value has not been cached yet.
   */
  getValue() {
    let v = this._value.get();
    if (!v) {
      v = this._computeValue();
      this._value.set(v, void 0);
    }
    return v;
  }
}
class ObservablePromise {
  constructor(promise) {
    this._value = (0, import_base.observableValue)(this, void 0);
    /**
     * The current state of the promise.
     * Is `undefined` if the promise didn't resolve yet.
     */
    this.promiseResult = this._value;
    this.promise = promise.then((value) => {
      (0, import_base.transaction)((tx) => {
        this._value.set(new PromiseResult(value, void 0), tx);
      });
      return value;
    }, (error) => {
      (0, import_base.transaction)((tx) => {
        this._value.set(new PromiseResult(void 0, error), tx);
      });
      throw error;
    });
  }
  static fromFn(fn) {
    return new ObservablePromise(fn());
  }
}
class PromiseResult {
  constructor(data, error) {
    this.data = data;
    this.error = error;
  }
  /**
   * Returns the value if the promise resolved, otherwise throws the error.
   */
  getDataOrThrow() {
    if (this.error) {
      throw this.error;
    }
    return this.data;
  }
}
class ObservableLazyPromise {
  constructor(_computePromise) {
    this._computePromise = _computePromise;
    this._lazyValue = new ObservableLazy(() => new ObservablePromise(this._computePromise()));
    /**
     * Does not enforce evaluation of the promise compute function.
     * Is undefined if the promise has not been computed yet.
     */
    this.cachedPromiseResult = (0, import_derived.derived)(this, (reader) => this._lazyValue.cachedValue.read(reader)?.promiseResult.read(reader));
  }
  getPromise() {
    return this._lazyValue.getValue().promise;
  }
}
function waitForState(observable, predicate, isError, cancellationToken) {
  if (!predicate) {
    predicate = (state) => state !== null && state !== void 0;
  }
  return new Promise((resolve, reject) => {
    let isImmediateRun = true;
    let shouldDispose = false;
    const stateObs = observable.map((state) => {
      return {
        isFinished: predicate(state),
        error: isError ? isError(state) : false,
        state
      };
    });
    const d = (0, import_autorun.autorun)((reader) => {
      const { isFinished, error, state } = stateObs.read(reader);
      if (isFinished || error) {
        if (isImmediateRun) {
          shouldDispose = true;
        } else {
          d.dispose();
        }
        if (error) {
          reject(error === true ? state : error);
        } else {
          resolve(state);
        }
      }
    });
    if (cancellationToken) {
      const dc = cancellationToken.onCancellationRequested(() => {
        d.dispose();
        dc.dispose();
        reject(new import_errors.CancellationError());
      });
      if (cancellationToken.isCancellationRequested) {
        d.dispose();
        dc.dispose();
        reject(new import_errors.CancellationError());
        return;
      }
    }
    isImmediateRun = false;
    if (shouldDispose) {
      d.dispose();
    }
  });
}
function derivedWithCancellationToken(computeFnOrOwner, computeFnOrUndefined) {
  let computeFn;
  let owner;
  if (computeFnOrUndefined === void 0) {
    computeFn = computeFnOrOwner;
    owner = void 0;
  } else {
    owner = computeFnOrOwner;
    computeFn = computeFnOrUndefined;
  }
  let cancellationTokenSource = void 0;
  return new import_derived.Derived(
    new import_debugName.DebugNameData(owner, void 0, computeFn),
    (r) => {
      if (cancellationTokenSource) {
        cancellationTokenSource.dispose(true);
      }
      cancellationTokenSource = new import_cancellation.CancellationTokenSource();
      return computeFn(r, cancellationTokenSource.token);
    },
    void 0,
    void 0,
    () => cancellationTokenSource?.dispose(),
    import_equals.strictEquals
  );
}
//# sourceMappingURL=promise.js.map
