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
var derived_exports = {};
__export(derived_exports, {
  Derived: () => Derived,
  DerivedWithSetter: () => DerivedWithSetter,
  derived: () => derived,
  derivedDisposable: () => derivedDisposable,
  derivedHandleChanges: () => derivedHandleChanges,
  derivedOpts: () => derivedOpts,
  derivedWithSetter: () => derivedWithSetter,
  derivedWithStore: () => derivedWithStore
});
module.exports = __toCommonJS(derived_exports);
var import_assert = require("vs/base/common/assert");
var import_equals = require("vs/base/common/equals");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_base = require("vs/base/common/observableInternal/base");
var import_debugName = require("vs/base/common/observableInternal/debugName");
var import_logging = require("vs/base/common/observableInternal/logging");
function derived(computeFnOrOwner, computeFn) {
  if (computeFn !== void 0) {
    return new Derived(
      new import_debugName.DebugNameData(computeFnOrOwner, void 0, computeFn),
      computeFn,
      void 0,
      void 0,
      void 0,
      import_equals.strictEquals
    );
  }
  return new Derived(
    new import_debugName.DebugNameData(void 0, void 0, computeFnOrOwner),
    computeFnOrOwner,
    void 0,
    void 0,
    void 0,
    import_equals.strictEquals
  );
}
function derivedWithSetter(owner, computeFn, setter) {
  return new DerivedWithSetter(
    new import_debugName.DebugNameData(owner, void 0, computeFn),
    computeFn,
    void 0,
    void 0,
    void 0,
    import_equals.strictEquals,
    setter
  );
}
function derivedOpts(options, computeFn) {
  return new Derived(
    new import_debugName.DebugNameData(options.owner, options.debugName, options.debugReferenceFn),
    computeFn,
    void 0,
    void 0,
    options.onLastObserverRemoved,
    options.equalsFn ?? import_equals.strictEquals
  );
}
(0, import_base._setDerivedOpts)(derivedOpts);
function derivedHandleChanges(options, computeFn) {
  return new Derived(
    new import_debugName.DebugNameData(options.owner, options.debugName, void 0),
    computeFn,
    options.createEmptyChangeSummary,
    options.handleChange,
    void 0,
    options.equalityComparer ?? import_equals.strictEquals
  );
}
function derivedWithStore(computeFnOrOwner, computeFnOrUndefined) {
  let computeFn;
  let owner;
  if (computeFnOrUndefined === void 0) {
    computeFn = computeFnOrOwner;
    owner = void 0;
  } else {
    owner = computeFnOrOwner;
    computeFn = computeFnOrUndefined;
  }
  const store = new import_lifecycle.DisposableStore();
  return new Derived(
    new import_debugName.DebugNameData(owner, void 0, computeFn),
    (r) => {
      store.clear();
      return computeFn(r, store);
    },
    void 0,
    void 0,
    () => store.dispose(),
    import_equals.strictEquals
  );
}
function derivedDisposable(computeFnOrOwner, computeFnOrUndefined) {
  let computeFn;
  let owner;
  if (computeFnOrUndefined === void 0) {
    computeFn = computeFnOrOwner;
    owner = void 0;
  } else {
    owner = computeFnOrOwner;
    computeFn = computeFnOrUndefined;
  }
  let store = void 0;
  return new Derived(
    new import_debugName.DebugNameData(owner, void 0, computeFn),
    (r) => {
      if (!store) {
        store = new import_lifecycle.DisposableStore();
      } else {
        store.clear();
      }
      const result = computeFn(r);
      if (result) {
        store.add(result);
      }
      return result;
    },
    void 0,
    void 0,
    () => {
      if (store) {
        store.dispose();
        store = void 0;
      }
    },
    import_equals.strictEquals
  );
}
var DerivedState = /* @__PURE__ */ ((DerivedState2) => {
  DerivedState2[DerivedState2["initial"] = 0] = "initial";
  DerivedState2[DerivedState2["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
  DerivedState2[DerivedState2["stale"] = 2] = "stale";
  DerivedState2[DerivedState2["upToDate"] = 3] = "upToDate";
  return DerivedState2;
})(DerivedState || {});
class Derived extends import_base.BaseObservable {
  constructor(_debugNameData, _computeFn, createChangeSummary, _handleChange, _handleLastObserverRemoved = void 0, _equalityComparator) {
    super();
    this._debugNameData = _debugNameData;
    this._computeFn = _computeFn;
    this.createChangeSummary = createChangeSummary;
    this._handleChange = _handleChange;
    this._handleLastObserverRemoved = _handleLastObserverRemoved;
    this._equalityComparator = _equalityComparator;
    this.state = 0 /* initial */;
    this.value = void 0;
    this.updateCount = 0;
    this.dependencies = /* @__PURE__ */ new Set();
    this.dependenciesToBeRemoved = /* @__PURE__ */ new Set();
    this.changeSummary = void 0;
    this.changeSummary = this.createChangeSummary?.();
    (0, import_logging.getLogger)()?.handleDerivedCreated(this);
  }
  get debugName() {
    return this._debugNameData.getDebugName(this) ?? "(anonymous)";
  }
  onLastObserverRemoved() {
    this.state = 0 /* initial */;
    this.value = void 0;
    for (const d of this.dependencies) {
      d.removeObserver(this);
    }
    this.dependencies.clear();
    this._handleLastObserverRemoved?.();
  }
  get() {
    if (this.observers.size === 0) {
      const result = this._computeFn(this, this.createChangeSummary?.());
      this.onLastObserverRemoved();
      return result;
    } else {
      do {
        if (this.state === 1 /* dependenciesMightHaveChanged */) {
          for (const d of this.dependencies) {
            d.reportChanges();
            if (this.state === 2 /* stale */) {
              break;
            }
          }
        }
        if (this.state === 1 /* dependenciesMightHaveChanged */) {
          this.state = 3 /* upToDate */;
        }
        this._recomputeIfNeeded();
      } while (this.state !== 3 /* upToDate */);
      return this.value;
    }
  }
  _recomputeIfNeeded() {
    if (this.state === 3 /* upToDate */) {
      return;
    }
    const emptySet = this.dependenciesToBeRemoved;
    this.dependenciesToBeRemoved = this.dependencies;
    this.dependencies = emptySet;
    const hadValue = this.state !== 0 /* initial */;
    const oldValue = this.value;
    this.state = 3 /* upToDate */;
    const changeSummary = this.changeSummary;
    this.changeSummary = this.createChangeSummary?.();
    try {
      this.value = this._computeFn(this, changeSummary);
    } finally {
      for (const o of this.dependenciesToBeRemoved) {
        o.removeObserver(this);
      }
      this.dependenciesToBeRemoved.clear();
    }
    const didChange = hadValue && !this._equalityComparator(oldValue, this.value);
    (0, import_logging.getLogger)()?.handleDerivedRecomputed(this, {
      oldValue,
      newValue: this.value,
      change: void 0,
      didChange,
      hadValue
    });
    if (didChange) {
      for (const r of this.observers) {
        r.handleChange(this, void 0);
      }
    }
  }
  toString() {
    return `LazyDerived<${this.debugName}>`;
  }
  // IObserver Implementation
  beginUpdate(_observable) {
    this.updateCount++;
    const propagateBeginUpdate = this.updateCount === 1;
    if (this.state === 3 /* upToDate */) {
      this.state = 1 /* dependenciesMightHaveChanged */;
      if (!propagateBeginUpdate) {
        for (const r of this.observers) {
          r.handlePossibleChange(this);
        }
      }
    }
    if (propagateBeginUpdate) {
      for (const r of this.observers) {
        r.beginUpdate(this);
      }
    }
  }
  endUpdate(_observable) {
    this.updateCount--;
    if (this.updateCount === 0) {
      const observers = [...this.observers];
      for (const r of observers) {
        r.endUpdate(this);
      }
    }
    (0, import_assert.assertFn)(() => this.updateCount >= 0);
  }
  handlePossibleChange(observable) {
    if (this.state === 3 /* upToDate */ && this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
      this.state = 1 /* dependenciesMightHaveChanged */;
      for (const r of this.observers) {
        r.handlePossibleChange(this);
      }
    }
  }
  handleChange(observable, change) {
    if (this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
      const shouldReact = this._handleChange ? this._handleChange({
        changedObservable: observable,
        change,
        didChange: (o) => o === observable
      }, this.changeSummary) : true;
      const wasUpToDate = this.state === 3 /* upToDate */;
      if (shouldReact && (this.state === 1 /* dependenciesMightHaveChanged */ || wasUpToDate)) {
        this.state = 2 /* stale */;
        if (wasUpToDate) {
          for (const r of this.observers) {
            r.handlePossibleChange(this);
          }
        }
      }
    }
  }
  // IReader Implementation
  readObservable(observable) {
    observable.addObserver(this);
    const value = observable.get();
    this.dependencies.add(observable);
    this.dependenciesToBeRemoved.delete(observable);
    return value;
  }
  addObserver(observer) {
    const shouldCallBeginUpdate = !this.observers.has(observer) && this.updateCount > 0;
    super.addObserver(observer);
    if (shouldCallBeginUpdate) {
      observer.beginUpdate(this);
    }
  }
  removeObserver(observer) {
    const shouldCallEndUpdate = this.observers.has(observer) && this.updateCount > 0;
    super.removeObserver(observer);
    if (shouldCallEndUpdate) {
      observer.endUpdate(this);
    }
  }
}
class DerivedWithSetter extends Derived {
  constructor(debugNameData, computeFn, createChangeSummary, handleChange, handleLastObserverRemoved = void 0, equalityComparator, set) {
    super(
      debugNameData,
      computeFn,
      createChangeSummary,
      handleChange,
      handleLastObserverRemoved,
      equalityComparator
    );
    this.set = set;
  }
}
//# sourceMappingURL=derived.js.map
