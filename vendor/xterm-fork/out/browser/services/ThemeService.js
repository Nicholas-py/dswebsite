"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeService = void 0;
const ColorContrastCache_1 = require("browser/ColorContrastCache");
const Types_1 = require("browser/Types");
const Color_1 = require("common/Color");
const lifecycle_1 = require("vs/base/common/lifecycle");
const Services_1 = require("common/services/Services");
const event_1 = require("vs/base/common/event");
const DEFAULT_FOREGROUND = Color_1.css.toColor('#ffffff');
const DEFAULT_BACKGROUND = Color_1.css.toColor('#000000');
const DEFAULT_CURSOR = Color_1.css.toColor('#ffffff');
const DEFAULT_CURSOR_ACCENT = DEFAULT_BACKGROUND;
const DEFAULT_SELECTION = {
    css: 'rgba(255, 255, 255, 0.3)',
    rgba: 0xFFFFFF4D
};
const DEFAULT_OVERVIEW_RULER_BORDER = DEFAULT_FOREGROUND;
let ThemeService = class ThemeService extends lifecycle_1.Disposable {
    get colors() { return this._colors; }
    constructor(_optionsService) {
        super();
        this._optionsService = _optionsService;
        this._contrastCache = new ColorContrastCache_1.ColorContrastCache();
        this._halfContrastCache = new ColorContrastCache_1.ColorContrastCache();
        this._onChangeColors = this._register(new event_1.Emitter());
        this.onChangeColors = this._onChangeColors.event;
        this._colors = {
            foreground: DEFAULT_FOREGROUND,
            background: DEFAULT_BACKGROUND,
            cursor: DEFAULT_CURSOR,
            cursorAccent: DEFAULT_CURSOR_ACCENT,
            selectionForeground: undefined,
            selectionBackgroundTransparent: DEFAULT_SELECTION,
            selectionBackgroundOpaque: Color_1.color.blend(DEFAULT_BACKGROUND, DEFAULT_SELECTION),
            selectionInactiveBackgroundTransparent: DEFAULT_SELECTION,
            selectionInactiveBackgroundOpaque: Color_1.color.blend(DEFAULT_BACKGROUND, DEFAULT_SELECTION),
            scrollbarSliderBackground: Color_1.color.opacity(DEFAULT_FOREGROUND, 0.2),
            scrollbarSliderHoverBackground: Color_1.color.opacity(DEFAULT_FOREGROUND, 0.4),
            scrollbarSliderActiveBackground: Color_1.color.opacity(DEFAULT_FOREGROUND, 0.5),
            overviewRulerBorder: DEFAULT_FOREGROUND,
            ansi: Types_1.DEFAULT_ANSI_COLORS.slice(),
            contrastCache: this._contrastCache,
            halfContrastCache: this._halfContrastCache
        };
        this._updateRestoreColors();
        this._setTheme(this._optionsService.rawOptions.theme);
        this._register(this._optionsService.onSpecificOptionChange('minimumContrastRatio', () => this._contrastCache.clear()));
        this._register(this._optionsService.onSpecificOptionChange('theme', () => this._setTheme(this._optionsService.rawOptions.theme)));
    }
    _setTheme(theme = {}) {
        const colors = this._colors;
        colors.foreground = parseColor(theme.foreground, DEFAULT_FOREGROUND);
        colors.background = parseColor(theme.background, DEFAULT_BACKGROUND);
        colors.cursor = Color_1.color.blend(colors.background, parseColor(theme.cursor, DEFAULT_CURSOR));
        colors.cursorAccent = Color_1.color.blend(colors.background, parseColor(theme.cursorAccent, DEFAULT_CURSOR_ACCENT));
        colors.selectionBackgroundTransparent = parseColor(theme.selectionBackground, DEFAULT_SELECTION);
        colors.selectionBackgroundOpaque = Color_1.color.blend(colors.background, colors.selectionBackgroundTransparent);
        colors.selectionInactiveBackgroundTransparent = parseColor(theme.selectionInactiveBackground, colors.selectionBackgroundTransparent);
        colors.selectionInactiveBackgroundOpaque = Color_1.color.blend(colors.background, colors.selectionInactiveBackgroundTransparent);
        colors.selectionForeground = theme.selectionForeground ? parseColor(theme.selectionForeground, Color_1.NULL_COLOR) : undefined;
        if (colors.selectionForeground === Color_1.NULL_COLOR) {
            colors.selectionForeground = undefined;
        }
        if (Color_1.color.isOpaque(colors.selectionBackgroundTransparent)) {
            const opacity = 0.3;
            colors.selectionBackgroundTransparent = Color_1.color.opacity(colors.selectionBackgroundTransparent, opacity);
        }
        if (Color_1.color.isOpaque(colors.selectionInactiveBackgroundTransparent)) {
            const opacity = 0.3;
            colors.selectionInactiveBackgroundTransparent = Color_1.color.opacity(colors.selectionInactiveBackgroundTransparent, opacity);
        }
        colors.scrollbarSliderBackground = parseColor(theme.scrollbarSliderBackground, Color_1.color.opacity(colors.foreground, 0.2));
        colors.scrollbarSliderHoverBackground = parseColor(theme.scrollbarSliderHoverBackground, Color_1.color.opacity(colors.foreground, 0.4));
        colors.scrollbarSliderActiveBackground = parseColor(theme.scrollbarSliderActiveBackground, Color_1.color.opacity(colors.foreground, 0.5));
        colors.overviewRulerBorder = parseColor(theme.overviewRulerBorder, DEFAULT_OVERVIEW_RULER_BORDER);
        colors.ansi = Types_1.DEFAULT_ANSI_COLORS.slice();
        colors.ansi[0] = parseColor(theme.black, Types_1.DEFAULT_ANSI_COLORS[0]);
        colors.ansi[1] = parseColor(theme.red, Types_1.DEFAULT_ANSI_COLORS[1]);
        colors.ansi[2] = parseColor(theme.green, Types_1.DEFAULT_ANSI_COLORS[2]);
        colors.ansi[3] = parseColor(theme.yellow, Types_1.DEFAULT_ANSI_COLORS[3]);
        colors.ansi[4] = parseColor(theme.blue, Types_1.DEFAULT_ANSI_COLORS[4]);
        colors.ansi[5] = parseColor(theme.magenta, Types_1.DEFAULT_ANSI_COLORS[5]);
        colors.ansi[6] = parseColor(theme.cyan, Types_1.DEFAULT_ANSI_COLORS[6]);
        colors.ansi[7] = parseColor(theme.white, Types_1.DEFAULT_ANSI_COLORS[7]);
        colors.ansi[8] = parseColor(theme.brightBlack, Types_1.DEFAULT_ANSI_COLORS[8]);
        colors.ansi[9] = parseColor(theme.brightRed, Types_1.DEFAULT_ANSI_COLORS[9]);
        colors.ansi[10] = parseColor(theme.brightGreen, Types_1.DEFAULT_ANSI_COLORS[10]);
        colors.ansi[11] = parseColor(theme.brightYellow, Types_1.DEFAULT_ANSI_COLORS[11]);
        colors.ansi[12] = parseColor(theme.brightBlue, Types_1.DEFAULT_ANSI_COLORS[12]);
        colors.ansi[13] = parseColor(theme.brightMagenta, Types_1.DEFAULT_ANSI_COLORS[13]);
        colors.ansi[14] = parseColor(theme.brightCyan, Types_1.DEFAULT_ANSI_COLORS[14]);
        colors.ansi[15] = parseColor(theme.brightWhite, Types_1.DEFAULT_ANSI_COLORS[15]);
        if (theme.extendedAnsi) {
            const colorCount = Math.min(colors.ansi.length - 16, theme.extendedAnsi.length);
            for (let i = 0; i < colorCount; i++) {
                colors.ansi[i + 16] = parseColor(theme.extendedAnsi[i], Types_1.DEFAULT_ANSI_COLORS[i + 16]);
            }
        }
        this._contrastCache.clear();
        this._halfContrastCache.clear();
        this._updateRestoreColors();
        this._onChangeColors.fire(this.colors);
    }
    restoreColor(slot) {
        this._restoreColor(slot);
        this._onChangeColors.fire(this.colors);
    }
    _restoreColor(slot) {
        if (slot === undefined) {
            for (let i = 0; i < this._restoreColors.ansi.length; ++i) {
                this._colors.ansi[i] = this._restoreColors.ansi[i];
            }
            return;
        }
        switch (slot) {
            case 256:
                this._colors.foreground = this._restoreColors.foreground;
                break;
            case 257:
                this._colors.background = this._restoreColors.background;
                break;
            case 258:
                this._colors.cursor = this._restoreColors.cursor;
                break;
            default:
                this._colors.ansi[slot] = this._restoreColors.ansi[slot];
        }
    }
    modifyColors(callback) {
        callback(this._colors);
        this._onChangeColors.fire(this.colors);
    }
    _updateRestoreColors() {
        this._restoreColors = {
            foreground: this._colors.foreground,
            background: this._colors.background,
            cursor: this._colors.cursor,
            ansi: this._colors.ansi.slice()
        };
    }
};
exports.ThemeService = ThemeService;
exports.ThemeService = ThemeService = __decorate([
    __param(0, Services_1.IOptionsService)
], ThemeService);
function parseColor(cssString, fallback) {
    if (cssString !== undefined) {
        try {
            return Color_1.css.toColor(cssString);
        }
        catch {
        }
    }
    return fallback;
}
//# sourceMappingURL=ThemeService.js.map