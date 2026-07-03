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
var autorun_exports = {};
__export(autorun_exports, {
  AutorunObserver: () => AutorunObserver,
  autorun: () => autorun,
  autorunDelta: () => autorunDelta,
  autorunHandleChanges: () => autorunHandleChanges,
  autorunOpts: () => autorunOpts,
  autorunWithStore: () => autorunWithStore,
  autorunWithStoreHandleChanges: () => autorunWithStoreHandleChanges
});
module.exports = __toCommonJS(autorun_exports);
var import_assert = require("vs/base/common/assert");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_debugName = require("vs/base/common/observableInternal/debugName");
var import_logging = require("vs/base/common/observableInternal/logging");
function autorun(fn) {
  return new AutorunObserver(
    new import_debugName.DebugNameData(void 0, void 0, fn),
    fn,
    void 0,
    void 0
  );
}
function autorunOpts(options, fn) {
  return new AutorunObserver(
    new import_debugName.DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn),
    fn,
    void 0,
    void 0
  );
}
function autorunHandleChanges(options, fn) {
  return new AutorunObserver(
    new import_debugName.DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn),
    fn,
    options.createEmptyChangeSummary,
    options.handleChange
  );
}
function autorunWithStoreHandleChanges(options, fn) {
  const store = new import_lifecycle.DisposableStore();
  const disposable = autorunHandleChanges(
    {
      owner: options.owner,
      debugName: options.debugName,
      debugReferenceFn: options.debugReferenceFn ?? fn,
      createEmptyChangeSummary: options.createEmptyChangeSummary,
      handleChange: options.handleChange
    },
    (reader, changeSummary) => {
      store.clear();
      fn(reader, changeSummary, store);
    }
  );
  return (0, import_lifecycle.toDisposable)(() => {
    disposable.dispose();
    store.dispose();
  });
}
function autorunWithStore(fn) {
  const store = new import_lifecycle.DisposableStore();
  const disposable = autorunOpts(
    {
      owner: void 0,
      debugName: void 0,
      debugReferenceFn: fn
    },
    (reader) => {
      store.clear();
      fn(reader, store);
    }
  );
  return (0, import_lifecycle.toDisposable)(() => {
    disposable.dispose();
    store.dispose();
  });
}
function autorunDelta(observable, handler) {
  let _lastValue;
  return autorunOpts({ debugReferenceFn: handler }, (reader) => {
    const newValue = observable.read(reader);
    const lastValue = _lastValue;
    _lastValue = newValue;
    handler({ lastValue, newValue });
  });
}
var AutorunState = /* @__PURE__ */ ((AutorunState2) => {
  AutorunState2[AutorunState2["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
  AutorunState2[AutorunState2["stale"] = 2] = "stale";
  AutorunState2[AutorunState2["upToDate"] = 3] = "upToDate";
  return AutorunState2;
})(AutorunState || {});
class AutorunObserver {
  constructor(_debugNameData, _runFn, createChangeSummary, _handleChange) {
    this._debugNameData = _debugNameData;
    this._runFn = _runFn;
    this.createChangeSummary = createChangeSummary;
    this._handleChange = _handleChange;
    this.state = 2 /* stale */;
    this.updateCount = 0;
    this.disposed = false;
    this.dependencies = /* @__PURE__ */ new Set();
    this.dependenciesToBeRemoved = /* @__PURE__ */ new Set();
    this.changeSummary = this.createChangeSummary?.();
    (0, import_logging.getLogger)()?.handleAutorunCreated(this);
    this._runIfNeeded();
    (0, import_lifecycle.trackDisposable)(this);
  }
  get debugName() {
    return this._debugNameData.getDebugName(this) ?? "(anonymous)";
  }
  dispose() {
    this.disposed = true;
    for (const o of this.dependencies) {
      o.removeObserver(this);
    }
    this.dependencies.clear();
    (0, import_lifecycle.markAsDisposed)(this);
  }
  _runIfNeeded() {
    if (this.state === 3 /* upToDate */) {
      return;
    }
    const emptySet = this.dependenciesToBeRemoved;
    this.dependenciesToBeRemoved = this.dependencies;
    this.dependencies = emptySet;
    this.state = 3 /* upToDate */;
    const isDisposed = this.disposed;
    try {
      if (!isDisposed) {
        (0, import_logging.getLogger)()?.handleAutorunTriggered(this);
        const changeSummary = this.changeSummary;
        this.changeSummary = this.createChangeSummary?.();
        this._runFn(this, changeSummary);
      }
    } finally {
      if (!isDisposed) {
        (0, import_logging.getLogger)()?.handleAutorunFinished(this);
      }
      for (const o of this.dependenciesToBeRemoved) {
        o.removeObserver(this);
      }
      this.dependenciesToBeRemoved.clear();
    }
  }
  toString() {
    return `Autorun<${this.debugName}>`;
  }
  // IObserver implementation
  beginUpdate() {
    if (this.state === 3 /* upToDate */) {
      this.state = 1 /* dependenciesMightHaveChanged */;
    }
    this.updateCount++;
  }
  endUpdate() {
    if (this.updateCount === 1) {
      do {
        if (this.state === 1 /* dependenciesMightHaveChanged */) {
          this.state = 3 /* upToDate */;
          for (const d of this.dependencies) {
            d.reportChanges();
            if (this.state === 2 /* stale */) {
              break;
            }
          }
        }
        this._runIfNeeded();
      } while (this.state !== 3 /* upToDate */);
    }
    this.updateCount--;
    (0, import_assert.assertFn)(() => this.updateCount >= 0);
  }
  handlePossibleChange(observable) {
    if (this.state === 3 /* upToDate */ && this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
      this.state = 1 /* dependenciesMightHaveChanged */;
    }
  }
  handleChange(observable, change) {
    if (this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
      const shouldReact = this._handleChange ? this._handleChange({
        changedObservable: observable,
        change,
        didChange: (o) => o === observable
      }, this.changeSummary) : true;
      if (shouldReact) {
        this.state = 2 /* stale */;
      }
    }
  }
  // IReader implementation
  readObservable(observable) {
    if (this.disposed) {
      return observable.get();
    }
    observable.addObserver(this);
    const value = observable.get();
    this.dependencies.add(observable);
    this.dependenciesToBeRemoved.delete(observable);
    return value;
  }
}
((autorun2) => {
  autorun2.Observer = AutorunObserver;
})(autorun || (autorun = {}));
//# sourceMappingURL=autorun.js.map
