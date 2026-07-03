import { ICoreBrowserService } from './Services';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
export declare class CoreBrowserService extends Disposable implements ICoreBrowserService {
    private _textarea;
    private _window;
    readonly mainDocument: Document;
    serviceBrand: undefined;
    private _isFocused;
    private _cachedIsFocused;
    private _screenDprMonitor;
    private readonly _onDprChange;
    readonly onDprChange: Event<number>;
    private readonly _onWindowChange;
    readonly onWindowChange: Event<Window & typeof globalThis>;
    constructor(_textarea: HTMLTextAreaElement, _window: Window & typeof globalThis, mainDocument: Document);
    get window(): Window & typeof globalThis;
    set window(value: Window & typeof globalThis);
    get dpr(): number;
    get isFocused(): boolean;
}
//# sourceMappingURL=CoreBrowserService.d.ts.map