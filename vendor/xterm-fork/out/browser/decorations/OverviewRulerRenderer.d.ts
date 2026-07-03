import { ICoreBrowserService, IRenderService, IThemeService } from 'browser/services/Services';
import { Disposable } from 'vs/base/common/lifecycle';
import { IBufferService, IDecorationService, IOptionsService } from 'common/services/Services';
export declare class OverviewRulerRenderer extends Disposable {
    private readonly _viewportElement;
    private readonly _screenElement;
    private readonly _bufferService;
    private readonly _decorationService;
    private readonly _renderService;
    private readonly _optionsService;
    private readonly _themeService;
    private readonly _coreBrowserService;
    private readonly _canvas;
    private readonly _ctx;
    private readonly _colorZoneStore;
    private get _width();
    private _animationFrame;
    private _shouldUpdateDimensions;
    private _shouldUpdateAnchor;
    private _lastKnownBufferLength;
    private _containerHeight;
    constructor(_viewportElement: HTMLElement, _screenElement: HTMLElement, _bufferService: IBufferService, _decorationService: IDecorationService, _renderService: IRenderService, _optionsService: IOptionsService, _themeService: IThemeService, _coreBrowserService: ICoreBrowserService);
    private _refreshDrawConstants;
    private _refreshDrawHeightConstants;
    private _refreshColorZonePadding;
    private _refreshCanvasDimensions;
    private _refreshDecorations;
    private _renderRulerOutline;
    private _renderColorZone;
    private _queueRefresh;
}
//# sourceMappingURL=OverviewRulerRenderer.d.ts.map