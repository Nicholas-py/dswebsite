import { Disposable } from 'vs/base/common/lifecycle';
import { IAttributeData } from 'common/Types';
import { IBuffer, IBufferSet } from 'common/buffer/Types';
import { IBufferService, IOptionsService } from 'common/services/Services';
export declare const MINIMUM_COLS = 2;
export declare const MINIMUM_ROWS = 1;
export declare class BufferService extends Disposable implements IBufferService {
    serviceBrand: any;
    cols: number;
    rows: number;
    buffers: IBufferSet;
    isUserScrolling: boolean;
    private readonly _onResize;
    readonly onResize: import("vs/base/common/event").Event<{
        cols: number;
        rows: number;
    }>;
    private readonly _onScroll;
    readonly onScroll: import("vs/base/common/event").Event<number>;
    get buffer(): IBuffer;
    private _cachedBlankLine;
    constructor(optionsService: IOptionsService);
    resize(cols: number, rows: number): void;
    reset(): void;
    scroll(eraseAttr: IAttributeData, isWrapped?: boolean): void;
    scrollLines(disp: number, suppressScrollEvent?: boolean): void;
}
//# sourceMappingURL=BufferService.d.ts.map