"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecorationService = void 0;
const Color_1 = require("common/Color");
const lifecycle_1 = require("vs/base/common/lifecycle");
const SortedList_1 = require("common/SortedList");
const event_1 = require("vs/base/common/event");
let $xmin = 0;
let $xmax = 0;
class DecorationService extends lifecycle_1.Disposable {
    get decorations() { return this._decorations.values(); }
    constructor() {
        super();
        this._decorations = new SortedList_1.SortedList(e => e?.marker.line);
        this._onDecorationRegistered = this._register(new event_1.Emitter());
        this.onDecorationRegistered = this._onDecorationRegistered.event;
        this._onDecorationRemoved = this._register(new event_1.Emitter());
        this.onDecorationRemoved = this._onDecorationRemoved.event;
        this._register((0, lifecycle_1.toDisposable)(() => this.reset()));
    }
    registerDecoration(options) {
        if (options.marker.isDisposed) {
            return undefined;
        }
        const decoration = new Decoration(options);
        if (decoration) {
            const markerDispose = decoration.marker.onDispose(() => decoration.dispose());
            const listener = decoration.onDispose(() => {
                listener.dispose();
                if (decoration) {
                    if (this._decorations.delete(decoration)) {
                        this._onDecorationRemoved.fire(decoration);
                    }
                    markerDispose.dispose();
                }
            });
            this._decorations.insert(decoration);
            this._onDecorationRegistered.fire(decoration);
        }
        return decoration;
    }
    reset() {
        for (const d of this._decorations.values()) {
            d.dispose();
        }
        this._decorations.clear();
    }
    *getDecorationsAtCell(x, line, layer) {
        let xmin = 0;
        let xmax = 0;
        for (const d of this._decorations.getKeyIterator(line)) {
            xmin = d.options.x ?? 0;
            xmax = xmin + (d.options.width ?? 1);
            if (x >= xmin && x < xmax && (!layer || (d.options.layer ?? 'bottom') === layer)) {
                yield d;
            }
        }
    }
    forEachDecorationAtCell(x, line, layer, callback) {
        this._decorations.forEachByKey(line, d => {
            $xmin = d.options.x ?? 0;
            $xmax = $xmin + (d.options.width ?? 1);
            if (x >= $xmin && x < $xmax && (!layer || (d.options.layer ?? 'bottom') === layer)) {
                callback(d);
            }
        });
    }
}
exports.DecorationService = DecorationService;
class Decoration extends lifecycle_1.DisposableStore {
    get backgroundColorRGB() {
        if (this._cachedBg === null) {
            if (this.options.backgroundColor) {
                this._cachedBg = Color_1.css.toColor(this.options.backgroundColor);
            }
            else {
                this._cachedBg = undefined;
            }
        }
        return this._cachedBg;
    }
    get foregroundColorRGB() {
        if (this._cachedFg === null) {
            if (this.options.foregroundColor) {
                this._cachedFg = Color_1.css.toColor(this.options.foregroundColor);
            }
            else {
                this._cachedFg = undefined;
            }
        }
        return this._cachedFg;
    }
    constructor(options) {
        super();
        this.options = options;
        this.onRenderEmitter = this.add(new event_1.Emitter());
        this.onRender = this.onRenderEmitter.event;
        this._onDispose = this.add(new event_1.Emitter());
        this.onDispose = this._onDispose.event;
        this._cachedBg = null;
        this._cachedFg = null;
        this.marker = options.marker;
        if (this.options.overviewRulerOptions && !this.options.overviewRulerOptions.position) {
            this.options.overviewRulerOptions.position = 'full';
        }
    }
    dispose() {
        this._onDispose.fire();
        super.dispose();
    }
}
//# sourceMappingURL=DecorationService.js.map