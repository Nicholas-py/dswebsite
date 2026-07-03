"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutorunObserver = void 0;
exports.autorun = autorun;
exports.autorunOpts = autorunOpts;
exports.autorunHandleChanges = autorunHandleChanges;
exports.autorunWithStoreHandleChanges = autorunWithStoreHandleChanges;
exports.autorunWithStore = autorunWithStore;
exports.autorunDelta = autorunDelta;
const assert_1 = require("vs/base/common/assert");
const lifecycle_1 = require("vs/base/common/lifecycle");
const debugName_1 = require("vs/base/common/observableInternal/debugName");
const logging_1 = require("vs/base/common/observableInternal/logging");
/**
 * Runs immediately and whenever a transaction ends and an observed observable changed.
 * {@link fn} should start with a JS Doc using `@description` to name the autorun.
 */
function autorun(fn) {
    return new AutorunObserver(new debugName_1.DebugNameData(undefined, undefined, fn), fn, undefined, undefined);
}
/**
 * Runs immediately and whenever a transaction ends and an observed observable changed.
 * {@link fn} should start with a JS Doc using `@description` to name the autorun.
 */
function autorunOpts(options, fn) {
    return new AutorunObserver(new debugName_1.DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn), fn, undefined, undefined);
}
/**
 * Runs immediately and whenever a transaction ends and an observed observable changed.
 * {@link fn} should start with a JS Doc using `@description` to name the autorun.
 *
 * Use `createEmptyChangeSummary` to create a "change summary" that can collect the changes.
 * Use `handleChange` to add a reported change to the change summary.
 * The run function is given the last change summary.
 * The change summary is discarded after the run function was called.
 *
 * @see autorun
 */
function autorunHandleChanges(options, fn) {
    return new AutorunObserver(new debugName_1.DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? fn), fn, options.createEmptyChangeSummary, options.handleChange);
}
/**
 * @see autorunHandleChanges (but with a disposable store that is cleared before the next run or on dispose)
 */
function autorunWithStoreHandleChanges(options, fn) {
    const store = new lifecycle_1.DisposableStore();
    const disposable = autorunHandleChanges({
        owner: options.owner,
        debugName: options.debugName,
        debugReferenceFn: options.debugReferenceFn ?? fn,
        createEmptyChangeSummary: options.createEmptyChangeSummary,
        handleChange: options.handleChange,
    }, (reader, changeSummary) => {
        store.clear();
        fn(reader, changeSummary, store);
    });
    return (0, lifecycle_1.toDisposable)(() => {
        disposable.dispose();
        store.dispose();
    });
}
/**
 * @see autorun (but with a disposable store that is cleared before the next run or on dispose)
 */
function autorunWithStore(fn) {
    const store = new lifecycle_1.DisposableStore();
    const disposable = autorunOpts({
        owner: undefined,
        debugName: undefined,
        debugReferenceFn: fn,
    }, reader => {
        store.clear();
        fn(reader, store);
    });
    return (0, lifecycle_1.toDisposable)(() => {
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
var AutorunState;
(function (AutorunState) {
    /**
     * A dependency could have changed.
     * We need to explicitly ask them if at least one dependency changed.
     */
    AutorunState[AutorunState["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
    /**
     * A dependency changed and we need to recompute.
     */
    AutorunState[AutorunState["stale"] = 2] = "stale";
    AutorunState[AutorunState["upToDate"] = 3] = "upToDate";
})(AutorunState || (AutorunState = {}));
class AutorunObserver {
    get debugName() {
        return this._debugNameData.getDebugName(this) ?? '(anonymous)';
    }
    constructor(_debugNameData, _runFn, createChangeSummary, _handleChange) {
        this._debugNameData = _debugNameData;
        this._runFn = _runFn;
        this.createChangeSummary = createChangeSummary;
        this._handleChange = _handleChange;
        this.state = AutorunState.stale;
        this.updateCount = 0;
        this.disposed = false;
        this.dependencies = new Set();
        this.dependenciesToBeRemoved = new Set();
        this.changeSummary = this.createChangeSummary?.();
        (0, logging_1.getLogger)()?.handleAutorunCreated(this);
        this._runIfNeeded();
        (0, lifecycle_1.trackDisposable)(this);
    }
    dispose() {
        this.disposed = true;
        for (const o of this.dependencies) {
            o.removeObserver(this);
        }
        this.dependencies.clear();
        (0, lifecycle_1.markAsDisposed)(this);
    }
    _runIfNeeded() {
        if (this.state === AutorunState.upToDate) {
            return;
        }
        const emptySet = this.dependenciesToBeRemoved;
        this.dependenciesToBeRemoved = this.dependencies;
        this.dependencies = emptySet;
        this.state = AutorunState.upToDate;
        const isDisposed = this.disposed;
        try {
            if (!isDisposed) {
                (0, logging_1.getLogger)()?.handleAutorunTriggered(this);
                const changeSummary = this.changeSummary;
                this.changeSummary = this.createChangeSummary?.();
                this._runFn(this, changeSummary);
            }
        }
        finally {
            if (!isDisposed) {
                (0, logging_1.getLogger)()?.handleAutorunFinished(this);
            }
            // We don't want our observed observables to think that they are (not even temporarily) not being observed.
            // Thus, we only unsubscribe from observables that are definitely not read anymore.
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
        if (this.state === AutorunState.upToDate) {
            this.state = AutorunState.dependenciesMightHaveChanged;
        }
        this.updateCount++;
    }
    endUpdate() {
        if (this.updateCount === 1) {
            do {
                if (this.state === AutorunState.dependenciesMightHaveChanged) {
                    this.state = AutorunState.upToDate;
                    for (const d of this.dependencies) {
                        d.reportChanges();
                        if (this.state === AutorunState.stale) {
                            // The other dependencies will refresh on demand
                            break;
                        }
                    }
                }
                this._runIfNeeded();
            } while (this.state !== AutorunState.upToDate);
        }
        this.updateCount--;
        (0, assert_1.assertFn)(() => this.updateCount >= 0);
    }
    handlePossibleChange(observable) {
        if (this.state === AutorunState.upToDate && this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
            this.state = AutorunState.dependenciesMightHaveChanged;
        }
    }
    handleChange(observable, change) {
        if (this.dependencies.has(observable) && !this.dependenciesToBeRemoved.has(observable)) {
            const shouldReact = this._handleChange ? this._handleChange({
                changedObservable: observable,
                change,
                didChange: (o) => o === observable,
            }, this.changeSummary) : true;
            if (shouldReact) {
                this.state = AutorunState.stale;
            }
        }
    }
    // IReader implementation
    readObservable(observable) {
        // In case the run action disposes the autorun
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
exports.AutorunObserver = AutorunObserver;
(function (autorun) {
    autorun.Observer = AutorunObserver;
})(autorun || (exports.autorun = autorun = {}));
