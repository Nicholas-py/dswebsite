import { Disposable } from 'vs/base/common/lifecycle';
import { IDecPrivateModes, IModes } from 'common/Types';
import { IBufferService, ICoreService, ILogService, IOptionsService } from 'common/services/Services';
export declare class CoreService extends Disposable implements ICoreService {
    private readonly _bufferService;
    private readonly _logService;
    private readonly _optionsService;
    serviceBrand: any;
    isCursorInitialized: boolean;
    isCursorHidden: boolean;
    modes: IModes;
    decPrivateModes: IDecPrivateModes;
    private readonly _onData;
    readonly onData: import("vs/base/common/event").Event<string>;
    private readonly _onUserInput;
    readonly onUserInput: import("vs/base/common/event").Event<void>;
    private readonly _onBinary;
    readonly onBinary: import("vs/base/common/event").Event<string>;
    private readonly _onRequestScrollToBottom;
    readonly onRequestScrollToBottom: import("vs/base/common/event").Event<void>;
    constructor(_bufferService: IBufferService, _logService: ILogService, _optionsService: IOptionsService);
    reset(): void;
    triggerDataEvent(data: string, wasUserInput?: boolean): void;
    triggerBinaryEvent(data: string): void;
}
//# sourceMappingURL=CoreService.d.ts.map