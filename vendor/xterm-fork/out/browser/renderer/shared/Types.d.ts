import { FontWeight, Terminal } from '@xterm/xterm';
import { IColorSet, ITerminal } from 'browser/Types';
import { IDisposable } from 'common/Types';
import type { Event } from 'vs/base/common/event';
export interface ICharAtlasConfig {
    customGlyphs: boolean;
    devicePixelRatio: number;
    letterSpacing: number;
    lineHeight: number;
    fontSize: number;
    fontFamily: string;
    fontWeight: FontWeight;
    fontWeightBold: FontWeight;
    deviceCellWidth: number;
    deviceCellHeight: number;
    deviceCharWidth: number;
    deviceCharHeight: number;
    allowTransparency: boolean;
    drawBoldTextInBrightColors: boolean;
    minimumContrastRatio: number;
    colors: IColorSet;
}
export interface IDimensions {
    width: number;
    height: number;
}
export interface IOffset {
    top: number;
    left: number;
}
export interface IRenderDimensions {
    css: {
        canvas: IDimensions;
        cell: IDimensions;
    };
    device: {
        canvas: IDimensions;
        cell: IDimensions;
        char: IDimensions & IOffset;
    };
}
export interface IRequestRedrawEvent {
    start: number;
    end: number;
}
export interface IRenderer extends IDisposable {
    readonly dimensions: IRenderDimensions;
    readonly onRequestRedraw: Event<IRequestRedrawEvent>;
    dispose(): void;
    handleDevicePixelRatioChange(): void;
    handleResize(cols: number, rows: number): void;
    handleCharSizeChanged(): void;
    handleBlur(): void;
    handleFocus(): void;
    handleSelectionChanged(start: [number, number] | undefined, end: [number, number] | undefined, columnSelectMode: boolean): void;
    handleCursorMove(): void;
    clear(): void;
    renderRows(start: number, end: number): void;
    clearTextureAtlas?(): void;
}
export interface ITextureAtlas extends IDisposable {
    readonly pages: {
        canvas: HTMLCanvasElement;
        version: number;
    }[];
    onAddTextureAtlasCanvas: Event<HTMLCanvasElement>;
    onRemoveTextureAtlasCanvas: Event<HTMLCanvasElement>;
    warmUp(): void;
    beginFrame(): boolean;
    clearTexture(): void;
    getRasterizedGlyph(code: number, bg: number, fg: number, ext: number, restrictToCellHeight: boolean): IRasterizedGlyph;
    getRasterizedGlyphCombinedChar(chars: string, bg: number, fg: number, ext: number, restrictToCellHeight: boolean): IRasterizedGlyph;
}
export interface IRasterizedGlyph {
    offset: IVector;
    texturePage: number;
    texturePosition: IVector;
    texturePositionClipSpace: IVector;
    size: IVector;
    sizeClipSpace: IVector;
}
export interface IVector {
    x: number;
    y: number;
}
export interface IBoundingBox {
    top: number;
    left: number;
    right: number;
    bottom: number;
}
export interface ISelectionRenderModel {
    readonly hasSelection: boolean;
    readonly columnSelectMode: boolean;
    readonly viewportStartRow: number;
    readonly viewportEndRow: number;
    readonly viewportCappedStartRow: number;
    readonly viewportCappedEndRow: number;
    readonly startCol: number;
    readonly endCol: number;
    readonly selectionStart: [number, number] | undefined;
    readonly selectionEnd: [number, number] | undefined;
    clear(): void;
    update(terminal: ITerminal, start: [number, number] | undefined, end: [number, number] | undefined, columnSelectMode?: boolean): void;
    isCellSelected(terminal: Terminal, x: number, y: number): boolean;
}
//# sourceMappingURL=Types.d.ts.map