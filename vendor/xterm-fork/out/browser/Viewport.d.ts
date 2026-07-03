import { ICoreBrowserService, IRenderService, IThemeService } from 'browser/services/Services';
import { Disposable } from 'vs/base/common/lifecycle';
import { IBufferService, ICoreMouseService, IOptionsService } from 'common/services/Services';
import { Emitter, Event } from 'vs/base/common/event';
export declare class Viewport extends Disposable {
    private readonly _bufferService;
    private readonly _optionsService;
    private readonly _renderService;
    protected _onRequestScrollLines: Emitter<number>;
    readonly onRequestScrollLines: Event<number>;
    private _scrollableElement;
    private _styleElement;
    private _queuedAnimationFrame?;
    private _latestYDisp?;
    private _isSyncing;
    private _isHandlingScroll;
    private _suppressOnScrollHandler;
    constructor(element: HTMLElement, screenElement: HTMLElement, _bufferService: IBufferService, coreBrowserService: ICoreBrowserService, coreMouseService: ICoreMouseService, themeService: IThemeService, _optionsService: IOptionsService, _renderService: IRenderService);
    scrollLines(disp: number): void;
    scrollToLine(line: number, disableSmoothScroll?: boolean): void;
    private _getChangeOptions;
    private _queueSync;
    private _sync;
    private _handleScroll;
}
//# sourceMappingURL=Viewport.d.ts.map