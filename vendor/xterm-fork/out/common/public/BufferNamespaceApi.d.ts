import { IBuffer as IBufferApi, IBufferNamespace as IBufferNamespaceApi } from '@xterm/xterm';
import { ICoreTerminal } from 'common/Types';
import { Disposable } from 'vs/base/common/lifecycle';
export declare class BufferNamespaceApi extends Disposable implements IBufferNamespaceApi {
    private _core;
    private _normal;
    private _alternate;
    private readonly _onBufferChange;
    readonly onBufferChange: import("vs/base/common/event").Event<IBufferApi>;
    constructor(_core: ICoreTerminal);
    get active(): IBufferApi;
    get normal(): IBufferApi;
    get alternate(): IBufferApi;
}
//# sourceMappingURL=BufferNamespaceApi.d.ts.map