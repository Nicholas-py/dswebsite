import { Disposable } from 'vs/base/common/lifecycle';
import { IDecorationService, IInternalDecoration } from 'common/services/Services';
import { IDecoration, IDecorationOptions } from '@xterm/xterm';
export declare class DecorationService extends Disposable implements IDecorationService {
    serviceBrand: any;
    private readonly _decorations;
    private readonly _onDecorationRegistered;
    readonly onDecorationRegistered: import("vs/base/common/event").Event<IInternalDecoration>;
    private readonly _onDecorationRemoved;
    readonly onDecorationRemoved: import("vs/base/common/event").Event<IInternalDecoration>;
    get decorations(): IterableIterator<IInternalDecoration>;
    constructor();
    registerDecoration(options: IDecorationOptions): IDecoration | undefined;
    reset(): void;
    getDecorationsAtCell(x: number, line: number, layer?: 'bottom' | 'top'): IterableIterator<IInternalDecoration>;
    forEachDecorationAtCell(x: number, line: number, layer: 'bottom' | 'top' | undefined, callback: (decoration: IInternalDecoration) => void): void;
}
//# sourceMappingURL=DecorationService.d.ts.map